import 'package:image_picker/image_picker.dart';
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
  Future<Either<Failure, void>> register(
      Map<String, dynamic> data, XFile image) async {
    try {
      final bytes = await image.readAsBytes();
      FormData formData = FormData.fromMap({
        ...data,
        'idCardImage': MultipartFile.fromBytes(bytes, filename: image.name),
      });

      final response = await _dioClient.post(
        '/v2/auth/register',
        data: formData,
      );

      if (response.statusCode == 201) {
        return const Right(null);
      } else {
        return Left(ServerFailure(
            message: response.data['message'] ?? 'Registration failed'));
      }
    } on DioException catch (e) {
      String errorMessage = e.message ?? 'Network Error';
      if (e.response?.data != null) {
        if (e.response!.data is Map) {
          errorMessage = e.response!.data['message'] ?? errorMessage;
        } else if (e.response!.data is String) {
          errorMessage = e.response!.data;
        }
      }
      return Left(ServerFailure(message: errorMessage));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> login(
      String email, String password) async {
    try {
      final response = await _dioClient.post(
        '/v2/auth/login',
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['data']['token']; // Corrected path nesting
        final user = data['data']['user'];

        // Save token
        await _storage.write(key: 'auth_token', value: token);

        // Map to UserEntity
        return Right(UserEntity(
          id: user['id'] ?? user['_id'],
          email: user['email'],
          firstName: user['firstName'] ?? '',
          lastName: user['lastName'] ?? '',
          role: user['role'],
          phoneNumber: user['phoneNumber'],
          address: user['address'],
          province: user['province'],
          district: user['district'],
          subdistrict: user['subdistrict'],
          zipCode: user['zipCode'],
          registeredAt: user['registeredAt'] != null
              ? DateTime.tryParse(user['registeredAt'])
              : null,
        ));
      } else {
        return Left(
            ServerFailure(message: response.data['message'] ?? 'Login failed'));
      }
    } on DioException catch (e) {
      String errorMessage = e.message ?? 'Network Error';
      if (e.response?.data != null) {
        if (e.response!.data is Map) {
          errorMessage = e.response!.data['message'] ?? errorMessage;
        } else if (e.response!.data is String) {
          errorMessage = e.response!.data;
        }
      }
      return Left(ServerFailure(message: errorMessage));
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
      final response = await _dioClient.get('/v2/auth/me');

      if (response.statusCode == 200) {
        final data = response.data;
        // Backend returns { success: true, data: { ...UserFields... } }
        final user = data['data'];

        return Right(UserEntity(
          id: user['id'] ?? user['_id'],
          email: user['email'],
          firstName: user['firstName'] ?? '',
          lastName: user['lastName'] ?? '',
          role: user['role'],
          phoneNumber: user['phoneNumber'],
          address: user['address'],
          province: user['province'],
          district: user['district'],
          subdistrict: user['subdistrict'],
          zipCode: user['zipCode'],
          registeredAt: user['registeredAt'] != null
              ? DateTime.tryParse(user['registeredAt'])
              : null,
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
