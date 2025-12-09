import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:hive_flutter/hive_flutter.dart';

// --- Strong-typed Data Model ---
class ApplicationFormData {
// ... existing ApplicationFormData code ...
// (I will try to target specific blocks to avoid re-writing the whole big class if possible, or just the top and the State class)
// Since the file content is provided, I'll use target/replace efficiently.
// But wait, removing duplicate imports at the top requires replacing the top block.

  final String formType; // ktl1, pt09, pt10, pt11
  final String requestCategory; // new, renew

  // Step 1: Applicant
  final String applicantType; // community, individual, juristic
  final String entityName;
  final String presidentName;
  final String regCode1; // SWC.01 or Juristic ID
  final String regCode2; // TWC.3
  final String idCard;
  final String houseId;
  final String address;
  final String phone;
  final String email;
  final String lineId;

  // Step 2: Objective & Area
  final String objective; // medical, export
  final String areaType; // outdoor, indoor, greenhouse
  final String establishmentName;
  final String locationAddress;
  final String lat;
  final String landDocType;
  final String landDocNo;
  final String landVol;
  final String landOwnership; // owner, tenant
  final String landOwnerName;
  final String areaSize;

  // Step 3: Product (Composite Step 1 also covers this)
  final String processType;
  final String plantPart;
  final String strainName;
  final String sourceOrigin;
  final String sourceName;
  final String quantity;

  // New Fields for Composite Wizard
  // PT.11 Distribution (Step 2)
  final String productDescription;
  final List<String> salesChannels;

  // PT.10 Export (Step 3 - Optional)
  final bool isExportEnabled;
  final String exportDestination;
  final String transportMethod;

  // Step 4: Facility Standard (KTL.1)
  final String productionPlanDetails;
  final String securityMeasures;
  final String wasteManagement;
  final List<String> sopChecklist;

  ApplicationFormData({
    this.formType = '',
    this.requestCategory = 'new',
    this.applicantType = 'individual',
    this.entityName = '',
    this.presidentName = '',
    this.regCode1 = '',
    this.regCode2 = '',
    this.idCard = '',
    this.houseId = '',
    this.address = '',
    this.phone = '',
    this.email = '',
    this.lineId = '',
    this.objective = '',
    this.areaType = '',
    this.establishmentName = '',
    this.locationAddress = '',
    this.lat = '',
    this.landDocType = '',
    this.landDocNo = '',
    this.landVol = '',
    this.landOwnership = 'owner',
    this.landOwnerName = '',
    this.areaSize = '',
    this.processType = 'production',
    this.plantPart = '',
    this.strainName = '',
    this.sourceOrigin = 'domestic',
    this.sourceName = '',
    this.quantity = '',
    this.productDescription = '',
    this.salesChannels = const [],
    this.isExportEnabled = false,
    this.exportDestination = '',
    this.transportMethod = '',
    this.productionPlanDetails = '',
    this.securityMeasures = '',
    this.wasteManagement = '',
    this.sopChecklist = const [],
  });

