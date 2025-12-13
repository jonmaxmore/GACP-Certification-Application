# AccessApi

All URIs are relative to *http://localhost:3001*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**checkAccess**](#checkaccess) | **POST** /api/v2/access/check | Check access to resource|
|[**getRoles**](#getroles) | **GET** /api/v2/access/roles | Get available roles|
|[**verifyStaff**](#verifystaff) | **POST** /api/v2/access/verify-staff | Verify staff role|

# **checkAccess**
> AccessCheckResponse checkAccess(accessCheckRequest)

Verifies if the authenticated user has access to a specific resource

### Example

```typescript
import {
    AccessApi,
    Configuration,
    AccessCheckRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AccessApi(configuration);

let accessCheckRequest: AccessCheckRequest; //

const { status, data } = await apiInstance.checkAccess(
    accessCheckRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accessCheckRequest** | **AccessCheckRequest**|  | |


### Return type

**AccessCheckResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Access check result |  -  |
|**400** | Missing resource parameter |  -  |
|**401** | Unauthorized |  -  |
|**404** | Resource not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRoles**
> RolesResponse getRoles()

Returns list of all available roles in the system

### Example

```typescript
import {
    AccessApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AccessApi(configuration);

const { status, data } = await apiInstance.getRoles();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**RolesResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Roles list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyStaff**
> VerifyStaffResponse verifyStaff(verifyStaffRequest)

Verifies if a role is a valid staff role and returns redirect path

### Example

```typescript
import {
    AccessApi,
    Configuration,
    VerifyStaffRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AccessApi(configuration);

let verifyStaffRequest: VerifyStaffRequest; //

const { status, data } = await apiInstance.verifyStaff(
    verifyStaffRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **verifyStaffRequest** | **VerifyStaffRequest**|  | |


### Return type

**VerifyStaffResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Staff verification result |  -  |
|**400** | Missing role parameter |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

