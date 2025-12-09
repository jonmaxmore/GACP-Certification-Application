import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step4Standard extends ConsumerWidget {
  const Step4Standard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(applicationFormProvider.notifier);
    final state = ref.watch(applicationFormProvider);

    final sopItems = [
      'การเพาะเมล็ด/เลี้ยงแม่พันธุ์',
      'การเตรียมดิน/วัสดุปลูก',
      'การดูแลรักษา/ปุ๋ย/น้ำ',
      'การป้องกันกำจัดศัตรูพืช',
      'การเก็บเกี่ยว',
      'การทำแห้ง',
      'การทริม',
      'การบ่ม',
      'การบรรจุและติดฉลาก',
      'การจัดเก็บและขนย้าย',
      'การกำจัดของเสีย'
    ];

    return WizardScaffold(
      onBack: () => context.go('/applications/create/product'),
      onNext: () => context.go('/applications/create/documents'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("ข้อมูลการจัดการ",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          WizardTextInput(
              'แผนการผลิต (ปลูก) และการใช้ประโยชน์',
              state.productionPlanDetails,
              (v) => notifier.update('productionPlanDetails', v),
              maxLines: 3),
          WizardTextInput('มาตรการรักษาความปลอดภัย', state.securityMeasures,
              (v) => notifier.update('securityMeasures', v),
              maxLines: 2),
          WizardTextInput(
              'วิธีการจัดการส่วนที่เหลือ (Waste)',
              state.wasteManagement,
              (v) => notifier.update('wasteManagement', v)),
          const Divider(),
          const Text("คู่มือมาตรฐาน SOP (เลือกที่มี)",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ...sopItems.map((item) => CheckboxListTile(
                title: Text(item),
                // ignore: unnecessary_cast
                value:
                    (state.sopChecklist as List<String>? ?? []).contains(item),
                onChanged: (v) => notifier.toggleSop(item, v!),
                dense: true,
                controlAffinity: ListTileControlAffinity.leading,
              )),
        ],
      ),
    );
  }
}
