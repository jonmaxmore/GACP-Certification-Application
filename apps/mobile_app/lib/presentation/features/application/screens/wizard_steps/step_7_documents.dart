import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/form_state_provider.dart';
import '../../models/gacp_application_models.dart';
import 'wizard_common.dart';

class Step7Documents extends ConsumerWidget {
  const Step7Documents({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);

    // Adaptive Logic: Generate Required Docs
    final plantId = state.plantId;
    final plantConfig = plantConfigs[plantId] ?? plantConfigs.values.first;
    final isGroupA = plantConfig.group == PlantGroup.highControl;
    final isReplacement = state.type == ServiceType.replacement;

    final docList = _generateDocList(state, isGroupA, isReplacement);

    return WizardScaffold(
      title: '7. เอกสารแนบ (Document Uploads)',
      onBack: () {
        if (isReplacement) {
          context.go('/applications/create/step4'); // Back to Reason Form
        } else {
          context.go('/applications/create/step6');
        }
      },
      onNext: () {
        // Validation: Check if all required docs are uploaded (Mock check)
        const bool allUploaded = true;
        // Real implementation would check state.documents maps

        if (allUploaded) {
          context.go('/applications/create/step8');
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('รายการเอกสารที่ต้องใช้ (Generated Document List)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          Text(
              isReplacement
                  ? 'เอกสารสำหรับขอใบแทน (Replacement Docs)'
                  : 'ระบบวิเคราะห์เอกสารที่จำเป็นตามข้อมูลที่กรอก',
              style: const TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),
          Expanded(
            child: ListView.builder(
              itemCount: docList.length,
              itemBuilder: (ctx, index) {
                final doc = docList[index];
                return _UploadItem(
                    title: doc.label, isRequired: doc.isRequired);
              },
            ),
          ),
        ],
      ),
    );
  }

  List<DocRequirement> _generateDocList(
      GACPApplication state, bool isGroupA, bool isReplacement) {
    final list = <DocRequirement>[];

    // CASE: REPLACEMENT
    if (isReplacement) {
      if (state.replacementReason?.reason == 'Lost') {
        list.add(DocRequirement('สำเนาใบแจ้งความ (Police Report Copy)', true));
      } else {
        list.add(DocRequirement(
            'รูปถ่ายใบรับรองที่ชำรุด (Photo of Damaged Cert)', true));
      }
      list.add(DocRequirement('สำเนาบัตรประชาชน (ID Card Copy)', true));
      return list;
    }

    // CASE: NEW / RENEWAL
    // 1. Mandatory (All)
    list.add(DocRequirement('สำเนาบัตรประชาชน (ID Card Copy)', true));
    list.add(DocRequirement('เอกสารสิทธิ์ที่ดิน (Land Title Deed)', true));
    list.add(DocRequirement('รูปถ่ายแปลงปลูก (Site Photos)', true));
    list.add(DocRequirement('แผนที่การเดินทาง (Map)', true));
    list.add(
        DocRequirement('ผลวิเคราะห์คุณภาพดิน/น้ำ (Soil/Water Analysis)', true));

    // 2. Group Specific
    if (isGroupA) {
      // License Docs based on Status
      if (state.licenseInfo?.plantingStatus == 'Notify') {
        list.add(DocRequirement('ใบรับจดแจ้ง (Notification Receipt)', true));
      } else {
        list.add(DocRequirement('ใบอนุญาต (License Copy)', true));
      }

      // Security
      if (state.securityMeasures.hasCCTV) {
        list.add(DocRequirement('ผังการติดตั้งกล้องวงจรปิด (CCTV Plan)', true));
      }
    } else {
      // Group B
      list.add(DocRequirement('ใบรับรอง GAP (ถ้ามี)', false));
      // Tuber Check
      final hasTuber = state.production.plantParts
          .any((p) => p.contains('Tuber') || p.contains('หัว'));
      if (hasTuber) {
        list.add(DocRequirement(
            'ผลวิเคราะห์สารหนู (Arsenic Test Requirement)', true));
      }
    }

    // 3. Sourcing
    if (state.production.sourceType == 'Buy') {
      list.add(
          DocRequirement('ใบเสร็จรับเงินค่าเมล็ดพันธุ์ (Seed Receipt)', true));
    } else if (state.production.sourceType == 'Import') {
      list.add(DocRequirement('ใบอนุญาตนำเข้า (Import License)', true));
    }

    return list;
  }
}

class DocRequirement {
  final String label;
  final bool isRequired;
  DocRequirement(this.label, this.isRequired);
}

class _UploadItem extends StatefulWidget {
  final String title;
  final bool isRequired;

  const _UploadItem({required this.title, required this.isRequired});

  @override
  State<_UploadItem> createState() => _UploadItemState();
}

class _UploadItemState extends State<_UploadItem> {
  String? _fileName;

  void _pickFile() async {
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() {
      _fileName = 'doc_${DateTime.now().millisecond}.pdf';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(
          _fileName != null ? LucideIcons.checkCircle : LucideIcons.fileUp,
          color: _fileName != null ? Colors.green : Colors.grey,
        ),
        title: Text(widget.title),
        subtitle: Text(
            widget.isRequired ? '* จำเป็น (Required)' : 'ไม่บังคับ (Optional)',
            style:
                TextStyle(color: widget.isRequired ? Colors.red : Colors.grey)),
        trailing: IconButton(
          icon: const Icon(Icons.upload_file),
          onPressed: _pickFile,
          color: _fileName != null ? Colors.green : Colors.blue,
        ),
      ),
    );
  }
}
