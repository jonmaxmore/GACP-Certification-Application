import 'dart:io';

import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_app/core/errors/failures.dart';
import 'package:mobile_app/core/network/dio_client.dart';
import 'package:mobile_app/core/providers/core_providers.dart';

abstract class PaymentRepository {
  Future<Either<Failure, bool>> confirmPayment({
    required String applicationId,
    required String phase,
    required double amount,
    File? slipImage,
  });
}

class PaymentRepositoryImpl implements PaymentRepository {
  final DioClient _dioClient;

  PaymentRepositoryImpl(this._dioClient);

  @override
  Future<Either<Failure, bool>> confirmPayment({
    required String applicationId,
    required String phase,
    required double amount,
    File? slipImage,
  }) async {
    try {
      final Map<String, dynamic> data = {
        'applicationId': applicationId,
        'phase': phase,
        'amount': amount,
      };

      final formData = FormData.fromMap(data);

      if (slipImage != null) {
        final String fileName = slipImage.path.split('/').last;
        formData.files.add(MapEntry(
          'slipImage',
          await MultipartFile.fromFile(
            slipImage.path,
            filename: fileName,
          ),
        ));
      }

      final response = await _dioClient.post(
        '/v2/payments/confirm',
        data: formData,
      );

      if (response.statusCode == 200 && response.data['success']) {
        return const Right(true);
      }
      return Left(
          ServerFailure(message: response.data['error'] ?? 'Payment failed'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  return PaymentRepositoryImpl(ref.watch(dioClientProvider));
});
