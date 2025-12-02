import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../data/repositories/application_repository_impl.dart';
import '../../../../domain/entities/application_entity.dart';
import '../../../../domain/repositories/application_repository.dart';
import '../../auth/providers/auth_provider.dart';

// 1. Repository Provider
final applicationRepositoryProvider = Provider<ApplicationRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return ApplicationRepositoryImpl(dioClient);
});

// 2. State Class
class ApplicationState {
  final bool isLoading;
  final List<ApplicationEntity> applications;
  final String? error;
  
  // Form State
  final String selectedFormType; // 'GACP_FORM_9', 'GACP_FORM_10', 'GACP_FORM_11'
  final int currentStep;
  final String? selectedEstablishmentId;
  final Map<String, dynamic> formData;
  final Map<String, File> documents;
  final bool isSuccess;

  const ApplicationState({
    this.isLoading = false,
    this.applications = const [],
    this.error,
    this.selectedFormType = 'GACP_FORM_9',
    this.currentStep = 0,
    this.selectedEstablishmentId,
    this.formData = const {
      // Form 9 Defaults
      'areaUnit': 'rai',
      'landOwnershipType': 'owned',
      'waterSourceType': 'well',
      'soilType': 'loam',
      'plantingSystem': 'soil',
      'plantingMethod': 'seeds',
      'tempControl': false,
      // Form 10 Defaults
      'dispensingMethod': 'pharmacy',
      // Form 11 Defaults
      'importExportType': 'import',
      'transportMode': 'air',
    },
    this.documents = const {},
    this.isSuccess = false,
  });

