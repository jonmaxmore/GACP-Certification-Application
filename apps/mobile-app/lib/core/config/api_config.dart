/// GACP Platform - API Configuration
///
/// SINGLE SOURCE OF TRUTH for all API URLs and ports.
/// Change values here once → affects entire mobile app.

import 'package:flutter/foundation.dart';

/// API Environment Configuration
class ApiConfig {
  // =====================================================
  // PORT CONFIGURATION - CHANGE HERE ONLY!
  // =====================================================

  /// Backend API port (production uses 3002, dev can use 5000)
  static const int backendPort = 3002;

  /// Frontend port (for web)
  static const int frontendPort = 3000;

  // =====================================================
  // URL GENERATION - DO NOT MODIFY
  // =====================================================

  /// Get the backend base URL based on current platform
  static String get baseUrl {
    // Web platform
    if (kIsWeb) {
      return 'http://localhost:$backendPort/api';
    }

    // Android Emulator uses 10.0.2.2 to reach host machine
    try {
      if (defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:$backendPort/api';
      }
    } catch (_) {}

    // iOS Simulator, macOS, Windows, Linux
    return 'http://localhost:$backendPort/api';
  }

  /// API v2 base URL
  static String get v2BaseUrl => '$baseUrl/v2';

  /// Health check endpoint
  static String get healthUrl => 'http://localhost:$backendPort/health';

  // =====================================================
  // PRODUCTION URLs - AWS EC2 Deployment
  // =====================================================

  /// Production API URL (AWS EC2 instance)
  static const String productionUrl = 'http://47.129.167.71/api';

  /// Whether to use production URL
  static bool get useProduction => kReleaseMode;

  /// Get the effective base URL (dev or production)
  static String get effectiveBaseUrl {
    if (useProduction) {
      return productionUrl;
    }
    return baseUrl;
  }

  // =====================================================
  // TIMEOUTS & RETRY
  // =====================================================

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
  static const int maxRetries = 3;
}
