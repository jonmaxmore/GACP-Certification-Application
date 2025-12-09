import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step4Composite extends ConsumerWidget {
  const Step4Composite({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/step3'),
      onNext: () => context.go('/applications/create/step5'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("4. สถานที่ผลิต (กทล.1)",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const Text("Facility Standard Details",
              style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),

          // Location
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("ข้อมูลสถานที่ (Location)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  WizardTextInput(
                      "ชื่อสถานที่ (Establishment Name)",
                      state.establishmentName,
                      (v) => notifier.update('establishmentName', v)),
                  WizardTextInput("ที่อยู่ (Address)", state.locationAddress,
                      (v) => notifier.update('locationAddress', v),
                      maxLines: 2),
                  WizardTextInput("พิกัด (Coordinates)", state.lat,
                      (v) => notifier.update('lat', v)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // SOP
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              side: BorderSide(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("มาตรฐานการผลิต (SOP Checklist)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "มีการคัดเลือกสายพันธุ์ (Selection)"),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "มีการเตรียมดิน/วัสดุปลูก (Soil Prep)"),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "ระบบน้ำสะอาด (Water System)"),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "การจัดการศัตรูพืช (Pest Control)"),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "การเก็บเกี่ยว (Harvesting)"),
                  _buildSopCheckbox(
                      notifier, state.sopChecklist, "การทำแห้ง (Drying)"),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSopCheckbox(
      ApplicationFormNotifier notifier, List<String> list, String label) {
    return CheckboxListTile(
      title: Text(label, style: const TextStyle(fontSize: 14)),
      value: list.contains(label),
      onChanged: (val) => notifier.toggleSop(label, val ?? false),
      controlAffinity: ListTileControlAffinity.leading,
      contentPadding: EdgeInsets.zero,
      dense: true,
      activeColor: Colors.green,
    );
  }
}
