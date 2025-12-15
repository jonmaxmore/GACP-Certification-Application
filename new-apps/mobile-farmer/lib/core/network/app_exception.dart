class AppException implements Exception {
  final String message;
  final String? code;

  AppException(this.message, {this.code});

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  NetworkException(super.message);
}

class UnauthorizedException extends AppException {
  UnauthorizedException() : super('Session expired. Please login again.');
}

class ServerException extends AppException {
  ServerException(super.message);
}
