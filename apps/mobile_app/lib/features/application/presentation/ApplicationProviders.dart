import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/ApplicationRepository.dart';

// 1. Fetch List Provider
final myApplicationsProvider =
    FutureProvider.autoDispose<List<ApplicationModel>>((ref) async {
  final repo = ref.watch(applicationRepositoryProvider);
  final result = await repo.getMyApplications();
  return result.fold((error) => throw error.message, (data) => data);
});

// 2. Submit Notifier
class ApplicationSubmitState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;

  ApplicationSubmitState(
      {this.isLoading = false, this.error, this.isSuccess = false});
}

class ApplicationSubmitNotifier extends StateNotifier<ApplicationSubmitState> {
  final ApplicationRepository _repo;
  final Ref _ref;

  ApplicationSubmitNotifier(this._repo, this._ref)
      : super(ApplicationSubmitState());

  Future<void> submit({
    required String formType,
    required String establishmentId,
    required String applicantType,
  }) async {
    state = ApplicationSubmitState(isLoading: true);

    final result = await _repo.submitApplication(
      formType: formType,
      establishmentId: establishmentId,
      applicantType: applicantType,
    );

    state = result.fold(
      (l) => ApplicationSubmitState(error: l.message),
      (r) {
        // Refresh list
        _ref.invalidate(myApplicationsProvider);
        return ApplicationSubmitState(isSuccess: true);
      },
    );
  }
}

final applicationSubmitProvider = StateNotifierProvider.autoDispose<
    ApplicationSubmitNotifier, ApplicationSubmitState>((ref) {
  return ApplicationSubmitNotifier(
      ref.watch(applicationRepositoryProvider), ref);
});
