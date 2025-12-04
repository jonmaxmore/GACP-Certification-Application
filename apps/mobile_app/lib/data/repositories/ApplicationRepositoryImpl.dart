import 'dart:io';
import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../core/errors/Failures.dart';
import '../../core/network/DioClient.dart';
import '../../domain/entities/ApplicationEntity.dart';
import '../../domain/repositories/ApplicationRepository.dart';

class ApplicationRepositoryImpl implements ApplicationRepository {
  final DioClient _dioClient;

  ApplicationRepositoryImpl(this._dioClient);

  @override
  Future<Either<Failure, List<ApplicationEntity>>> getMyApplications() async {
    try {
      final response = await _dioClient.get('/applications/my-applications');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        final apps = data.map((item) {
          final formData = item['data'] ?? {};
          return ApplicationEntity(
            id: item['_id'] ?? item['id'],
            type: item['type'] ?? 'Unknown',
            status: item['status'] ?? 'Draft',
            establishmentId:
                item['establishment']?['_id'] ?? item['establishment'] ?? '',
            establishmentName: item['establishment']?['name'] ?? 'Unknown Farm',
            // Map form data fields
            totalArea: formData['totalArea']?.toDouble(),
            cultivatedArea: formData['cultivatedArea']?.toDouble(),
            areaUnit: formData['areaUnit'] ?? 'rai',
            landOwnershipType: formData['landOwnershipType'] ?? 'owned',
            landDocumentId: formData['landDocumentId'] ?? '',
            waterSourceType: formData['waterSourceType'] ?? 'well',
            soilType: formData['soilType'] ?? 'loam',
            plantingSystem: formData['plantingSystem'] ?? 'soil',
            cropName: formData['cropName'] ?? '',
            cropVariety: formData['cropVariety'] ?? '',
            cropSource: formData['cropSource'] ?? '',
            plantingMethod: formData['plantingMethod'] ?? 'seeds',
            fenceDescription: formData['fenceDescription'] ?? '',
            cctvCount: formData['cctvCount'],
            guardCount: formData['guardCount'],
            accessControl: formData['accessControl'] ?? '',
            storageLocation: formData['storageLocation'] ?? '',
            storageSecurity: formData['storageSecurity'] ?? '',
            tempControl: formData['tempControl'] ?? false,
            dispensingMethod: formData['dispensingMethod'] ?? 'pharmacy',
            pharmacistName: formData['pharmacistName'] ?? '',
            pharmacistLicense: formData['pharmacistLicense'] ?? '',
            operatingHours: formData['operatingHours'] ?? '',
            commercialRegNumber: formData['commercialRegNumber'] ?? '',
            importExportType: formData['importExportType'] ?? 'import',
            country: formData['country'] ?? '',
            portOfEntryExit: formData['portOfEntryExit'] ?? '',
            transportMode: formData['transportMode'] ?? 'air',
            carrierName: formData['carrierName'] ?? '',
            expectedDate: formData['expectedDate'] != null
                ? DateTime.tryParse(formData['expectedDate'])
                : null,
            plantParts: formData['plantParts'] ?? '',
            quantity: formData['quantity']?.toDouble(),
            purpose: formData['purpose'] ?? '',
            documents: (item['documents'] as List?)
                    ?.map((d) => d.toString())
                    .toList() ??
                [],
            createdAt: DateTime.tryParse(item['createdAt']) ?? DateTime.now(),
          );
        }).toList();
        return Right(apps);
      } else {
        return const Left(
            ServerFailure(message: 'Failed to fetch applications'));
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
        final applicationId = item['applicationId'] ??
            item['_id']; // Handle different response formats

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
          // Map form data fields
          totalArea: formData['totalArea']?.toDouble(),
          cultivatedArea: formData['cultivatedArea']?.toDouble(),
          areaUnit: formData['areaUnit'] ?? 'rai',
          landOwnershipType: formData['landOwnershipType'] ?? 'owned',
          landDocumentId: formData['landDocumentId'] ?? '',
          waterSourceType: formData['waterSourceType'] ?? 'well',
          soilType: formData['soilType'] ?? 'loam',
          plantingSystem: formData['plantingSystem'] ?? 'soil',
          cropName: formData['cropName'] ?? '',
          cropVariety: formData['cropVariety'] ?? '',
          cropSource: formData['cropSource'] ?? '',
          plantingMethod: formData['plantingMethod'] ?? 'seeds',
          fenceDescription: formData['fenceDescription'] ?? '',
          cctvCount: formData['cctvCount'],
          guardCount: formData['guardCount'],
          accessControl: formData['accessControl'] ?? '',
          storageLocation: formData['storageLocation'] ?? '',
          storageSecurity: formData['storageSecurity'] ?? '',
          tempControl: formData['tempControl'] ?? false,
          dispensingMethod: formData['dispensingMethod'] ?? 'pharmacy',
          pharmacistName: formData['pharmacistName'] ?? '',
          pharmacistLicense: formData['pharmacistLicense'] ?? '',
          operatingHours: formData['operatingHours'] ?? '',
          commercialRegNumber: formData['commercialRegNumber'] ?? '',
          importExportType: formData['importExportType'] ?? 'import',
          country: formData['country'] ?? '',
          portOfEntryExit: formData['portOfEntryExit'] ?? '',
          transportMode: formData['transportMode'] ?? 'air',
          carrierName: formData['carrierName'] ?? '',
          expectedDate: formData['expectedDate'] != null
              ? DateTime.tryParse(formData['expectedDate'])
              : null,
          plantParts: formData['plantParts'] ?? '',
          quantity: formData['quantity']?.toDouble(),
          purpose: formData['purpose'] ?? '',
          documents: documents.keys.toList(),
          createdAt: DateTime.now(),
        ));
      } else {
        return const Left(
            ServerFailure(message: 'Failed to submit application'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  Future<void> _uploadDocument(
      String applicationId, String docType, File file) async {
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
