import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/gacp_application_models.dart';

class ApplicationFormNotifier extends StateNotifier<GACPApplication> {
  ApplicationFormNotifier()
      : super(const GACPApplication(
          profile: ApplicantProfile(),
          location: SiteLocation(),
          securityMeasures: SecurityChecklist(),
          production: ProductionPlan(),
        ));

  // --- Step 0: Plant Config ---
  void setPlant(String plantId) {
    state = state.copyWith(plantId: plantId);
  }

  void setEstablishmentId(String id) {
    state = state.copyWith(establishmentId: id);
  }

  // --- Step 1: Standards ---
  void acceptStandards(bool isAccepted) {
    state = state.copyWith(acceptedStandards: isAccepted);
  }

  // --- Step 2: Request Type ---
  void setServiceType(ServiceType type) {
    state = state.copyWith(type: type);
  }

  // --- Step 3: Terms ---
  void consentPDPA(bool isConsented) {
    state = state.copyWith(consentedPDPA: isConsented);
  }

  // --- Step 4: Profile & License ---
  void updateProfile({
    String? applicantType,
    String? name,
    String? idCard,
    String? address,
    String? mobile,
    String? email,
    String? responsibleName,
    String? qualification,
  }) {
    state = state.copyWith(
      profile: state.profile.copyWith(
        applicantType: applicantType,
        name: name,
        idCard: idCard,
        address: address,
        mobile: mobile,
        email: email,
        responsibleName: responsibleName,
        qualification: qualification,
      ),
    );
  }

  void updateLicense({
    String? plantingStatus,
    String? notifyNumber,
    List<String>? licenses,
    String? licenseNumber,
    String? licenseType,
    String? licenseExpiry,
  }) {
    final currentLicense = state.licenseInfo ?? const LegalLicense();
    state = state.copyWith(
      licenseInfo: currentLicense.copyWith(
        plantingStatus: plantingStatus,
        notifyNumber: notifyNumber,
        licenses: licenses,
        licenseNumber: licenseNumber,
        licenseType: licenseType,
        licenseExpiry: licenseExpiry,
      ),
    );
  }

  /// Generic field update for dynamic form fields
  void updateField(String fieldName, dynamic value) {
    switch (fieldName) {
      case 'hasGapHistory':
        state = state.copyWith(hasGapHistory: value as bool?);
        break;
      case 'gapCertificateNumber':
        state = state.copyWith(gapCertificateNumber: value as String?);
        break;
      default:
        // For unknown fields, log a warning (could add more fields as needed)
        break;
    }
  }

  void updateReplacementReason({
    String? reason,
    String? policeReportNo,
    String? policeStation,
    DateTime? reportDate,
  }) {
    final currentReason = state.replacementReason ?? const ReplacementReason();
    state = state.copyWith(
      replacementReason: currentReason.copyWith(
        reason: reason,
        policeReportNo: policeReportNo,
        policeStation: policeStation,
        reportDate: reportDate,
      ),
    );
  }

  // --- Step 5: Location & Security ---
  void updateLocation({
    String? name,
    String? address,
    String? north,
    String? south,
    String? east,
    String? west,
  }) {
    state = state.copyWith(
      location: state.location.copyWith(
        name: name,
        address: address,
        north: north,
        south: south,
        east: east,
        west: west,
      ),
    );
  }

  void updateSecurity({
    bool? hasFence,
    bool? hasCCTV,
    bool? hasAccessControl,
    bool? hasAnimalBarrier,
    bool? hasZoning,
  }) {
    state = state.copyWith(
      securityMeasures: state.securityMeasures.copyWith(
        hasFence: hasFence,
        hasCCTV: hasCCTV,
        hasAccessControl: hasAccessControl,
        hasAnimalBarrier: hasAnimalBarrier,
        hasZoning: hasZoning,
      ),
    );
  }

  // --- Step 6: Production ---
  void updateProduction({
    List<String>? plantParts,
    String? sourceType,
    String? sourceDetail,
    double? areaSizeRai,
    String? areaSizeUnit,
    int? treeCount,
    double? estimatedYield,
    String? cycle,
  }) {
    state = state.copyWith(
      production: state.production.copyWith(
        plantParts: plantParts,
        sourceType: sourceType,
        sourceDetail: sourceDetail,
        areaSizeRai: areaSizeRai,
        areaSizeUnit: areaSizeUnit,
        treeCount: treeCount,
        estimatedYield: estimatedYield,
        productionCycle: cycle,
      ),
    );
  }

  // New methods for Farm Inputs & Post Harvest
  void addFarmInput(FarmInputItem item) {
    final newInputs = List<FarmInputItem>.from(state.production.farmInputs)
      ..add(item);
    state = state.copyWith(
        production: state.production.copyWith(farmInputs: newInputs));
  }

  void removeFarmInput(int index) {
    final newInputs = List<FarmInputItem>.from(state.production.farmInputs)
      ..removeAt(index);
    state = state.copyWith(
        production: state.production.copyWith(farmInputs: newInputs));
  }

  void updatePostHarvest({String? drying, String? packaging, String? storage}) {
    state = state.copyWith(
        production: state.production.copyWith(
            postHarvest: state.production.postHarvest.copyWith(
                dryingMethod: drying, packaging: packaging, storage: storage)));
  }
}

final applicationFormProvider =
    StateNotifierProvider<ApplicationFormNotifier, GACPApplication>((ref) {
  return ApplicationFormNotifier();
});
