import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/PaymentRepository.dart';

class PaymentState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;

  PaymentState({this.isLoading = false, this.error, this.isSuccess = false});
}

class PaymentNotifier extends StateNotifier<PaymentState> {
  final PaymentRepository _repo;

  PaymentNotifier(this._repo) : super(PaymentState());

  Future<void> confirmPayment({
    required String applicationId,
    required String phase,
    required double amount,
    File? slipImage,
  }) async {
    state = PaymentState(isLoading: true);

    final result = await _repo.confirmPayment(
      applicationId: applicationId,
      phase: phase,
      amount: amount,
      slipImage: slipImage,
    );

    state = result.fold(
      (l) => PaymentState(error: l.message),
      (r) => PaymentState(isSuccess: true),
    );
  }
}

final paymentProvider =
    StateNotifierProvider.autoDispose<PaymentNotifier, PaymentState>((ref) {
  return PaymentNotifier(ref.watch(paymentRepositoryProvider));
});
