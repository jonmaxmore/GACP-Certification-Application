// GACP Application Models - V2 Master Spec

// 1. Enums & Constants
enum PlantGroup {
  highControl, // Cannabis, Kratom (Group A)
  generalHerb // Turmeric, Ginger, etc. (Group B)
}

enum ServiceType { newApplication, renewal, replacement }

enum SecurityLevel {
  strict, // Fence + CCTV + Access Log
  basic // Animal Barrier + Zoning
}

// 2. Plant Configuration Model (Config Driven UI)
class PlantConfig {
  final String id; // 'CAN', 'TUR', etc.
  final String nameTH;
  final String nameEN;
  final PlantGroup group;
  final bool requiresLicense; // Logic for Step 4
  final SecurityLevel security; // Logic for Step 5
  final String productionUnit; // 'Tree' or 'Rai' (Step 6)
  final List<String> requiredDocs; // Dynamic Doc List IDs

  const PlantConfig({
    required this.id,
    required this.nameTH,
    required this.nameEN,
    required this.group,
    required this.requiresLicense,
    required this.security,
    required this.productionUnit,
    required this.requiredDocs,
  });
}

// Master Spec Data: 6 Plants
final Map<String, PlantConfig> plantConfigs = {
  // GROUP A: High Control
  'CAN': const PlantConfig(
    id: 'CAN',
    nameTH: 'กัญชา',
    nameEN: 'Cannabis',
    group: PlantGroup.highControl,
    requiresLicense: true,
    security: SecurityLevel.strict,
    productionUnit: 'Tree',
    requiredDocs: [
      'doc_license_bht',
      'doc_cctv_plan',
      'doc_site_map',
      'doc_sop'
    ],
  ),
  'KRA': const PlantConfig(
    id: 'KRA',
    nameTH: 'กระท่อม',
    nameEN: 'Kratom',
    group: PlantGroup.highControl,
    requiresLicense: true,
    security: SecurityLevel.strict,
    productionUnit: 'Tree',
    requiredDocs: ['doc_license_bht', 'doc_location_plan'],
  ),
  // GROUP B: General Herbs
  'TUR': const PlantConfig(
    id: 'TUR',
    nameTH: 'ขมิ้นชัน',
    nameEN: 'Turmeric',
    group: PlantGroup.generalHerb,
    requiresLicense: false,
    security: SecurityLevel.basic,
    productionUnit: 'Rai',
    requiredDocs: ['doc_gap_cert', 'doc_soil_analysis'],
  ),
  'GIN': const PlantConfig(
    id: 'GIN',
    nameTH: 'ขิง',
    nameEN: 'Ginger',
    group: PlantGroup.generalHerb,
    requiresLicense: false,
    security: SecurityLevel.basic,
    productionUnit: 'Rai',
    requiredDocs: ['doc_gap_cert', 'doc_soil_analysis'],
  ),
  'GAL': const PlantConfig(
    id: 'GAL',
    nameTH: 'กระชายดำ',
    nameEN: 'Black Galingale',
    group: PlantGroup.generalHerb,
    requiresLicense: false,
    security: SecurityLevel.basic,
    productionUnit: 'Rai',
    requiredDocs: ['doc_gap_cert', 'doc_soil_analysis'],
  ),
  'PLA': const PlantConfig(
    id: 'PLA',
    nameTH: 'ไพล',
    nameEN: 'Plai',
    group: PlantGroup.generalHerb,
    requiresLicense: false,
    security: SecurityLevel.basic,
    productionUnit: 'Rai',
    requiredDocs: ['doc_gap_cert', 'doc_soil_analysis'],
  ),
};

// 3. Application Data Model (The Payload)
class GACPApplication {
  final String? applicationId;
  final String? establishmentId; // Selected Farm ID
  final String? plantId; // Selected in Step 0
  final ServiceType? type; // Selected in Step 2

  // --- Step 4: Profile & License ---
  final ApplicantProfile profile;
  final LegalLicense? licenseInfo; // Nullable (Only for Group A)
  final ReplacementReason? replacementReason; // For Replacement Logic

  // --- Step 5: Site & Security ---
  final SiteLocation location;
  final SecurityChecklist securityMeasures;

  // --- Step 6: Production ---
  final ProductionPlan production;

  // --- Step 1 & 3: Consents ---
  final bool acceptedStandards; // Step 1
  final bool consentedPDPA; // Step 3

  // --- Step 8: signature ---
  final String? signatureBase64;

