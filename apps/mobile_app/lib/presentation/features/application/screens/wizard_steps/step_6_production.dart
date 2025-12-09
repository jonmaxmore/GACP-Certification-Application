import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import '../../models/gacp_application_models.dart';
import '../wizard_common.dart';

class Step6Production extends ConsumerWidget {
  const Step6Production({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    // Adaptive Logic
    final plantId = state.plantId;
    final plantConfig = plantConfigs[plantId] ?? plantConfigs.values.first;
    final isTreeUnit = plantConfig.productionUnit == 'Tree';
    final isGroupA = plantConfig.group == PlantGroup.highControl;

    return WizardScaffold(
      title: "6. ข้อมูลการผลิต (Production Plan)",
      onBack: () => context.go('/applications/create/step5'),
      onNext: () {
        if (FormValidator.validateStep6(state.production, plantConfig)) {
          context.go('/applications/create/step7');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text(
                    "กรุณาระบุส่วนที่ใช้และแหล่งที่มา (Please specify plant parts & source)")),
          );
        }
      },
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Plant Parts (Dynamic Multi-Select)
            WizardSectionTitle(title: "1. ส่วนของพืชที่ใช้ (Plant Parts Used)"),
            _buildPlantPartsSelector(
                isGroupA, state.production.plantParts, notifier),

            const SizedBox(height: 24),

            // 2. Production Plan (Dynamic Units)
            WizardSectionTitle(title: "2. แผนการผลิต (Production Plan)"),
            if (isTreeUnit) ...[
              WizardTextInput(
                  "จำนวนต้นที่ปลูก (Tree Count)",
                  state.production.treeCount?.toString() ?? '',
                  (v) => notifier.updateProduction(treeCount: int.tryParse(v)),
                  keyboardType: TextInputType.number),
            ] else ...[
              Row(
                children: [
                  Expanded(
                      flex: 2,
                      child: WizardTextInput(
                          "ขนาดพื้นที่ (Area Size)",
                          state.production.areaSizeRai?.toString() ?? '',
                          (v) => notifier.updateProduction(
                              areaSizeRai: double.tryParse(v)),
                          keyboardType: TextInputType.number)),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 1,
                    child: DropdownButtonFormField<String>(
                      value: state.production.areaSizeUnit ?? 'Rai',
                      decoration: const InputDecoration(
                          labelText: "หน่วย (Unit)",
                          border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: "Rai", child: Text("ไร่")),
                        DropdownMenuItem(value: "Ngan", child: Text("งาน")),
                        DropdownMenuItem(value: "Wah", child: Text("ตร.วา")),
                      ],
                      onChanged: (v) =>
                          notifier.updateProduction(areaSizeUnit: v),
                    ),
                  )
                ],
              )
            ],

            const SizedBox(height: 12),
            WizardTextInput(
              isGroupA
                  ? "ผลผลิตคาดการณ์ (Dried Flower Kg)"
                  : "ผลผลิตคาดการณ์ (Fresh Tuber Ton/Kg)",
              state.production.estimatedYield.toString() == "0.0"
                  ? ""
                  : state.production.estimatedYield.toString(),
              (v) =>
                  notifier.updateProduction(estimatedYield: double.tryParse(v)),
              keyboardType: TextInputType.number,
            ),
            WizardTextInput(
              "รอบการผลิต (Production Cycle - e.g. 3-4 months)",
              state.production.productionCycle,
              (v) => notifier.updateProduction(cycle: v),
            ),

            const SizedBox(height: 24),

            // 3. Traceability / Origin
            const WizardSectionTitle(
                title: "3. แหล่งที่มา (Seed/Source Origin)"),
            _buildOriginSource(state.production.sourceType,
                state.production.sourceDetail, notifier),
          ],
        ),
      ),
    );
  }

  Widget _buildPlantPartsSelector(bool isGroupA, List<String> currentSelected,
      ApplicationFormNotifier notifier) {
    final options = isGroupA
        ? [
            "Inflorescence (ช่อดอกแห้ง)",
            "Fresh Flower (ดอกสด)",
            "Leaf (ใบ)",
            "Seed (เมล็ด)",
            "Stem (ลำต้น)",
            "Root (ราก)"
          ]
        : ["Rhizome (เหง้า)", "Tuber (หัว)", "Rootlet (รากฝอย)", "Leaf (ใบ)"];

    return Wrap(
      spacing: 8.0,
      runSpacing: 4.0,
      children: options.map((option) {
        final isSelected = currentSelected.contains(option);
        return FilterChip(
          label: Text(option),
          selected: isSelected,
          onSelected: (selected) {
            final newList = List<String>.from(currentSelected);
            if (selected) {
              newList.add(option);
            } else {
              newList.remove(option);
            }
            notifier.updateProduction(plantParts: newList);
          },
          selectedColor: Colors.green.shade100,
          checkmarkColor: Colors.green,
        );
      }).toList(),
    );
  }

  Widget _buildOriginSource(String currentType, String currentDetail,
      ApplicationFormNotifier notifier) {
    return Column(
      children: [
        RadioListTile<String>(
          title: const Text("นำเข้า (Import)"),
          value: "Import",
          groupValue: currentType,
          onChanged: (v) => notifier.updateProduction(sourceType: v),
        ),
        if (currentType == "Import")
          Padding(
              padding: const EdgeInsets.only(left: 32, bottom: 8),
              child: WizardTextInput(
                  "เลขที่ใบอนุญาตนำเข้า (Import License No)",
                  currentDetail,
                  (v) => notifier.updateProduction(sourceDetail: v))),
        RadioListTile<String>(
          title: const Text("ซื้อจากผู้มีใบอนุญาต (Buy from Licensed Seller)"),
          value: "Buy",
          groupValue: currentType,
          onChanged: (v) => notifier.updateProduction(sourceType: v),
        ),
        if (currentType == "Buy")
          Padding(
              padding: const EdgeInsets.only(left: 32, bottom: 8),
              child: WizardTextInput(
                  "ชื่อผู้ขาย/เลขใบอนุญาต (Seller Name/License)",
                  currentDetail,
                  (v) => notifier.updateProduction(sourceDetail: v))),
        RadioListTile<String>(
          title: const Text("เก็บเมล็ด/หัวพันธุ์เอง (Self-Sourced)"),
          value: "Self",
          groupValue: currentType,
          onChanged: (v) => notifier.updateProduction(sourceType: v),
        ),
        if (currentType == "Self")
          Padding(
              padding: const EdgeInsets.only(left: 32, bottom: 8),
              child: WizardTextInput(
                  "เลข Lot เดิมที่อ้างอิง (Previous Lot No)",
                  currentDetail,
                  (v) => notifier.updateProduction(sourceDetail: v))),
      ],
    );
  }
}
