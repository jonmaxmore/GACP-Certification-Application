import 'package:flutter/material.dart';
import '../../presentation/features/application/providers/form_state_provider.dart';
import 'plant_strategy.dart';

class GeneralStrategy implements PlantStrategy {
  @override
  String get id => 'GEN';
  @override
  String get name => 'General Plant (พืชทั่วไป)';
  @override
  bool get requiresStrictLicense => false;

  @override
  List<Widget> buildSecurityWidgets(
      BuildContext context, ApplicationFormNotifier notifier, dynamic state) {
    final security = state.securityMeasures;
    return [
      _buildCheckItem(
          "มีมาตรการป้องกันสัตว์ (Animal Barrier)",
          security.hasAnimalBarrier,
          (v) => notifier.updateSecurity(hasAnimalBarrier: v),
          isRequired: true),
      _buildCheckItem("การแบ่งโซนพื้นที่ (Zoning)", security.hasZoning,
          (v) => notifier.updateSecurity(hasZoning: v),
          isRequired: true),
      _buildCheckItem("มีรั้ว (Optional)", security.hasFence,
          (v) => notifier.updateSecurity(hasFence: v),
          isRequired: false),
    ];
  }

  @override
  List<Widget> buildProductionWidgets(
      BuildContext context, ApplicationFormNotifier notifier, dynamic state) {
    return [];
  }

  @override
  List<String> getRequiredDocuments() {
    return [
      'land_ownership',
      'location_map',
      'photos_site',
      // No medical license
    ];
  }

  @override
  bool validateSecurity(dynamic securityMeasures) {
    return securityMeasures.hasAnimalBarrier && securityMeasures.hasZoning;
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
    return ["Rhizome (เหง้า)", "Tuber (หัว)", "Rootlet (รากฝอย)", "Leaf (ใบ)"];
  }

  @override
  String getYieldLabel() => "ผลผลิตคาดการณ์ (Fresh Tuber Ton/Kg)";

  @override
  bool get usesTreeUnit => false;
}
