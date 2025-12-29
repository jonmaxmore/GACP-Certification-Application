# gacp_auth_farmer_client.api.AuthenticationApi

## Load the API package
```dart
import 'package:gacp_auth_farmer_client/api.dart';
```

All URIs are relative to *http://localhost:5000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getProfile**](AuthenticationApi.md#getprofile) | **GET** /api/auth/farmer/profile | Get current user profile
[**loginFarmer**](AuthenticationApi.md#loginfarmer) | **POST** /api/auth/farmer/login | Login farmer
[**registerFarmer**](AuthenticationApi.md#registerfarmer) | **POST** /api/auth/farmer/register | Register new farmer account
[**requestPasswordReset**](AuthenticationApi.md#requestpasswordreset) | **POST** /api/auth/farmer/request-password-reset | Request password reset
[**resetPassword**](AuthenticationApi.md#resetpassword) | **POST** /api/auth/farmer/reset-password | Reset password with token
[**updateProfile**](AuthenticationApi.md#updateprofile) | **PUT** /api/auth/farmer/profile | Update user profile
[**verifyEmail**](AuthenticationApi.md#verifyemail) | **GET** /api/auth/farmer/verify-email/{token} | Verify email address


# **getProfile**
> UserProfile getProfile()

Get current user profile

Returns authenticated farmer's profile

### Example
```dart
import 'package:gacp_auth_farmer_client/api.dart';
// TODO Configure HTTP Bearer authorization: BearerAuth
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('BearerAuth').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('BearerAuth').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthenticationApi();

try {
    final result = api_instance.getProfile();
    print(result);
} catch (e) {
    print('Exception when calling AuthenticationApi->getProfile: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**UserProfile**](UserProfile.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **loginFarmer**
> LoginResponse loginFarmer(loginRequest)

Login farmer

Authenticates farmer and returns JWT token

### Example
```dart
import 'package:gacp_auth_farmer_client/api.dart';

final api_instance = AuthenticationApi();
final loginRequest = LoginRequest(); // LoginRequest | 

try {
    final result = api_instance.loginFarmer(loginRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthenticationApi->loginFarmer: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **loginRequest** | [**LoginRequest**](LoginRequest.md)|  | 

### Return type

[**LoginResponse**](LoginResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registerFarmer**
> RegisterResponse registerFarmer(registerRequest)

Register new farmer account

Creates a new farmer account with email verification required. Password must meet security requirements (min 8 chars, uppercase, lowercase, number, special char). 

### Example
```dart
import 'package:gacp_auth_farmer_client/api.dart';

final api_instance = AuthenticationApi();
final registerRequest = RegisterRequest(); // RegisterRequest | 

try {
    final result = api_instance.registerFarmer(registerRequest);
    print(result);
} catch (e) {
    print('Exception when calling AuthenticationApi->registerFarmer: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **registerRequest** | [**RegisterRequest**](RegisterRequest.md)|  | 

### Return type

[**RegisterResponse**](RegisterResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestPasswordReset**
> requestPasswordReset(requestPasswordResetRequest)

Request password reset

Sends password reset email to farmer

### Example
```dart
import 'package:gacp_auth_farmer_client/api.dart';

final api_instance = AuthenticationApi();
final requestPasswordResetRequest = RequestPasswordResetRequest(); // RequestPasswordResetRequest | 

try {
    api_instance.requestPasswordReset(requestPasswordResetRequest);
} catch (e) {
    print('Exception when calling AuthenticationApi->requestPasswordReset: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **requestPasswordResetRequest** | [**RequestPasswordResetRequest**](RequestPasswordResetRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **resetPassword**
> resetPassword(resetPasswordRequest)

Reset password with token

Resets farmer password using reset token

### Example
```dart
import 'package:gacp_auth_farmer_client/api.dart';

final api_instance = AuthenticationApi();
final resetPasswordRequest = ResetPasswordRequest(); // ResetPasswordRequest | 

try {
    api_instance.resetPassword(resetPasswordRequest);
} catch (e) {
    print('Exception when calling AuthenticationApi->resetPassword: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **resetPasswordRequest** | [**ResetPasswordRequest**](ResetPasswordRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateProfile**
> updateProfile(updateProfileRequest)

Update user profile

Updates farmer profile information

### Example
```dart
import 'package:gacp_auth_farmer_client/api.dart';
// TODO Configure HTTP Bearer authorization: BearerAuth
// Case 1. Use String Token
//defaultApiClient.getAuthentication<HttpBearerAuth>('BearerAuth').setAccessToken('YOUR_ACCESS_TOKEN');
// Case 2. Use Function which generate token.
// String yourTokenGeneratorFunction() { ... }
//defaultApiClient.getAuthentication<HttpBearerAuth>('BearerAuth').setAccessToken(yourTokenGeneratorFunction);

final api_instance = AuthenticationApi();
final updateProfileRequest = UpdateProfileRequest(); // UpdateProfileRequest | 

try {
    api_instance.updateProfile(updateProfileRequest);
} catch (e) {
    print('Exception when calling AuthenticationApi->updateProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateProfileRequest** | [**UpdateProfileRequest**](UpdateProfileRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyEmail**
> verifyEmail(token)

Verify email address

Verifies farmer email using token sent via email

### Example
```dart
import 'package:gacp_auth_farmer_client/api.dart';

final api_instance = AuthenticationApi();
final token = token_example; // String | 

try {
    api_instance.verifyEmail(token);
} catch (e) {
    print('Exception when calling AuthenticationApi->verifyEmail: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token** | **String**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

