# LoginResponseData


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token** | **string** | JWT access token | [optional] [default to undefined]
**refreshToken** | **string** | JWT refresh token | [optional] [default to undefined]
**user** | [**UserProfile**](UserProfile.md) |  | [optional] [default to undefined]

## Example

```typescript
import { LoginResponseData } from './api';

const instance: LoginResponseData = {
    token,
    refreshToken,
    user,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
