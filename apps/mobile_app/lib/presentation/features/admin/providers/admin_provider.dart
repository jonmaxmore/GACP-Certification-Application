import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/repositories/application_repository_impl.dart';
import '../../../../domain/repositories/application_repository.dart';
import '../../auth/providers/auth_provider.dart'; // Source of dioClientProvider

class AdminState {
  final bool isLoading;
  final Map<String, dynamic>? stats;
  final String? error;

  AdminState({this.isLoading = false, this.stats, this.error});

  AdminState copyWith(
      {bool? isLoading, Map<String, dynamic>? stats, String? error}) {
    return AdminState(
      isLoading: isLoading ?? this.isLoading,
      stats: stats ?? this.stats,
      error: error,
    );
  }
}

class AdminNotifier extends StateNotifier<AdminState> {
  final ApplicationRepository _repository;

  AdminNotifier(this._repository) : super(AdminState());

  Future<void> fetchDashboardStats() async {
    state = state.copyWith(isLoading: true, error: null);
    final result = await _repository.getDashboardStats();
    result.fold(
      (failure) =>
          state = state.copyWith(isLoading: false, error: failure.message),
      (data) => state = state.copyWith(isLoading: false, stats: data),
    );
  }
}

final adminProvider = StateNotifierProvider<AdminNotifier, AdminState>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final repository = ApplicationRepositoryImpl(dioClient);
  return AdminNotifier(repository);
});