  factory ApplicationFormData.fromJson(Map<String, dynamic> json) {
    return ApplicationFormData(
      formType: json['formType'] ?? '',
      requestCategory: json['requestCategory'] ?? 'new',
      applicantType: json['applicantType'] ?? 'individual',
      entityName: json['entityName'] ?? '',
      presidentName: json['presidentName'] ?? '',
      regCode1: json['regCode1'] ?? '',
      regCode2: json['regCode2'] ?? '',
      idCard: json['idCard'] ?? '',
      houseId: json['houseId'] ?? '',
      address: json['address'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      lineId: json['lineId'] ?? '',
      objective: json['objective'] ?? '',
      areaType: json['areaType'] ?? '',
      establishmentName: json['establishmentName'] ?? '',
      locationAddress: json['locationAddress'] ?? '',
      lat: json['lat'] ?? '',
      landDocType: json['landDocType'] ?? '',
      landDocNo: json['landDocNo'] ?? '',
      landVol: json['landVol'] ?? '',
      landOwnership: json['landOwnership'] ?? 'owner',
      landOwnerName: json['landOwnerName'] ?? '',
      areaSize: json['areaSize'] ?? '',
      processType: json['processType'] ?? 'production',
      plantPart: json['plantPart'] ?? '',
      strainName: json['strainName'] ?? '',
      sourceOrigin: json['sourceOrigin'] ?? 'domestic',
      sourceName: json['sourceName'] ?? '',
      quantity: json['quantity'] ?? '',
      productDescription: json['productDescription'] ?? '',
      salesChannels:
          (json['salesChannels'] as List?)?.map((e) => e.toString()).toList() ??
              [],
      isExportEnabled: json['isExportEnabled'] ?? false,
      exportDestination: json['exportDestination'] ?? '',
      transportMethod: json['transportMethod'] ?? '',
      productionPlanDetails: json['productionPlanDetails'] ?? '',
      securityMeasures: json['securityMeasures'] ?? '',
      wasteManagement: json['wasteManagement'] ?? '',
      sopChecklist:
          (json['sopChecklist'] as List?)?.map((e) => e.toString()).toList() ??
              [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'formType': formType,
      'requestCategory': requestCategory,
      'applicantType': applicantType,
      'entityName': entityName,
      'presidentName': presidentName,
      'regCode1': regCode1,
      'regCode2': regCode2,
      'idCard': idCard,
      'houseId': houseId,
      'address': address,
      'phone': phone,
      'email': email,
      'lineId': lineId,
      'objective': objective,
      'areaType': areaType,
      'establishmentName': establishmentName,
      'locationAddress': locationAddress,
      'lat': lat,
      'landDocType': landDocType,
      'landDocNo': landDocNo,
      'landVol': landVol,
      'landOwnership': landOwnership,
      'landOwnerName': landOwnerName,
      'areaSize': areaSize,
      'processType': processType,
      'plantPart': plantPart,
      'strainName': strainName,
      'sourceOrigin': sourceOrigin,
      'sourceName': sourceName,
      'quantity': quantity,
      'productDescription': productDescription,
      'salesChannels': salesChannels,
      'isExportEnabled': isExportEnabled,
      'exportDestination': exportDestination,
      'transportMethod': transportMethod,
      'productionPlanDetails': productionPlanDetails,
      'securityMeasures': securityMeasures,
      'wasteManagement': wasteManagement,
      'sopChecklist': sopChecklist,
    };
  }

  ApplicationFormData copyWith({
    String? formType,
    String? requestCategory,
    String? applicantType,
    String? entityName,
    String? presidentName,
    String? regCode1,
    String? regCode2,
    String? idCard,
    String? houseId,
    String? address,
    String? phone,
    String? email,
    String? lineId,
    String? objective,
    String? areaType,
    String? establishmentName,
    String? locationAddress,
    String? lat,
    String? landDocType,
    String? landDocNo,
    String? landVol,
    String? landOwnership,
    String? landOwnerName,
    String? areaSize,
    String? processType,
    String? plantPart,
    String? strainName,
    String? sourceOrigin,
    String? sourceName,
    String? quantity,
    String? productDescription,
    List<String>? salesChannels,
    bool? isExportEnabled,
    String? exportDestination,
    String? transportMethod,
    String? productionPlanDetails,
    String? securityMeasures,
    String? wasteManagement,
    List<String>? sopChecklist,
  }) {
    return ApplicationFormData(
      formType: formType ?? this.formType,
      requestCategory: requestCategory ?? this.requestCategory,
      applicantType: applicantType ?? this.applicantType,
      entityName: entityName ?? this.entityName,
      presidentName: presidentName ?? this.presidentName,
      regCode1: regCode1 ?? this.regCode1,
      regCode2: regCode2 ?? this.regCode2,
      idCard: idCard ?? this.idCard,
      houseId: houseId ?? this.houseId,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      lineId: lineId ?? this.lineId,
      objective: objective ?? this.objective,
      areaType: areaType ?? this.areaType,
      establishmentName: establishmentName ?? this.establishmentName,
      locationAddress: locationAddress ?? this.locationAddress,
      lat: lat ?? this.lat,
      landDocType: landDocType ?? this.landDocType,
      landDocNo: landDocNo ?? this.landDocNo,
      landVol: landVol ?? this.landVol,
      landOwnership: landOwnership ?? this.landOwnership,
      landOwnerName: landOwnerName ?? this.landOwnerName,
      areaSize: areaSize ?? this.areaSize,
      processType: processType ?? this.processType,
      plantPart: plantPart ?? this.plantPart,
      strainName: strainName ?? this.strainName,
      sourceOrigin: sourceOrigin ?? this.sourceOrigin,
      sourceName: sourceName ?? this.sourceName,
      quantity: quantity ?? this.quantity,
      productDescription: productDescription ?? this.productDescription,
      salesChannels: salesChannels ?? this.salesChannels,
      isExportEnabled: isExportEnabled ?? this.isExportEnabled,
      exportDestination: exportDestination ?? this.exportDestination,
      transportMethod: transportMethod ?? this.transportMethod,
      productionPlanDetails:
          productionPlanDetails ?? this.productionPlanDetails,
      securityMeasures: securityMeasures ?? this.securityMeasures,
      wasteManagement: wasteManagement ?? this.wasteManagement,
      sopChecklist: sopChecklist ?? this.sopChecklist,
    );
  }
}

// --- State Class ---
class ApplicationFormState {
  final ApplicationFormData data;
  final Map<String, PlatformFile> attachments;
  final bool isLoading;
  final String? error;

  ApplicationFormState({
    required this.data,
    this.attachments = const {},
    this.isLoading = false,
    this.error,
  });

  factory ApplicationFormState.initial() {
    return ApplicationFormState(data: ApplicationFormData());
  }

  // Proxies for UI convenience
  String get formType => data.formType;
  String get requestCategory => data.requestCategory;
  String get applicantType => data.applicantType;
  String get entityName => data.entityName;
  String get presidentName => data.presidentName;
  String get regCode1 => data.regCode1;
  String get regCode2 => data.regCode2;
  String get idCard => data.idCard;
  String get houseId => data.houseId;
  String get address => data.address;
  String get phone => data.phone;
  String get email => data.email;
  String get lineId => data.lineId;
  String get objective => data.objective;
  String get areaType => data.areaType;
  String get establishmentName => data.establishmentName;
  String get locationAddress => data.locationAddress;
  String get lat => data.lat;
  String get landDocType => data.landDocType;
  String get landDocNo => data.landDocNo;
  String get landVol => data.landVol;
  String get landOwnership => data.landOwnership;
  String get landOwnerName => data.landOwnerName;
  String get areaSize => data.areaSize;
  String get processType => data.processType;
  String get plantPart => data.plantPart;
  String get strainName => data.strainName;
  String get sourceOrigin => data.sourceOrigin;
  String get sourceName => data.sourceName;
  String get quantity => data.quantity;
  String get productDescription => data.productDescription;
  List<String> get salesChannels => data.salesChannels;
  bool get isExportEnabled => data.isExportEnabled;
  String get exportDestination => data.exportDestination;
  String get transportMethod => data.transportMethod;
  String get productionPlanDetails => data.productionPlanDetails;
  String get securityMeasures => data.securityMeasures;
  String get wasteManagement => data.wasteManagement;
  List<String> get sopChecklist => data.sopChecklist;

  ApplicationFormState copyWith({
    ApplicationFormData? data,
    Map<String, PlatformFile>? attachments,
    bool? isLoading,
    String? error,
  }) {
    return ApplicationFormState(
      data: data ?? this.data,
      attachments: attachments ?? this.attachments,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// --- Notifier ---
class ApplicationFormNotifier extends StateNotifier<ApplicationFormState> {
  ApplicationFormNotifier() : super(ApplicationFormState.initial());

  void update(String key, dynamic value) {
    ApplicationFormData newData = state.data;
    switch (key) {
      case 'formType':
        newData = newData.copyWith(formType: value);
        break;
      case 'requestCategory':
        newData = newData.copyWith(requestCategory: value);
        break;
      case 'applicantType':
        newData = newData.copyWith(applicantType: value);
        break;
      case 'entityName':
        newData = newData.copyWith(entityName: value);
        break;
      case 'presidentName':
        newData = newData.copyWith(presidentName: value);
        break;
      case 'regCode1':
        newData = newData.copyWith(regCode1: value);
        break;
      case 'regCode2':
        newData = newData.copyWith(regCode2: value);
        break;
      case 'idCard':
        newData = newData.copyWith(idCard: value);
        break;
      case 'houseId':
        newData = newData.copyWith(houseId: value);
        break;
      case 'address':
        newData = newData.copyWith(address: value);
        break;
      case 'phone':
        newData = newData.copyWith(phone: value);
        break;
      case 'email':
        newData = newData.copyWith(email: value);
        break;
      case 'lineId':
        newData = newData.copyWith(lineId: value);
        break;
      case 'objective':
        newData = newData.copyWith(objective: value);
        break;
      case 'areaType':
        newData = newData.copyWith(areaType: value);
        break;
      case 'establishmentName':
        newData = newData.copyWith(establishmentName: value);
        break;
      case 'locationAddress':
        newData = newData.copyWith(locationAddress: value);
        break;
      case 'lat':
        newData = newData.copyWith(lat: value);
        break;
      case 'landDocType':
        newData = newData.copyWith(landDocType: value);
        break;
      case 'landDocNo':
        newData = newData.copyWith(landDocNo: value);
        break;
      case 'landVol':
        newData = newData.copyWith(landVol: value);
        break;
      case 'landOwnership':
        newData = newData.copyWith(landOwnership: value);
        break;
      case 'landOwnerName':
        newData = newData.copyWith(landOwnerName: value);
        break;
      case 'areaSize':
        newData = newData.copyWith(areaSize: value);
        break;
      case 'processType':
        newData = newData.copyWith(processType: value);
        break;
      case 'plantPart':
        newData = newData.copyWith(plantPart: value);
        break;
      case 'strainName':
        newData = newData.copyWith(strainName: value);
        break;
      case 'sourceOrigin':
        newData = newData.copyWith(sourceOrigin: value);
        break;
      case 'sourceName':
        newData = newData.copyWith(sourceName: value);
        break;
      case 'quantity':
        newData = newData.copyWith(quantity: value);
        break;
      case 'productDescription':
        newData = newData.copyWith(productDescription: value);
        break;
      case 'isExportEnabled':
        newData = newData.copyWith(isExportEnabled: value);
        break;
      case 'exportDestination':
        newData = newData.copyWith(exportDestination: value);
        break;
      case 'transportMethod':
        newData = newData.copyWith(transportMethod: value);
        break;
      case 'productionPlanDetails':
        newData = newData.copyWith(productionPlanDetails: value);
        break;
      case 'securityMeasures':
        newData = newData.copyWith(securityMeasures: value);
        break;
      case 'wasteManagement':
        newData = newData.copyWith(wasteManagement: value);
        break;
    }
    state = state.copyWith(data: newData);
  }

  void toggleSalesChannel(String item, bool isSelected) {
    final list = List<String>.from(state.data.salesChannels);
    if (isSelected) {
      if (!list.contains(item)) list.add(item);
    } else {
      list.remove(item);
    }
    state = state.copyWith(data: state.data.copyWith(salesChannels: list));
  }

  void toggleSop(String item, bool isSelected) {
    final list = List<String>.from(state.data.sopChecklist);
    if (isSelected) {
      if (!list.contains(item)) list.add(item);
    } else {
      list.remove(item);
    }
    state = state.copyWith(data: state.data.copyWith(sopChecklist: list));
  }

  void addAttachment(String key, PlatformFile file) {
    final newFiles = Map<String, PlatformFile>.from(state.attachments);
    newFiles[key] = file;
    state = state.copyWith(attachments: newFiles);
  }

  void removeAttachment(String key) {
    final newFiles = Map<String, PlatformFile>.from(state.attachments);
    newFiles.remove(key);
    state = state.copyWith(attachments: newFiles);
  }

  Future<void> saveDraft() async {
    final box = Hive.box('application_drafts');
    await box.put('current_draft', state.data.toJson());
  }

  Future<bool> loadDraft() async {
    try {
      final box = Hive.box('application_drafts');
      final draftData = box.get('current_draft');
      if (draftData != null && draftData is Map) {
        state = state.copyWith(
            data: ApplicationFormData.fromJson(
                Map<String, dynamic>.from(draftData)));
        return true;
      }
    } catch (e) {
      print('Error loading draft: $e');
      final box = Hive.box('application_drafts');
      await box.delete('current_draft');
    }
    return false;
  }
}

final applicationFormProvider = StateNotifierProvider.autoDispose<
    ApplicationFormNotifier, ApplicationFormState>((ref) {
  return ApplicationFormNotifier();
});
