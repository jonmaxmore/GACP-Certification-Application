import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/gacp_application_models.dart';

// State Provider
final applicationFormProvider =
    StateNotifierProvider<ApplicationFormNotifier, GACPApplication>((ref) {
  return ApplicationFormNotifier();
});

class ApplicationFormNotifier extends StateNotifier<GACPApplication> {
  ApplicationFormNotifier()
      : super(const GACPApplication(
          profile: ApplicantProfile(),
          location: SiteLocation(),
          securityMeasures: SecurityChecklist(),
          production: ProductionPlan(),
        ));

  // --- Step 0: Plant Selection ---
  void setPlant(String plantId) {
    state = state.copyWith(plantId: plantId);
  }

  // --- Step 2: Request Type ---
  void setServiceType(ServiceType type) {
    state = state.copyWith(type: type);
  }

  // --- Step 1 & 3: Consents ---
  void acceptStandards(bool accepted) {
    state = state.copyWith(acceptedStandards: accepted);
  }

  void consentPDPA(bool consented) {
    state = state.copyWith(consentedPDPA: consented);
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
  }) {
    final currentLicense = state.licenseInfo ?? const LegalLicense();
    state = state.copyWith(
      licenseInfo: currentLicense.copyWith(
        plantingStatus: plantingStatus,
        notifyNumber: notifyNumber,
        licenses: licenses,
        licenseNumber: licenseNumber,
      ),
    );
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

  // --- Step 5: Site & Security ---
  void updateLocation({
    String? name,
    String? address,
    double? lat,
    double? lng,
    String? north,
    String? south,
    String? east,
    String? west,
  }) {
    state = state.copyWith(
      location: state.location.copyWith(
        name: name,
        address: address,
        lat: lat,
        lng: lng,
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

  // --- Step 8: Signature ---
  void updateSignature(String base64) {
    state = state.copyWith(signatureBase64: base64);
  }

  // --- Submit ---
  Future<String?> submit() async {
    // Mock API Call
    await Future.delayed(const Duration(seconds: 2));
    return "APP-${DateTime.now().millisecondsSinceEpoch}";
  }
}
