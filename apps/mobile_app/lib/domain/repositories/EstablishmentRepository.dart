import 'dart:io';
import 'package:dartz/dartz.dart';
import '../../core/errors/Failures.dart';
import '../entities/EstablishmentEntity.dart';

abstract class EstablishmentRepository {
  Future<Either<Failure, List<EstablishmentEntity>>> getEstablishments();
  Future<Either<Failure, EstablishmentEntity>> createEstablishment({
    required String name,
    required String type,
    required String address,
    required double latitude,
    required double longitude,
    File? image,
  });
}
