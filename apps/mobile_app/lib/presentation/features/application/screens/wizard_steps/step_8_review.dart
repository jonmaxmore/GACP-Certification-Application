import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/form_state_provider.dart';
import '../../models/gacp_application_models.dart';
import 'wizard_common.dart';

class Step8Review extends ConsumerWidget {
  const Step8Review({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final plantId = state.plantId;
    final plantConfig = plantConfigs[plantId];
    final isGroupA = plantConfig?.group == PlantGroup.highControl;

    return WizardScaffold(
      title: "8. ตรวจสอบและยืนยัน (Review & Submit)",
      onBack: () => context.go('/applications/create/step7'),
      onNext: () {
        // Trigger Payment / Submit
        _showPaymentDialog(context);
      },
      child: SingleChildScrollView(
        child: Column(
          children: [
            const WizardSectionTitle(
                title: "สรุปข้อมูลใบสมัคร (Application Summary)"),
            _buildSummaryCard("1. ประเภทคำขอ (Service)",
                "${state.type?.name.toUpperCase()} - ${plantConfig?.nameTh}"),
            if (state.type == ServiceType.replacement)
              _buildSummaryCard("เหตุผล (Reason)",
                  "${state.replacementReason?.reason} - ${state.replacementReason?.policeReportNo}"),
            _buildSummaryCard("2. ผู้ยื่น (Applicant)",
                "${state.profile.name} (${state.profile.applicantType})"),
            _buildSummaryCard("3. สถานที่ (Site)",
                "${state.location.name}\n${state.location.address}"),
            if (isGroupA)
              _buildSummaryCard("4. ใบอนุญาต (License)",
                  "${state.licenseInfo?.plantingStatus} - ${state.licenseInfo?.notifyNumber ?? state.licenseInfo?.licenseNumber}"),
            _buildSummaryCard("5. ความปลอดภัย (Security)",
                "Fence: ${state.securityMeasures.hasFence}\nCCTV: ${state.securityMeasures.hasCCTV}\nZoning: ${state.securityMeasures.hasZoning}"),
            if (state.type != ServiceType.replacement)
              _buildSummaryCard("6. การผลิต (Production)",
                  "Parts: ${state.production.plantParts.join(', ')}\nSource: ${state.production.sourceType}\nYield: ${state.production.estimatedYield}"),
            const SizedBox(height: 24),
            const Divider(),
            const Text("ลงลายมือชื่อ (E-Signature)",
                style: TextStyle(fontWeight: FontWeight.bold)),
            Container(
              height: 150,
              width: double.infinity,
              color: Colors.grey[200],
              child: const Center(
                  child: Text("[Signature Pad Placeholder]",
                      style: TextStyle(color: Colors.grey))),
            ),
            const SizedBox(height: 10),
            Row(children: [
              Checkbox(value: true, onChanged: (v) {}),
              const Expanded(
                  child: Text(
                      "ข้าพเจ้ายืนยันว่าข้อมูลถูกต้อง (I confirm the data is correct)"))
            ])
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(String title, String content) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        title: Text(title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        subtitle: Text(content,
            style: const TextStyle(fontSize: 14, color: Colors.black87)),
      ),
    );
  }

  void _showPaymentDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("ชำระเงิน (Payment)"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(LucideIcons.qrCode, size: 100),
            const SizedBox(height: 10),
            const Text("PromptPay QR Code"),
            const Text("ยอดชำระ: 500.00 THB",
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Colors.green)),
            const SizedBox(height: 20),
            const LinearProgressIndicator(),
            const Text("กำลังตรวจสอบการโอน... (Polling)",
                style: TextStyle(fontSize: 12)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.go('/applications'); // Finish
            },
            child: const Text("จำลองจ่ายสำเร็จ (Simulate Success)"),
          )
        ],
      ),
    );
  }
}