  const GACPApplication({
    this.applicationId,
    this.establishmentId,
    this.plantId,
    this.type,
    required this.profile,
    this.licenseInfo,
    this.replacementReason,
    required this.location,
    required this.securityMeasures,
    required this.production,
    this.acceptedStandards = false,
    this.consentedPDPA = false,
    this.signatureBase64,
  });

  GACPApplication copyWith({
    String? applicationId,
    String? establishmentId,
    String? plantId,
    ServiceType? type,
    ApplicantProfile? profile,
    LegalLicense? licenseInfo,
    ReplacementReason? replacementReason,
    SiteLocation? location,
    SecurityChecklist? securityMeasures,
    ProductionPlan? production,
    bool? acceptedStandards,
    bool? consentedPDPA,
    String? signatureBase64,
  }) {
    return GACPApplication(
      applicationId: applicationId ?? this.applicationId,
      establishmentId: establishmentId ?? this.establishmentId,
      plantId: plantId ?? this.plantId,
      type: type ?? this.type,
      profile: profile ?? this.profile,
      licenseInfo: licenseInfo ?? this.licenseInfo,
      replacementReason: replacementReason ?? this.replacementReason,
      location: location ?? this.location,
      securityMeasures: securityMeasures ?? this.securityMeasures,
      production: production ?? this.production,
      acceptedStandards: acceptedStandards ?? this.acceptedStandards,
      consentedPDPA: consentedPDPA ?? this.consentedPDPA,
      signatureBase64: signatureBase64 ?? this.signatureBase64,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'applicationId': applicationId,
      'establishmentId': establishmentId,
      'plantId': plantId,
      'type': type?.name,
      'profile': profile.toMap(),
      'licenseInfo': licenseInfo?.toMap(),
      'replacementReason': replacementReason?.toMap(),
      'location': location.toMap(),
      'securityMeasures': securityMeasures.toMap(),
      'production': production.toMap(),
      'acceptedStandards': acceptedStandards,
      'consentedPDPA': consentedPDPA,
      'signatureBase64': signatureBase64,
    };
  }

  factory GACPApplication.fromMap(Map<String, dynamic> map) {
    return GACPApplication(
      applicationId: map['applicationId'],
      establishmentId: map['establishmentId'],
      plantId: map['plantId'],
      type: map['type'] != null
          ? ServiceType.values.firstWhere((e) => e.name == map['type'])
          : null,
      profile: ApplicantProfile.fromMap(map['profile'] ?? {}),
      licenseInfo: map['licenseInfo'] != null
          ? LegalLicense.fromMap(map['licenseInfo'])
          : null,
      replacementReason: map['replacementReason'] != null
          ? ReplacementReason.fromMap(map['replacementReason'])
          : null,
      location: SiteLocation.fromMap(map['location'] ?? {}),
      securityMeasures:
          SecurityChecklist.fromMap(map['securityMeasures'] ?? {}),
      production: ProductionPlan.fromMap(map['production'] ?? {}),
      acceptedStandards: map['acceptedStandards'] ?? false,
      consentedPDPA: map['consentedPDPA'] ?? false,
      signatureBase64: map['signatureBase64'],
    );
  }
}

// Sub-models
class ApplicantProfile {
  final String applicantType; // Individual, Community, Juristic
  final String name;
  final String idCard;
  final String address;
  final String mobile;
  final String email;

  // Responsible Person
  final String responsibleName;
  final String qualification; // Thai Med, Folk Doc, Trained

  const ApplicantProfile({
    this.applicantType = 'Individual',
    this.name = '',
    this.idCard = '',
    this.address = '',
    this.mobile = '',
    this.email = '',
    this.responsibleName = '',
    this.qualification = 'Through Training',
  });

  ApplicantProfile copyWith({
    String? applicantType,
    String? name,
    String? idCard,
    String? address,
    String? mobile,
    String? email,
    String? responsibleName,
    String? qualification,
  }) {
    return ApplicantProfile(
      applicantType: applicantType ?? this.applicantType,
      name: name ?? this.name,
      idCard: idCard ?? this.idCard,
      address: address ?? this.address,
      mobile: mobile ?? this.mobile,
      email: email ?? this.email,
      responsibleName: responsibleName ?? this.responsibleName,
      qualification: qualification ?? this.qualification,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'applicantType': applicantType,
      'name': name,
      'idCard': idCard,
      'address': address,
      'mobile': mobile,
      'email': email,
      'responsibleName': responsibleName,
      'qualification': qualification,
    };
  }

