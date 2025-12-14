import '../../../../core/network/dio_client.dart';
import '../models/gacp_application_models.dart';

class ApplicationService {
  final DioClient _client;

  ApplicationService(this._client);

  Future<String?> submitApplication(GACPApplication appData) async {
    try {
      // Map GACPApplication to Backend Schema (ApplicationModel.js)
      // Backend expects 'data' object with specific fields and a generic 'formData' map
      final payload = {
        'farmId': appData.establishmentId,
        'requestType': appData.type?.name.toUpperCase() ?? 'NEW',
        'certificationType': ['CULTIVATION'],
        'applicantType': appData.profile.applicantType.toUpperCase(),
        'applicantInfo': {
          'name': appData.profile.name,
          'idCard': appData.profile.idCard,
          'address': appData.profile.address,
          'mobile': appData.profile.mobile,
          'email': appData.profile.email,
          'entityName': appData.profile.applicantType != 'Individual'
              ? appData.profile.name
              : '',
        },
        'siteInfo': {
          'address': appData.location.address,
          'coordinates':
              '${appData.location.lat ?? 0},${appData.location.lng ?? 0}',
        },
        // All specific GACP data goes into the flexible 'formData' map
        'formData': appData.toMap(),
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

  Future<GACPApplication?> getApplication(String id) async {
    try {
      final response = await _client.get('/applications/$id');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data']; // The Application Object
        final appData = data['data']; // The 'data' field in schema
        final formData = appData['formData']; // The GACPApplication map

        if (formData != null) {
          return GACPApplication.fromMap(formData);
        }
      }
      return null;
    } catch (e) {
      throw Exception('Error fetching application: $e');
    }
  }
}
