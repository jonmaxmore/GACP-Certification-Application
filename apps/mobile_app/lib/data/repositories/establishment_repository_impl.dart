import 'package:image_picker/image_picker.dart';
import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../core/errors/failures.dart';
import '../../core/network/dio_client.dart';
import '../../domain/entities/establishment_entity.dart';
import '../../domain/repositories/establishment_repository.dart';

class EstablishmentRepositoryImpl implements EstablishmentRepository {
  final DioClient _dioClient;

  EstablishmentRepositoryImpl(this._dioClient);

  @override
  Future<Either<Failure, List<EstablishmentEntity>>> getEstablishments() async {
    try {
      final response =
          await _dioClient.get('/establishments/my-establishments');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        final establishments = data
            .map((item) => EstablishmentEntity.fromJson(item))
            .toList();

        return Right(establishments);
      } else {
        return const Left(
            ServerFailure(message: 'Failed to fetch establishments'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
  @override
  Future<Either<Failure, EstablishmentEntity>> createEstablishment({
    required String name,
    required String type,
    required String address,
    required double latitude,
    required double longitude,
    required String titleDeedNo,
    required String security,
    XFile? image, // Changed from File
  }) async {
    try {
      final data = {
        'name': name,
        'type': type,
        'location': {
          'address': address,
          'coordinates': [longitude, latitude], // GeoJSON order
        },
        'titleDeedNo': titleDeedNo,
        'security': security,
      };

      FormData formData;
      if (image != null) {
        final bytes = await image.readAsBytes();
        formData = FormData.fromMap({
          ...data,
          'image': MultipartFile.fromBytes(bytes, filename: image.name),
        });
      } else {
        formData = FormData.fromMap(data);
      }

      final response = await _dioClient.post('/establishments', data: formData);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return Right(EstablishmentEntity.fromJson(response.data['data']));
      } else {
        return const Left(
            ServerFailure(message: 'Failed to create establishment'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> deleteEstablishment(String id) async {
    try {
      final response = await _dioClient.delete('/establishments/$id');

      if (response.statusCode == 200) {
        return const Right(null);
      } else {
        return const Left(
            ServerFailure(message: 'Failed to delete establishment'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
