//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class AuthenticationApi {
  AuthenticationApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Get current user profile
  ///
  /// Returns authenticated farmer's profile
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getProfileWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/farmer/profile';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Get current user profile
  ///
  /// Returns authenticated farmer's profile
  Future<UserProfile?> getProfile() async {
    final response = await getProfileWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'UserProfile',) as UserProfile;
    
    }
    return null;
  }

  /// Login farmer
  ///
  /// Authenticates farmer and returns JWT token
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [LoginRequest] loginRequest (required):
  Future<Response> loginFarmerWithHttpInfo(LoginRequest loginRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/farmer/login';

    // ignore: prefer_final_locals
    Object? postBody = loginRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Login farmer
  ///
  /// Authenticates farmer and returns JWT token
  ///
  /// Parameters:
  ///
  /// * [LoginRequest] loginRequest (required):
  Future<LoginResponse?> loginFarmer(LoginRequest loginRequest,) async {
    final response = await loginFarmerWithHttpInfo(loginRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'LoginResponse',) as LoginResponse;
    
    }
    return null;
  }

  /// Register new farmer account
  ///
  /// Creates a new farmer account with email verification required. Password must meet security requirements (min 8 chars, uppercase, lowercase, number, special char). 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [RegisterRequest] registerRequest (required):
  Future<Response> registerFarmerWithHttpInfo(RegisterRequest registerRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/farmer/register';

    // ignore: prefer_final_locals
    Object? postBody = registerRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Register new farmer account
  ///
  /// Creates a new farmer account with email verification required. Password must meet security requirements (min 8 chars, uppercase, lowercase, number, special char). 
  ///
  /// Parameters:
  ///
  /// * [RegisterRequest] registerRequest (required):
  Future<RegisterResponse?> registerFarmer(RegisterRequest registerRequest,) async {
    final response = await registerFarmerWithHttpInfo(registerRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'RegisterResponse',) as RegisterResponse;
    
    }
    return null;
  }

  /// Request password reset
  ///
  /// Sends password reset email to farmer
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [RequestPasswordResetRequest] requestPasswordResetRequest (required):
  Future<Response> requestPasswordResetWithHttpInfo(RequestPasswordResetRequest requestPasswordResetRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/farmer/request-password-reset';

    // ignore: prefer_final_locals
    Object? postBody = requestPasswordResetRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Request password reset
  ///
  /// Sends password reset email to farmer
  ///
  /// Parameters:
  ///
  /// * [RequestPasswordResetRequest] requestPasswordResetRequest (required):
  Future<void> requestPasswordReset(RequestPasswordResetRequest requestPasswordResetRequest,) async {
    final response = await requestPasswordResetWithHttpInfo(requestPasswordResetRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Reset password with token
  ///
  /// Resets farmer password using reset token
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [ResetPasswordRequest] resetPasswordRequest (required):
  Future<Response> resetPasswordWithHttpInfo(ResetPasswordRequest resetPasswordRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/farmer/reset-password';

    // ignore: prefer_final_locals
    Object? postBody = resetPasswordRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Reset password with token
  ///
  /// Resets farmer password using reset token
  ///
  /// Parameters:
  ///
  /// * [ResetPasswordRequest] resetPasswordRequest (required):
  Future<void> resetPassword(ResetPasswordRequest resetPasswordRequest,) async {
    final response = await resetPasswordWithHttpInfo(resetPasswordRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Update user profile
  ///
  /// Updates farmer profile information
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [UpdateProfileRequest] updateProfileRequest (required):
  Future<Response> updateProfileWithHttpInfo(UpdateProfileRequest updateProfileRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/farmer/profile';

    // ignore: prefer_final_locals
    Object? postBody = updateProfileRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PUT',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Update user profile
  ///
  /// Updates farmer profile information
  ///
  /// Parameters:
  ///
  /// * [UpdateProfileRequest] updateProfileRequest (required):
  Future<void> updateProfile(UpdateProfileRequest updateProfileRequest,) async {
    final response = await updateProfileWithHttpInfo(updateProfileRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Verify email address
  ///
  /// Verifies farmer email using token sent via email
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] token (required):
  Future<Response> verifyEmailWithHttpInfo(String token,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/farmer/verify-email/{token}'
      .replaceAll('{token}', token);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Verify email address
  ///
  /// Verifies farmer email using token sent via email
  ///
  /// Parameters:
  ///
  /// * [String] token (required):
  Future<void> verifyEmail(String token,) async {
    final response = await verifyEmailWithHttpInfo(token,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