  factory ApplicantProfile.fromMap(Map<String, dynamic> map) {
    return ApplicantProfile(
      applicantType: map['applicantType'] ?? 'Individual',
      name: map['name'] ?? '',
      idCard: map['idCard'] ?? '',
      address: map['address'] ?? '',
      mobile: map['mobile'] ?? '',
      email: map['email'] ?? '',
      responsibleName: map['responsibleName'] ?? '',
      qualification: map['qualification'] ?? 'Through Training',
    );
  }
}

// 3.1 License Info (Adaptive for Group A)
class LegalLicense {
  final String plantingStatus; // 'Notify', 'Permission'
  final String notifyNumber; // เลขจดแจ้ง
  final List<String> licenses; // PT11, PT13, PT16
  final String licenseNumber; // Number for the selected license

  const LegalLicense({
    this.plantingStatus = 'Notify',
    this.notifyNumber = '',
    this.licenses = const [],
    this.licenseNumber = '',
  });

  LegalLicense copyWith({
    String? plantingStatus,
    String? notifyNumber,
    List<String>? licenses,
    String? licenseNumber,
  }) {
    return LegalLicense(
      plantingStatus: plantingStatus ?? this.plantingStatus,
      notifyNumber: notifyNumber ?? this.notifyNumber,
      licenses: licenses ?? this.licenses,
      licenseNumber: licenseNumber ?? this.licenseNumber,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'plantingStatus': plantingStatus,
      'notifyNumber': notifyNumber,
      'licenses': licenses,
      'licenseNumber': licenseNumber,
    };
  }

  factory LegalLicense.fromMap(Map<String, dynamic> map) {
    return LegalLicense(
      plantingStatus: map['plantingStatus'] ?? 'Notify',
      notifyNumber: map['notifyNumber'] ?? '',
      licenses: List<String>.from(map['licenses'] ?? []),
      licenseNumber: map['licenseNumber'] ?? '',
    );
  }
}

class ReplacementReason {
  final String reason; // 'Lost', 'Damaged'
  final String policeReportNo;
  final String policeStation;
  final DateTime? reportDate;

  const ReplacementReason({
    this.reason = 'Lost',
    this.policeReportNo = '',
    this.policeStation = '',
    this.reportDate,
  });

  ReplacementReason copyWith({
    String? reason,
    String? policeReportNo,
    String? policeStation,
    DateTime? reportDate,
  }) {
    return ReplacementReason(
      reason: reason ?? this.reason,
      policeReportNo: policeReportNo ?? this.policeReportNo,
      policeStation: policeStation ?? this.policeStation,
      reportDate: reportDate ?? this.reportDate,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'reason': reason,
      'policeReportNo': policeReportNo,
      'policeStation': policeStation,
      'reportDate': reportDate?.toIso8601String(),
    };
  }

  factory ReplacementReason.fromMap(Map<String, dynamic> map) {
    return ReplacementReason(
      reason: map['reason'] ?? 'Lost',
      policeReportNo: map['policeReportNo'] ?? '',
      policeStation: map['policeStation'] ?? '',
      reportDate: map['reportDate'] != null
          ? DateTime.tryParse(map['reportDate'])
          : null,
    );
  }
}

class SiteLocation {
  final String name;
  final String address;
  final double? lat;
  final double? lng;
  // Risk Assessment
  final String north;
  final String south;
  final String east;
  final String west;

  const SiteLocation({
    this.name = '',
    this.address = '',
    this.lat,
    this.lng,
    this.north = '',
    this.south = '',
    this.east = '',
    this.west = '',
  });

  SiteLocation copyWith({
    String? name,
    String? address,
    double? lat,
    double? lng,
    String? north,
    String? south,
    String? east,
    String? west,
  }) {
    return SiteLocation(
      name: name ?? this.name,
      address: address ?? this.address,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      north: north ?? this.north,
      south: south ?? this.south,
      east: east ?? this.east,
      west: west ?? this.west,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'address': address,
      'lat': lat,
      'lng': lng,
      'north': north,
      'south': south,
      'east': east,
      'west': west,
    };
  }

  factory SiteLocation.fromMap(Map<String, dynamic> map) {
    return SiteLocation(
      name: map['name'] ?? '',
      address: map['address'] ?? '',
      lat: map['lat'],
      lng: map['lng'],
      north: map['north'] ?? '',
      south: map['south'] ?? '',
      east: map['east'] ?? '',
      west: map['west'] ?? '',
    );
  }
}

