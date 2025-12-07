import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/application_provider.dart';
import 'package:mobile_app/presentation/features/establishment/providers/establishment_provider.dart';
import 'package:mobile_app/domain/entities/establishment_entity.dart'; // Correct Import

class ApplicationFormScreen extends ConsumerStatefulWidget {
  final String? requestType;
  const ApplicationFormScreen({super.key, this.requestType});

  @override
  ConsumerState<ApplicationFormScreen> createState() =>
      _ApplicationFormScreenState();
}

class _ApplicationFormScreenState extends ConsumerState<ApplicationFormScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // AI State
  bool _isAnalyzing = false;
  String? _aiResult;

  // Review & Payment State
  bool _isReviewed = false;
  bool _isPaidPhase1 = false;

  // Controllers
  final _applicantNameController = TextEditingController();
  final _idCardController = TextEditingController();
  final _mobileController = TextEditingController(); // New
  final _emailController = TextEditingController(); // New
  final _lineIdController = TextEditingController(); // New
  final _regNoController = TextEditingController();
  final _officeAddressController = TextEditingController();
  final _titleDeedController = TextEditingController();
  final _gpsController = TextEditingController();
  final _securityFencingController =
      TextEditingController(text: 'รั้วลวดหนาม สูง 2 เมตร');
  final _securityCCTVController = TextEditingController();

  // New: Dropdown Values
  String _certificationType = 'CULTIVATION';
  String _objective = 'COMMERCIAL_DOMESTIC';
  String _applicantType = 'INDIVIDUAL';
  String _areaType = 'OUTDOOR'; // New: Site Area Type
  // Enums from Backend:
  // certificationType: ['CULTIVATION', 'PROCESSING']
  // objective: ['RESEARCH', 'COMMERCIAL_DOMESTIC', 'COMMERCIAL_EXPORT', 'OTHER']
  // applicantType: ['COMMUNITY', 'INDIVIDUAL', 'JURISTIC']

  // Selected Establishment
  EstablishmentEntity? _selectedEstablishment;

  @override
  void dispose() {
    _applicantNameController.dispose();
    _regNoController.dispose();
    _officeAddressController.dispose();
    _titleDeedController.dispose();
    _gpsController.dispose();
    _securityFencingController.dispose();
    _securityCCTVController.dispose();
    super.dispose();
  }

  void _onEstablishmentSelected(EstablishmentEntity? establishment) {
    setState(() {
      _selectedEstablishment = establishment;
    });
    if (establishment != null) {
      _applicantNameController.text = establishment.name;
      _officeAddressController.text =
          establishment.address; // Simple String Link
      _titleDeedController.text = establishment.titleDeedNo;
      _gpsController.text =
          '${establishment.latitude}, ${establishment.longitude}';
      _securityFencingController.text = establishment.security;

      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Auto-filled from ${establishment.name}')));
    }
  }

  void _runAIScan() async {
    setState(() => _isAnalyzing = true);
    await Future.delayed(const Duration(seconds: 2)); // Simulate processing
    if (mounted) {
      setState(() {
        _isAnalyzing = false;
        _aiResult = 'เอกสารถูกต้องตามมาตรฐาน GACP (Document Valid)';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ขอรับใบรับรองใหม่ (GACP)')),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: _onContinue,
        onStepCancel: _onCancel,
        controlsBuilder: _buildControls,
        steps: [
          // Step 1: Form 09 Data Entry (Comprehensive)
          Step(
            title: const Text('กรอกข้อมูลใบสมัคร (Form 09)'),
            content: Form(
              key: _formKey,
              child: Column(
                children: [
                  const Text('กรุณากรอกข้อมูลตามมาตรฐาน GACP/DTAM',
                      style: TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 12),

                  // Section 1: Applicant Info
                  ExpansionTile(
                    initiallyExpanded: true,
                    title: const Text('1. ข้อมูลผู้ยื่นคำขอ (Applicant)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      // Establishment Selector (Auto-fill)
                      Consumer(builder: (context, ref, child) {
                        final estState = ref.watch(establishmentProvider);
                        return DropdownButtonFormField<EstablishmentEntity>(
                          decoration: const InputDecoration(
                            labelText: 'เลือกแปลงปลูกเพื่อระบุข้อมูล',
                            prefixIcon: Icon(LucideIcons.sprout),
                            border: OutlineInputBorder(),
                            helperText: 'ข้อมูลจะถูกเติมอัตโนมัติ (Auto-fill)',
                          ),
                          initialValue: _selectedEstablishment,
                          items: estState.establishments.map((e) {
                            return DropdownMenuItem(
                              value: e,
                              child: Text(e.name),
                            );
                          }).toList(),
                          onChanged: _onEstablishmentSelected,
                        );
                      }),
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 16),

                      // New: GACP Service Details
                      DropdownButtonFormField<String>(
                        value: _certificationType,
                        decoration: const InputDecoration(
                            labelText: 'ประเภทการรับรอง (Certification Type)',
                            border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(
                              value: 'CULTIVATION',
                              child: Text('การเพาะปลูก (Cultivation)')),
                          DropdownMenuItem(
                              value: 'PROCESSING',
                              child: Text('การแปรรูป (Processing)')),
                        ],
                        onChanged: (v) =>
                            setState(() => _certificationType = v!),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _objective,
                        decoration: const InputDecoration(
                            labelText: 'วัตถุประสงค์ (Objective)',
                            border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(
                              value: 'RESEARCH',
                              child: Text('วิจัย (Research)')),
                          DropdownMenuItem(
                              value: 'COMMERCIAL_DOMESTIC',
                              child: Text(
                                  'จำหน่ายในประเทศ (Commercial Domestic)')),
                          DropdownMenuItem(
                              value: 'COMMERCIAL_EXPORT',
                              child: Text('ส่งออก (Commercial Export)')),
                          DropdownMenuItem(
                              value: 'OTHER', child: Text('อื่นๆ (Other)')),
                        ],
                        onChanged: (v) => setState(() => _objective = v!),
                      ),
                      const SizedBox(height: 12),
                      const Divider(),
                      const SizedBox(height: 12),

                      DropdownButtonFormField<String>(
                        value: _applicantType,
                        decoration: const InputDecoration(
                            labelText: 'ประเภทผู้ยื่น (Applicant Type)',
                            border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(
                              value: 'INDIVIDUAL',
                              child: Text('บุคคลธรรมดา (Individual)')),
                          DropdownMenuItem(
                              value: 'COMMUNITY',
                              child:
                                  Text('วิสาหกิจชุมชน (Community Enterprise)')),
                          DropdownMenuItem(
                              value: 'JURISTIC',
                              child: Text('นิติบุคคล (Juristic)')),
                        ],
                        onChanged: (v) => setState(() => _applicantType = v!),
                      ),
                      const SizedBox(height: 12),

                      const SizedBox(height: 12),

                      // Conditional: ID Card
                      if (_applicantType == 'INDIVIDUAL')
                        Column(
                          children: [
                            TextFormField(
                              controller: _idCardController,
                              decoration: const InputDecoration(
                                  labelText: 'เลขบัตรประชาชน (ID Card)',
                                  prefixIcon: Icon(LucideIcons.contact),
                                  border: OutlineInputBorder()),
                              validator: (v) => v!.length != 13
                                  ? 'ระบุเลขบัตรฯ 13 หลัก'
                                  : null,
                              keyboardType: TextInputType.number,
                              maxLength: 13,
                            ),
                            const SizedBox(height: 12),
                          ],
                        ),

                      TextFormField(
                        controller: _applicantNameController,
                        decoration: const InputDecoration(
                            labelText: 'ชื่อสถานประกอบการ / เกษตรกร',
                            prefixIcon: Icon(LucideIcons.user),
                            border: OutlineInputBorder()),
                        validator: (v) => v!.isEmpty ? 'ระบุชื่อ' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _regNoController,
                        decoration: const InputDecoration(
                            labelText: 'เลขทะเบียนเกษตรกร / นิติบุคคล',
                            prefixIcon: Icon(LucideIcons.hash),
                            border: OutlineInputBorder()),
                        validator: (v) => v!.isEmpty ? 'ระบุเลขทะเบียน' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _officeAddressController,
                        decoration: const InputDecoration(
                            labelText: 'ที่ตั้งสำนักงาน (Address)',
                            prefixIcon: Icon(LucideIcons.home),
                            border: OutlineInputBorder()),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _mobileController,
                        decoration: const InputDecoration(
                            labelText: 'เบอร์โทรศัพท์ (Mobile)',
                            prefixIcon: Icon(LucideIcons.phone),
                            border: OutlineInputBorder()),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                            labelText: 'อีเมล (Email)',
                            prefixIcon: Icon(LucideIcons.mail),
                            border: OutlineInputBorder()),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _lineIdController,
                        decoration: const InputDecoration(
                            labelText: 'Line ID',
                            prefixIcon: Icon(LucideIcons.messageCircle),
                            border: OutlineInputBorder()),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                  // Section 2: Site Info
                  ExpansionTile(
                    title: const Text('2. สถานที่เพาะปลูก (Cultivation Site)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      DropdownButtonFormField<String>(
                        value: _areaType,
                        decoration: const InputDecoration(
                            labelText: 'ประเภทพื้นที่ (Area Type)',
                            border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(
                              value: 'OUTDOOR',
                              child: Text('กลางแจ้ง (Outdoor)')),
                          DropdownMenuItem(
                              value: 'INDOOR', child: Text('ในร่ม (Indoor)')),
                          DropdownMenuItem(
                              value: 'GREENHOUSE',
                              child: Text('โรงเรือน (Greenhouse)')),
                          DropdownMenuItem(
                              value: 'OTHER', child: Text('อื่นๆ (Other)')),
                        ],
                        onChanged: (v) => setState(() => _areaType = v!),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _titleDeedController,
                        decoration: const InputDecoration(
                            labelText: 'เลขที่โฉนดที่ดิน (Title Deed No.)',
                            prefixIcon: Icon(LucideIcons.file),
                            border: OutlineInputBorder()),
                        validator: (v) => v!.isEmpty ? 'ระบุเลขโฉนด' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _gpsController,
                        decoration: const InputDecoration(
                            labelText: 'พิกัดแปลงปลูก (GPS Coordinates)',
                            prefixIcon: Icon(LucideIcons.mapPin),
                            border: OutlineInputBorder()),
                        validator: (v) => v!.isEmpty ? 'ระบุพิกัด' : null,
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                  // Section 3: Security
                  ExpansionTile(
                    title: const Text('3. ระบบความปลอดภัย (Security)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      TextFormField(
                        controller: _securityFencingController,
                        decoration: const InputDecoration(
                            labelText: 'รายละเอียดรั้วกั้น (Fencing)',
                            border: OutlineInputBorder()),
                        // Initial Value removed because Controller has it
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                            labelText: 'จำนวนกล้อง CCTV',
                            border: OutlineInputBorder()),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                  // Section 4: Cultivation Plan
                  ExpansionTile(
                    title: const Text('4. แผนการผลิต (Cultivation Plan)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      TextFormField(
                        decoration: const InputDecoration(
                            labelText: 'สายพันธุ์ที่ปลูก (Plant Strain)',
                            prefixIcon: Icon(LucideIcons.sprout),
                            border: OutlineInputBorder()),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                              child: TextFormField(
                                  decoration: const InputDecoration(
                                      labelText: 'จำนวนต้น',
                                      border: OutlineInputBorder()))),
                          const SizedBox(width: 12),
                          Expanded(
                              child: TextFormField(
                                  decoration: const InputDecoration(
                                      labelText: 'พื้นที่ (ไร่)',
                                      border: OutlineInputBorder()))),
                        ],
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                  // Section 5: Harvesting
                  ExpansionTile(
                    title: const Text('5. การเก็บเกี่ยว (Harvesting)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      TextFormField(
                        decoration: const InputDecoration(
                            labelText: 'วิธีการเก็บเกี่ยว (Method)',
                            border: OutlineInputBorder()),
                        initialValue:
                            'เก็บเกี่ยวด้วยมือ (Manual Harvest only flowers)',
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        decoration: const InputDecoration(
                            labelText: 'ภาชนะที่ใช้บรรจุ (Containers)',
                            border: OutlineInputBorder()),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                  // Section 6: Post-Harvest
                  ExpansionTile(
                    title: const Text(
                        '6. การจัดการหลังเก็บเกี่ยว (Post-Harvest)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      TextFormField(
                        decoration: const InputDecoration(
                            labelText: 'การลดความชื้น (Drying)',
                            border: OutlineInputBorder()),
                        initialValue:
                            'ห้องอบควบคุมอุณหภูมิ (Temperature Controlled Room)',
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        decoration: const InputDecoration(
                            labelText: 'สถานที่เก็บรักษา (Storage)',
                            border: OutlineInputBorder()),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),

                  // Section 7: Personnel
                  ExpansionTile(
                    title: const Text('7. บุคลากร (Personnel)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      TextFormField(
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                            labelText: 'จำนวนผู้ปฏิบัติงาน (Workers)',
                            border: OutlineInputBorder()),
                      ),
                      const SizedBox(height: 12),
                      CheckboxListTile(
                        title: const Text('ผ่านการอบรม GACP แล้ว (Trained)'),
                        value: true,
                        onChanged: (v) {},
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ],
              ),
            ),
            isActive: _currentStep >= 0,
          ),

          // Step 2: Documents
          Step(
            title: const Text('แนบเอกสาร & AI Scan'),
            content: Column(
              children: [
                const Text('กรุณาแนบโฉนดที่ดินเพื่อตรวจสอบ'),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8)),
                  child: Column(
                    children: [
                      const Icon(LucideIcons.fileImage,
                          size: 40, color: Colors.blue),
                      const Text('Chanote_Land_01.pdf'),
                      const SizedBox(height: 12),
                      if (_isAnalyzing)
                        // Fixed: no const here
                        const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircularProgressIndicator(),
                              SizedBox(width: 8),
                              Text('AI Analyzing...')
                            ])
                      else if (_aiResult != null)
                        Container(
                          padding: const EdgeInsets.all(8),
                          color: Colors.green[50],
                          child: Row(children: [
                            const Icon(LucideIcons.check, color: Colors.green),
                            const SizedBox(width: 8),
                            Text(_aiResult!,
                                style: const TextStyle(color: Colors.green))
                          ]),
                        )
                      else
                        ElevatedButton.icon(
                            onPressed: _runAIScan,
                            icon: const Icon(LucideIcons.scan),
                            label: const Text('Run AI Scan'))
                    ],
                  ),
                )
              ],
            ),
            isActive: _currentStep >= 1,
          ),

          // Step 3: Payment
          Step(
            title: const Text('ชำระค่าธรรมเนียม'),
            content: Column(
              children: [
                const Text('ค่าธรรมเนียมคำขอ: 5,000 บาท'),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: _openWebViewDialog, // Review first
                  icon: const Icon(LucideIcons.eye),
                  label: const Text('ตรวจสอบเอกสาร (Review)'),
                ),
                const SizedBox(height: 12),
                if (_isReviewed)
                  ElevatedButton.icon(
                    onPressed: _isPaidPhase1 ? null : _simulatePayment,
                    icon: const Icon(LucideIcons.creditCard),
                    label: Text(_isPaidPhase1
                        ? 'ชำระเงินแล้ว (Paid)'
                        : 'ชำระเงิน 5,000 บาท'),
                    style: ElevatedButton.styleFrom(
                        backgroundColor:
                            _isPaidPhase1 ? Colors.grey : Colors.purple,
                        foregroundColor: Colors.white),
                  ),
                if (_isPaidPhase1)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: ElevatedButton(
                      onPressed: _submitApplication,
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white),
                      child: const Text('ยื่นคำขอ (Submit)'),
                    ),
                  ),
              ],
            ),
            isActive: _currentStep >= 2,
          ),
        ],
      ),
    );
  }

  void _onContinue() async {
    if (_currentStep == 0) {
      if (_formKey.currentState != null && !_formKey.currentState!.validate()) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('กรุณากรอกข้อมูลให้ครบถ้วน')));
        return;
      }

      // Create Draft Application (if not exists)
      final appState = ref.read(applicationProvider);
      if (appState.applicationId == null) {
        if (_selectedEstablishment == null) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('กรุณาเลือกแปลงปลูก (Select Establishment)')));
          return;
        }

        // Show Loading
        showDialog(
            context: context,
            barrierDismissible: false,
            builder: (ctx) => const Center(child: CircularProgressIndicator()));

        final success =
            await ref.read(applicationProvider.notifier).createApplication(
          establishmentId: _selectedEstablishment!.id,
          requestType: widget.requestType ?? 'NEW',
          // Structured Data Payload (GACP V2)
          certificationType: _certificationType,
          objective: _objective,
          applicantType: _applicantType,
          applicantInfo: {
            'name': _applicantNameController.text,
            'address': _officeAddressController.text,
            'idCard': _idCardController.text,
            'registrationCode': _regNoController.text,
            // Contact Info
            'mobile': _mobileController.text,
            'email': _emailController.text,
            'lineId': _lineIdController.text,
            // Use 'entityName' if Juristic/Community, but map to name for simplicity or separate if needed
            'entityName': _applicantNameController.text,
          },
          siteInfo: {
            'areaType': _areaType,
            'titleDeedNo': _titleDeedController.text,
            'coordinates': _gpsController.text,
            'address': _officeAddressController
                .text, // Fallback if site address same as office make explicit if needed
          },
          // Flexible/Legacy Data
          formData: {
            'securityFencing': _securityFencingController.text,
            'securityCCTV': _securityCCTVController.text,
            // ... other loose fields
          },
          documents: {}, // Attachments handled in next step
        );

        Navigator.pop(context); // Hide Loading

        if (!success) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Failed to create application draft')));
          return;
        }
      }
    }
    if (_currentStep < 2) setState(() => _currentStep++);
  }

  void _onCancel() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    } else {
      context.pop();
    }
  }

  // Controls
  Widget _buildControls(BuildContext context, ControlsDetails details) {
    if (_currentStep == 2) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 20),
      child: Row(
        children: [
          ElevatedButton(
              onPressed: details.onStepContinue, child: const Text('ถัดไป')),
          const SizedBox(width: 12),
          TextButton(
              onPressed: details.onStepCancel, child: const Text('ย้อนกลับ')),
        ],
      ),
    );
  }

  // Helpers
  void _openWebViewDialog() {
    setState(() => _isReviewed = true);
    showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
                title: const Text('Preview'),
                content: const Text('Reviewing Document...'),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Close'))
                ]));
  }

  Future<void> _simulatePayment() async {
    final result = await ref.read(applicationProvider.notifier).payPhase1();
    if (result != null && mounted) {
      _showPaymentDialog(result);
    }
  }

  void _showPaymentDialog(Map<String, dynamic> data) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('ชำระเงินผ่าน Ksher'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (data['qrCode'] != null)
              Image.network(data['qrCode'], height: 200, width: 200),
            const SizedBox(height: 16),
            const Text('Scan QR or Click below'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              icon: const Icon(LucideIcons.externalLink),
              label: const Text('เปิดหน้าชำระเงิน (Open Payment Page)'),
              onPressed: () => launchUrl(Uri.parse(data['paymentUrl'])),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () async {
              // Refresh Status
              final appId = ref.read(applicationProvider).applicationId;
              if (appId != null) {
                await ref
                    .read(applicationProvider.notifier)
                    .fetchApplicationById(appId);
                final app = ref.read(applicationProvider).currentApplication;
                if (app != null &&
                    app['payment']['phase1']['status'] == 'PAID') {
                  setState(() => _isPaidPhase1 = true);
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Payment Successful!')));
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                      content: Text('Payment Not Yet Confirmed')));
                }
              }
            },
            child: const Text('ตรวจสอบสถานะ (Check Status)'),
          ),
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('ปิด (Close)')),
        ],
      ),
    );
  }

  void _submitApplication() {
    final state = ref.read(applicationProvider);
    if (state.currentApplication?['status'] == 'SUBMITTED') {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Success!')));
      context.pop();
    }
  }
}