  ApplicationState copyWith({
    bool? isLoading,
    List<ApplicationEntity>? applications,
    String? error,
    String? selectedFormType,
    int? currentStep,
    String? selectedEstablishmentId,
    Map<String, dynamic>? formData,
    Map<String, File>? documents,
    bool? isSuccess,
  }) {
    return ApplicationState(
      isLoading: isLoading ?? this.isLoading,
      applications: applications ?? this.applications,
      error: error,
      selectedFormType: selectedFormType ?? this.selectedFormType,
      currentStep: currentStep ?? this.currentStep,
      selectedEstablishmentId: selectedEstablishmentId ?? this.selectedEstablishmentId,
      formData: formData ?? this.formData,
      documents: documents ?? this.documents,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

// 3. Notifier
class ApplicationNotifier extends StateNotifier<ApplicationState> {
  final ApplicationRepository _repository;

  ApplicationNotifier(this._repository) : super(const ApplicationState()) {
    loadApplications();
  }

  Future<void> loadApplications() async {
    state = state.copyWith(isLoading: true, error: null);
    final result = await _repository.getMyApplications();
    result.fold(
      (failure) => state = state.copyWith(isLoading: false, error: failure.message),
      (data) => state = state.copyWith(isLoading: false, applications: data),
    );
  }

  void setFormType(String type) {
    state = state.copyWith(selectedFormType: type, currentStep: 0);
  }

  void setStep(int step) {
    state = state.copyWith(currentStep: step);
  }

  void setEstablishment(String id) {
    state = state.copyWith(selectedEstablishmentId: id);
  }

  void updateFormData(String key, dynamic value) {
    final newFormData = Map<String, dynamic>.from(state.formData);
    newFormData[key] = value;
    state = state.copyWith(formData: newFormData);
  }

  void addDocument(String key, File file) {
    final newDocs = Map<String, File>.from(state.documents);
    newDocs[key] = file;
    state = state.copyWith(documents: newDocs);
  }

  void removeDocument(String key) {
    final newDocs = Map<String, File>.from(state.documents);
    newDocs.remove(key);
    state = state.copyWith(documents: newDocs);
  }

  Future<void> submitApplication() async {
    if (state.selectedEstablishmentId == null) {
      state = state.copyWith(error: 'Please select an establishment');
      return;
    }

    state = state.copyWith(isLoading: true, error: null, isSuccess: false);

    // Construct nested JSON based on Form Type
    Map<String, dynamic> backendData = {};

    if (state.selectedFormType == 'GACP_FORM_9') {
      backendData = {
        'farmInformation': {
          'farmSize': {
            'totalArea': state.formData['totalArea'],
            'cultivatedArea': state.formData['cultivatedArea'],
            'unit': state.formData['areaUnit'],
          },
          'landOwnership': {
            'type': state.formData['landOwnershipType'],
            'documentId': state.formData['landDocumentId'],
          },
          'waterSource': {
            'type': state.formData['waterSourceType'],
          },
          'soilType': {
            'type': state.formData['soilType'],
          },
          'plantingSystem': state.formData['plantingSystem'],
        },
        'cropInformation': [
          {
            'strainName': state.formData['cropName'],
            'variety': state.formData['cropVariety'],
            'sourceOrigin': state.formData['cropSource'],
            'plantingMethod': state.formData['plantingMethod'],
          }
        ],
        'formSpecificData': {
          'production': {
            'securityMeasures': {
              'fenceDescription': state.formData['fenceDescription'],
              'cctvCount': state.formData['cctvCount'],
              'guardCount': state.formData['guardCount'],
              'accessControl': state.formData['accessControl'],
            },
            'storageFacility': {
              'location': state.formData['storageLocation'],
              'security': state.formData['storageSecurity'],
              'temperatureControl': state.formData['tempControl'],
            }
          }
        }
      };
    } else if (state.selectedFormType == 'GACP_FORM_10') {
      backendData = {
        'formSpecificData': {
          'sale': {
            'dispensingMethod': state.formData['dispensingMethod'],
            'pharmacist': {
              'name': state.formData['pharmacistName'],
              'licenseNumber': state.formData['pharmacistLicense'],
            },
            'storageDetails': state.formData['saleStorageDetails'],
            'operatingHours': state.formData['operatingHours'],
            'commercialRegNumber': state.formData['commercialRegNumber'],
          }
        }
      };
    } else if (state.selectedFormType == 'GACP_FORM_11') {
      backendData = {
        'formSpecificData': {
          'importExport': {
            'type': state.formData['importExportType'],
            'country': state.formData['country'],
            'portOfEntryExit': state.formData['portOfEntryExit'],
            'transportMode': state.formData['transportMode'],
            'carrierName': state.formData['carrierName'],
            'expectedDate': state.formData['expectedDate']?.toIso8601String(),
            'plantParts': state.formData['plantParts'],
            'quantity': state.formData['quantity'],
            'purpose': state.formData['purpose'],
          }
        }
      };
    }

    final result = await _repository.createApplication(
      establishmentId: state.selectedEstablishmentId!,
      type: state.selectedFormType,
      formData: backendData,
      documents: state.documents,
    );

    result.fold(
      (failure) => state = state.copyWith(isLoading: false, error: failure.message),
      (newItem) {
        final newList = [...state.applications, newItem];
        state = state.copyWith(
          isLoading: false,
          applications: newList,
          isSuccess: true,
          currentStep: 0,
          formData: {
             'areaUnit': 'rai',
             'landOwnershipType': 'owned',
             'waterSourceType': 'well',
             'soilType': 'loam',
             'plantingSystem': 'soil',
             'plantingMethod': 'seeds',
             'tempControl': false,
             'dispensingMethod': 'pharmacy',
             'importExportType': 'import',
             'transportMode': 'air',
          },
          documents: {},
          selectedEstablishmentId: null,
        );
      },
    );
  }

  void resetForm() {
    state = state.copyWith(
      isSuccess: false,
      error: null,
      currentStep: 0,
      selectedFormType: 'GACP_FORM_9',
      formData: {
         'areaUnit': 'rai',
         'landOwnershipType': 'owned',
         'waterSourceType': 'well',
         'soilType': 'loam',
         'plantingSystem': 'soil',
         'plantingMethod': 'seeds',
         'tempControl': false,
         'dispensingMethod': 'pharmacy',
         'importExportType': 'import',
         'transportMode': 'air',
      },
      documents: {},
      selectedEstablishmentId: null,
    );
  }
}

// 4. Provider
final applicationProvider = StateNotifierProvider<ApplicationNotifier, ApplicationState>((ref) {
  final repository = ref.watch(applicationRepositoryProvider);
  return ApplicationNotifier(repository);
});
