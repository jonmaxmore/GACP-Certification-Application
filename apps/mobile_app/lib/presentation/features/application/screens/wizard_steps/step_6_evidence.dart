import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step6Evidence extends ConsumerWidget {
  const Step6Evidence({super.key});

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
      onBack: () => context.go('/applications/create/step5'),
      onNext: () => context.go('/applications/create/step7'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("6. เอกสารหลักฐาน (E-Evidence)",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const Text("อัปโหลดเอกสารประกอบการพิจารณา (25 รายการ)",
              style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),

          // Group A: General
          _buildCategoryHeader("หมวด ก: ข้อมูลทั่วไป (General)"),
          WizardDocTile('1. สำเนาบัตรประชาชน/หนังสือรับรอง', 'doc_id', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('2. เอกสารสิทธิ์ที่ดิน (โฉนด/น.ส.3)', 'doc_land', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('3. หนังสือยินยอมใช้ที่ดิน', 'doc_consent', state,
              (k) => _pickFile(ref, k)),

          const SizedBox(height: 16),
          // Group B: Production
          _buildCategoryHeader("หมวด ข: การผลิต (Production)"),
          WizardDocTile('4. แผนผังสถานที่ (Layout)', 'doc_layout', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile('5. รูปถ่ายสถานที่ (Photos)', 'doc_photos', state,
              (k) => _pickFile(ref, k)),
          WizardDocTile(
              '6. คู่มือ SOP', 'doc_sop', state, (k) => _pickFile(ref, k)),

          const SizedBox(height: 16),
          // Group C: Video Evidence
          _buildCategoryHeader("หมวด ค: วิดีโอหลักฐาน (Video Evidence)"),
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
                  const Text("ลิงก์วิดีโอ (Video URL)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextFormField(
                    initialValue: state.videoLink,
                    decoration: const InputDecoration(
                        hintText: "https://youtube.com/...",
                        border: OutlineInputBorder(),
                        isDense: true,
                        prefixIcon: Icon(Icons.link)),
                    onChanged: (v) => ref
                        .read(applicationFormProvider.notifier)
                        .update('videoLink', v),
                  ),
                  const SizedBox(height: 4),
                  const Text("อัปโหลดวิดีโอขึ้น Cloud/YouTube แล้วนำลิงก์มาวาง",
                      style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),
          // Group D: Other
          _buildCategoryHeader("หมวด ง: อื่นๆ (Other)"),
          WizardDocTile('7. เอกสารอื่นๆ (Other)', 'doc_other', state,
              (k) => _pickFile(ref, k)),
        ],
      ),
    );
  }

  Widget _buildCategoryHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(title,
          style: const TextStyle(
              fontWeight: FontWeight.bold, color: Colors.blueGrey)),
    );
  }
}
