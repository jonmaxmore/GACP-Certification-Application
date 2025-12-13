# PricingApi

All URIs are relative to *http://localhost:3001*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getInvoice**](#getinvoice) | **GET** /api/v2/pricing/invoice/{phase} | Get invoice for payment phase|
|[**getPlatformFees**](#getplatformfees) | **GET** /api/v2/pricing/fees | Get all platform fees|
|[**getQuotation**](#getquotation) | **GET** /api/v2/pricing/quotation/{applicationId} | Get quotation for application|

# **getInvoice**
> InvoiceResponse getInvoice()

Returns invoice details for a specific payment phase

### Example

```typescript
import {
    PricingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PricingApi(configuration);

let phase: 'phase1' | 'phase2'; // (default to undefined)

const { status, data } = await apiInstance.getInvoice(
    phase
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **phase** | [**&#39;phase1&#39; | &#39;phase2&#39;**]**Array<&#39;phase1&#39; &#124; &#39;phase2&#39;>** |  | defaults to undefined|


### Return type

**InvoiceResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Invoice retrieved |  -  |
|**404** | Phase not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPlatformFees**
> FeesResponse getPlatformFees()

Returns all pricing information for the platform

### Example

```typescript
import {
    PricingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PricingApi(configuration);

const { status, data } = await apiInstance.getPlatformFees();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**FeesResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Fees retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getQuotation**
> QuotationResponse getQuotation()

Returns quotation details for a specific application

### Example

```typescript
import {
    PricingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PricingApi(configuration);

let applicationId: string; // (default to undefined)

const { status, data } = await apiInstance.getQuotation(
    applicationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **applicationId** | [**string**] |  | defaults to undefined|


### Return type

**QuotationResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Quotation retrieved |  -  |
|**401** | Unauthorized |  -  |
|**404** | Application not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

