# PlatformFees


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**applicationFee** | **number** | Application submission fee | [optional] [default to undefined]
**inspectionFee** | **number** | Inspection and certification fee | [optional] [default to undefined]
**renewalFee** | **number** | Certificate renewal fee | [optional] [default to undefined]
**expediteFee** | **number** | Expedited processing fee | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]
**vatRate** | **number** | VAT rate (0 for government) | [optional] [default to undefined]
**lastUpdated** | **string** |  | [optional] [default to undefined]
**validUntil** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { PlatformFees } from './api';

const instance: PlatformFees = {
    applicationFee,
    inspectionFee,
    renewalFee,
    expediteFee,
    currency,
    vatRate,
    lastUpdated,
    validUntil,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
