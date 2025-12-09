import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step2Objective extends ConsumerWidget {
  const Step2Objective({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(applicationFormProvider.notifier);
    final state = ref.watch(applicationFormProvider);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/applicant-info'),
      onNext: () => context.go('/applications/create/product'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("วัตถุประสงค์",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          WizardRadioTile('เพื่อใช้ทางการแพทย์', 'medical', state.objective,
              (v) => notifier.update('objective', v)),
          WizardRadioTile('เพื่อการส่งออก', 'export', state.objective,
              (v) => notifier.update('objective', v)),
          const Divider(),
          const Text("ลักษณะพื้นที่",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          WizardRadioTile('กลางแจ้ง (Outdoor)', 'outdoor', state.areaType,
              (v) => notifier.update('areaType', v)),
          WizardRadioTile('ระบบปิด (Indoor)', 'indoor', state.areaType,
              (v) => notifier.update('areaType', v)),
          WizardRadioTile('โรงเรือน (Greenhouse)', 'greenhouse', state.areaType,
              (v) => notifier.update('areaType', v)),
          const Divider(),
          WizardTextInput(
              'ชื่อสถานที่ (พื้นที่ปลูก/แปรรูป)',
              state.establishmentName,
              (v) => notifier.update('establishmentName', v)),
          WizardTextInput('ตั้งอยู่เลขที่', state.locationAddress,
              (v) => notifier.update('locationAddress', v),
              maxLines: 2),
          WizardTextInput('พิกัดภูมิศาสตร์ (GPS)', state.lat,
              (v) => notifier.update('lat', v)),
          const Divider(),
          const Text("ข้อมูลที่ดิน",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          WizardTextInput('ประเภทเอกสาร (โฉนด/นส.3)', state.landDocType,
              (v) => notifier.update('landDocType', v)),
          Row(children: [
            Expanded(
                child: WizardTextInput('เลขที่', state.landDocNo,
                    (v) => notifier.update('landDocNo', v))),
            const SizedBox(width: 10),
            Expanded(
                child: WizardTextInput('เล่มที่', state.landVol,
                    (v) => notifier.update('landVol', v))),
          ]),
          const Text("กรรมสิทธิ์",
              style: TextStyle(fontWeight: FontWeight.bold)),
          WizardRadioTile('เจ้าของที่ดิน', 'owner', state.landOwnership,
              (v) => notifier.update('landOwnership', v)),
          WizardRadioTile('ผู้เช่า', 'tenant', state.landOwnership,
              (v) => notifier.update('landOwnership', v)),
          if (state.landOwnership == 'tenant')
            WizardTextInput('ชื่อเจ้าของที่ดินผู้ให้เช่า', state.landOwnerName,
                (v) => notifier.update('landOwnerName', v)),
          WizardTextInput('ขนาดพื้นที่ (ตร.ม.)', state.areaSize,
              (v) => notifier.update('areaSize', v)),
        ],
      ),
    );
  }
}
