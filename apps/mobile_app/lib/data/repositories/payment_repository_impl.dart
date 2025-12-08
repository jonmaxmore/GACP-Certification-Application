import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../../core/network/dio_client.dart';
import '../../domain/repositories/payment_repository.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final DioClient _dioClient;

  PaymentRepositoryImpl(this._dioClient);

  @override
  Future<Either<Failure, String>> getPaymentUrl({
    required String applicationId,
    required double amount,
  }) async {
    try {
      final response = await _dioClient.post(
        '/payments/checkout',
        data: {
          'applicationId': applicationId,
          'amount': amount,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final url = response.data['paymentUrl'];
        if (url != null) {
          return Right(url);
        }
      }
      return Left(ServerFailure('Failed to get payment URL'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
