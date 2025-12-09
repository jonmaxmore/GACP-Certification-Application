import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step4ProductDetails extends ConsumerWidget {
  const Step4ProductDetails({super.key});

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
          const Text(
            "4. ข้อมูลการผลิต (Product Details)",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 20),
          Card(
            shape: RoundedRectangleBorder(
              side: BorderSide(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("รายละเอียดพืช (Plant Details)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  WizardTextInput(
                    "ชื่อสายพันธุ์ (Strain Name)",
                    state.strainName,
                    (v) => notifier.update('strainName', v),
                  ),
                  WizardTextInput(
                    "แหล่งที่มาของเมล็ดพันธุ์ (Source Origin)",
                    state.sourceName, // Reusing sourceName
                    (v) => notifier.update('sourceName', v),
                  ),
                  WizardTextInput(
                    "จำนวนต้นที่ปลูก (Quantity)",
                    state.quantity,
                    (v) => notifier.update('quantity', v),
                  ),
                  const SizedBox(height: 10),
                  const Text("รอบการผลิต (Cycle)",
                      style: TextStyle(fontSize: 14, color: Colors.grey)),
                  WizardTextInput(
                    "วันที่เริ่มปลูก (Planting Date)",
                    "01/01/2026", // Mock for now or use DatePicker
                    (v) {},
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
