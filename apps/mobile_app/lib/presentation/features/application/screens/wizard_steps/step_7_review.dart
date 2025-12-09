import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step7Review extends ConsumerWidget {
  const Step7Review({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/step6'),
      onNext: () async {
        try {
          // Trigger actual submission to Backend (via ApplicationService)
          final id = await ref.read(applicationFormProvider.notifier).submit();

          if (context.mounted && id != null) {
            // Success -> Proceed to Payment
            context.go('/applications/$id/pay1');
          }
        } catch (e) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text("Submission Failed: $e"),
                  backgroundColor: Colors.red),
            );
          }
        }
      },
      nextLabel: "ยืนยันและชำระเงิน (Confirm & Pay)",
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("7. สรุปและยืนยัน (Review & Sign)",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 20),

          _buildSection("1. ผู้ยื่นคำขอ (Applicant)", [
            WizardSummaryRow("Type", state.applicantType),
            WizardSummaryRow(
                "Name",
                state.entityName.isNotEmpty
                    ? state.entityName
                    : state.presidentName),
            WizardSummaryRow("ID/Reg",
                state.idCard.isNotEmpty ? state.idCard : state.regCode1),
          ]),

          _buildSection("2. สถานที่และขอบเขต (Site & Scope)", [
            WizardSummaryRow("Site", state.establishmentName),
            WizardSummaryRow("Address", state.locationAddress),
            WizardSummaryRow(
                "Scope",
                [
                  if (state.salesChannels.isNotEmpty) "Distribution",
                  if (state.isExportEnabled) "Export"
                ].join(", ")),
          ]),

          _buildSection("3. ข้อมูลการผลิต (Product)", [
            WizardSummaryRow("Strain", state.strainName),
            WizardSummaryRow("Qty", state.quantity),
          ]),

          if (state.isExportEnabled)
            _buildSection("4. การส่งออก (Export)", [
              WizardSummaryRow("Dest", state.exportDestination),
              WizardSummaryRow("Via", state.transportMethod),
            ]),

          const SizedBox(height: 20),
          // Digital Signature Placeholder
          Card(
            color: Colors.green[50],
            child: CheckboxListTile(
              value: true,
              onChanged: (v) {},
              title: const Text(
                  "ข้าพเจ้ายืนยันว่าข้อมูลถูกต้อง (I certify that the information is correct)"),
              activeColor: Colors.green,
            ),
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
