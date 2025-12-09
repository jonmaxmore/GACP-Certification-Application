import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';
import '../../../../../core/strategies/plant_strategy.dart';

class Step5Security extends ConsumerWidget {
  const Step5Security({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    // Architecture Refinement: Strategy Pattern
    final plantId = state.plantId ?? '';
    final strategy = PlantStrategyFactory.getStrategy(plantId);
    final isStrict = strategy.requiresStrictLicense;

    return WizardScaffold(
      title: "5. สถานที่ & ความปลอดภัย (Site & Security)",
      onBack: () => context.go('/applications/create/step4'),
      onNext: () {
        // Use Strategy for Validation
        if (strategy.validateSecurity(state.securityMeasures)) {
          context.go('/applications/create/step6');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(isStrict
                    ? "Group A ต้องมีรั้ว, CCTV, และการควบคุมการเข้าออก (Must have Fence, CCTV, Access Control)"
                    : "Group B ต้องมีการจัดการสัตว์และการแบ่งโซน (Must have Animal Barrier & Zoning)")),
          );
        }
      },
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Risk Assessment
            const WizardSectionTitle(
                title: "1. การประเมินความเสี่ยง (Risk Assessment)"),
            const Text("โปรดระบุสภาพแวดล้อมรอบแปลงปลูก (Surroundings)",
                style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 8),
            WizardTextInput("ทิศเหนือ (North) ติดกับ...", state.location.north,
                (v) => notifier.updateLocation(north: v)),
            WizardTextInput("ทิศใต้ (South) ติดกับ...", state.location.south,
                (v) => notifier.updateLocation(south: v)),
            WizardTextInput("ทิศตะวันออก (East) ติดกับ...", state.location.east,
                (v) => notifier.updateLocation(east: v)),
            WizardTextInput("ทิศตะวันตก (West) ติดกับ...", state.location.west,
                (v) => notifier.updateLocation(west: v)),

            const SizedBox(height: 24),

            // 2. Security Checklist (Strategy Pattern)
            WizardSectionTitle(
                title:
                    "2. มาตรการความปลอดภัย (${isStrict ? 'High Control' : 'Standard'})"),

            // Render widgets from strategy
            ...strategy.buildSecurityWidgets(context, notifier, state),

            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isStrict ? Colors.red.shade50 : Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                    color:
                        isStrict ? Colors.red.shade200 : Colors.green.shade200),
              ),
              child: Row(
                children: [
                  Icon(isStrict ? Icons.security : Icons.eco,
                      color: isStrict ? Colors.red : Colors.green),
                  const SizedBox(width: 10),
                  Expanded(
                      child: Text(
                          isStrict
                              ? "มาตรการเข้มงวด: ต้องมีหลักฐานภาพถ่าย Fence/CCTV ใน Step 7"
                              : "มาตรการพื้นฐาน: เน้นการป้องกันการปนเปื้อนจากสัตว์และแบ่งโซนชัดเจน",
                          style: TextStyle(
                              color: isStrict
                                  ? Colors.red.shade900
                                  : Colors.green.shade900,
                              fontSize: 13))),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