class SecurityChecklist {
  final bool hasFence;
  final bool hasCCTV;
  final bool hasAccessControl;
  final bool hasAnimalBarrier;
  final bool hasZoning;

  const SecurityChecklist({
    this.hasFence = false,
    this.hasCCTV = false,
    this.hasAccessControl = false,
    this.hasAnimalBarrier = false,
    this.hasZoning = false,
  });

  SecurityChecklist copyWith({
    bool? hasFence,
    bool? hasCCTV,
    bool? hasAccessControl,
    bool? hasAnimalBarrier,
    bool? hasZoning,
  }) {
    return SecurityChecklist(
      hasFence: hasFence ?? this.hasFence,
      hasCCTV: hasCCTV ?? this.hasCCTV,
      hasAccessControl: hasAccessControl ?? this.hasAccessControl,
      hasAnimalBarrier: hasAnimalBarrier ?? this.hasAnimalBarrier,
      hasZoning: hasZoning ?? this.hasZoning,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'hasFence': hasFence,
      'hasCCTV': hasCCTV,
      'hasAccessControl': hasAccessControl,
      'hasAnimalBarrier': hasAnimalBarrier,
      'hasZoning': hasZoning,
    };
  }

  factory SecurityChecklist.fromMap(Map<String, dynamic> map) {
    return SecurityChecklist(
      hasFence: map['hasFence'] ?? false,
      hasCCTV: map['hasCCTV'] ?? false,
      hasAccessControl: map['hasAccessControl'] ?? false,
      hasAnimalBarrier: map['hasAnimalBarrier'] ?? false,
      hasZoning: map['hasZoning'] ?? false,
    );
  }
}

// Model for 6.4 Farm Inputs
class FarmInputItem {
  final String type; // ปุ๋ยอินทรีย์, ปุ๋ยเคมี, ฮอร์โมน, etc.
  final String name; // Trade Name
  final String regNo; // Registration Number

  const FarmInputItem({
    this.type = 'Organic Fertilizer',
    this.name = '',
    this.regNo = '',
  });

  Map<String, dynamic> toMap() {
    return {
      'type': type,
      'name': name,
      'regNo': regNo,
    };
  }

  factory FarmInputItem.fromMap(Map<String, dynamic> map) {
    return FarmInputItem(
      type: map['type'] ?? '',
      name: map['name'] ?? '',
      regNo: map['regNo'] ?? '',
    );
  }
}

// Model for 6.5 Post-Harvest
class PostHarvestPlan {
  final String dryingMethod; // Sun Dry, Oven, Solar Dome
  final String packaging; // Vacuum, Foil, Plastic Box
  final String storage; // Room 25C, Warehouse

  const PostHarvestPlan({
    this.dryingMethod = 'Sun Dry',
    this.packaging = '',
    this.storage = '',
  });

  PostHarvestPlan copyWith({
    String? dryingMethod,
    String? packaging,
    String? storage,
  }) {
    return PostHarvestPlan(
      dryingMethod: dryingMethod ?? this.dryingMethod,
      packaging: packaging ?? this.packaging,
      storage: storage ?? this.storage,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'dryingMethod': dryingMethod,
      'packaging': packaging,
      'storage': storage,
    };
  }

  factory PostHarvestPlan.fromMap(Map<String, dynamic> map) {
    return PostHarvestPlan(
      dryingMethod: map['dryingMethod'] ?? 'Sun Dry',
      packaging: map['packaging'] ?? '',
      storage: map['storage'] ?? '',
    );
  }
}

// 3.2 Production Plan (Adaptive)
class ProductionPlan {
  final List<String> plantParts; // Flower, Leaf, etc.
  final String sourceType; // Import, Buy, Self
  final String sourceDetail; // License No, Seller Name, or Lot No

  // Adaptive Units
  final double? areaSizeRai; // For Group B
  final String? areaSizeUnit; // Rai, Ngan, Wah
  final int? treeCount; // For Group A

  final double estimatedYield; // Kg or Ton based on context
  final String productionCycle; // 3-4 months, etc.

  // New Modules 6.4 & 6.5
  final List<FarmInputItem> farmInputs;
  final PostHarvestPlan postHarvest;

  const ProductionPlan({
    this.plantParts = const [],
    this.sourceType = 'Self',
    this.sourceDetail = '',
    this.areaSizeRai,
    this.areaSizeUnit = 'Rai',
    this.treeCount,
    this.estimatedYield = 0.0,
    this.productionCycle = '',
    this.farmInputs = const [],
    this.postHarvest = const PostHarvestPlan(),
  });

