# ErrorResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**success** | **boolean** |  | [optional] [default to undefined]
**error** | **string** |  | [optional] [default to undefined]
**code** | **string** |  | [optional] [default to undefined]
**field** | **string** | Field that caused the error (for validation errors) | [optional] [default to undefined]
**resource** | **string** | Resource that caused the error (for conflict errors) | [optional] [default to undefined]

## Example

```typescript
import { ErrorResponse } from './api';

const instance: ErrorResponse = {
    success,
    error,
    code,
    field,
    resource,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
