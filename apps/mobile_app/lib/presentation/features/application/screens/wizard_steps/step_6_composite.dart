import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step6Composite extends ConsumerWidget {
  const Step6Composite({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/step5'),
      onNext: () {
        // Submit Logic (Mock)
        context.go('/payment');
      },
      nextLabel: "ยืนยันและชำระเงิน (Submit & Pay)",
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("6. ตรวจสอบข้อมูล (Review)",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 20),
          _buildSection("ผู้ขออนุญาต (Applicant)", [
            WizardSummaryRow("Name", state.entityName),
            WizardSummaryRow("ID Card", state.idCard),
            WizardSummaryRow("Phone", state.phone),
          ]),
          _buildSection("การเพาะปลูก (Cultivation)", [
            WizardSummaryRow("Strain", state.strainName),
            WizardSummaryRow("Quantity", state.quantity),
            WizardSummaryRow("Objective", state.objective),
          ]),
          _buildSection("การจำหน่าย (Distribution)", [
            WizardSummaryRow("Product Desc", state.productDescription),
            WizardSummaryRow("Channels", state.salesChannels.join(", ")),
          ]),
          if (state.isExportEnabled)
            _buildSection("การส่งออก (Export)", [
              WizardSummaryRow("Destination", state.exportDestination),
              WizardSummaryRow("Transport", state.transportMethod),
            ]),
          _buildSection("สถานที่แพะปลูก (Establishment)", [
            WizardSummaryRow("Name", state.establishmentName),
            WizardSummaryRow("Address", state.locationAddress),
          ]),
          const SizedBox(height: 20),
          const Center(
            child: Text("กรุณาตรวจสอบความถูกต้องก่อนยืนยัน",
                style:
                    TextStyle(color: Colors.red, fontStyle: FontStyle.italic)),
          )
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const Divider(),
            ...children,
          ],
        ),
      ),
    );
  }
}
