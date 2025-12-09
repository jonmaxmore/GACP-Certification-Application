import 'package:flutter/material.dart';
import '../../presentation/features/application/models/gacp_application_models.dart';
import '../../presentation/features/application/providers/form_state_provider.dart';
import 'plant_strategy.dart';

class CannabisStrategy implements PlantStrategy {
  @override
  String get id => 'CAN';
  @override
  String get name => 'Cannabis (กัญชา)';
  @override
  bool get requiresStrictLicense => true;

  @override
  List<Widget> buildSecurityWidgets(
      BuildContext context, ApplicationFormNotifier notifier, dynamic state) {
    final security = state.securityMeasures;
    return [
      _buildCheckItem("มีรั้วรอบขอบชิด (Secure Fence)", security.hasFence,
          (v) => notifier.updateSecurity(hasFence: v),
          isRequired: true),
      _buildCheckItem("มีกล้องวงจรปิด (CCTV Medical Grade)", security.hasCCTV,
          (v) => notifier.updateSecurity(hasCCTV: v),
          isRequired: true),
      _buildCheckItem(
          "มีการควบคุมการเข้า-ออก (Access Control)",
          security.hasAccessControl,
          (v) => notifier.updateSecurity(hasAccessControl: v),
          isRequired: true),
      _buildCheckItem("การแบ่งโซนพื้นที่ (Zoning)", security.hasZoning,
          (v) => notifier.updateSecurity(hasZoning: v),
          isRequired: false),
    ];
  }

  @override
  List<Widget> buildProductionWidgets(
      BuildContext context, ApplicationFormNotifier notifier, dynamic state) {
    // Cannabis uses "Tree Count" usually (or Tree unit)
    // Here we can return specific widgets if needed.
    // currently Step 6 logic is mixes Unit type and Plant Group.
    // We will focus on Group logic.
    return []; // For now, logic is handled inside Step 6 via composition, or we move it here?
    // Apple Architect said: "List<Widget> buildProductionInputs(BuildContext context);"
  }

  @override
  List<String> getRequiredDocuments() {
    return [
      'land_ownership',
      'location_map',
      'photos_site',
      'medical_license', // Strict
      'security_plan'
    ];
  }

  @override
  bool validateSecurity(dynamic securityMeasures) {
    return securityMeasures.hasFence &&
        securityMeasures.hasCCTV &&
        securityMeasures.hasAccessControl;
  }

  Widget _buildCheckItem(String title, bool value, Function(bool) onChanged,
      {bool isRequired = false}) {
    return CheckboxListTile(
      title: Row(
        children: [
          Expanded(child: Text(title)),
          if (isRequired) const Text(" *", style: TextStyle(color: Colors.red)),
        ],
      ),
      value: value,
      onChanged: (v) => onChanged(v ?? false),
      activeColor: Colors.green,
    );
  }

  @override
  List<String> getPlantPartsOptions() {
    return [
      "Inflorescence (ช่อดอกแห้ง)",
      "Fresh Flower (ดอกสด)",
      "Leaf (ใบ)",
      "Seed (เมล็ด)",
      "Stem (ลำต้น)",
      "Root (ราก)"
    ];
  }

  @override
  String getYieldLabel() => "ผลผลิตคาดการณ์ (Dried Flower Kg)";

  @override
  bool get usesTreeUnit => true;
}
