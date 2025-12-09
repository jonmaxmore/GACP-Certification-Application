import 'package:flutter/material.dart';
import '../../presentation/features/application/providers/form_state_provider.dart';
import 'cannabis_strategy.dart';
import 'general_strategy.dart';

/// Strategy Protocol for Plant-Specific UI and Logic (Apple Standard)
abstract class PlantStrategy {
  String get id;
  String get name;
  bool get requiresStrictLicense;

  /// Build security checklist widgets for Step 5
  List<Widget> buildSecurityWidgets(
      BuildContext context, ApplicationFormNotifier notifier, dynamic state);

  /// Build production plan widgets for Step 6
  List<Widget> buildProductionWidgets(
      BuildContext context, ApplicationFormNotifier notifier, dynamic state);

  /// Get required document types for Step 7
  List<String> getRequiredDocuments();

  /// Validate Step 5
  bool validateSecurity(dynamic securityMeasures);

  // --- Step 6 Configuration ---
  List<String> getPlantPartsOptions();
  String getYieldLabel();
  bool get usesTreeUnit;
}

class PlantStrategyFactory {
  static PlantStrategy getStrategy(String plantId) {
    if (plantId == 'CAN') {
      return CannabisStrategy();
    }
    return GeneralStrategy();
  }
}
