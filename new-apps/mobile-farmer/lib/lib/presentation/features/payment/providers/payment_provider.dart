import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/repositories/payment_repository_impl.dart';
import '../../../../domain/repositories/payment_repository.dart';
import '../../../../core/providers/core_providers.dart';

// 1. State Class
class PaymentState {
  final bool isLoading;
  final String? error;
  final String? paymentUrl;

  const PaymentState({
    this.isLoading = false,
    this.error,
    this.paymentUrl,
  });

  PaymentState copyWith({
    bool? isLoading,
    String? error,
    String? paymentUrl,
  }) {
    return PaymentState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      paymentUrl: paymentUrl ?? this.paymentUrl,
    );
  }
}

// 2. Notifier
class PaymentNotifier extends StateNotifier<PaymentState> {
  final PaymentRepository _repository;

  PaymentNotifier(this._repository) : super(const PaymentState());

  Future<bool> getPaymentUrl({
    required String applicationId,
    required double amount,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getPaymentUrl(
      applicationId: applicationId,
      amount: amount,
    );

    return result.fold(
      (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
        return false;
      },
      (url) {
        state = state.copyWith(isLoading: false, paymentUrl: url);
        return true;
      },
    );
  }
}

// 3. Provider
final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return PaymentRepositoryImpl(dioClient);
});

final paymentProvider =
    StateNotifierProvider<PaymentNotifier, PaymentState>((ref) {
  final repository = ref.watch(paymentRepositoryProvider);
  return PaymentNotifier(repository);
});
