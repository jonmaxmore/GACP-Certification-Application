import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/network/dio_client.dart';

class ApplicationState {
  final bool isLoading;
  final String? error;
  final String? applicationId;
  final Map<String, dynamic>? currentApplication;
  final List<dynamic> pendingReviews;

  ApplicationState({
    this.isLoading = false,
    this.error,
    this.applicationId,
    this.currentApplication,
    this.pendingReviews = const [],
  });

  ApplicationState copyWith({
    bool? isLoading,
    String? error,
    String? applicationId,
    Map<String, dynamic>? currentApplication,
    List<dynamic>? pendingReviews,
  }) {
    return ApplicationState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      applicationId: applicationId ?? this.applicationId,
      currentApplication: currentApplication ?? this.currentApplication,
      pendingReviews: pendingReviews ?? this.pendingReviews,
    );
  }
}

class ApplicationNotifier extends StateNotifier<ApplicationState> {
  final DioClient _dio;
  DioClient get dio => _dio; // Expose for other providers

  ApplicationNotifier(this._dio) : super(ApplicationState());

  // ... (Previous methods: createDraft, confirmPreReview, payPhase1, simulateOfficerReview, payPhase2, assignAuditor, submitAudit)

  // Stage 3: Fetch Pending Reviews (Officer Dashboard)
  Future<void> fetchPendingReviews() async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _dio.get('/v2/applications/pending-reviews');
      state = state.copyWith(
        isLoading: false,
        pendingReviews: response.data['data'] ?? [],
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  // Fetch Single Application by ID
  Future<void> fetchApplicationById(String id) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _dio.get('/v2/applications/$id');
      state = state.copyWith(
        isLoading: false,
        currentApplication: response.data['data'],
        applicationId: id,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  // Stage 1: Create Draft
  Future<void> createDraft({required String farmId}) async {
    if (state.isLoading) return; // Prevent double submission
    state = state.copyWith(isLoading: true);
    try {
      // NOTE: In a real app, 'farmId' comes from the user selection
      // For Demo/Dev, we might need a fallback if not provided or handle 400
      final response = await _dio.post(
        '/v2/applications/draft',
        data: {'farmId': farmId},
      );
      // Backend returns { success: true, data: { ... } }
      final data = response.data['data'];
      state = state.copyWith(
        isLoading: false,
        applicationId: data['_id'],
        currentApplication: data,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  // Stage 3: Pre-Review Confirm (Unlock Payment)
  Future<bool> confirmPreReview() async {
    if (state.applicationId == null) return false;
    state = state.copyWith(isLoading: true);
    try {
      await _dio.post(
        '/v2/applications/${state.applicationId}/confirm-review',
      );
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // Stage 2: Payment Phase 1 (Unlock Submit)
  Future<Map<String, dynamic>?> payPhase1() async {
    if (state.applicationId == null) return null;
    state = state.copyWith(isLoading: true);
    try {
      final response =
          await _dio.post('/v2/applications/${state.applicationId}/pay-phase1');
      state = state.copyWith(isLoading: false);
      if (response.statusCode == 200 && response.data['success']) {
        return response.data['data']; // { transactionId, paymentUrl, qrCode }
      }
      return null;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return null;
    }
  }

  // Stage 3: Officer Review (Simulated for Demo)
  Future<bool> simulateOfficerReview({required bool approve}) async {
    if (state.applicationId == null) return false;
    state = state.copyWith(isLoading: true);
    try {
      await _dio.post(
        '/v2/applications/${state.applicationId}/review',
        data: {'action': approve ? 'APPROVE' : 'REJECT'},
      );
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // Stage 4: Payment Phase 2 (25,000 THB)
  Future<Map<String, dynamic>?> payPhase2() async {
    if (state.applicationId == null) return null;
    state = state.copyWith(isLoading: true);
    try {
      final response =
          await _dio.post('/v2/applications/${state.applicationId}/pay-phase2');
      state = state.copyWith(isLoading: false);
      if (response.statusCode == 200 && response.data['success']) {
        return response.data['data'];
      }
      return null;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return null;
    }
  }

  // Stage 5: Scheduling
  Future<bool> assignAuditor(
      {required String auditorId, required String date}) async {
    if (state.applicationId == null) return false;
    state = state.copyWith(isLoading: true);
    try {
      await _dio.post(
        '/v2/applications/${state.applicationId}/assign-auditor',
        data: {'auditorId': auditorId, 'date': date},
      );
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // Stage 6: Audit Result
  Future<bool> submitAudit({required bool pass, String notes = ''}) async {
    if (state.applicationId == null) return false;
    state = state.copyWith(isLoading: true);
    try {
      await _dio.post(
        '/v2/applications/${state.applicationId}/audit-result',
        data: {'result': pass ? 'PASS' : 'FAIL', 'notes': notes},
      );
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // Fetch Assignments for Auditor (Mock: All 'AUDIT_SCHEDULED')
  Future<void> fetchMyAssignments() async {
    state = state.copyWith(isLoading: true);
    try {
      // In real app, filter by auditorId from auth token
      final response = await _dio.get('/v2/applications/pending-reviews');
      // For Demo: Reuse pending-reviews endpoint but filter in UI or here if needed
      // Actually, let's just return all for demo
      state = state.copyWith(
        isLoading: false,
        pendingReviews: response.data['data'] ?? [],
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final applicationProvider =
    StateNotifierProvider<ApplicationNotifier, ApplicationState>((ref) {
  const storage = FlutterSecureStorage();
  return ApplicationNotifier(DioClient(storage));
});
