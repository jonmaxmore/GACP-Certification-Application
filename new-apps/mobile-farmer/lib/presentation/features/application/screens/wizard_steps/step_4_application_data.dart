import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import '../../models/gacp_application_models.dart';
import 'wizard_common.dart';

class Step4ApplicationData extends ConsumerStatefulWidget {
  const Step4ApplicationData({super.key});

  @override
  ConsumerState<Step4ApplicationData> createState() =>
      _Step4ApplicationDataState();
}

class _Step4ApplicationDataState extends ConsumerState<Step4ApplicationData>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    // Adaptive Logic
    final plantId = state.plantId;
    final plantConfig = plantConfigs[plantId] ?? plantConfigs.values.first;
    final isGroupA = plantConfig.group == PlantGroup.highControl;
    final isReplacement = state.type == ServiceType.replacement;

    return WizardScaffold(
      title: '4. ข้อมูลใบสมัคร (Application Data)',
      onBack: () => context.go('/applications/create/step3'),
      onNext: () {
        if (FormValidator.validateStep4(state, plantConfig)) {
          // If Replacement, skip to Step 7 (Documents)
          if (isReplacement) {
            context.go('/applications/create/step7');
          } else {
            context.go('/applications/create/step5');
          }
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content:
                    Text('กรุณากรอกข้อมูลให้ครบถ้วน (Please fill all fields)')),
          );
        }
      },
      child: isReplacement
          ? _ReasonForm(state: state, notifier: notifier)
          : Column(
              children: [
                TabBar(
                  controller: _tabController,
                  labelColor: Colors.green,
                  unselectedLabelColor: Colors.grey,
                  tabs: const [
                    Tab(text: 'A. ผู้ยื่น (Applicant)'),
                    Tab(text: 'B. โครงการ (Project)'),
                  ],
                ),
                const SizedBox(height: 10),
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _ApplicantForm(state: state, notifier: notifier),
                      _ProjectForm(
                          state: state, notifier: notifier, isGroupA: isGroupA),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class _ReasonForm extends StatelessWidget {
  final GACPApplication state;
  final ApplicationFormNotifier notifier;

  const _ReasonForm({required this.state, required this.notifier});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(8)),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber, color: Colors.orange),
                  SizedBox(width: 8),
                  Expanded(
                      child: Text(
                          'แบบฟอร์มขอใบแทน (Replacement Request) - กรุณาระบุสาเหตุ',
                          style: TextStyle(color: Colors.deepOrange))),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildReasonRadio('สูญหาย (Lost)', 'Lost'),
            _buildReasonRadio('ชำรุด (Damaged)', 'Damaged'),
            const SizedBox(height: 16),
            if (state.replacementReason?.reason == 'Lost') ...[
              const Text('รายละเอียดการแจ้งความ (Police Report)',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              WizardTextInput(
                  'เลขที่ใบแจ้งความ (Report No.)',
                  state.replacementReason?.policeReportNo ?? '',
                  (v) => notifier.updateReplacementReason(policeReportNo: v)),
              WizardTextInput(
                  'สถานีตำรวจ (Police Station)',
                  state.replacementReason?.policeStation ?? '',
                  (v) => notifier.updateReplacementReason(policeStation: v)),
            ] else ...[
              const Text(
                  'กรุณาเตรียมรูปถ่ายใบที่ชำรุดเพื่ออัปโหลดในขั้นตอนถัดไป (Step 7)',
                  style: TextStyle(color: Colors.grey)),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildReasonRadio(String label, String value) {
    return RadioListTile<String>(
      title: Text(label),
      value: value,
      groupValue: state.replacementReason?.reason ?? 'Lost',
      onChanged: (v) => notifier.updateReplacementReason(reason: v),
    );
  }
}

class _ApplicantForm extends StatelessWidget {
  final GACPApplication state;
  final ApplicationFormNotifier notifier;

  const _ApplicantForm({required this.state, required this.notifier});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('1. ข้อมูลผู้ยื่น (Applicant Info)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: state.profile.applicantType,
            decoration: const InputDecoration(
                labelText: 'ประเภทผู้ยื่น (Type)',
                border: OutlineInputBorder()),
            items: const [
              DropdownMenuItem(value: 'Individual', child: Text('บุคคลธรรมดา')),
              DropdownMenuItem(
                  value: 'Community', child: Text('วิสาหกิจชุมชน')),
              DropdownMenuItem(value: 'Juristic', child: Text('นิติบุคคล')),
            ],
            onChanged: (v) => notifier.updateProfile(applicantType: v),
          ),
          const SizedBox(height: 12),
          WizardTextInput('ชื่อ-สกุล / นิติบุคคล (Name)', state.profile.name,
              (v) => notifier.updateProfile(name: v)),
          WizardTextInput('เลขบัตรปชช. / เลขนิติบุคคล (ID Card / Tax ID)',
              state.profile.idCard, (v) => notifier.updateProfile(idCard: v)),
          WizardTextInput('ที่อยู่ (Address)', state.profile.address,
              (v) => notifier.updateProfile(address: v)),
          WizardTextInput('เบอร์โทรศัพท์ (Mobile)', state.profile.mobile,
              (v) => notifier.updateProfile(mobile: v)),
          const SizedBox(height: 24),
          const Text('2. ผู้รับผิดชอบการผลิต (Responsible Person)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          WizardTextInput(
              'ชื่อผู้รับผิดชอบ (Responsible Name)',
              state.profile.responsibleName,
              (v) => notifier.updateProfile(responsibleName: v)),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: state.profile.qualification,
            decoration: const InputDecoration(
                labelText: 'คุณสมบัติ (Qualification)',
                border: OutlineInputBorder()),
            items: const [
              DropdownMenuItem(value: 'Thai Med', child: Text('แพทย์แผนไทย')),
              DropdownMenuItem(value: 'Folk Doc', child: Text('หมอพื้นบ้าน')),
              DropdownMenuItem(
                  value: 'Through Training',
                  child: Text('ผ่านการอบรมหลักสูตร')),
            ],
            onChanged: (v) => notifier.updateProfile(qualification: v),
          ),
        ],
      ),
    );
  }
}

