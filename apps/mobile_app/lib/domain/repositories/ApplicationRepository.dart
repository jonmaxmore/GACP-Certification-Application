import 'dart:io';
import 'package:dartz/dartz.dart';
import '../../core/errors/Failures.dart';
import '../entities/ApplicationEntity.dart';

abstract class ApplicationRepository {
  Future<Either<Failure, List<ApplicationEntity>>> getMyApplications();
  Future<Either<Failure, ApplicationEntity>> createApplication({
    required String establishmentId,
    required String type,
    required Map<String, dynamic> formData,
    required Map<String, File> documents, // key: document_type, value: file
  });
  Future<Either<Failure, ApplicationEntity>> getApplicationById(String id);
  Future<Either<Failure, ApplicationEntity>> updateApplicationStatus(
      String id, String status,
      {String? notes});
}
