import 'dart:io';
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
      final response = await _dioClient.get('/establishments');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        final establishments = data
            .map((item) => EstablishmentEntity(
                  id: item['_id'] ?? item['id'],
                  name: item['name'] ?? 'Unknown Farm',
                  type: item['type'] ?? 'Outdoor',
                  address: item['address']?.toString() ?? '',
                  status: item['status'] ?? 'Pending',
                  latitude: item['location']?['coordinates']?[1],
                  longitude: item['location']?['coordinates']?[0],
                  imageUrl: item['imageUrl'],
                  titleDeedNo: item['titleDeedNo'] ?? '',
                  security: item['security'] ?? '',
                  // Mock Data
                  updatedAt: DateTime.now().subtract(const Duration(days: 3)),
                  licenseExpiredAt:
                      DateTime.now().add(const Duration(days: 365)),
                  licenseNumber:
                      'GACP-2025-${(item['_id'] ?? item['id']).toString().substring(0, 4).toUpperCase()}',
                ))
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
    File? image,
  }) async {
    try {
      final formData = FormData.fromMap({
        'name': name,
        'type': type,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'titleDeedNo': titleDeedNo,
        'security': security,
        if (image != null)
          'evidence_photo': await MultipartFile.fromFile(
            image.path,
            filename: 'evidence.jpg',
          ),
      });

      final response = await _dioClient.post('/establishments', data: formData);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final item = response.data['data'];
        return Right(EstablishmentEntity(
          id: item['_id'] ?? item['id'],
          name: item['name'] ?? 'Unknown Farm',
          type: item['type'] ?? 'Outdoor',
          address: item['address']?.toString() ?? '',
          status: item['status'] ?? 'Pending',
          latitude: item['location']?['coordinates']?[1],
          longitude: item['location']?['coordinates']?[0],
          imageUrl: item['imageUrl'],
          titleDeedNo: item['titleDeedNo'] ?? '',
          security: item['security'] ?? '',
        ));
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

      if (response.statusCode == 200 || response.statusCode == 204) {
        return const Right(null);
      } else {
        return Left(
            ServerFailure(message: response.data['error'] ?? 'Delete failed'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Delete Failed'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
