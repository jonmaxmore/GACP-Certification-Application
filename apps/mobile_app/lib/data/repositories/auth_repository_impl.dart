import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/errors/failures.dart';
import '../../core/network/dio_client.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final DioClient _dioClient;
  final FlutterSecureStorage _storage;

  AuthRepositoryImpl(this._dioClient, this._storage);

  @override
  Future<Either<Failure, UserEntity>> login(String email, String password) async {
    try {
      final response = await _dioClient.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        final user = data['user'];

        // Save token
        await _storage.write(key: 'auth_token', value: token);
        
        // Save user info (optional, or rely on getCurrentUser)
        // For now, we map the response to UserEntity
        return Right(UserEntity(
          id: user['id'] ?? user['_id'],
          email: user['email'],
          firstName: user['firstName'] ?? '',
          lastName: user['lastName'] ?? '',
          role: user['role'],
        ));
      } else {
        return Left(ServerFailure(message: response.data['message'] ?? 'Login failed'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.response?.data['message'] ?? e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      await _storage.delete(key: 'auth_token');
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> getCurrentUser() async {
    try {
      final response = await _dioClient.get('/auth/me');

      if (response.statusCode == 200) {
        final user = response.data['user'];
        return Right(UserEntity(
          id: user['id'] ?? user['_id'],
          email: user['email'],
          firstName: user['firstName'] ?? '',
          lastName: user['lastName'] ?? '',
          role: user['role'],
        ));
      } else {
        return const Left(ServerFailure(message: 'Failed to get user'));
      }
    } on DioException catch (e) {
      return Left(ServerFailure(message: e.message ?? 'Network Error'));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
