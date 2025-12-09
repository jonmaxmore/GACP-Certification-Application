import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step5OperationSOP extends ConsumerWidget {
  const Step5OperationSOP({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/step4'),
      onNext: () => context.go('/applications/create/step6'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "5. มาตรฐานการดำเนินงาน (Operation & SOP)",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 20),
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
                  const Text("SOP Checklist (Standard Operating Procedures)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "1. การคัดเลือกสายพันธุ์ (Selection)"),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "2. การเตรียมดิน/วัสดุปลูก (Soil Preparation)"),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "3. ระบบน้ำ (Water System)"),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "4. การจัดการศัตรูพืช (Pest Control)"),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "5. การเก็บเกี่ยว (Harvesting)"),
                  _buildSopCheckbox(notifier, state.sopChecklist,
                      "6. การแปรรูป/ทำแห้ง (Drying & Processing)"),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("แผนการผลิต (Production Plan)",
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        WizardTextInput(
                            "รายละเอียดแผนการผลิตคร่าวๆ",
                            state.productionPlanDetails,
                            (v) => notifier.update('productionPlanDetails', v),
                            maxLines: 3),
                      ])))
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
