import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step3Composite extends ConsumerWidget {
  const Step3Composite({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/step2'),
      onNext: () => context.go('/applications/create/step4'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("3. การส่งออก (ภ.ท.10) [Optional]",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const Text("Export Details", style: TextStyle(color: Colors.grey)),
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
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(LucideIcons.plane, color: Colors.blue),
                          SizedBox(width: 10),
                          Text("ต้องการขออนุญาตส่งออกหรือไม่?",
                              style: TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Switch(
                        value: state.isExportEnabled,
                        onChanged: (val) =>
                            notifier.update('isExportEnabled', val),
                        activeColor: Colors.green,
                      ),
                    ],
                  ),
                  if (state.isExportEnabled) ...[
                    const Divider(),
                    const SizedBox(height: 10),
                    WizardTextInput(
                        "ประเทศปลายทาง (Destination Country)",
                        state.exportDestination,
                        (v) => notifier.update('exportDestination', v)),
                    WizardTextInput(
                        "วิธีการขนส่ง (Transport Method)",
                        state.transportMethod,
                        (v) => notifier.update('transportMethod', v)),
                  ] else ...[
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Text("ข้ามส่วนนี้หากไม่ต้องการขออนุญาตส่งออก",
                          style: TextStyle(color: Colors.grey)),
                    )
                  ]
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
