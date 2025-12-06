import 'package:fpdart/fpdart.dart';
import 'package:mobile_app/core/errors/Failures.dart';
import '../entity/EstablishmentEntity.dart';
import 'dart:io';

abstract class EstablishmentRepository {
  Future<Either<Failure, List<EstablishmentEntity>>> getEstablishments();

  Future<Either<Failure, EstablishmentEntity>> createEstablishment({
    required String name,
    required EstablishmentType type,
    required EstablishmentAddress address,
    required EstablishmentCoordinates coordinates,
    List<File>? images,
  });
}
