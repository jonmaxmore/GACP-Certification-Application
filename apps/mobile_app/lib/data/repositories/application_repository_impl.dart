import 'package:image_picker/image_picker.dart';
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
        final apps = data.map((item) => _mapToEntity(item)).toList();
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
  Future<Either<Failure, ApplicationEntity>> getApplicationById(
      String id) async {
    try {
      final response = await _dioClient.get('/applications/$id');

      if (response.statusCode == 200) {
        final data = response.data['data'];
        return Right(_mapToEntity(data));
      } else {
        return const Left(
            ServerFailure(message: 'Failed to fetch application details'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ApplicationEntity>> updateApplicationStatus(
      String id, String status,
      {String? notes}) async {
    try {
      final body = {
        'status': status,
        if (notes != null) 'notes': notes,
      };

      final response =
          await _dioClient.patch('/applications/$id/status', data: body);

      if (response.statusCode == 200) {
        final data = response.data['data'];
        return Right(_mapToEntity(data));
      } else {
        return const Left(
            ServerFailure(message: 'Failed to update application status'));
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
    required Map<String, XFile> documents,
  }) async {
    try {
      // Step 0: Fetch Establishment Details (Required for backend 'farm' address)
      // We need this to populate farm.address.province for Officer Assignment
      final estResponse =
          await _dioClient.get('/establishments/$establishmentId');
      Map<String, dynamic> estData = {};
      if (estResponse.statusCode == 200) {
        estData = estResponse.data['data'] ?? {};
      }

      // Step 1: Construct Structured Payload for GACP V2 Backend
      final body = {
        'establishmentId': establishmentId,
        'farmId': establishmentId, // Redundant but safe
        'type': type,

        // Pass through structured GACP Data
        'requestType': formData['requestType'],
        'certificationType': formData['certificationType'],
        'objective': formData['objective'],
        'applicantType': formData['applicantType'],
        'applicantInfo': formData['applicantInfo'],
        'siteInfo': {
          ...(formData['siteInfo'] ?? {}),
          'name': estData['name'], // Fallback/Enrich
          'coordinates': estData['coordinates'],
        },

        // Legacy/Generic Data
        'formData': formData['formData'] ?? {},
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

        // Return a constructed entity (or fetch fresh)
        return Right(ApplicationEntity(
          id: applicationId,
          type: type,
          status: 'Draft', // Initially draft
          establishmentId: establishmentId,
          establishmentName: estData['name'] ?? 'Current Farm',
          // Key fields
          totalArea: formData['totalArea']?.toDouble(),
          cropName: formData['cropName'] ?? '',
          documents: documents.keys.toList(),
          createdAt: DateTime.now(),
        ));
      } else {
        return const Left(
            ServerFailure(message: 'Failed to submit application'));
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        return const Left(ServerFailure(message: 'Unauthorized'));
      }
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, ApplicationEntity>> submitApplication(
      String id) async {
    try {
      final response = await _dioClient.post('/applications/$id/submit');

      if (response.statusCode == 200) {
        final data = response.data['data'];
        return Right(_mapToEntity(data));
      } else {
        return const Left(
            ServerFailure(message: 'Failed to submit application for review'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  Future<void> _uploadDocument(
      String applicationId, String docType, XFile file) async {
    try {
      final bytes = await file.readAsBytes();
      FormData formData = FormData.fromMap({
        'document': MultipartFile.fromBytes(bytes, filename: file.name),
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

  ApplicationEntity _mapToEntity(Map<String, dynamic> item) {
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
      documents:
          (item['documents'] as List?)?.map((d) => d.toString()).toList() ?? [],
      createdAt: DateTime.tryParse(item['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> getDashboardStats() async {
    try {
      final response = await _dioClient.get('/applications/stats');

      if (response.statusCode == 200) {
        return Right(response.data['data']);
      } else {
        return const Left(
            ServerFailure(message: 'Failed to fetch dashboard stats'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<ApplicationEntity>>>
      getAuditorAssignments() async {
    try {
      final response =
          await _dioClient.get('/applications/auditor/assignments');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        final apps = data.map((item) => _mapToEntity(item)).toList();
        return Right(apps);
      } else {
        return const Left(
            ServerFailure(message: 'Failed to fetch auditor assignments'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
