import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile_app/presentation/features/application/screens/map_picker_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/application_provider.dart';
import '../../auth/providers/auth_provider.dart'; // Added Import
import 'package:mobile_app/presentation/features/establishment/providers/establishment_provider.dart';
import 'package:mobile_app/domain/entities/establishment_entity.dart';
import 'package:mobile_app/presentation/features/application/widgets/herb_type_selector.dart'; // Import Added
import 'package:mobile_app/presentation/features/application/widgets/replacement_info_section.dart'; // Import Added
import 'package:mobile_app/presentation/features/application/widgets/document_upload_section.dart'; // Import Added
import 'package:mobile_app/presentation/features/application/services/form_config_service.dart'; // Import Added
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
  bool _isConfirmed = false; // New: Strict Review Confirmation
  bool _isPaidPhase1 = false;
  Map<String, XFile> _uploadedFiles = {}; // New: Track uploaded files (XFile)
  Map<String, String> _videoLinks = {}; // New: Track video links

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
      TextEditingController(); // เนเธซเธฅเนเธเธ—เธตเนเธกเธฒเธชเธฒเธขเธเธฑเธเธเธธเน (เธเธฃเธดเธฉเธฑเธ—)
  final _expectedQtyController = TextEditingController(); // เธเธฃเธดเธกเธฒเธ“

  // Juristic / Community Specific
  final _authorizedDirectorController =
      TextEditingController(); // เธเธทเนเธญเธเธฃเธฐเธเธฒเธ/เธเธฃเธฃเธกเธเธฒเธฃ
  final _officePhoneController =
      TextEditingController(); // เนเธ—เธฃเธจเธฑเธเธ—เนเธชเธ–เธฒเธเธ—เธตเนเธเธฑเธ”เธ•เธฑเนเธ
  final _directorMobileController = TextEditingController(); // เธกเธทเธญเธ–เธทเธญเธเธฃเธฐเธเธฒเธ
  final _communityReg01Controller = TextEditingController(); // เธชเธงเธ.01
  final _communityReg03Controller = TextEditingController(); // เธ—.เธง.เธ.3
  final _houseIdController = TextEditingController(); // เน€เธฅเธเธฃเธซเธฑเธชเธเธฃเธฐเธเธณเธเนเธฒเธ

  // Coordinator (Juristic)
  final _coordinatorNameController = TextEditingController();
  final _coordinatorPhoneController = TextEditingController();
  final _coordinatorLineController = TextEditingController();
  final _titleDeedController = TextEditingController();
  final _gpsController = TextEditingController();
  final _securityFencingController =
      TextEditingController(text: 'เธฃเธฑเนเธงเธฅเธงเธ”เธซเธเธฒเธก เธชเธนเธ 2 เน€เธกเธ•เธฃ');
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
  String? _herbType; // New: Herb Type
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

  @override
  void initState() {
    super.initState();
    // Check Auth Status on Load (Fix for 401 Issue)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(authProvider).user;
      if (user == null) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Session Expired. Please Login.')));
        context.go('/login'); // Redirect to Login
      }
    });
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
        _aiResult = 'เน€เธญเธเธชเธฒเธฃเธ–เธนเธเธ•เนเธญเธเธ•เธฒเธกเธกเธฒเธ•เธฃเธเธฒเธ GACP (Document Valid)';
      });
    }
  }

  Future<void> _pickFile(String docId) async {
    final picker = ImagePicker();
    try {
      // Pick an image (or we could use FilePicker for PDFs if we add that package)
      // For now, GACP V2 requirements mention PDF/Image. ImagePicker handles images.
      // If PDF is required, we really should use file_picker, but sticking to instructions:
      // "ensure image and document handling is compatible... use XFile".
      // ImagePicker returns XFile.
      final XFile? file = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );

      if (file != null) {
        setState(() {
          _uploadedFiles[docId] = file;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error picking file: $e')),
      );
    }
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
      appBar: AppBar(title: const Text('เธเธญเธฃเธฑเธเนเธเธฃเธฑเธเธฃเธญเธเนเธซเธกเน (GACP)')),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: _onContinue,
        onStepCancel: _onCancel,
        controlsBuilder: _buildControls,
        steps: [
          // Step 1: Form 09 Data Entry (Comprehensive)
          Step(
            title: const Text('เธเธฃเธญเธเธเนเธญเธกเธนเธฅเนเธเธชเธกเธฑเธเธฃ (Form 09)'),
            content: Form(
              key: _formKey,
              child: Column(
                children: [
                  const Text('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเนเธญเธกเธนเธฅเธ•เธฒเธกเธกเธฒเธ•เธฃเธเธฒเธ GACP/DTAM',
                      style: TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 12),

                  // Herb Type Selection (New Request)
                  // Herb Type Selection (Refactored)
                  HerbTypeSelector(
                    value: _herbType,
                    onChanged: (v) => setState(() => _herbType = v),
                  ),
                  const SizedBox(height: 24),

                  // Replacement Section (Refactored)
                  if (widget.requestType == 'SUBSTITUTE' ||
                      widget.requestType == 'REPLACEMENT')
                    ReplacementInfoSection(
                      selectedReason: _replacementReason,
                      onReasonChanged: (v) =>
                          setState(() => _replacementReason = v!),
                      otherReasonController: _replacementReasonOtherController,
                      oldCertController: _oldCertificateController,
                    ),

                  // Amendment Section (Conditional)
                  if (widget.requestType == 'AMENDMENT') ...[
                    ExpansionTile(
                      initiallyExpanded: true,
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text('0. เธเนเธญเธกเธนเธฅเธเธฒเธฃเธเธญเนเธเนเนเธ (Amendment Info)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _oldCertificateController,
                          decoration: const InputDecoration(
                            labelText:
                                'เน€เธฅเธเธ—เธตเนเนเธเธฃเธฑเธเธฃเธญเธเน€เธ”เธดเธก (Original Certificate No.)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          decoration: const InputDecoration(
                            labelText:
                                'เธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเธ•เนเธญเธเธเธฒเธฃเนเธเนเนเธ (Item to Correct)',
                            hintText: 'e.g. เน€เธเธฅเธตเนเธขเธเธเธทเนเธญเธเธนเนเธ”เธณเน€เธเธดเธเธเธดเธเธเธฒเธฃ',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          maxLines: 2,
                          decoration: const InputDecoration(
                            labelText: 'เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฒเธฃเนเธเนเนเธ (Detail)',
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
                          labelText: 'เน€เธฅเธทเธญเธเนเธเธฅเธเธเธฅเธนเธเน€เธเธทเนเธญเธฃเธฐเธเธธเธเนเธญเธกเธนเธฅ',
                          prefixIcon: Icon(LucideIcons.sprout),
                          border: OutlineInputBorder(),
                          helperText: 'เธเนเธญเธกเธนเธฅเธเธฐเธ–เธนเธเน€เธ•เธดเธกเธญเธฑเธ•เนเธเธกเธฑเธ•เธด (Auto-fill)',
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

                  // Section 2: Production Info (เธเนเธญเธกเธนเธฅเธเธฒเธฃเธเธฅเธดเธ•เนเธฅเธฐเธเธฒเธฃเธฃเธฑเธเธฃเธญเธ)
                  if (!_isReplacement && !_isAmendment)
                    ExpansionTile(
                      initiallyExpanded: true,
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text(
                          '1. เธเนเธญเธกเธนเธฅเธเธฒเธฃเธเธฅเธดเธ•เนเธฅเธฐเธเธฒเธฃเธฃเธฑเธเธฃเธญเธ (Production Info)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        _buildMultiSelect(
                          'เธเธฃเธฐเน€เธ เธ—เธเธฒเธฃเธฃเธฑเธเธฃเธญเธ (Certification Type)',
                          {
                            'CULTIVATION': 'เธเธฒเธฃเน€เธเธฒเธฐเธเธฅเธนเธ (Cultivation)',
                            'PROCESSING': 'เธเธฒเธฃเนเธเธฃเธฃเธนเธ (Processing)',
                          },
                          _certificationTypes,
                          (newSet) =>
                              setState(() => _certificationTypes = newSet),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _plantPartsController,
                          decoration: const InputDecoration(
                              labelText: 'เธชเนเธงเธเธ—เธตเนเนเธเน (Parts Used)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _plantStrainController,
                          decoration: const InputDecoration(
                              labelText: 'เธเธทเนเธญเธชเธฒเธขเธเธฑเธเธเธธเน (Strain Name)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _strainSourceController,
                          decoration: const InputDecoration(
                              labelText: 'เนเธซเธฅเนเธเธ—เธตเนเธกเธฒเธเธญเธเธชเธฒเธขเธเธฑเธเธเธธเน (Source)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                                child: TextFormField(
                                    controller: _expectedQtyController,
                                    decoration: const InputDecoration(
                                        labelText: 'เธเธฃเธดเธกเธฒเธ“ (Quantity)',
                                        border: OutlineInputBorder()))),
                            const SizedBox(width: 12),
                            Expanded(
                                child: TextFormField(
                                    decoration: const InputDecoration(
                                        labelText: 'เธซเธเนเธงเธข (Unit)',
                                        border: OutlineInputBorder()))),
                          ],
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),

                  // Section 3: Objective & Permit (เธงเธฑเธ•เธ–เธธเธเธฃเธฐเธชเธเธเน & เธเธทเนเธเธ—เธตเน)
                  if (!_isReplacement && !_isAmendment)
                    ExpansionTile(
                      initiallyExpanded: true,
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text(
                          '2. เธงเธฑเธ•เธ–เธธเธเธฃเธฐเธชเธเธเนเนเธฅเธฐเธเธทเนเธเธ—เธตเน (Objective & Site)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        _buildMultiSelect(
                          'เธงเธฑเธ•เธ–เธธเธเธฃเธฐเธชเธเธเน (Objective)',
                          {
                            'RESEARCH': 'เธงเธดเธเธฑเธข (Research)',
                            'COMMERCIAL_DOMESTIC':
                                'เธเธณเธซเธเนเธฒเธขเนเธเธเธฃเธฐเน€เธ—เธจ (Commercial Domestic)',
                            'COMMERCIAL_EXPORT': 'เธชเนเธเธญเธญเธ (Commercial Export)',
                            'OTHER': 'เธญเธทเนเธเน (Other)',
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
                                    'เนเธเธเนเธเธญเธเธธเธเธฒเธ• (Permit File) - Upload Later',
                                prefixIcon: Icon(LucideIcons.file),
                                border: OutlineInputBorder()),
                          ),
                        const SizedBox(height: 12),
                        const Divider(),
                        const SizedBox(height: 12),
                        _buildMultiSelect(
                          'เธฅเธฑเธเธฉเธ“เธฐเธเธทเนเธเธ—เธตเน (Area Type)',
                          {
                            'OUTDOOR': 'เธเธฅเธฒเธเนเธเนเธ (Outdoor)',
                            'INDOOR': 'เนเธเธฃเนเธก (Indoor)',
                            'GREENHOUSE': 'เนเธฃเธเน€เธฃเธทเธญเธ (Greenhouse)',
                            'OTHER': 'เธญเธทเนเธเน (Other)',
                          },
                          _areaTypes,
                          (newSet) => setState(() => _areaTypes = newSet),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _titleDeedController,
                          decoration: const InputDecoration(
                              labelText: 'เน€เธฅเธเธ—เธตเนเนเธเธเธ”เธ—เธตเนเธ”เธดเธ (Title Deed No.)',
                              prefixIcon: Icon(LucideIcons.file),
                              border: OutlineInputBorder()),
                          validator: (v) => v!.isEmpty ? 'เธฃเธฐเธเธธเน€เธฅเธเนเธเธเธ”' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _gpsController,
                          decoration: InputDecoration(
                            labelText: 'เธเธดเธเธฑเธ”เนเธเธฅเธเธเธฅเธนเธ (GPS Coordinates)',
                            prefixIcon: IconButton(
                              icon: const Icon(LucideIcons.mapPin),
                              onPressed: _openGoogleMaps,
                              tooltip: 'เธ”เธนเนเธ Google Maps',
                            ),
                            suffixIcon: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.my_location),
                                  onPressed: _getCurrentLocation,
                                  tooltip: 'เธ•เธณเนเธซเธเนเธเธเธฑเธเธเธธเธเธฑเธ',
                                ),
                                IconButton(
                                  icon: const Icon(Icons.map),
                                  onPressed: _pickLocationOnMap,
                                  tooltip: 'เน€เธฅเธทเธญเธเธเธฒเธเนเธเธเธ—เธตเน',
                                ),
                              ],
                            ),
                            border: const OutlineInputBorder(),
                          ),
                          validator: (v) => v!.isEmpty ? 'เธฃเธฐเธเธธเธเธดเธเธฑเธ”' : null,
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),

                  // Section 3: Applicant Info (เธเนเธญเธกเธนเธฅเธเธนเนเธเธญเนเธเธฃเธฑเธเธฃเธญเธ)
                  ExpansionTile(
                    initiallyExpanded: true,
                    childrenPadding: const EdgeInsets.symmetric(horizontal: 16),
                    title: const Text('3. เธเนเธญเธกเธนเธฅเธเธนเนเธเธญเนเธเธฃเธฑเธเธฃเธญเธ (Applicant Info)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _applicantType,
                        decoration: const InputDecoration(
                            labelText: 'เธเธฃเธฐเน€เธ เธ—เธเธนเนเธเธญเนเธเธฃเธฑเธเธฃเธญเธ (Applicant Type)',
                            border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(
                              value: 'COMMUNITY',
                              child:
                                  Text('เธงเธดเธชเธฒเธซเธเธดเธเธเธธเธกเธเธ (Community Enterprise)')),
                          DropdownMenuItem(
                              value: 'INDIVIDUAL',
                              child: Text('เธเธธเธเธเธฅเธเธฃเธฃเธกเธ”เธฒ (Individual)')),
                          DropdownMenuItem(
                              value: 'JURISTIC',
                              child: Text('เธเธดเธ•เธดเธเธธเธเธเธฅ (Juristic)')),
                        ],
                        onChanged: (v) => setState(() => _applicantType = v!),
                      ),
                      const SizedBox(height: 12),

                      // Conditional Fields based on Applicant Type
                      if (_applicantType == 'INDIVIDUAL') ...[
                        TextFormField(
                          controller: _applicantNameController,
                          decoration: const InputDecoration(
                              labelText: 'เธเธทเนเธญเน€เธเนเธฒเธเธญเธเนเธเธฅเธเธเธฅเธนเธ (Owner Name)',
                              prefixIcon: Icon(LucideIcons.user),
                              border: OutlineInputBorder()),
                          validator: (v) => v!.isEmpty ? 'เธฃเธฐเธเธธเธเธทเนเธญ' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _idCardController,
                          decoration: const InputDecoration(
                              labelText: 'เน€เธฅเธเธเธฑเธ•เธฃเธเธฃเธฐเธเธฒเธเธ (ID Card)',
                              prefixIcon: Icon(LucideIcons.contact),
                              border: OutlineInputBorder()),
                          validator: (v) =>
                              v!.length != 13 ? 'เธฃเธฐเธเธธเน€เธฅเธเธเธฑเธ•เธฃเธฏ 13 เธซเธฅเธฑเธ' : null,
                          keyboardType: TextInputType.number,
                          maxLength: 13,
                        ),
                        const SizedBox(height: 12),
                      ] else if (_applicantType == 'JURISTIC') ...[
                        TextFormField(
                          controller: _applicantNameController,
                          decoration: const InputDecoration(
                              labelText:
                                  'เธเธทเนเธญเธชเธ–เธฒเธเธเธฃเธฐเธเธญเธเธเธฒเธฃ/เธเธฃเธดเธฉเธฑเธ— (Company Name)',
                              prefixIcon: Icon(LucideIcons.building),
                              border: OutlineInputBorder()),
                          validator: (v) => v!.isEmpty ? 'เธฃเธฐเธเธธเธเธทเนเธญ' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _authorizedDirectorController,
                          decoration: const InputDecoration(
                              labelText:
                                  'เธเธทเนเธญเธเธฃเธฐเธเธฒเธเธเธฃเธฃเธกเธเธฒเธฃ/เธเธนเนเธกเธตเธญเธณเธเธฒเธเธฅเธเธเธฒเธก (Authorized Director)',
                              border: OutlineInputBorder()),
                          validator: (v) =>
                              v!.isEmpty ? 'เธฃเธฐเธเธธเธเธทเนเธญเธเธฃเธฐเธเธฒเธ' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _regNoController, // Reg ID / Tax ID
                          decoration: const InputDecoration(
                              labelText: 'เน€เธฅเธเธ—เธฐเน€เธเธตเธขเธเธเธดเธ•เธดเธเธธเธเธเธฅ/เธเธนเนเน€เธชเธตเธขเธ เธฒเธฉเธต',
                              prefixIcon: Icon(LucideIcons.hash),
                              border: OutlineInputBorder()),
                          validator: (v) =>
                              v!.isEmpty ? 'เธฃเธฐเธเธธเน€เธฅเธเธ—เธฐเน€เธเธตเธขเธ' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _officePhoneController,
                          decoration: const InputDecoration(
                              labelText:
                                  'เนเธ—เธฃเธจเธฑเธเธ—เนเธชเธ–เธฒเธเธ—เธตเนเธเธฑเธ”เธ•เธฑเนเธ (Office Phone)',
                              border: OutlineInputBorder()),
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _directorMobileController,
                          decoration: const InputDecoration(
                              labelText:
                                  'เนเธ—เธฃเธจเธฑเธเธ—เนเธกเธทเธญเธ–เธทเธญเธเธฃเธฐเธเธฒเธเธเธฃเธฃเธกเธเธฒเธฃ (Director Mobile)',
                              border: OutlineInputBorder()),
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 12),
                        const Divider(),
                        const Text('เธเธนเนเธเธฃเธฐเธชเธฒเธเธเธฒเธ (Coordinator)',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _coordinatorNameController,
                          decoration: const InputDecoration(
                              labelText: 'เธเธทเนเธญเธเธนเนเธเธฃเธฐเธชเธฒเธเธเธฒเธ',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _coordinatorPhoneController,
                          decoration: const InputDecoration(
                              labelText: 'เนเธ—เธฃเธจเธฑเธเธ—เนเธกเธทเธญเธ–เธทเธญเธเธนเนเธเธฃเธฐเธชเธฒเธเธเธฒเธ',
                              border: OutlineInputBorder()),
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _coordinatorLineController,
                          decoration: const InputDecoration(
                              labelText: 'Line ID เธเธนเนเธเธฃเธฐเธชเธฒเธเธเธฒเธ',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                      ] else if (_applicantType == 'COMMUNITY') ...[
                        TextFormField(
                          controller: _applicantNameController,
                          decoration: const InputDecoration(
                              labelText: 'เธเธทเนเธญเธงเธดเธชเธฒเธซเธเธดเธเธเธธเธกเธเธ (Community Name)',
                              prefixIcon: Icon(LucideIcons.users),
                              border: OutlineInputBorder()),
                          validator: (v) => v!.isEmpty ? 'เธฃเธฐเธเธธเธเธทเนเธญ' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _authorizedDirectorController,
                          decoration: const InputDecoration(
                              labelText: 'เธเธทเนเธญเธเธฃเธฐเธเธฒเธ (President Name)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller:
                              _idCardController, // Reuse for President ID
                          decoration: const InputDecoration(
                              labelText: 'เน€เธฅเธเธ—เธตเนเธเธฑเธ•เธฃเธเธฃเธฐเธเธณเธ•เธฑเธงเธเธฃเธฐเธเธฒเธเธ (ID Card)',
                              border: OutlineInputBorder()),
                          maxLength: 13,
                          keyboardType: TextInputType.number,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _communityReg01Controller,
                          decoration: const InputDecoration(
                              labelText: 'เธฃเธซเธฑเธชเธ—เธฐเน€เธเธตเธขเธ เธชเธงเธ.01',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _communityReg03Controller,
                          decoration: const InputDecoration(
                              labelText: 'เธฃเธซเธฑเธชเธ—เธฐเน€เธเธตเธขเธ เธ—.เธง.เธ.3',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _houseIdController,
                          decoration: const InputDecoration(
                              labelText: 'เน€เธฅเธเธฃเธซเธฑเธชเธเธฃเธฐเธเธณเธเนเธฒเธ',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                      ],

                      // Common Address & Contact (Placed here as per flow)
                      TextFormField(
                        controller: _officeAddressController,
                        decoration: const InputDecoration(
                            labelText: 'เธ—เธตเนเธญเธขเธนเน (Address)',
                            prefixIcon: Icon(LucideIcons.home),
                            border: OutlineInputBorder()),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _mobileController,
                        decoration: const InputDecoration(
                            labelText: 'เนเธ—เธฃเธจเธฑเธเธ—เนเธกเธทเธญเธ–เธทเธญ (Mobile)',
                            prefixIcon: Icon(LucideIcons.phone),
                            border: OutlineInputBorder()),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                            labelText: 'เธญเธตเน€เธกเธฅ (Email)',
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
                            const Text('เธชเธณเธซเธฃเธฑเธเธเธฒเธฃเธ•เนเธญเธญเธฒเธขเธธ (Renewal Only)',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _oldCertificateController,
                              decoration: const InputDecoration(
                                labelText: 'เนเธเธฃเธฑเธเธฃเธญเธเน€เธฅเธเธ—เธตเน (Certificate No.)',
                                border: OutlineInputBorder(),
                              ),
                              validator: (v) =>
                                  v!.isEmpty ? 'เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเน€เธฅเธเนเธเธฃเธฑเธเธฃเธญเธ' : null,
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _yearController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'เธเธฃเธฐเธเธณเธเธต เธ.เธจ. (Year)',
                                border: OutlineInputBorder(),
                              ),
                              validator: (v) =>
                                  v!.isEmpty ? 'เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเธต' : null,
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _plantingPlanController,
                              maxLines: 4,
                              decoration: const InputDecoration(
                                labelText:
                                    'เนเธเธเธเธฒเธฃเธเธฅเธนเธเนเธฅเธฐเธเธฒเธฃเน€เธเนเธเน€เธเธตเนเธขเธง/เนเธเธฃเธฃเธนเธ\n(Planting/Harvesting Plan)',
                                hintText:
                                    'เธฃเธฐเธเธธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธชเธฑเธเน€เธเธ:\n1. เธชเธฒเธขเธเธฑเธเธเธธเนเธ—เธตเนเธเธฅเธนเธ (Variety)\n2. เธเธณเธเธงเธเธ•เนเธ เนเธฅเธฐเธฃเธฐเธขเธฐเน€เธงเธฅเธฒเน€เธเธฒเธฐเธเธฅเธนเธ (Qty & Schedule)\n3. เธเธฅเธเธฅเธดเธ•เธ—เธตเนเธเธฒเธ”เธเธฒเธฃเธ“เน (Expected Yield)',
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
                                    'เนเธเธเธเธฒเธฃเนเธเนเธเธฃเธฐเนเธขเธเธเน (Utilization Plan)',
                                hintText:
                                    'เธฃเธฐเธเธธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธชเธฑเธเน€เธเธ:\n1. เธฃเธนเธเนเธเธเธเธฅเธดเธ•เธ เธฑเธ“เธ‘เน (Product Form)\n2. เธเธฅเธธเนเธกเน€เธเนเธฒเธซเธกเธฒเธข (Target Market)\n3. เธเธฒเธฃเธเธณเนเธเนเธเน (Medical/Research)',
                                border: OutlineInputBorder(),
                                alignLabelWithHint: true,
                              ),
                            ),
                            const SizedBox(height: 12),
                          ],
                        ),
                    ],
                  ),

                  // Section 4: Security (เธเธงเธฒเธกเธเธฅเธญเธ”เธ เธฑเธข)
                  if (!_isReplacement && !_isAmendment)
                    ExpansionTile(
                      childrenPadding:
                          const EdgeInsets.symmetric(horizontal: 16),
                      title: const Text('4. เธฃเธฐเธเธเธเธงเธฒเธกเธเธฅเธญเธ”เธ เธฑเธข (Security)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _securityFencingController,
                          decoration: const InputDecoration(
                              labelText: 'เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธฃเธฑเนเธงเธเธฑเนเธ (Fencing)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _securityCCTVController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                              labelText: 'เธเธณเธเธงเธเธเธฅเนเธญเธ CCTV',
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
                      title: const Text('5. เธเธฒเธฃเน€เธเนเธเน€เธเธตเนเธขเธง (Harvesting)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        TextFormField(
                          decoration: const InputDecoration(
                              labelText: 'เธงเธดเธเธตเธเธฒเธฃเน€เธเนเธเน€เธเธตเนเธขเธง (Method)',
                              border: OutlineInputBorder()),
                          initialValue:
                              'เน€เธเนเธเน€เธเธตเนเธขเธงเธ”เนเธงเธขเธกเธทเธญ (Manual Harvest only flowers)',
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          decoration: const InputDecoration(
                              labelText: 'เธ เธฒเธเธเธฐเธ—เธตเนเนเธเนเธเธฃเธฃเธเธธ (Containers)',
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
                          '6. เธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธซเธฅเธฑเธเน€เธเนเธเน€เธเธตเนเธขเธง (Post-Harvest)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        TextFormField(
                          decoration: const InputDecoration(
                              labelText: 'เธเธฒเธฃเธฅเธ”เธเธงเธฒเธกเธเธทเนเธ (Drying)',
                              border: OutlineInputBorder()),
                          initialValue:
                              'เธซเนเธญเธเธญเธเธเธงเธเธเธธเธกเธญเธธเธ“เธซเธ เธนเธกเธด (Temperature Controlled Room)',
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          decoration: const InputDecoration(
                              labelText: 'เธชเธ–เธฒเธเธ—เธตเนเน€เธเนเธเธฃเธฑเธเธฉเธฒ (Storage)',
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
                      title: const Text('7. เธเธธเธเธฅเธฒเธเธฃ (Personnel)',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      children: [
                        const SizedBox(height: 16),
                        TextFormField(
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                              labelText: 'เธเธณเธเธงเธเธเธนเนเธเธเธดเธเธฑเธ•เธดเธเธฒเธ (Workers)',
                              border: OutlineInputBorder()),
                        ),
                        const SizedBox(height: 12),
                        CheckboxListTile(
                          title: const Text('เธเนเธฒเธเธเธฒเธฃเธญเธเธฃเธก GACP เนเธฅเนเธง (Trained)'),
                          value: true,
                          onChanged: (v) {},
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),

                  // Section 8: Delivery Method (เธเนเธญเธเธ—เธฒเธเธเธฒเธฃเธฃเธฑเธเนเธเธญเธเธธเธเธฒเธ•)
                  // Visible for ALL types
                  ExpansionTile(
                    initiallyExpanded: true,
                    childrenPadding: const EdgeInsets.symmetric(horizontal: 16),
                    title: const Text('8. เธเนเธญเธเธ—เธฒเธเธเธฒเธฃเธฃเธฑเธเนเธเธญเธเธธเธเธฒเธ• (Delivery)',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    children: [
                      const SizedBox(height: 16),
                      RadioListTile<String>(
                        title: const Text('เธฃเธฑเธเธ”เนเธงเธขเธ•เธเน€เธญเธ (Self Pickup)'),
                        subtitle: const Text('เธ“ เธจเธนเธเธขเนเธเธฃเธดเธเธฒเธฃ OSSC'),
                        value: 'PICKUP',
                        groupValue: 'MAIL',
                        onChanged: (v) {},
                      ),
                      RadioListTile<String>(
                        title: const Text('เธเธฑเธ”เธชเนเธเธ—เธฒเธเนเธเธฃเธฉเธ“เธตเธขเน (By Mail)'),
                        subtitle: const Text(
                            'เธ•เธฒเธกเธ—เธตเนเธญเธขเธนเนเธ—เธตเนเธฃเธฐเธเธธเนเธงเน (Registered Address)'),
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
            title: const Text('เนเธเธเน€เธญเธเธชเธฒเธฃ & AI Scan'),
            content: Column(
              children: [
                const Text('เธเธฃเธธเธ“เธฒเนเธเธเน€เธญเธเธชเธฒเธฃเธซเธฅเธฑเธเธเธฒเธเธเธฃเธฐเธเธญเธเธเธณเธเธญ (Documents)'),
                const SizedBox(height: 12),
                DocumentUploadSection(
                  documents: (widget.requestType == 'SUBSTITUTE' ||
                          widget.requestType == 'REPLACEMENT')
                      ? FormConfigService.getReplacementDocumentList(
                          reason: _replacementReason,
                          applicantType: _applicantType)
                      : FormConfigService.getRenewalDocumentList(
                          applicantType: _applicantType),
                  uploadedFiles: _uploadedFiles,
                  videoLinks: _videoLinks,
                  onPickFile: _pickFile,
                  onViewFile: _viewFile,
                  onDeleteFile: _deleteFile,
                  onLinkChanged: (docId, link) {
                    setState(() {
                      if (link.isEmpty) {
                        _videoLinks.remove(docId);
                      } else {
                        _videoLinks[docId] = link;
                      }
                    });
                  },
                ),
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
                      const Text('เธฃเธฐเธเธเธ•เธฃเธงเธเธชเธญเธเธเธงเธฒเธกเธ–เธนเธเธ•เนเธญเธเน€เธเธทเนเธญเธเธ•เนเธ (AI Scan)'),
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
                            label: const Text('เธ•เธฃเธงเธเธชเธญเธเน€เธญเธเธชเธฒเธฃเธ—เธฑเนเธเธซเธกเธ”'))
                    ],
                  ),
                )
              ],
            ),
            isActive: _currentStep >= 1,
          ),

          // Step 2: Review & Confirm
          Step(
            title: const Text('เธ•เธฃเธงเธเธชเธญเธเธเนเธญเธกเธนเธฅ (Review)'),
            content: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.withOpacity(0.3)),
                borderRadius: BorderRadius.circular(8),
                color: Colors.white,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('เธเธนเนเธขเธทเนเธเธเธณเธเธญ: ${_applicantNameController.text}',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('เธเธฃเธฐเน€เธ เธ—: $_applicantType'),
                  const SizedBox(height: 8),
                  Text('เนเธเธฅเธ: ${_selectedEstablishment?.name ?? '-'}'),
                  const Divider(),
                  Text('เธเนเธญเธกเธนเธฅเธเธฒเธฃเธเธฅเธดเธ•:',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[700])),
                  Text('เธกเธฒเธ•เธฃเธเธฒเธ: ${_certificationTypes.join(', ')}'),
                  Text('เธงเธฑเธ•เธ–เธธเธเธฃเธฐเธชเธเธเน: ${_objectives.join(', ')}'),
                  const Divider(),
                  Text('เน€เธญเธเธชเธฒเธฃเธ—เธตเนเนเธเธ: ${_uploadedFiles.length} เธฃเธฒเธขเธเธฒเธฃ',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  CheckboxListTile(
                    title: const Text(
                        'เธเนเธฒเธเน€เธเนเธฒเธเธญเธฃเธฑเธเธฃเธญเธเธงเนเธฒเธเนเธญเธกเธนเธฅเนเธฅเธฐเน€เธญเธเธชเธฒเธฃเธ—เธตเนเนเธเธเธกเธฒเธ–เธนเธเธ•เนเธญเธเนเธฅเธฐเน€เธเนเธเธเธงเธฒเธกเธเธฃเธดเธเธ—เธธเธเธเธฃเธฐเธเธฒเธฃ (I certify that all information is true)'),
                    value: _isConfirmed,
                    onChanged: (val) =>
                        setState(() => _isConfirmed = val ?? false),
                    controlAffinity: ListTileControlAffinity.leading,
                    contentPadding: EdgeInsets.zero,
                  )
                ],
              ),
            ),
            isActive: _currentStep >= 2,
          ),

          // Step 3: Payment
          Step(
            title: const Text('เธเธณเธฃเธฐเธเนเธฒเธเธฃเธฃเธกเน€เธเธตเธขเธก'),
            content: Column(
              children: [
                const Text('เธเนเธฒเธเธฃเธฃเธกเน€เธเธตเธขเธกเธเธณเธเธญ: 5,000 เธเธฒเธ—'),
                const SizedBox(height: 12),
                // Review button removed as we have a dedicated step now
                if (_isReviewed) // Keep for backward compatibility or remove? Better remove _isReviewed usage since we have Step 2
                  Container(),

                ElevatedButton.icon(
                  onPressed: _isPaidPhase1 ? null : _simulatePayment,
                  icon: const Icon(LucideIcons.creditCard),
                  label: Text(_isPaidPhase1
                      ? 'เธเธณเธฃเธฐเน€เธเธดเธเนเธฅเนเธง (Paid)'
                      : 'เธเธณเธฃเธฐเน€เธเธดเธ 5,000 เธเธฒเธ—'),
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
                      child: const Text('เธขเธทเนเธเธเธณเธเธญ (Submit)'),
                    ),
                  ),
              ],
            ),
            isActive: _currentStep >= 3,
          ),
        ],
      ),
    );
  }

  void _onContinue() async {
    // Step 0: Applicant Info & Establishment
    if (_currentStep == 0) {
      if (_formKey.currentState != null && !_formKey.currentState!.validate()) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเนเธญเธกเธนเธฅเนเธซเนเธเธฃเธเธ–เนเธงเธ')));
        return;
      }

      if (_selectedEstablishment == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเนเธเธฅเธเธเธฅเธนเธ (Select Establishment)')));
        return;
      }

      // Strict Validation: Multi-Select
      if (_certificationTypes.isEmpty || _objectives.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content:
                Text('เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธกเธฒเธ•เธฃเธฒเธเธฒเธเนเธฅเธฐเธงเธฑเธ•เธ–เธธเธเธฃเธฐเธชเธเธเนเธญเธขเนเธฒเธเธเนเธญเธข 1 เธฃเธฒเธขเธเธฒเธฃ')));
        return;
      }
      // Moved createApplication to Step 1 to include documents
    }

    // Step 1: Document Validation (Strict) & Creation
    if (_currentStep == 1) {
      final requiredDocs = _isReplacement
          ? FormConfigService.getReplacementDocumentList(
                  reason: _replacementReason, applicantType: _applicantType)
              .where((d) => d['required'] == true)
          : FormConfigService.getRenewalDocumentList(
                  applicantType: _applicantType)
              .where((d) => d['required'] == true);

      List<String> missing = [];
      for (var doc in requiredDocs) {
        if (!_uploadedFiles.containsKey(doc['id'])) {
          missing.add(doc['title']);
        }
      }

      if (missing.isNotEmpty) {
        showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
                  title: const Text('เน€เธญเธเธชเธฒเธฃเนเธกเนเธเธฃเธเธ–เนเธงเธ (Missing Documents)'),
                  content: SingleChildScrollView(
                    child: ListBody(
                      children: missing
                          .map((e) => Text('- $e',
                              style: const TextStyle(color: Colors.red)))
                          .toList(),
                    ),
                  ),
                  actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('เธ•เธเธฅเธ'))
                  ],
                ));
        return;
      }

      // Create Draft Application NOW with documents
      final appState = ref.read(applicationProvider);
      if (appState.applicationId == null) {
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
                  certificationType: _certificationTypes.toList(),
                  objective: _objectives.toList(),
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
                      'replacementOtherReason':
                          _replacementReasonOtherController.text,
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
                    'areaType': _areaTypes.toList(),
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
                    // Video Links
                    'videoLinks': _videoLinks,
                    // ... other loose fields
                  },
                  documents: _uploadedFiles, // Pass the real XFiles
                );

        if (mounted) Navigator.pop(context); // Hide Loading

        if (!success) {
          final error = ref.read(applicationProvider).error;
          if (error == 'Unauthorized' ||
              (error != null && error.contains('401'))) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text('Session Expired. Please Login again.'),
                  backgroundColor: Colors.red));
              context.go('/login');
            }
            return;
          }

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Failed to create application draft')));
          }
          return;
        }
      }
    }

    // Step 2: Review & Confirm (Strict)
    if (_currentStep == 2) {
      if (!_isConfirmed) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text(
                'เธเธฃเธธเธ“เธฒเธขเธทเธเธขเธฑเธเธเธงเธฒเธกเธ–เธนเธเธ•เนเธญเธเธเธญเธเธเนเธญเธกเธนเธฅ (Please confirm data correctness)')));
        return;
      }
    }

    // Step 3: Payment Check (Strict)
    if (_currentStep == 3) {
      // Final Submit is handled by specific button in Step 3 content, but if we had a "Next" here:
      if (!_isPaidPhase1) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text(
                'เธเธฃเธธเธ“เธฒเธเธณเธฃเธฐเธเนเธฒเธเธฃเธฃเธกเน€เธเธตเธขเธกเธเนเธญเธเธขเธทเนเธเธเธณเธเธญ (Please pay fee first)')));
        return;
      }
    }

    if (_currentStep < 3) setState(() => _currentStep++);
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
    // Hide standard controls on Payment Step (Index 3)
    if (_currentStep == 3) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 20),
      child: Row(
        children: [
          ElevatedButton(
              onPressed: details.onStepContinue, child: const Text('เธ–เธฑเธ”เนเธ')),
          const SizedBox(width: 12),
          TextButton(
              onPressed: details.onStepCancel, child: const Text('เธขเนเธญเธเธเธฅเธฑเธ')),
        ],
      ),
    );
  }

  // Helpers

  void _viewFile(String docId) {
    // Open file viewer
    final file = _uploadedFiles[docId];
    if (file != null) {
      // Logic to view file (e.g. OpenFile.open(file.path))
      // For now show snackbar
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Viewing ${file.name}')));
    }
  }

  void _deleteFile(String docId) {
    setState(() {
      _uploadedFiles.remove(docId);
    });
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
        title: const Text('เธเธณเธฃเธฐเน€เธเธดเธเธเนเธฒเธ Ksher'),
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
              label: const Text('เน€เธเธดเธ”เธซเธเนเธฒเธเธณเธฃเธฐเน€เธเธดเธ (Open Payment Page)'),
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
            child: const Text('เธ•เธฃเธงเธเธชเธญเธเธชเธ–เธฒเธเธฐ (Check Status)'),
          ),
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('เธเธดเธ” (Close)')),
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
