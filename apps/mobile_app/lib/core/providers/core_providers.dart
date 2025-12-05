import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../network/DioClient.dart';

final dioClientProvider = Provider((ref) {
  return DioClient(const FlutterSecureStorage());
});
