import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';

abstract class PaymentRepository {
  Future<Either<Failure, String>> getPaymentUrl({
    required String applicationId,
    required double amount,
  });
}
