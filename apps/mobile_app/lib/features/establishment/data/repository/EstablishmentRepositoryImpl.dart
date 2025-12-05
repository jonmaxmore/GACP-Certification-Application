import 'dart:io';

import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import 'package:mobile_app/core/errors/Failures.dart';
import 'package:mobile_app/core/network/DioClient.dart';
import '../../domain/entity/EstablishmentEntity.dart';
import '../../domain/repository/EstablishmentRepository.dart';
import '../model/EstablishmentModel.dart';
import 'package:http_parser/http_parser.dart';

class EstablishmentRepositoryImpl implements EstablishmentRepository {
  final DioClient _dioClient;

  EstablishmentRepositoryImpl(this._dioClient);

  @override
  Future<Either<Failure, List<EstablishmentEntity>>> getEstablishments() async {
    try {
      final response = await _dioClient.get('/v2/establishments');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        final establishments =
            data.map((e) => EstablishmentModel.fromJson(e).toEntity()).toList();
        return Right(establishments);
      } else {
        return Left(
            ServerFailure(message: response.data['error'] ?? 'Unknown error'));
      }
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, EstablishmentEntity>> createEstablishment({
    required String name,
    required EstablishmentType type,
    required EstablishmentAddress address,
    required EstablishmentCoordinates coordinates,
    List<File>? images,
  }) async {
    try {
      final Map<String, dynamic> fields = {
        'name': name,
        'type': type.name, // Enum to String
        'address[street]': address.street,
        'address[city]': address.city,
        'address[zipCode]': address.zipCode,
        'coordinates[lat]': coordinates.lat,
        'coordinates[lng]': coordinates.lng,
      };

      final formData = FormData.fromMap(fields);

      if (images != null && images.isNotEmpty) {
        for (var file in images) {
          String fileName = file.path.split('/').last;
          formData.files.add(MapEntry(
            'images',
            await MultipartFile.fromFile(
              file.path,
              filename: fileName,
            ),
          ));
        }
      }

      final response =
          await _dioClient.post('/v2/establishments', data: formData);

      if (response.statusCode == 201 && response.data['success'] == true) {
        final model = EstablishmentModel.fromJson(response.data['data']);
        return Right(model.toEntity());
      } else {
        return Left(ServerFailure(
            message: response.data['error'] ?? 'Creation failed'));
      }
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
