import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step2ApplicantInfo extends ConsumerWidget {
  const Step2ApplicantInfo({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    // Context-Aware Logic: Show Company fields only if Juristic
    final isJuristic = state.applicantType == 'juristic';

    return WizardScaffold(
      onBack: () => context.go('/applications/create/step1'),
      onNext: () => context.go('/applications/create/step3'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "2. ข้อมูลผู้ยื่นคำขอ (Applicant Info)",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 20),

          // Type Selection
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("ประเภทผู้ขอ (Applicant Type)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  WizardRadioTile(
                      "บุคคลธรรมดา (Individual)",
                      "individual",
                      state.applicantType,
                      (v) => notifier.update('applicantType', v)),
                  WizardRadioTile(
                      "นิติบุคคล (Juristic Person)",
                      "juristic",
                      state.applicantType,
                      (v) => notifier.update('applicantType', v)),
                  WizardRadioTile(
                      "วิสาหกิจชุมชน (Community Enterprise)",
                      "community",
                      state.applicantType,
                      (v) => notifier.update('applicantType', v)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Main Info Card
          Card(
            shape: RoundedRectangleBorder(
              side: BorderSide(color: Colors.blue[200]!),
              borderRadius: BorderRadius.circular(8),
            ),
            color: Colors.blue[50]?.withOpacity(0.3),
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isJuristic) ...[
                    WizardTextInput(
                      "ชื่อนิติบุคคล (Company Name)",
                      state.entityName,
                      (v) => notifier.update('entityName', v),
                    ),
                    WizardTextInput(
                      "เลขทะเบียนนิติบุคคล (Registration ID)",
                      state.regCode1,
                      (v) => notifier.update('regCode1', v),
                    ),
                  ],
                  WizardTextInput(
                    "ชื่อ-สกุล (Name - Surname)",
                    state.presidentName.isNotEmpty
                        ? state.presidentName
                        : state.entityName, // Fallback/Logic
                    (v) => notifier.update(
                        isJuristic ? 'presidentName' : 'entityName', v),
                  ),
                  WizardTextInput(
                    "เลขบัตรประชาชน (ID Card)",
                    state.idCard,
                    (v) => notifier.update('idCard', v),
                  ),
                  WizardTextInput(
                    "เบอร์โทรศัพท์ (Phone)",
                    state.phone,
                    (v) => notifier.update('phone', v),
                  ),
                  WizardTextInput(
                    "อีเมล (Email)",
                    state.email,
                    (v) => notifier.update('email', v),
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
