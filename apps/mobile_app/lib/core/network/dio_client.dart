import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'app_exception.dart';

class DioClient {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  // Dynamic Base URL based on platform
  static String get _baseUrl {
    if (kIsWeb) return 'http://localhost:3000/api';
    try {
      if (defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:3000/api'; // Android Emulator
      } else if (defaultTargetPlatform == TargetPlatform.iOS) {
        return 'http://localhost:3000/api'; // iOS Simulator
      }
    } catch (_) {}
    return 'http://localhost:3000/api'; // Fallback
  }

  DioClient(this._storage)
      : _dio = Dio(
          BaseOptions(
            baseUrl: _baseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
            headers: {
              'Accept': 'application/json',
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add Auth Token
          final token = await _storage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          // Handle 401 Unauthorized
          if (e.response?.statusCode == 401) {
            return handler.reject(DioException(
                requestOptions: e.requestOptions,
                error: UnauthorizedException()));
          }

          // Handle Timeouts
          if (e.type == DioExceptionType.connectionTimeout ||
              e.type == DioExceptionType.receiveTimeout ||
              e.type == DioExceptionType.sendTimeout) {
            return handler.reject(DioException(
                requestOptions: e.requestOptions,
                error: NetworkException(
                    'Connection timed out. Please check your internet.')));
          }

          // Handle No Internet
          if (e.type == DioExceptionType.connectionError) {
            return handler.reject(DioException(
                requestOptions: e.requestOptions,
                error: NetworkException('No internet connection.')));
          }

          return handler.next(e);
        },
      ),
    );

    // Log Interceptor
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
    ));
    // Retry Interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onError: (DioException e, handler) async {
          // Retry Logic for GET requests (Idempotent)
          if (e.requestOptions.method == 'GET' && _shouldRetry(e)) {
            final int retries = (e.requestOptions.extra['retries'] as int?) ?? 0;
            if (retries < 3) {
              e.requestOptions.extra['retries'] = retries + 1;
              await Future.delayed(Duration(
                  milliseconds: 1000 * (retries + 1))); // Exponential Backoff
              try {
                final response = await _dio.request(
                  e.requestOptions.path,
                  options: Options(
                    method: e.requestOptions.method,
                    headers: e.requestOptions.headers,
                    extra: e.requestOptions.extra,
                  ),
                  queryParameters: e.requestOptions.queryParameters,
                  data: e.requestOptions.data,
                );
                return handler.resolve(response);
              } catch (_) {
                // If retry fails, continue to normal error handling
              }
            }
          }
          return handler.next(e);
        },
      ),
    );
  }

  bool _shouldRetry(DioException e) {
    return e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.connectionError;
  }

  Future<Response> get(String path,
      {Map<String, dynamic>? queryParameters}) async {
    return await _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) async {
    return await _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) async {
    return await _dio.put(path, data: data);
  }

  Future<Response> delete(String path, {dynamic data}) async {
    return await _dio.delete(path, data: data);
  }

  Future<Response> patch(String path, {dynamic data}) async {
    return await _dio.patch(path, data: data);
  }
}
