import '../../../../core/network/dio_client.dart';
import '../providers/form_state_provider.dart';

class ApplicationService {
  final DioClient _client;

  ApplicationService(this._client);

  Future<String?> submitApplication(ApplicationFormData formData) async {
    try {
      // Map flat ApplicationFormData to Nested Backend Schema
      final payload = {
        'farmId': formData.establishmentId.isNotEmpty
            ? formData.establishmentId
            : throw Exception(
                'Establishment ID is missing. Please select a farm in Step 3.'),
        'requestType': formData.requestCategory.toUpperCase(), // 'NEW'
        'applicantType': formData.applicantType.toUpperCase(),
        'certificationType': ['CULTIVATION'],
        'objective': ['COMMERCIAL_DOMESTIC'],
        'formData': {
          'entityName': formData.entityName,
          'presidentName': formData.presidentName,
          'regCode1': formData.regCode1,
          'idCard': formData.idCard,
          'phone': formData.phone,
          'email': formData.email,
          'salesChannels': formData.salesChannels,
          'isExportEnabled': formData.isExportEnabled,
          'exportDestination': formData.exportDestination,
          'transportMethod': formData.transportMethod,
          'strainName': formData.strainName,
          'sourceName': formData.sourceName,
          'quantity': formData.quantity,
          'sopChecklist': formData.sopChecklist,
          'productionPlanDetails': formData.productionPlanDetails,
          'videoLink': formData.videoLink,
        },
        'applicantInfo': {
          'name': formData.presidentName,
          'idCard': formData.idCard,
          'entityName': formData.entityName,
          'registrationCode': formData.regCode1,
        }
      };

      // DioClient wrappers return Response
      final response = await _client.post('/applications/draft', data: payload);

      if (response.statusCode != 201 && response.statusCode != 200) {
        throw Exception('Failed to submit application: ${response.statusCode}');
      }

      // Return the ID for internal routing
      if (response.data != null && response.data['data'] != null) {
        return response.data['data']['_id'] ?? response.data['data']['id'];
      }
      return null;
    } catch (e) {
      // If mock env or offline, logging error but rethrowing for UI handling
      throw Exception('Error submitting application: $e');
    }
  }

  Future<ApplicationFormData> getApplication(String id) async {
    try {
      final response = await _client.get('/applications/$id');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'];

        // Map Backend Data to Mobile Form Data (Reverse Mapping)
        // This is a simplified mapper. In real world, this needs detailed field mapping.
        final backendForm = data['data']['formData'] ?? {};

        return ApplicationFormData(
          // Basic Info
          formType: 'FORM_10', // Derived or Default
          establishmentId: data['data']['farmId'] ?? '',

          // Mapped Fields
          entityName: backendForm['entityName'] ?? '',
          presidentName: backendForm['presidentName'] ?? '',
          regCode1: backendForm['regCode1'] ?? '',
          idCard: backendForm['idCard'] ?? '',
          phone: backendForm['phone'] ?? '',
          email: backendForm['email'] ?? '',

          // ... Map other fields as needed ...
          // For Prototype, specific fields are usually enough to demonstrate
        );
      }
      throw Exception('Application not found');
    } catch (e) {
      throw Exception('Error fetching application: $e');
    }
  }
}
