import 'package:dartz/dartz.dart';
import '../../core/errors/Failures.dart';
import '../entities/DashboardStatsEntity.dart';

abstract class DashboardRepository {
  Future<Either<Failure, DashboardStatsEntity>> getDashboardStats();
}
