/// GACP Application Builder
/// Blueprint Pattern: Builder Pattern
///
/// Purpose: ค่อยๆ ประกอบร่าง Object ทีละส่วน และ Validate ก่อนจะ .build()
/// เพื่อป้องกัน Object ที่ไม่สมบูรณ์ (Incomplete Object State)
///
/// Usage:
/// ```dart
/// final app = GACPApplicationBuilder()
///     .setPlantId('CAN')
///     .setProfile(userProfile)
///     .setLocation(siteLocation)
///     .build();
/// ```

import 'gacp_application_models.dart';

/// Exception thrown when building incomplete application
class ApplicationBuildException implements Exception {
  final String message;
  final List<String> missingFields;

  ApplicationBuildException(this.message, {this.missingFields = const []});

  @override
  String toString() =>
      'ApplicationBuildException: $message\nMissing: ${missingFields.join(", ")}';
}

/// Builder for GACPApplication
/// Implements the Builder Pattern for complex object construction
class GACPApplicationBuilder {
  // Core Required Fields
  String? _plantId;
  String? _plantGroup;
  String? _establishmentId;
  ApplicationType? _type;

  // Profile
  ApplicantProfile? _profile;

  // Location
  SiteLocation? _location;

  // License Info
  LegalLicense? _licenseInfo;

  // Security
  SecurityMeasures? _securityMeasures;

  // Production
  ProductionInfo? _production;

  // Optional Fields
  ReplacementReason? _replacementReason;
  List<DocumentUpload> _documents = [];
  ESignature? _signature;
  String? _gapCertificateNumber;
  bool _hasGapHistory = false;

  // --- Setters (Fluent API) ---

  GACPApplicationBuilder setPlantId(String id) {
    _plantId = id;
    return this;
  }

  GACPApplicationBuilder setPlantGroup(String group) {
    _plantGroup = group;
    return this;
  }

  GACPApplicationBuilder setEstablishmentId(String id) {
    _establishmentId = id;
    return this;
  }

  GACPApplicationBuilder setType(ApplicationType type) {
    _type = type;
    return this;
  }

  GACPApplicationBuilder setProfile(ApplicantProfile profile) {
    _profile = profile;
    return this;
  }

  GACPApplicationBuilder setLocation(SiteLocation location) {
    _location = location;
    return this;
  }

  GACPApplicationBuilder setLicenseInfo(LegalLicense license) {
    _licenseInfo = license;
    return this;
  }

  GACPApplicationBuilder setSecurityMeasures(SecurityMeasures security) {
    _securityMeasures = security;
    return this;
  }

  GACPApplicationBuilder setProduction(ProductionInfo production) {
    _production = production;
    return this;
  }

  GACPApplicationBuilder setReplacementReason(ReplacementReason reason) {
    _replacementReason = reason;
    return this;
  }

  GACPApplicationBuilder addDocument(DocumentUpload doc) {
    _documents.add(doc);
    return this;
  }

  GACPApplicationBuilder setDocuments(List<DocumentUpload> docs) {
    _documents = docs;
    return this;
  }

  GACPApplicationBuilder setSignature(ESignature sig) {
    _signature = sig;
    return this;
  }

  GACPApplicationBuilder setGapHistory(bool hasHistory,
      {String? certificateNumber}) {
    _hasGapHistory = hasHistory;
    _gapCertificateNumber = certificateNumber;
    return this;
  }

  // --- Validation Methods ---

  /// Validate required fields are present
  List<String> _getMissingRequiredFields() {
    final missing = <String>[];

    if (_plantId == null || _plantId!.isEmpty) missing.add('plantId');
    if (_profile == null) missing.add('profile');
    if (_location == null) missing.add('location');

    return missing;
  }

  /// Check if application is valid for submission
  bool isValid() => _getMissingRequiredFields().isEmpty;

  // --- Build Methods ---

  /// Build the final immutable GACPApplication
  /// Throws [ApplicationBuildException] if required fields are missing
  GACPApplication build() {
    final missing = _getMissingRequiredFields();

    if (missing.isNotEmpty) {
      throw ApplicationBuildException(
        'Cannot build application with missing required fields',
        missingFields: missing,
      );
    }

    return GACPApplication(
      plantId: _plantId!,
      plantGroup: _plantGroup ?? 'GROUP_A',
      establishmentId: _establishmentId ?? '',
      type: _type ?? ApplicationType.newApplication,
      profile: _profile!,
      location: _location!,
      licenseInfo: _licenseInfo ?? LegalLicense(),
      securityMeasures: _securityMeasures ?? SecurityMeasures(),
      production: _production ?? ProductionInfo(),
      replacementReason: _replacementReason,
      documents: _documents,
      signature: _signature,
      hasGapHistory: _hasGapHistory,
      gapCertificateNumber: _gapCertificateNumber ?? '',
    );
  }

  /// Build from existing application (for editing/renewal)
  static GACPApplicationBuilder fromExisting(GACPApplication app) {
    return GACPApplicationBuilder()
        .setPlantId(app.plantId)
        .setPlantGroup(app.plantGroup)
        .setEstablishmentId(app.establishmentId)
        .setType(app.type ?? ApplicationType.newApplication)
        .setProfile(app.profile)
        .setLocation(app.location)
        .setLicenseInfo(app.licenseInfo)
        .setSecurityMeasures(app.securityMeasures)
        .setProduction(app.production)
        .setDocuments(app.documents)
        .setGapHistory(app.hasGapHistory,
            certificateNumber: app.gapCertificateNumber);
  }
}
