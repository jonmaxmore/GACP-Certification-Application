import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step1ApplicantInfo extends ConsumerWidget {
  const Step1ApplicantInfo({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(applicationFormProvider.notifier);
    final state = ref.watch(applicationFormProvider);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/start'),
      onNext: () => context.go('/applications/create/objective'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("ประเภทผู้ขอรับใบรับรอง",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          WizardRadioTile('1. วิสาหกิจชุมชน', 'community', state.applicantType,
              (v) => notifier.update('applicantType', v)),
          WizardRadioTile('2. บุคคลธรรมดา', 'individual', state.applicantType,
              (v) => notifier.update('applicantType', v)),
          WizardRadioTile('3. นิติบุคคล', 'juristic', state.applicantType,
              (v) => notifier.update('applicantType', v)),
          const SizedBox(height: 20),

          if (state.applicantType == 'community') ...[
            WizardTextInput('ชื่อวิสาหกิจชุมชน', state.entityName,
                (v) => notifier.update('entityName', v)),
            WizardTextInput('ชื่อประธาน', state.presidentName,
                (v) => notifier.update('presidentName', v)),
            WizardTextInput('รหัสทะเบียน สวช.01', state.regCode1,
                (v) => notifier.update('regCode1', v)),
            WizardTextInput('รหัสทะเบียน ท.ว.ช.3', state.regCode2,
                (v) => notifier.update('regCode2', v)),
          ],
          if (state.applicantType == 'juristic') ...[
            WizardTextInput('ชื่อนิติบุคคล', state.entityName,
                (v) => notifier.update('entityName', v)),
            WizardTextInput('เลขทะเบียนนิติบุคคล', state.regCode1,
                (v) => notifier.update('regCode1', v)),
          ],

          // Common
          const Divider(),
          WizardTextInput('เลขบัตรประชาชน / เลขผู้เสียภาษี', state.idCard,
              (v) => notifier.update('idCard', v)),
          WizardTextInput('รหัสประจำบ้าน (House ID)', state.houseId,
              (v) => notifier.update('houseId', v)),
          WizardTextInput('ที่อยู่ตามทะเบียนบ้าน', state.address,
              (v) => notifier.update('address', v),
              maxLines: 2),
          WizardTextInput('โทรศัพท์มือถือ', state.phone,
              (v) => notifier.update('phone', v)),
          WizardTextInput(
              'อีเมล', state.email, (v) => notifier.update('email', v)),
          WizardTextInput(
              'Line ID', state.lineId, (v) => notifier.update('lineId', v)),
        ],
      ),
    );
  }
}
