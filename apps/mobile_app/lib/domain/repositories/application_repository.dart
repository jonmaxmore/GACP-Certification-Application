import 'dart:io';
import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/application_entity.dart';

abstract class ApplicationRepository {
  Future<Either<Failure, List<ApplicationEntity>>> getMyApplications();
  Future<Either<Failure, ApplicationEntity>> createApplication({
    required String establishmentId,
    required String type,
    required Map<String, dynamic> formData,
    required Map<String, File> documents, // key: document_type, value: file
  });
}