  ProductionPlan copyWith({
    List<String>? plantParts,
    String? sourceType,
    String? sourceDetail,
    double? areaSizeRai,
    String? areaSizeUnit,
    int? treeCount,
    double? estimatedYield,
    String? productionCycle,
    List<FarmInputItem>? farmInputs,
    PostHarvestPlan? postHarvest,
  }) {
    return ProductionPlan(
      plantParts: plantParts ?? this.plantParts,
      sourceType: sourceType ?? this.sourceType,
      sourceDetail: sourceDetail ?? this.sourceDetail,
      areaSizeRai: areaSizeRai ?? this.areaSizeRai,
      areaSizeUnit: areaSizeUnit ?? this.areaSizeUnit,
      treeCount: treeCount ?? this.treeCount,
      estimatedYield: estimatedYield ?? this.estimatedYield,
      productionCycle: productionCycle ?? this.productionCycle,
      farmInputs: farmInputs ?? this.farmInputs,
      postHarvest: postHarvest ?? this.postHarvest,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'plantParts': plantParts,
      'sourceType': sourceType,
      'sourceDetail': sourceDetail,
      'areaSizeRai': areaSizeRai,
      'areaSizeUnit': areaSizeUnit,
      'treeCount': treeCount,
      'estimatedYield': estimatedYield,
      'productionCycle': productionCycle,
      'farmInputs': farmInputs.map((e) => e.toMap()).toList(),
      'postHarvest': postHarvest.toMap(),
    };
  }

  factory ProductionPlan.fromMap(Map<String, dynamic> map) {
    return ProductionPlan(
      plantParts: List<String>.from(map['plantParts'] ?? []),
      sourceType: map['sourceType'] ?? 'Self',
      sourceDetail: map['sourceDetail'] ?? '',
      areaSizeRai: map['areaSizeRai']?.toDouble(),
      areaSizeUnit: map['areaSizeUnit'],
      treeCount: map['treeCount']?.toInt(),
      estimatedYield: map['estimatedYield']?.toDouble() ?? 0.0,
      productionCycle: map['productionCycle'] ?? '',
      farmInputs: (map['farmInputs'] as List<dynamic>?)
              ?.map((e) => FarmInputItem.fromMap(e))
              .toList() ??
          [],
      postHarvest: PostHarvestPlan.fromMap(map['postHarvest'] ?? {}),
    );
  }
}

// 4. Validation Logic Helper
class FormValidator {
  static bool validateStep4(GACPApplication app, PlantConfig config) {
    if (app.type == ServiceType.replacement) {
      final r = app.replacementReason;
      if (r == null) return false;
      if (r.reason == 'Lost') return r.policeReportNo.isNotEmpty;
      return true; // If damaged, just need photo in Step 7
    }

    // 1. Validate Profile (Always Required for New/Renew)
    if (app.profile.name.isEmpty ||
        app.profile.idCard.isEmpty ||
        app.profile.responsibleName.isEmpty) {
      return false;
    }

    // 2. Validate License (If Group A)
    if (config.requiresLicense) {
      // Deep logic: if PlantingStatus == Notify, need notifyNumber
      if (app.licenseInfo?.plantingStatus == 'Notify' &&
          (app.licenseInfo?.notifyNumber.isEmpty ?? true)) return false;
      if (app.licenseInfo?.plantingStatus == 'Permission' &&
          (app.licenseInfo?.licenseNumber.isEmpty ?? true)) return false;
    }
    return true;
  }

  static bool validateStep5(SecurityChecklist list, PlantConfig config) {
    if (config.security == SecurityLevel.strict) {
      return list.hasFence && list.hasCCTV && list.hasAccessControl;
    } else {
      return list.hasAnimalBarrier && list.hasZoning;
    }
  }

  static bool validateStep6(ProductionPlan plan, PlantConfig config) {
    if (plan.plantParts.isEmpty) return false;

    if (config.productionUnit == 'Tree') {
      if ((plan.treeCount ?? 0) <= 0) return false;
    } else {
      if ((plan.areaSizeRai ?? 0.0) <= 0) return false;
    }

    // Post Harvest Required?
    if (plan.postHarvest.packaging.isEmpty || plan.postHarvest.storage.isEmpty)
      return false;

    return true;
  }
}
