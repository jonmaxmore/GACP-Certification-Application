import 'package:image_picker/image_picker.dart';
import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/errors/failures.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/app_exception.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final DioClient _dioClient;
  final FlutterSecureStorage _storage;

  AuthRepositoryImpl(this._dioClient, this._storage);

  /// Translate English error messages to Thai for better UX
  String _translateError(String englishError) {
    const errorMap = {
      // Login errors
      'Invalid credentials': 'เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง',
      'Invalid email or password': 'เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง',
      'User not found': 'ไม่พบบัญชีผู้ใช้นี้ กรุณาลงทะเบียนก่อน',
      'Account is locked': 'บัญชีถูกล็อค กรุณารอ 30 นาทีแล้วลองใหม่',
      'Account is disabled': 'บัญชีนี้ถูกระงับการใช้งาน',
      'Password incorrect': 'รหัสผ่านไม่ถูกต้อง',
      // Registration errors
      'Thai ID Card already registered': 'บัตรประชาชนนี้ลงทะเบียนแล้ว',
      'Tax ID already registered': 'เลขทะเบียนนิติบุคคลนี้ลงทะเบียนแล้ว',
      'Community Enterprise already registered':
          'วิสาหกิจชุมชนนี้ลงทะเบียนแล้ว',
      'Invalid Thai ID Card number': 'เลขบัตรประชาชนไม่ถูกต้อง',
      // Network errors
      'Network Error': 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
      'Connection timed out': 'หมดเวลาเชื่อมต่อ กรุณาลองใหม่',
      'No internet connection': 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
    };

    // Check exact match
    if (errorMap.containsKey(englishError)) {
      return errorMap[englishError]!;
    }

    // Check partial match
    for (final entry in errorMap.entries) {
      if (englishError.toLowerCase().contains(entry.key.toLowerCase())) {
        return entry.value;
      }
    }

    // Return original if already Thai or no translation
    if (RegExp(r'[ก-๙]').hasMatch(englishError)) {
      return englishError;
    }

    return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
  }

  @override
  Future<Either<Failure, void>> register(
      Map<String, dynamic> data, XFile image) async {
    try {
      final bytes = await image.readAsBytes();
      final FormData formData = FormData.fromMap({
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

      // 1. Check for Backend Error Response (JSON)
      if (e.response?.data != null) {
        if (e.response!.data is Map) {
          // Check 'error' first (Backend Standard), then 'message'
          errorMessage = e.response!.data['error'] ??
              e.response!.data['message'] ??
              errorMessage;
        } else if (e.response!.data is String) {
          errorMessage = e.response!.data;
        }
      }
      // 2. Check for Custom NetworkException (Timeout/No Internet)
      else if (e.error is NetworkException) {
        errorMessage = (e.error as NetworkException).message;
      }

      return Left(ServerFailure(message: _translateError(errorMessage)));
    } catch (e) {
      return Left(ServerFailure(message: _translateError(e.toString())));
    }
  }

  @override
  Future<Either<Failure, void>> registerWithData(
      Map<String, dynamic> data) async {
    try {
      final response = await _dioClient.post(
        '/auth-farmer/register',
        data: data,
      );

      if (response.statusCode == 201) {
        return const Right(null);
      } else {
        return Left(ServerFailure(
            message: response.data['error'] ??
                response.data['message'] ??
                'Registration failed'));
      }
    } on DioException catch (e) {
      String errorMessage = e.message ?? 'Network Error';

      if (e.response?.data != null) {
        if (e.response!.data is Map) {
          errorMessage = e.response!.data['error'] ??
              e.response!.data['message'] ??
              errorMessage;
        } else if (e.response!.data is String) {
          errorMessage = e.response!.data;
        }
      } else if (e.error is NetworkException) {
        errorMessage = (e.error as NetworkException).message;
      }

      return Left(ServerFailure(message: _translateError(errorMessage)));
    } catch (e) {
      return Left(ServerFailure(message: _translateError(e.toString())));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> login(
      String idCardOrEmail, String password) async {
    try {
      // Support both Thai ID (13 digits) and Email login
      final isThaiId =
          RegExp(r'^\d{13}$').hasMatch(idCardOrEmail.replaceAll('-', ''));

      final response = await _dioClient.post(
        '/v2/auth/login',
        data: {
          // Send as both fields for backend compatibility
          'email': isThaiId ? null : idCardOrEmail,
          'idCard': isThaiId ? idCardOrEmail.replaceAll('-', '') : null,
          'password': password,
        },
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
      return Left(ServerFailure(message: _translateError(errorMessage)));
    } catch (e) {
      return Left(ServerFailure(message: _translateError(e.toString())));
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
  Future<Either<Failure, UserEntity>> loginWithAccountType(
    String accountType,
    String identifier,
    String password,
  ) async {
    try {
      // Staff uses different API endpoint
      final isStaff = accountType == 'STAFF';
      final endpoint = isStaff ? '/v2/auth-staff/login' : '/v2/auth/login';

      final response = await _dioClient.post(
        endpoint,
        data: isStaff
            ? {
                'email': identifier,
                'password': password,
              }
            : {
                'accountType': accountType,
                'identifier': identifier.replaceAll('-', ''),
                'password': password,
              },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final token =
            data['data']['tokens']?['accessToken'] ?? data['data']['token'];
        final user = data['data']['user'];

        // Save token
        await _storage.write(key: 'auth_token', value: token);

        // Save user role for routing
        await _storage.write(key: 'user_role', value: user['role'] ?? 'FARMER');
        await _storage.write(key: 'account_type', value: accountType);

        // Map to UserEntity with multi-account support
        return Right(UserEntity(
          id: user['id'] ?? user['_id'],
          email: user['email'],
          firstName: user['firstName'] ?? user['representativeName'] ?? '',
          lastName: user['lastName'] ?? '',
          role: user['role'],
          phoneNumber: user['phoneNumber'],
          address: user['address'],
          province: user['province'],
          district: user['district'],
          subdistrict: user['subdistrict'],
          zipCode: user['zipCode'],
          accountType: accountType,
          companyName: user['companyName'],
          communityName: user['communityName'],
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
      return Left(ServerFailure(message: _translateError(errorMessage)));
    } catch (e) {
      return Left(ServerFailure(message: _translateError(e.toString())));
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
