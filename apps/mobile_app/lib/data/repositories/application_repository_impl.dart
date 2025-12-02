import 'dart:io';
import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../core/errors/failures.dart';
import '../../core/network/dio_client.dart';
import '../../domain/entities/application_entity.dart';
import '../../domain/repositories/application_repository.dart';

class ApplicationRepositoryImpl implements ApplicationRepository {
  final DioClient _dioClient;

  ApplicationRepositoryImpl(this._dioClient);

  @override
  Future<Either<Failure, List<ApplicationEntity>>> getMyApplications() async {
    try {
      final response = await _dioClient.get('/applications/my-applications');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        final apps = data.map((item) => ApplicationEntity(
          id: item['_id'] ?? item['id'],
          type: item['type'] ?? 'Unknown',
          status: item['status'] ?? 'Draft',
          establishmentId: item['establishment']?['_id'] ?? item['establishment'] ?? '',
          establishmentName: item['establishment']?['name'] ?? 'Unknown Farm',
          formData: item['data'] ?? {},
          documents: (item['documents'] as List?)?.map((d) => d.toString()).toList() ?? [],
          createdAt: DateTime.tryParse(item['createdAt']) ?? DateTime.now(),
        )).toList();
        return Right(apps);
      } else {
        return const Left(ServerFailure(message: 'Failed to fetch applications'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ApplicationEntity>> createApplication({
    required String establishmentId,
    required String type,
    required Map<String, dynamic> formData,
    required Map<String, File> documents,
  }) async {
    try {
      // Step 1: Create Application (JSON)
      final body = {
        'establishmentId': establishmentId,
        'type': type,
        'farmerData': formData, // Backend expects 'farmerData' key
      };

      final response = await _dioClient.post('/applications', data: body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final item = response.data['data'];
        final applicationId = item['applicationId'] ?? item['_id']; // Handle different response formats

        // Step 2: Upload Documents
        for (var entry in documents.entries) {
          await _uploadDocument(applicationId, entry.key, entry.value);
        }

        return Right(ApplicationEntity(
          id: applicationId,
          type: type,
          status: 'Pending',
          establishmentId: establishmentId,
          establishmentName: 'Current Farm', // Placeholder until refresh
          formData: formData,
          documents: documents.keys.toList(),
          createdAt: DateTime.now(),
        ));
      } else {
        return const Left(ServerFailure(message: 'Failed to submit application'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  Future<void> _uploadDocument(String applicationId, String docType, File file) async {
    try {
      String fileName = file.path.split('/').last;
      FormData formData = FormData.fromMap({
        'document': await MultipartFile.fromFile(file.path, filename: fileName),
      });

      await _dioClient.post(
        '/applications/$applicationId/documents/$docType',
        data: formData,
      );
    } catch (e) {
      print('Failed to upload document $docType: $e');
      // Continue uploading other documents even if one fails
    }
  }
}
