import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile_app/presentation/features/application/screens/map_picker_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/application_provider.dart';
import 'package:mobile_app/presentation/features/establishment/providers/establishment_provider.dart';
import 'package:mobile_app/domain/entities/establishment_entity.dart'; // Correct Import
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'New Application', type: ApplicationFormScreen)
Widget applicationFormUseCase(BuildContext context) {
  return const ProviderScope(
    child: ApplicationFormScreen(requestType: 'NEW'),
  );
}

@widgetbook.UseCase(name: 'Renewal', type: ApplicationFormScreen)
Widget applicationFormRenewUseCase(BuildContext context) {
  return const ProviderScope(
    child: ApplicationFormScreen(requestType: 'RENEW'),
  );
}

@widgetbook.UseCase(name: 'Replacement', type: ApplicationFormScreen)
Widget applicationFormSubstituteUseCase(BuildContext context) {
  return const ProviderScope(
    child: ApplicationFormScreen(requestType: 'SUBSTITUTE'),
  );
}

@widgetbook.UseCase(name: 'Amendment', type: ApplicationFormScreen)
Widget applicationFormAmendmentUseCase(BuildContext context) {
  return const ProviderScope(
    child: ApplicationFormScreen(requestType: 'AMENDMENT'),
  );
}

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

  // Helper
  bool get _isReplacement =>
      widget.requestType == 'SUBSTITUTE' || widget.requestType == 'REPLACEMENT';
  bool get _isAmendment => widget.requestType == 'AMENDMENT';

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

  // New Controllers (User Requested)
  final _plantStrainController = TextEditingController(); // Strain
  final _plantPartsController = TextEditingController();
  final _strainSourceController =
      TextEditingController(); // แหล่งที่มาสายพันธุ์ (บริษัท)
  final _expectedQtyController = TextEditingController(); // ปริมาณ

  // Juristic / Community Specific
  final _authorizedDirectorController =
      TextEditingController(); // ชื่อประธาน/กรรมการ
  final _officePhoneController =
      TextEditingController(); // โทรศัพท์สถานที่จัดตั้ง
  final _directorMobileController = TextEditingController(); // มือถือประธาน
  final _communityReg01Controller = TextEditingController(); // สวช.01
  final _communityReg03Controller = TextEditingController(); // ท.ว.ช.3
  final _houseIdController = TextEditingController(); // เลขรหัสประจำบ้าน

  // Coordinator (Juristic)
  final _coordinatorNameController = TextEditingController();
  final _coordinatorPhoneController = TextEditingController();
  final _coordinatorLineController = TextEditingController();
  final _titleDeedController = TextEditingController();
  final _gpsController = TextEditingController();
  final _securityFencingController =
      TextEditingController(text: 'รั้วลวดหนาม สูง 2 เมตร');
  final _securityCCTVController = TextEditingController();

  // Renewal Fields
  final _oldCertificateController = TextEditingController();
  final _yearController = TextEditingController();
  final _plantingPlanController = TextEditingController(); // New
  final _utilizationPlanController = TextEditingController(); // New

  // New: Multi-Select Values
  Set<String> _certificationTypes = {'CULTIVATION'};
  Set<String> _objectives = {'COMMERCIAL_DOMESTIC'};
  String _applicantType = 'INDIVIDUAL';
  Set<String> _areaTypes = {'OUTDOOR'}; // New: Site Area Type
  // Enums from Backend:
  // certificationType: ['CULTIVATION', 'PROCESSING']
  // objective: ['RESEARCH', 'COMMERCIAL_DOMESTIC', 'COMMERCIAL_EXPORT', 'OTHER']
  // applicantType: ['COMMUNITY', 'INDIVIDUAL', 'JURISTIC']

  // Selected Establishment
  EstablishmentEntity? _selectedEstablishment;

  // Replacement Specific
  String _replacementReason = 'LOST'; // LOST, DAMAGED, OTHER
  final _replacementReasonOtherController = TextEditingController();

  @override
  void dispose() {
    _applicantNameController.dispose();
    _regNoController.dispose();
    _officeAddressController.dispose();
    _titleDeedController.dispose();
    _gpsController.dispose();
    _securityFencingController.dispose();
    _securityCCTVController.dispose();
    _replacementReasonOtherController.dispose(); // Dispose new controller
    _plantingPlanController.dispose();
    _utilizationPlanController.dispose();
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

  // Helper for Replacement Documents
  List<Map<String, dynamic>> _getReplacementDocumentList() {
    final commonDocs = [
      {
        'id': 'REQ_FORM',
        'title': '1. แบบลงทะเบียนยื่นคำขอ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'hasDownload': true,
        'isLink': false
      },
      {
        'id': 'LAND_TITLE',
        'title': '2. สำเนาหนังสือแสดงกรรมสิทธิ์ในที่ดิน',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'LAND_CONSENT',
        'title': '3. หนังสือให้ความยินยอม (กรณีเช่า)',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': false, // Conditional
        'isLink': false
      },
      {
        'id': 'MAP_GPS',
        'title': '4. แผนที่แสดงที่ตั้งและพิกัด',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'BUILDING_PLAN',
        'title': '5. แบบแปลนอาคารหรือโรงเรือน',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'EXTERIOR_PHOTO',
        'title': '6. ภาพถ่ายบริเวณภายนอกอาคาร',
        'description': 'Upload 1 supported file: PDF or Image.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'PROD_PLAN',
        'title': '7. แผนการผลิตกัญชาแต่ละรอบ/ปี',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'SECURITY_PLAN',
        'title': '8. มาตรการรักษาความปลอดภัย',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'INTERIOR_PHOTO',
        'title': '9. ภาพถ่ายภายในสถานที่ผลิต',
        'description': 'Upload 1 supported file: PDF or Image.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'SOP',
        'title': '10. คู่มือมาตรฐานการปฏิบัติงาน (SOP)',
        'description': 'ฉบับภาษาไทยเท่านั้น. Upload 1 supported file: PDF.',
        'maxSize': '1 GB',
        'required': true,
        'isLink': false
      },
    ];

    final individualDocs = [
      {
        'id': 'TRAINING_CERT',
        'title': '11. หนังสือรับรองการฝึกอบรม (E-learning)',
        'description': 'Upload 1 supported file.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'STRAIN_CERT',
        'title': '12. หนังสือรับรองสายพันธ์ุ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'INTERNAL_TRAINING',
        'title': '13. เอกสารการอบรมพนักงานภายใน',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'STAFF_TEST',
        'title': '14. แบบทดสอบพนักงานและผลการทดสอบ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'SUBSTRATE_TEST',
        'title': '15. ผลตรวจวัสดุปลูก',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'WATER_TEST',
        'title': '16. ผลตรวจน้ำ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '10 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'FLOWER_TEST',
        'title': '17. ผลตรวจช่อดอก',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'INPUTS_REPORT',
        'title': '18. รายงานปัจจัยการผลิตและสารชีวภัณฑ์',
        'description': 'Upload 1 supported file.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'CP_CCP',
        'title': '19. ตารางแผนควบคุมการผลิต CP/CCP',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'CALIBRATION',
        'title': '20. ใบสอบเทียบเครื่องมือ (ตราชั่ง)',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'VIDEO_LINK',
        'title': '21. วิดีโอแสดงสถานที่การปฏิบัติงาน',
        'description': 'กรุณาแนบลิงค์วิดีโอ',
        'maxSize': 'Link',
        'required': true,
        'isLink': true
      },
      {
        'id': 'ADDITIONAL_DOCS',
        'title': '22. เอกสารเพิ่มเติม',
        'description': 'Upload up to 5 supported files: PDF or image.',
        'maxSize': '1 GB',
        'required': false,
        'isLink': false
      },
    ];

    final communityDocs = [
      {
        'id': 'REG_SMCE',
        'title': '11. สำเนาหนังสือสำคัญแสดงการจดทะเบียนวิสาหกิจ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'AUTH_DOC_01',
        'title': '12. หนังสือผู้ได้รับมอบหมาย (สวช.01)',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'OPERATION_DOC_03',
        'title': '13. เอกสารการดําเนินกิจการ (ท.ว.ช.3)',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'TRAINING_CERT',
        'title': '14. หนังสือรับรองการฝึกอบรม (E-learning)',
        'description': 'Upload 1 supported file: PDF or image.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'STRAIN_CERT',
        'title': '15. หนังสือรับรองสายพันธ์ุ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '10 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'INTERNAL_TRAINING',
        'title': '16. เอกสารการอบรมพนักงานภายใน',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'STAFF_TEST',
        'title': '17. แบบทดสอบพนักงานและผลการทดสอบ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'SUBSTRATE_TEST',
        'title': '18. ผลตรวจวัสดุปลูก',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'WATER_TEST',
        'title': '19. ผลตรวจน้ำ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'FLOWER_TEST',
        'title': '20. ผลตรวจช่อดอก',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'INPUTS_REPORT',
        'title': '21. รายงานปัจจัยการผลิตและสารชีวภัณฑ์',
        'description': 'Upload 1 supported file: PDF or image.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'CP_CCP',
        'title': '22. ตารางแผนควบคุมการผลิต CP/CCP',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'CALIBRATION',
        'title': '23. ใบสอบเทียบเครื่องมือ (ตราชั่ง)',
        'description': 'Upload 1 supported file: PDF or image.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'VIDEO_LINK',
        'title': '24. วิดีโอแสดงสถานที่การปฏิบัติงาน',
        'description': 'กรุณาแนบลิงค์วิดีโอ',
        'maxSize': 'Link',
        'required': true,
        'isLink': true
      },
      {
        'id': 'ADDITIONAL_DOCS',
        'title': '25. เอกสารเพิ่มเติม',
        'description': 'Upload up to 5 supported files.',
        'maxSize': '100 MB',
        'required': false,
        'isLink': false
      },
    ];

    final juristicDocs = [
      {
        'id': 'JURISTIC_CERT',
        'title': '11. สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'SHAREHOLDER_LIST',
        'title': '12. บัญชีรายชื่อกรรมการผู้จัดการ/หุ้นส่วน',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'AUTH_REP',
        'title': '13. หนังสือแสดงว่าผู้ขอใบรับรองเป็นผู้แทน',
        'description': 'Upload 1 supported file.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'TRAINING_CERT',
        'title': '14. หนังสือรับรองการฝึกอบรม (E-learning)',
        'description': 'Upload 1 supported file: PDF or image.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'STRAIN_CERT',
        'title': '15. หนังสือรับรองสายพันธ์ุ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'INTERNAL_TRAINING',
        'title': '16. เอกสารการอบรมพนักงานภายใน',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'STAFF_TEST',
        'title': '17. แบบทดสอบพนักงานและผลการทดสอบ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'SUBSTRATE_TEST',
        'title': '18. ผลตรวจวัสดุปลูก',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'WATER_TEST',
        'title': '19. ผลตรวจน้ำ',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'FLOWER_TEST',
        'title': '20. ผลตรวจช่อดอก',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'INPUTS_REPORT',
        'title': '21. รายงานปัจจัยการผลิตและสารชีวภัณฑ์',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'CP_CCP',
        'title': '22. ตารางแผนควบคุมการผลิต CP/CCP',
        'description': 'Upload 1 supported file: PDF.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'CALIBRATION',
        'title': '23. ใบสอบเทียบเครื่องมือ (ตราชั่ง)',
        'description': 'Upload 1 supported file.',
        'maxSize': '100 MB',
        'required': true,
        'isLink': false
      },
      {
        'id': 'VIDEO_LINK',
        'title': '24. วิดีโอแสดงสถานที่ปฏิบัติงาน',
        'description': 'กรุณาแนบลิงค์วิดีโอ',
        'maxSize': 'Link',
        'required': true,
        'isLink': true
      },
      {
        'id': 'ADDITIONAL_DOCS',
        'title': '25. เอกสารเพิ่มเติม',
        'description': 'Upload up to 5 supported files.',
        'maxSize': '100 MB',
        'required': false,
        'isLink': false
      },
    ];

    List<Map<String, dynamic>> specialDocs = [];
    if (_replacementReason == 'LOST') {
      specialDocs.add({
        'id': 'POLICE_REPORT',
        'title': 'ใบแจ้งความ (Police Report)',
        'description': 'กรณีใบรับรองสูญหาย. Upload 1 supported file.',
        'maxSize': '10 MB',
        'required': true,
        'isLink': false
      });
    } else if (_replacementReason == 'DAMAGED') {
      specialDocs.add({
        'id': 'ORIGINAL_CERT_PHYSICAL',
        'title': 'ใบรับรองฉบับเดิม (Original Certificate)',
        'description': 'กรณีชำรุด. Upload 1 supported file.',
        'maxSize': '10 MB',
        'required': true,
        'isLink': false
      });
    }

    if (_applicantType == 'COMMUNITY') {
      return [...specialDocs, ...commonDocs, ...communityDocs];
    } else if (_applicantType == 'JURISTIC') {
      return [...specialDocs, ...commonDocs, ...juristicDocs];
    } else {
      // Individual
      return [...specialDocs, ...commonDocs, ...individualDocs];
    }
  }

  // Renewal helper remains...
  List<Map<String, dynamic>> _getRenewalDocumentList() {
    // 1-10 are common for all
    final commonDocs = [
      {
        'id': 'REQ_FORM',
        'title': '1. แบบลงทะเบียนยื่นคำขอ',
        'description':
            'ดาวน์โหลดแบบฟอร์มและแนบกลับ (Upload PDF). ตัวอย่างวิดีโอ (แนบลิงค์)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF'],
        'hasDownload': true,
        'hasVideo': true,
        'videoLink': 'https://youtu.be/example'
      },
      {
        'id': 'LAND_TITLE',
        'title': '2. สำเนาหนังสือแสดงกรรมสิทธิ์ในที่ดิน/สิทธิครอบครอง',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'LAND_CONSENT',
        'title': '3. หนังสือให้ความยินยอม (กรณีเช่า/ใช้ที่ดินผู้อื่น)',
        'required': false, // Contextual
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'MAP_GPS',
        'title': '4. แผนที่แสดงที่ตั้งและพิกัด (Map & Coordinates)',
        'description':
            'เส้นทางเข้าถึง, พิกัดแปลง, ขนาดแปลง, สิ่งปลูกสร้างใกล้เคียง',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
      {
        'id': 'BUILDING_PLAN',
        'title': '5. แบบแปลนอาคารหรือโรงเรือน',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'EXTERIOR_PHOTO',
        'title': '6. ภาพถ่ายบริเวณภายนอกอาคาร/โรงเรือน',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
      {
        'id': 'PROD_PLAN_DOC',
        'title': '7. แผนการผลิตกัญชาแต่ละรอบ/ปี และแผนการใช้ประโยชน์',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'SECURITY_PLAN_DOC',
        'title': '8. มาตรการรักษาความปลอดภัย และการจัดการส่วนที่เหลือ',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'INTERIOR_PHOTO',
        'title': '9. ภาพถ่ายภายในสถานที่ผลิตและเก็บเกี่ยว',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
      {
        'id': 'SOP_FULL',
        'title': '10. คู่มือมาตรฐานการปฏิบัติงาน (SOP) ฉบับภาษาไทย',
        'description':
            'ระบุละเอียดทุกขั้นตอน (เพาะ, เก็บเกี่ยว, ตาก, ทริม, บ่ม, บรรจุ, ขนย้าย, กำจัดของเสีย, อบรม, เอกสารแนบ, บันทึกผล). Upload PDF.',
        'required': true,
        'maxSize': '1 GB',
        'types': ['PDF']
      },
    ];

    // Individual Specific
    final individualDocs = [
      {
        'id': 'TRAINING_CERT',
        'title': '11. หนังสือรับรองการฝึกอบรม (E-learning GACP)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
      {
        'id': 'STRAIN_CERT',
        'title': '12. หนังสือรับรองสายพันธุ์',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'INTERNAL_TRAINING',
        'title': '13. เอกสารการอบรมพนักงานภายใน',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'STAFF_TEST',
        'title': '14. แบบทดสอบพนักงานและผลการทดสอบ (ก่อน/หลัง)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'SUBSTRATE_TEST',
        'title': '15. ผลตรวจวัสดุปลูก',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'WATER_TEST',
        'title': '16. ผลตรวจน้ำ',
        'required': true,
        'maxSize': '10 MB',
        'types': ['PDF']
      },
      {
        'id': 'FLOWER_TEST',
        'title': '17. ผลตรวจช่อดอก',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'INPUTS_REPORT',
        'title': '18. รายงานปัจจัยการผลิตและสารชีวภัณฑ์',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
      {
        'id': 'CP_CCP',
        'title': '19. ตารางแผนควบคุมการผลิต CP/CCP',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'CALIBRATION',
        'title': '20. ใบสอบเทียบเครื่องมือ (ตราชั่ง)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'VIDEO_LINK',
        'title': '21. วิดีโอแสดงสถานที่การปฏิบัติงาน (แนบลิงค์)',
        'required': true,
        'maxSize': 'Link',
        'isLink': true
      },
      {
        'id': 'ADDITIONAL_DOCS',
        'title': '22. เอกสารเพิ่มเติม (Additional)',
        'required': false,
        'maxSize': '1 GB',
        'types': ['PDF', 'Image']
      },
    ];

    // Community Specific
    final communityDocs = [
      {
        'id': 'COMMUNITY_REG',
        'title': '11. สำเนาหนังสือจดทะเบียนวิสาหกิจชุมชน',
        'description': 'แสดงวัตถุประสงค์สอดคล้องและบัญชีรายชื่อสมาชิก',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'AUTH_REP_01',
        'title': '12. หนังสือผู้ได้รับมอบหมาย (สวช.01)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'OPERATION_03',
        'title': '13. เอกสารแสดงการดำเนินกิจการ (ท.ว.ช.3)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'TRAINING_CERT',
        'title': '14. หนังสือรับรองการฝึกอบรม (E-learning GACP)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
      {
        'id': 'STRAIN_CERT',
        'title': '15. หนังสือรับรองสายพันธุ์',
        'required': true,
        'maxSize': '10 MB',
        'types': ['PDF']
      },
      {
        'id': 'INTERNAL_TRAINING',
        'title': '16. เอกสารการอบรมพนักงานภายใน',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'STAFF_TEST',
        'title': '17. แบบทดสอบพนักงานและผลการทดสอบ (ก่อน/หลัง)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'SUBSTRATE_TEST',
        'title': '18. ผลตรวจวัสดุปลูก',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'WATER_TEST',
        'title': '19. ผลตรวจน้ำ',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'FLOWER_TEST',
        'title': '20. ผลตรวจช่อดอก',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'INPUTS_REPORT',
        'title': '21. รายงานปัจจัยการผลิตและสารชีวภัณฑ์',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
      {
        'id': 'CP_CCP',
        'title': '22. ตารางแผนควบคุมการผลิต CP/CCP',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'CALIBRATION',
        'title': '23. ใบสอบเทียบเครื่องมือ (ตราชั่ง)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
      {
        'id': 'VIDEO_LINK',
        'title': '24. วิดีโอแสดงสถานที่การปฏิบัติงาน (แนบลิงค์)',
        'required': true,
        'maxSize': 'Link',
        'isLink': true
      },
      {
        'id': 'ADDITIONAL_DOCS',
        'title': '25. เอกสารเพิ่มเติม (Additional)',
        'required': false,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
    ];

    // Juristic Specific
    final juristicDocs = [
      {
        'id': 'JURISTIC_CERT',
        'title': '11. สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'SHAREHOLDER_LIST',
        'title': '12. บัญชีรายชื่อกรรมการผู้จัดการ/หุ้นส่วน',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'AUTH_REP_LETTER',
        'title': '13. หนังสือแสดงผู้มีอำนาจทำการแทนนิติบุคคล',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'TRAINING_CERT',
        'title': '14. หนังสือรับรองการฝึกอบรม (E-learning GACP)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
      {
        'id': 'STRAIN_CERT',
        'title': '15. หนังสือรับรองสายพันธุ์',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'INTERNAL_TRAINING',
        'title': '16. เอกสารการอบรมพนักงานภายใน',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'STAFF_TEST',
        'title': '17. แบบทดสอบพนักงานและผลการทดสอบ (ก่อน/หลัง)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'SUBSTRATE_TEST',
        'title': '18. ผลตรวจวัสดุปลูก',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'WATER_TEST',
        'title': '19. ผลตรวจน้ำ',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'FLOWER_TEST',
        'title': '20. ผลตรวจช่อดอก',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'INPUTS_REPORT',
        'title': '21. รายงานปัจจัยการผลิตและสารชีวภัณฑ์',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'CP_CCP',
        'title': '22. ตารางแผนควบคุมการผลิต CP/CCP',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'CALIBRATION',
        'title': '23. ใบสอบเทียบเครื่องมือ (ตราชั่ง)',
        'required': true,
        'maxSize': '100 MB',
        'types': ['PDF']
      },
      {
        'id': 'VIDEO_LINK',
        'title': '24. วิดีโอแสดงสถานที่การปฏิบัติงาน (แนบลิงค์)',
        'required': true,
        'maxSize': 'Link',
        'isLink': true
      },
      {
        'id': 'ADDITIONAL_DOCS',
        'title': '25. เอกสารเพิ่มเติม (Additional)',
        'required': false,
        'maxSize': '100 MB',
        'types': ['PDF', 'Image']
      },
    ];

    // Prepend 'OLD_CERT' if needed or keep it in the list.
    // The user request puts 'Original Certificate' at the top of the renewal form fields, not necessarily doc list.
    // But logically it's a doc. Let's add it as item 0 or handle in form.
    // User request: "ต้นฉบับใบรับรองเก่า" is listed in the top section with upload constraint.
    // Let's ensure it's in the list if not in the form body.

    // Combining..
    List<Map<String, dynamic>> selectedList;
    if (_applicantType == 'COMMUNITY') {
      selectedList = [...commonDocs, ...communityDocs];
    } else if (_applicantType == 'JURISTIC') {
      selectedList = [...commonDocs, ...juristicDocs];
    } else {
      selectedList = [...commonDocs, ...individualDocs];
    }

    // Add the specific "Original Certificate" which was requested at the very top
    // The user prompt lists it separately before the numbered list.
    // So we add it to the start.
    return [
      {
        'id': 'ORIGINAL_OLD_CERT',
        'title': '0. ต้นฉบับใบรับรองเก่า (Original Old Certificate)',
        'required': true,
        'maxSize': '10 MB',
        'types': ['PDF', 'Image']
      },
      ...selectedList
    ];
  }

  // ... existing controllers

  Future<void> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content:
                Text('Location services are disabled. Please enable them.')));
      }
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Location permissions are denied')));
        }
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text(
                'Location permissions are permanently denied, we cannot request permissions.')));
      }
      return;
    }

    final Position position = await Geolocator.getCurrentPosition();
    setState(() {
      _gpsController.text = '${position.latitude}, ${position.longitude}';
    });
  }

  Future<void> _pickLocationOnMap() async {
    // Parse current text if available to center map
    LatLng? initialCenter;
    if (_gpsController.text.isNotEmpty) {
      try {
        final parts = _gpsController.text.split(',');
        if (parts.length == 2) {
          initialCenter = LatLng(
            double.parse(parts[0].trim()),
            double.parse(parts[1].trim()),
          );
        }
      } catch (e) {
        // ignore parse error
      }
    }

    final LatLng? result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => MapPickerScreen(initialCenter: initialCenter),
      ),
    );

    if (result != null) {
      setState(() {
        _gpsController.text =
            '${result.latitude.toStringAsFixed(6)}, ${result.longitude.toStringAsFixed(6)}';
      });
    }
  }

  Future<void> _openGoogleMaps() async {
    if (_gpsController.text.isEmpty) return;
    final Uri url = Uri.parse(
        'https://www.google.com/maps/search/?api=1&query=${_gpsController.text}');
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not launch Google Maps')));
      }
    }
  }

  Widget _buildMultiSelect(String title, Map<String, String> options,
      Set<String> selectedValues, Function(Set<String>) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(4)),
          child: Column(
            children: options.entries.map((entry) {
              final isSelected = selectedValues.contains(entry.key);
              return CheckboxListTile(
                title: Text(entry.value),
                value: isSelected,
                onChanged: (bool? value) {
                  final newSet = Set<String>.from(selectedValues);
                  if (value == true) {
                    newSet.add(entry.key);
                  } else {
                    newSet.remove(entry.key);
                  }
                  onChanged(newSet);
                },
                controlAffinity: ListTileControlAffinity.leading,
                dense: true,
              );
            }).toList(),
          ),
        ),
      ],
    );
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

                  // Replacement Section (Conditional)
                  if (widget.requestType == 'SUBSTITUTE' ||
                      widget.requestType == 'REPLACEMENT') ...[
                    ExpansionTile(
                      initiallyExpanded: true,
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text(
                          '0. ข้อมูลการขอใบแทน (Replacement Info)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _replacementReason,
                          decoration: const InputDecoration(
                            labelText: 'เหตุผลในการขอใบแทน (Reason)',
                            border: OutlineInputBorder(),
                          ),
                          items: const [
                            DropdownMenuItem(
                                value: 'LOST', child: Text('สูญหาย (Lost)')),
                            DropdownMenuItem(
                                value: 'DAMAGED',
                                child:
                                    Text('ชำรุด/ลบเลือน (Damaged/Illegible)')),
                            DropdownMenuItem(
                                value: 'OTHER', child: Text('อื่นๆ (Other)')),
                          ],
                          onChanged: (v) {
                            setState(() {
                              _replacementReason = v!;
                            });
                          },
                        ),
                        const SizedBox(height: 12),
                        if (_replacementReason == 'OTHER')
                          TextFormField(
                            controller: _replacementReasonOtherController,
                            decoration: const InputDecoration(
                              labelText: 'ระบุเหตุผล (Other Reason)',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        if (_replacementReason == 'OTHER')
                          const SizedBox(height: 12),
                        TextFormField(
                          controller: _oldCertificateController,
                          decoration: const InputDecoration(
                            labelText:
                                'เลขที่ใบรับรองเดิม (Original Certificate No.)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (_replacementReason == 'LOST')
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.amber.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.amber),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.info, color: Colors.amber),
                                SizedBox(width: 12),
                                Expanded(
                                    child: Text(
                                        'กรุณาแนบใบแจ้งความในขั้นตอนถัดไป (Please attach Police Report in next step)')),
                              ],
                            ),
                          ),
                        if (_replacementReason == 'DAMAGED')
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.blue.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.blue),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.info, color: Colors.blue),
                                SizedBox(width: 12),
                                Expanded(
                                    child: Text(
                                        'กรุณาส่งคืนใบรับรองเดิม (Please return the original certificate)')),
                              ],
                            ),
                          ),
                        const SizedBox(height: 16),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Amendment Section (Conditional)
                  if (widget.requestType == 'AMENDMENT') ...[
                    ExpansionTile(
                      initiallyExpanded: true,
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text('0. ข้อมูลการขอแก้ไข (Amendment Info)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _oldCertificateController,
                          decoration: const InputDecoration(
                            labelText:
                                'เลขที่ใบรับรองเดิม (Original Certificate No.)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          decoration: const InputDecoration(
                            labelText:
                                'รายการที่ต้องการแก้ไข (Item to Correct)',
                            hintText: 'e.g. เปลี่ยนชื่อผู้ดำเนินกิจการ',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          maxLines: 2,
                          decoration: const InputDecoration(
                            labelText: 'รายละเอียดการแก้ไข (Detail)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Divider(),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ],

                  // Section 1: Establishment (Auto-fill)
                  // Hide for Replacement, Amendment might need it but usually focused on manual edit
                  // For now, hide auto-fill for Amendment too to keep it focused
                  if (!_isReplacement && !_isAmendment) ...[
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
                  ],

                  // Section 2: Production Info (ข้อมูลการผลิตและการรับรอง)
                  if (!_isReplacement && !_isAmendment)
                    ExpansionTile(
                      initiallyExpanded: true,
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text(
                          '1. ข้อมูลการผลิตและการรับรอง (Production Info)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        _buildMultiSelect(
                          'ประเภทการรับรอง (Certification Type)',
                          {
                            'CULTIVATION': 'การเพาะปลูก (Cultivation)',
                            'PROCESSING': 'การแปรรูป (Processing)',
                          },
                          _certificationTypes,
                          (newSet) =>
                              setState(() => _certificationTypes = newSet),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _plantPartsController,
                          decoration: const InputDecoration(
                              labelText: 'ส่วนที่ใช้ (Parts Used)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _plantStrainController,
                          decoration: const InputDecoration(
                              labelText: 'ชื่อสายพันธุ์ (Strain Name)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _strainSourceController,
                          decoration: const InputDecoration(
                              labelText: 'แหล่งที่มาของสายพันธุ์ (Source)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                                child: TextFormField(
                                    controller: _expectedQtyController,
                                    decoration: const InputDecoration(
                                        labelText: 'ปริมาณ (Quantity)',
                                        border: OutlineInputBorder()))),
                            const SizedBox(width: 12),
                            Expanded(
                                child: TextFormField(
                                    decoration: const InputDecoration(
                                        labelText: 'หน่วย (Unit)',
                                        border: OutlineInputBorder()))),
                          ],
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),

                  // Section 3: Objective & Permit (วัตถุประสงค์ & พื้นที่)
                  if (!_isReplacement && !_isAmendment)
                    ExpansionTile(
                      initiallyExpanded: true,
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text(
                          '2. วัตถุประสงค์และพื้นที่ (Objective & Site)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        _buildMultiSelect(
                          'วัตถุประสงค์ (Objective)',
                          {
                            'RESEARCH': 'วิจัย (Research)',
                            'COMMERCIAL_DOMESTIC':
                                'จำหน่ายในประเทศ (Commercial Domestic)',
                            'COMMERCIAL_EXPORT': 'ส่งออก (Commercial Export)',
                            'OTHER': 'อื่นๆ (Other)',
                          },
                          _objectives,
                          (newSet) => setState(() => _objectives = newSet),
                        ),
                        const SizedBox(height: 12),
                        // Permit File Upload Placeholder
                        if (_objectives.contains('COMMERCIAL_DOMESTIC') ||
                            _objectives.contains('COMMERCIAL_EXPORT'))
                          TextFormField(
                            readOnly: true,
                            decoration: const InputDecoration(
                                labelText:
                                    'แนบใบอนุญาต (Permit File) - Upload Later',
                                prefixIcon: Icon(LucideIcons.file),
                                border: OutlineInputBorder()),
                          ),
                        const SizedBox(height: 12),
                        const Divider(),
                        const SizedBox(height: 12),
                        _buildMultiSelect(
                          'ลักษณะพื้นที่ (Area Type)',
                          {
                            'OUTDOOR': 'กลางแจ้ง (Outdoor)',
                            'INDOOR': 'ในร่ม (Indoor)',
                            'GREENHOUSE': 'โรงเรือน (Greenhouse)',
                            'OTHER': 'อื่นๆ (Other)',
                          },
                          _areaTypes,
                          (newSet) => setState(() => _areaTypes = newSet),
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
                          decoration: InputDecoration(
                            labelText: 'พิกัดแปลงปลูก (GPS Coordinates)',
                            prefixIcon: IconButton(
                              icon: const Icon(LucideIcons.mapPin),
                              onPressed: _openGoogleMaps,
                              tooltip: 'ดูใน Google Maps',
                            ),
                            suffixIcon: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.my_location),
                                  onPressed: _getCurrentLocation,
                                  tooltip: 'ตำแหน่งปัจจุบัน',
                                ),
                                IconButton(
                                  icon: const Icon(Icons.map),
                                  onPressed: _pickLocationOnMap,
                                  tooltip: 'เลือกจากแผนที่',
                                ),
                              ],
                            ),
                            border: const OutlineInputBorder(),
                          ),
                          validator: (v) => v!.isEmpty ? 'ระบุพิกัด' : null,
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),

                  // Section 3: Applicant Info (ข้อมูลผู้ขอใบรับรอง)
                  ExpansionTile(
                    initiallyExpanded: true,
                    childrenPadding: const EdgeInsets.symmetric(horizontal: 16),
                    title: const Text('3. ข้อมูลผู้ขอใบรับรอง (Applicant Info)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _applicantType,
                        decoration: const InputDecoration(
                            labelText: 'ประเภทผู้ขอใบรับรอง (Applicant Type)',
                            border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(
                              value: 'COMMUNITY',
                              child:
                                  Text('วิสาหกิจชุมชน (Community Enterprise)')),
                          DropdownMenuItem(
                              value: 'INDIVIDUAL',
                              child: Text('บุคคลธรรมดา (Individual)')),
                          DropdownMenuItem(
                              value: 'JURISTIC',
                              child: Text('นิติบุคคล (Juristic)')),
                        ],
                        onChanged: (v) => setState(() => _applicantType = v!),
                      ),
                      const SizedBox(height: 12),

                      // Conditional Fields based on Applicant Type
                      if (_applicantType == 'INDIVIDUAL') ...[
                        TextFormField(
                          controller: _applicantNameController,
                          decoration: const InputDecoration(
                              labelText: 'ชื่อเจ้าของแปลงปลูก (Owner Name)',
                              prefixIcon: Icon(LucideIcons.user),
                              border: OutlineInputBorder()),
                          validator: (v) => v!.isEmpty ? 'ระบุชื่อ' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _idCardController,
                          decoration: const InputDecoration(
                              labelText: 'เลขบัตรประชาชน (ID Card)',
                              prefixIcon: Icon(LucideIcons.contact),
                              border: OutlineInputBorder()),
                          validator: (v) =>
                              v!.length != 13 ? 'ระบุเลขบัตรฯ 13 หลัก' : null,
                          keyboardType: TextInputType.number,
                          maxLength: 13,
                        ),
                        const SizedBox(height: 12),
                      ] else if (_applicantType == 'JURISTIC') ...[
                        TextFormField(
                          controller: _applicantNameController,
                          decoration: const InputDecoration(
                              labelText:
                                  'ชื่อสถานประกอบการ/บริษัท (Company Name)',
                              prefixIcon: Icon(LucideIcons.building),
                              border: OutlineInputBorder()),
                          validator: (v) => v!.isEmpty ? 'ระบุชื่อ' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _authorizedDirectorController,
                          decoration: const InputDecoration(
                              labelText:
                                  'ชื่อประธานกรรมการ/ผู้มีอำนาจลงนาม (Authorized Director)',
                              border: OutlineInputBorder()),
                          validator: (v) =>
                              v!.isEmpty ? 'ระบุชื่อประธาน' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _regNoController, // Reg ID / Tax ID
                          decoration: const InputDecoration(
                              labelText: 'เลขทะเบียนนิติบุคคล/ผู้เสียภาษี',
                              prefixIcon: Icon(LucideIcons.hash),
                              border: OutlineInputBorder()),
                          validator: (v) =>
                              v!.isEmpty ? 'ระบุเลขทะเบียน' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _officePhoneController,
                          decoration: const InputDecoration(
                              labelText:
                                  'โทรศัพท์สถานที่จัดตั้ง (Office Phone)',
                              border: OutlineInputBorder()),
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _directorMobileController,
                          decoration: const InputDecoration(
                              labelText:
                                  'โทรศัพท์มือถือประธานกรรมการ (Director Mobile)',
                              border: OutlineInputBorder()),
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 12),
                        const Divider(),
                        const Text('ผู้ประสานงาน (Coordinator)',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _coordinatorNameController,
                          decoration: const InputDecoration(
                              labelText: 'ชื่อผู้ประสานงาน',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _coordinatorPhoneController,
                          decoration: const InputDecoration(
                              labelText: 'โทรศัพท์มือถือผู้ประสานงาน',
                              border: OutlineInputBorder()),
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _coordinatorLineController,
                          decoration: const InputDecoration(
                              labelText: 'Line ID ผู้ประสานงาน',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                      ] else if (_applicantType == 'COMMUNITY') ...[
                        TextFormField(
                          controller: _applicantNameController,
                          decoration: const InputDecoration(
                              labelText: 'ชื่อวิสาหกิจชุมชน (Community Name)',
                              prefixIcon: Icon(LucideIcons.users),
                              border: OutlineInputBorder()),
                          validator: (v) => v!.isEmpty ? 'ระบุชื่อ' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _authorizedDirectorController,
                          decoration: const InputDecoration(
                              labelText: 'ชื่อประธาน (President Name)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller:
                              _idCardController, // Reuse for President ID
                          decoration: const InputDecoration(
                              labelText: 'เลขที่บัตรประจำตัวประชาชน (ID Card)',
                              border: OutlineInputBorder()),
                          maxLength: 13,
                          keyboardType: TextInputType.number,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _communityReg01Controller,
                          decoration: const InputDecoration(
                              labelText: 'รหัสทะเบียน สวช.01',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _communityReg03Controller,
                          decoration: const InputDecoration(
                              labelText: 'รหัสทะเบียน ท.ว.ช.3',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _houseIdController,
                          decoration: const InputDecoration(
                              labelText: 'เลขรหัสประจำบ้าน',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                      ],

                      // Common Address & Contact (Placed here as per flow)
                      TextFormField(
                        controller: _officeAddressController,
                        decoration: const InputDecoration(
                            labelText: 'ที่อยู่ (Address)',
                            prefixIcon: Icon(LucideIcons.home),
                            border: OutlineInputBorder()),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _mobileController,
                        decoration: const InputDecoration(
                            labelText: 'โทรศัพท์มือถือ (Mobile)',
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

                      // RENEWAL SPECIFIC FIELDS
                      if (widget.requestType == 'RENEW')
                        Column(
                          children: [
                            const Divider(),
                            const Text('สำหรับการต่ออายุ (Renewal Only)',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _oldCertificateController,
                              decoration: const InputDecoration(
                                labelText: 'ใบรับรองเลขที่ (Certificate No.)',
                                border: OutlineInputBorder(),
                              ),
                              validator: (v) =>
                                  v!.isEmpty ? 'กรุณาระบุเลขใบรับรอง' : null,
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _yearController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'ประจำปี พ.ศ. (Year)',
                                border: OutlineInputBorder(),
                              ),
                              validator: (v) =>
                                  v!.isEmpty ? 'กรุณาระบุปี' : null,
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _plantingPlanController,
                              maxLines: 4,
                              decoration: const InputDecoration(
                                labelText:
                                    'แผนการปลูกและการเก็บเกี่ยว/แปรรูป\n(Planting/Harvesting Plan)',
                                hintText:
                                    'ระบุรายละเอียดสังเขป:\n1. สายพันธุ์ที่ปลูก (Variety)\n2. จำนวนต้น และระยะเวลาเพาะปลูก (Qty & Schedule)\n3. ผลผลิตที่คาดการณ์ (Expected Yield)',
                                border: OutlineInputBorder(),
                                alignLabelWithHint: true,
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _utilizationPlanController,
                              maxLines: 4,
                              decoration: const InputDecoration(
                                labelText:
                                    'แผนการใช้ประโยชน์ (Utilization Plan)',
                                hintText:
                                    'ระบุรายละเอียดสังเขป:\n1. รูปแบบผลิตภัณฑ์ (Product Form)\n2. กลุ่มเป้าหมาย (Target Market)\n3. การนำไปใช้ (Medical/Research)',
                                border: OutlineInputBorder(),
                                alignLabelWithHint: true,
                              ),
                            ),
                            const SizedBox(height: 12),
                          ],
                        ),
                    ],
                  ),

                  // Section 4: Security (ความปลอดภัย)
                  if (!_isReplacement && !_isAmendment)
                    ExpansionTile(
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text('4. ระบบความปลอดภัย (Security)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _securityFencingController,
                          decoration: const InputDecoration(
                              labelText: 'รายละเอียดรั้วกั้น (Fencing)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _securityCCTVController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                              labelText: 'จำนวนกล้อง CCTV',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),

                  // Section 5: Harvesting
                  if (!_isReplacement && !_isAmendment)
                    ExpansionTile(
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text('5. การเก็บเกี่ยว (Harvesting)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
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
                  if (!_isReplacement && !_isAmendment)
                    ExpansionTile(
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text(
                          '6. การจัดการหลังเก็บเกี่ยว (Post-Harvest)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
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
                  if (!_isReplacement && !_isAmendment)
                    ExpansionTile(
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text('7. บุคลากร (Personnel)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
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

                  // Section 8: Delivery Method (ช่องทางการรับใบอนุญาต)
                  // Visible for ALL types
                  ExpansionTile(
                    initiallyExpanded: true,
                    childrenPadding: const EdgeInsets.symmetric(horizontal: 16),
                    title: const Text('8. ช่องทางการรับใบอนุญาต (Delivery)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      const SizedBox(height: 16),
                      RadioListTile<String>(
                        title: const Text('รับด้วยตนเอง (Self Pickup)'),
                        subtitle: const Text('ณ ศูนย์บริการ OSSC'),
                        value: 'PICKUP',
                        groupValue: 'MAIL',
                        onChanged: (v) {},
                      ),
                      RadioListTile<String>(
                        title: const Text('จัดส่งทางไปรษณีย์ (By Mail)'),
                        subtitle: const Text(
                            'ตามที่อยู่ที่ระบุไว้ (Registered Address)'),
                        value: 'MAIL',
                        groupValue: 'MAIL',
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
                const Text('กรุณาแนบเอกสารหลักฐานประกอบคำขอ (Documents)'),
                const SizedBox(height: 12),
                ...() {
                  if (widget.requestType == 'SUBSTITUTE' ||
                      widget.requestType == 'REPLACEMENT') {
                    return _getReplacementDocumentList();
                  }
                  // Default to Renewal for now or handle NEW elsewhere if needed
                  // Assuming this block originally was just for Renewal or mixed.
                  // Since the existing code called _getRenewalDocumentList(), we default to that or check for RENEW.
                  // But wait, what if it's NEW? Does NEW use _getRenewalDocumentList?
                  // The existing code at 1525 was `..._getRenewalDocumentList().map((doc) {`.
                  // If requestType is NEW, it might have been showing Renewal docs incorrectly?
                  // No, usually NEW has a different Step 2 or list.
                  // For now, I will preserve existing behavior for non-replacement types.
                  return _getRenewalDocumentList();
                }()
                    .map((doc) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(8),
                      color: Colors.white,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              doc['isLink'] == true
                                  ? LucideIcons.video
                                  : LucideIcons.fileText,
                              color: Colors.blue[700],
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                doc['title'],
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            if (doc['required'] == true)
                              const Text('*',
                                  style: TextStyle(color: Colors.red)),
                          ],
                        ),
                        if (doc['subtitle'] != null)
                          Text(doc['subtitle'],
                              style: TextStyle(
                                  color: Colors.grey[600], fontSize: 12)),
                        if (doc['description'] != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Text(doc['description'],
                                style: TextStyle(
                                    fontStyle: FontStyle.italic,
                                    color: Colors.grey[700],
                                    fontSize: 12)),
                          ),
                        const SizedBox(height: 8),
                        if (doc['isLink'] == true)
                          TextFormField(
                            decoration: const InputDecoration(
                              hintText: 'วางลิงค์วิดีโอ (Paste Video Link)',
                              border: OutlineInputBorder(),
                              isDense: true,
                            ),
                          )
                        else
                          Row(
                            children: [
                              OutlinedButton.icon(
                                onPressed: () {}, // TODO: Implement Upload
                                icon: const Icon(LucideIcons.uploadCloud,
                                    size: 16),
                                label: const Text('New Upload'),
                              ),
                              const Spacer(),
                              Text(
                                'Max: ${doc['maxSize']}',
                                style: const TextStyle(
                                    color: Colors.grey, fontSize: 10),
                              ),
                            ],
                          ),
                        if (doc['hasDownload'] == true)
                          TextButton.icon(
                            onPressed: () {},
                            icon: const Icon(LucideIcons.download, size: 16),
                            label: const Text('ดาวน์โหลดแบบฟอร์ม'),
                            style: TextButton.styleFrom(
                                visualDensity: VisualDensity.compact),
                          )
                      ],
                    ),
                  );
                }).toList(),
                const SizedBox(height: 16),
                // AI Scan Section (Bottom)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                      border: Border.all(color: Colors.blue.withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(8),
                      color: Colors.blue[50]),
                  child: Column(
                    children: [
                      const Text('ระบบตรวจสอบความถูกต้องเบื้องต้น (AI Scan)'),
                      const SizedBox(height: 8),
                      if (_isAnalyzing)
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
                            Expanded(
                                child: Text(_aiResult!,
                                    style:
                                        const TextStyle(color: Colors.green)))
                          ]),
                        )
                      else
                        ElevatedButton.icon(
                            onPressed: _runAIScan,
                            icon: const Icon(LucideIcons.scan),
                            label: const Text('ตรวจสอบเอกสารทั้งหมด'))
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
          certificationType: _certificationTypes.join(','),
          objective: _objectives.join(','),
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
            // RENEWAL DATA
            if (widget.requestType == 'RENEW') ...{
              'oldCertificateId': _oldCertificateController.text,
              'year': _yearController.text,
            },
            // REPLACEMENT DATA
            if (widget.requestType == 'SUBSTITUTE' ||
                widget.requestType == 'REPLACEMENT') ...{
              'oldCertificateId': _oldCertificateController.text,
              'replacementReason': _replacementReason,
              'replacementOtherReason': _replacementReasonOtherController.text,
            },
            // Juristic / Community Specific
            'authorizedDirector': _authorizedDirectorController.text,
            'officePhone': _officePhoneController.text,
            'directorMobile': _directorMobileController.text,
            'coordinator': {
              'name': _coordinatorNameController.text,
              'phone': _coordinatorPhoneController.text,
              'lineId': _coordinatorLineController.text,
            },
            'communityReg01': _communityReg01Controller.text,
            'communityReg03': _communityReg03Controller.text,
            'houseId': _houseIdController.text,

            'entityName': _applicantNameController.text,
          },
          siteInfo: {
            'areaType': _areaTypes.join(','),
            'titleDeedNo': _titleDeedController.text,
            'coordinates': _gpsController.text,
            'address': _officeAddressController
                .text, // Fallback if site address same as office make explicit if needed
          },
          // Flexible/Legacy Data
          formData: {
            'securityFencing': _securityFencingController.text,
            // 'securityCCTV': _securityCCTVController.text, // Commented out likely causing error if not defined
            // New Cultivation Data
            'plantParts': _plantPartsController.text,
            'strainSource': _strainSourceController.text,
            'expectedQty': _expectedQtyController.text,
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
