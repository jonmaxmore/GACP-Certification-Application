import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step5Documents extends ConsumerWidget {
  const Step5Documents({super.key});

  Future<void> _pickFile(WidgetRef ref, String key) async {
    final result = await FilePicker.platform.pickFiles(type: FileType.any);
    if (result != null) {
      ref
          .read(applicationFormProvider.notifier)
          .addAttachment(key, result.files.single);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/standard'),
      onNext: () => context.go('/applications/create/review'),
      child: Column(
        children: [
          const Text("เอกสารหลักฐาน (Upload PDF/Image)",
              style:
                  TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          WizardDocTile('1. สำเนาโฉนด/เอกสารสิทธิ์', 'doc_land', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('2. หนังสือยินยอมให้ใช้ที่ดิน', 'doc_consent', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('3. แผนที่และพิกัดแปลงปลูก', 'doc_map', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('4. แบบแปลนโรงเรือน', 'doc_layout', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('5. รูปถ่ายภายนอก', 'doc_photo_out', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile(
              '6. แผนการผลิต', 'doc_plan', state, (k) => _pickFile(ref, k)),
          WizardDocTile('7. มาตรการความปลอดภัย', 'doc_security', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('8. รูปถ่ายภายใน/เก็บเกี่ยว', 'doc_photo_in', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('9. คู่มือ SOP ฉบับเต็ม', 'doc_sop', state,
              (k) => _pickFile(ref, k)),
          const Divider(),
          WizardDocTile('10. ทะเบียนวิสาหกิจ/นิติบุคคล', 'doc_entity', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('11. หนังสือมอบอำนาจ (สวช.01)', 'doc_auth', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('12. เอกสารดำเนินกิจการ (ท.ว.ช.3)', 'doc_operate',
              state, (k) => _pickFile(ref, k)),
          WizardDocTile('13. ใบรับรองอบรม GACP', 'doc_train', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('14. หนังสือรับรองสายพันธุ์', 'doc_strain', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('15. เอกสารอบรมพนักงาน', 'doc_staff_train', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('16. แบบทดสอบพนักงาน', 'doc_staff_test', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('17. ผลตรวจวัสดุปลูก', 'doc_soil', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile(
              '18. ผลตรวจน้ำ', 'doc_water', state, (k) => _pickFile(ref, k)),
          WizardDocTile('19. ผลตรวจช่อดอก', 'doc_flower', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('20. รายงานปัจจัยการผลิต', 'doc_input', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile(
              '21. ตาราง CP/CCP', 'doc_ccp', state, (k) => _pickFile(ref, k)),
          WizardDocTile('22. ใบสอบเทียบเครื่องมือ', 'doc_calib', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('23. วิดีโอ (แนบลิงก์)', 'doc_video', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('24. เอกสารเพิ่มเติม', 'doc_other', state,
              (k) => _pickFile(ref, k)),
        ],
      ),
    );
  }
}
