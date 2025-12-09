import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step5Composite extends ConsumerWidget {
  const Step5Composite({super.key});

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
      onBack: () => context.go('/applications/create/step4'),
      onNext: () => context.go('/applications/create/step6'),
      child: Column(
        children: [
          const Text("5. เอกสารหลักฐาน (Evidence)",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const Text("Upload Required Documents",
              style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),
          WizardDocTile('1. สำเนาโฉนด/เอกสารสิทธิ์', 'doc_land', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('2. หนังสือยินยอมให้ใช้ที่ดิน', 'doc_consent', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('3. แผนผังสถานที่ผลิต', 'doc_layout', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('4. รูปถ่ายสถานที่', 'doc_photo', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile(
              '5. คู่มือ SOP', 'doc_sop', state, (k) => _pickFile(ref, k)),
          WizardDocTile('6. เอกสารแสดงการตั้งตัวแทน (ถ้ามี)', 'doc_agent',
              state, (k) => _pickFile(ref, k)),
        ],
      ),
    );
  }
}
