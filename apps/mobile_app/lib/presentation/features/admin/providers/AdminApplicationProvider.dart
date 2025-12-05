import 'package:flutter_riverpod/FlutterRiverpod.dart';
import '../../../../domain/entities/ApplicationEntity.dart';
import '../../application/providers/ApplicationProvider.dart';

// 1. Fetch Detail Provider
final applicationDetailProvider =
    FutureProvider.family<ApplicationEntity, String>((ref, id) async {
  final repository = ref.watch(applicationRepositoryProvider);
  final result = await repository.getApplicationById(id);
  return result.fold(
    (failure) => throw Exception(failure.message),
    (data) => data,
  );
});

// 2. Status Update Notifier
class ApplicationStatusState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;

  const ApplicationStatusState({
    this.isLoading = false,
    this.error,
    this.isSuccess = false,
  });

  ApplicationStatusState copyWith({
    bool? isLoading,
    String? error,
    bool? isSuccess,
  }) {
    return ApplicationStatusState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

class ApplicationStatusNotifier extends StateNotifier<ApplicationStatusState> {
  final Ref _ref;

  ApplicationStatusNotifier(this._ref) : super(const ApplicationStatusState());

  Future<void> updateStatus(String id, String status, {String? notes}) async {
    state = state.copyWith(isLoading: true, error: null, isSuccess: false);
    final repository = _ref.read(applicationRepositoryProvider);

    final result =
        await repository.updateApplicationStatus(id, status, notes: notes);

    result.fold(
      (failure) =>
          state = state.copyWith(isLoading: false, error: failure.message),
      (data) {
        state = state.copyWith(isLoading: false, isSuccess: true);
        // Invalidate the detail provider to refresh data
        _ref.invalidate(applicationDetailProvider(id));
      },
    );
  }
}

final applicationStatusProvider =
    StateNotifierProvider<ApplicationStatusNotifier, ApplicationStatusState>(
        (ref) {
  return ApplicationStatusNotifier(ref);
});
