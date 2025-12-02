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
        final establishments = data.map((item) => EstablishmentEntity(
          id: item['_id'] ?? item['id'],
          name: item['name'],
          type: item['type'],
          address: item['address'] ?? '',
          status: item['status'] ?? 'Pending',
          latitude: item['location']?['coordinates']?[1],
          longitude: item['location']?['coordinates']?[0],
          imageUrl: item['imageUrl'],
        )).toList();
        
        return Right(establishments);
      } else {
        return const Left(ServerFailure(message: 'Failed to fetch establishments'));
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
    File? image,
  }) async {
    try {
      final formData = FormData.fromMap({
        'name': name,
        'type': type,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
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
          name: item['name'],
          type: item['type'],
          address: item['address'] ?? '',
          status: item['status'] ?? 'Pending',
          latitude: item['location']?['coordinates']?[1],
          longitude: item['location']?['coordinates']?[0],
          imageUrl: item['imageUrl'],
        ));
      } else {
        return const Left(ServerFailure(message: 'Failed to create establishment'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
