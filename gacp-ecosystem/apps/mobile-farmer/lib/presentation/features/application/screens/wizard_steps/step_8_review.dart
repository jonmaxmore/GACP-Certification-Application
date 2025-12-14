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
      title: '8. ตรวจสอบและยืนยัน (Review & Submit)',
      onBack: () => context.go('/applications/create/step7'),
      onNext: () {
        // Trigger Payment / Submit
        _showPaymentDialog(context);
      },
      child: SingleChildScrollView(
        child: Column(
          children: [
            const WizardSectionTitle(
                title: 'สรุปข้อมูลใบสมัคร (Application Summary)'),
            _buildSummaryCard('1. ประเภทคำขอ (Service)',
                '${state.type?.name.toUpperCase()} - ${plantConfig?.nameTH}'),
            if (state.type == ServiceType.replacement)
              _buildSummaryCard('เหตุผล (Reason)',
                  '${state.replacementReason?.reason} - ${state.replacementReason?.policeReportNo}'),
            _buildSummaryCard('2. ผู้ยื่น (Applicant)',
                '${state.profile.name} (${state.profile.applicantType})\nResp: ${state.profile.responsibleName}'),
            _buildSummaryCard('3. สถานที่ (Site)',
                '${state.location.name}\n${state.location.address}\nAudit: ${state.location.north}/${state.location.south}'),
            if (isGroupA)
              _buildSummaryCard('4. ใบอนุญาต (License)',
                  '${state.licenseInfo?.plantingStatus} - ${state.licenseInfo?.notifyNumber ?? state.licenseInfo?.licenseNumber}'),
            _buildSummaryCard('5. ความปลอดภัย (Security)',
                'Fence: ${state.securityMeasures.hasFence}\nCCTV: ${state.securityMeasures.hasCCTV}\nZoning: ${state.securityMeasures.hasZoning}'),
            if (state.type != ServiceType.replacement) ...[
              _buildSummaryCard('6. การผลิต (Production)',
                  "Parts: ${state.production.plantParts.join(', ')}\nSource: ${state.production.sourceType}\nYield: ${state.production.estimatedYield}"),
              _buildSummaryCard('6.1 ปัจจัยการผลิต (Inputs)',
                  'Items: ${state.production.farmInputs.length} รายการ (See list below)'),
              _buildSummaryCard('6.2 หลังเก็บเกี่ยว (Post-Harvest)',
                  'Drying: ${state.production.postHarvest.dryingMethod}\nPkg: ${state.production.postHarvest.packaging}\nStorage: ${state.production.postHarvest.storage}'),
            ],
            const SizedBox(height: 24),

            // Pre-submission Checklist - Smart Check
            _buildPreSubmissionChecklist(state),

            const SizedBox(height: 16),
            const Divider(),
            const Text('ลงลายมือชื่อ (E-Signature)',
                style: TextStyle(fontWeight: FontWeight.bold)),
            Container(
              height: 150,
              width: double.infinity,
              color: Colors.grey[200],
              child: const Center(
                  child: Text('[Signature Pad Placeholder]',
                      style: TextStyle(color: Colors.grey))),
            ),
            const SizedBox(height: 10),
            Row(children: [
              Checkbox(value: true, onChanged: (v) {}),
              const Expanded(
                  child: Text(
                      'ข้าพเจ้ายืนยันว่าข้อมูลถูกต้อง (I confirm the data is correct)'))
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
        title: const Text('ชำระเงิน (Payment)'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.qrCode, size: 100),
            SizedBox(height: 10),
            Text('PromptPay QR Code'),
            Text('ยอดชำระ: 500.00 THB',
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Colors.green)),
            SizedBox(height: 20),
            LinearProgressIndicator(),
            Text('กำลังตรวจสอบการโอน... (Polling)',
                style: TextStyle(fontSize: 12)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.go('/applications'); // Finish
            },
            child: const Text('จำลองจ่ายสำเร็จ (Simulate Success)'),
          )
        ],
      ),
    );
  }

  /// Pre-submission Checklist - Smart Validation Before Submit
  Widget _buildPreSubmissionChecklist(GACPApplication state) {
    final checks = <_CheckItem>[];

    // Check 1: Profile Complete
    final profileOk =
        state.profile.name.isNotEmpty && state.profile.idCard.isNotEmpty;
    checks.add(_CheckItem(
      '👤 ข้อมูลผู้ยื่น (Applicant Info)',
      profileOk,
      'กรุณากรอกชื่อและเลขบัตรประชาชน',
    ));

    // Check 2: Land Ownership
    final landOk = state.location.landOwnership.isNotEmpty;
    checks.add(_CheckItem(
      '🏠 กรรมสิทธิ์ที่ดิน (Land Ownership)',
      landOk,
      'กรุณาระบุสถานะการครอบครองที่ดินใน Step 5',
    ));

    // Check 3: Location
    final locationOk =
        state.location.name.isNotEmpty || state.location.address.isNotEmpty;
    checks.add(_CheckItem(
      '📍 สถานที่ปลูก (Site Location)',
      locationOk,
      'กรุณากรอกข้อมูลสถานที่',
    ));

    // Check 4: Security (for non-replacement)
    if (state.type != ServiceType.replacement) {
      final securityOk =
          state.securityMeasures.hasFence || state.securityMeasures.hasZoning;
      checks.add(_CheckItem(
        '🔒 มาตรการความปลอดภัย (Security)',
        securityOk,
        'กรุณาเลือกมาตรการความปลอดภัยใน Step 5',
      ));
    }

    // Check 5: Production (for non-replacement)
    if (state.type != ServiceType.replacement) {
      final prodOk = state.production.plantParts.isNotEmpty;
      checks.add(_CheckItem(
        '🌱 แผนการผลิต (Production Plan)',
        prodOk,
        'กรุณาเลือกส่วนของพืชที่ใช้ใน Step 6',
      ));
    }

    final allOk = checks.every((c) => c.isOk);
    final failedCount = checks.where((c) => !c.isOk).length;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: allOk ? Colors.green.shade50 : Colors.amber.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: allOk ? Colors.green.shade200 : Colors.amber.shade300,
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                allOk ? LucideIcons.checkCircle2 : LucideIcons.alertTriangle,
                color: allOk ? Colors.green : Colors.amber.shade700,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  allOk
                      ? '✅ พร้อมส่งคำขอ! (Ready to Submit)'
                      : '⚠️ กรุณาตรวจสอบ $failedCount รายการ (Missing $failedCount items)',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color:
                        allOk ? Colors.green.shade800 : Colors.amber.shade900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...checks.map((c) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Icon(
                      c.isOk ? LucideIcons.checkCircle : LucideIcons.circle,
                      size: 18,
                      color: c.isOk ? Colors.green : Colors.grey,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            c.label,
                            style: TextStyle(
                              color: c.isOk
                                  ? Colors.green.shade700
                                  : Colors.grey.shade700,
                              fontWeight:
                                  c.isOk ? FontWeight.normal : FontWeight.w500,
                            ),
                          ),
                          if (!c.isOk)
                            Text(
                              c.hint,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.amber.shade800,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

/// Helper class for pre-submission check items
class _CheckItem {
  final String label;
  final bool isOk;
  final String hint;

  _CheckItem(this.label, this.isOk, this.hint);
}
