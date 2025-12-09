import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step6Review extends ConsumerWidget {
  const Step6Review({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/documents'),
      child: Column(
        children: [
          const Icon(LucideIcons.fileCheck, size: 64, color: Colors.green),
          const SizedBox(height: 10),
          const Text("ตรวจสอบข้อมูล",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          WizardSummaryRow("ผู้ขอ", state.applicantDetails['name']),
          WizardSummaryRow("สถานที่", state.establishmentName),
          WizardSummaryRow("ประเภท", state.formType),
          WizardSummaryRow("เอกสารแนบ", "${state.attachments.length} รายการ"),
          const SizedBox(height: 30),
          FilledButton(
            onPressed: () {
              // Submit & Redirect to Payment
              // For now, mock navigation to a payment page or success page
              // assuming ID 123 for the created application
              context.go('/applications/123/pay1');
            },
            style: FilledButton.styleFrom(
              backgroundColor: Colors.green,
              minimumSize: const Size(double.infinity, 50),
            ),
            child: const Text("ยืนยันและชำระเงิน"),
          ),
        ],
      ),
    );
  }
}
