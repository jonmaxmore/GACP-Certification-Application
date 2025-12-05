import 'package:flutter_riverpod/FlutterRiverpod.dart';
import 'package:flutter_secure_storage/FlutterSecureStorage.dart';
import '../network/DioClient.dart';

final dioClientProvider = Provider((ref) {
  return DioClient(const FlutterSecureStorage());
});