class _ProjectForm extends StatelessWidget {
  final GACPApplication state;
  final ApplicationFormNotifier notifier;
  final bool isGroupA;

  const _ProjectForm(
      {required this.state, required this.notifier, required this.isGroupA});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('1. สถานที่ปลูก (Site Location)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          WizardTextInput('ชื่อสถานที่ (Site Name)', state.location.name,
              (v) => notifier.updateLocation(name: v)),
          WizardTextInput('ที่อยู่สถานที่ (Address)', state.location.address,
              (v) => notifier.updateLocation(address: v)),
          if (isGroupA) ...[
            const SizedBox(height: 24),
            const Text('2. ใบอนุญาต (License Info) - Group A Only',
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.indigo,
                    fontSize: 16)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(child: _buildStatusRadio('จดแจ้ง (Notify)', 'Notify')),
                Expanded(
                    child: _buildStatusRadio(
                        'ขออนุญาต (Permission)', 'Permission')),
              ],
            ),
            if (state.licenseInfo?.plantingStatus == 'Notify')
              WizardTextInput(
                  'เลขที่ใบรับจดแจ้ง (Notify No.)',
                  state.licenseInfo?.notifyNumber ?? '',
                  (v) => notifier.updateLicense(notifyNumber: v)),
            if (state.licenseInfo?.plantingStatus == 'Permission') ...[
              WizardTextInput(
                  'เลขใบอนุญาต (License No.)',
                  state.licenseInfo?.licenseNumber ?? '',
                  (v) => notifier.updateLicense(licenseNumber: v)),
              const SizedBox(height: 12),
              const Text('ประเภทใบอนุญาต:',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              // Checkboxes for PT11, PT13, etc. could be added here
              // For now keeping simple
              const Text(
                  '(Select PT11, PT13, PT16 - Implemented in detailed view)',
                  style: TextStyle(color: Colors.grey)),
            ]
          ] else ...[
            const SizedBox(height: 24),
            const Text('2. มาตรฐานอื่นๆ (Other Certs) - Group B',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  border: Border.all(color: Colors.green),
                  borderRadius: BorderRadius.circular(8)),
              child: const Text(
                  'GAP / Organic (Optional - Attach in Step 7)\nระบบจะแนะนำเอกสารที่ต้องใช้ในขั้นตอนถัดไป',
                  style: TextStyle(color: Colors.green)),
            )
          ]
        ],
      ),
    );
  }

  Widget _buildStatusRadio(String label, String value) {
    return RadioListTile<String>(
      title: Text(label, style: const TextStyle(fontSize: 14)),
      value: value,
      groupValue: state.licenseInfo?.plantingStatus ?? 'Notify',
      onChanged: (v) => notifier.updateLicense(plantingStatus: v),
      contentPadding: EdgeInsets.zero,
    );
  }
}
