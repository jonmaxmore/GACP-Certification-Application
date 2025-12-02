import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/application_provider.dart';
import '../../establishment/providers/establishment_provider.dart';

class ApplicationFormScreen extends ConsumerStatefulWidget {
  final String formType; // 'GACP_FORM_9', 'GACP_FORM_10', 'GACP_FORM_11'

  const ApplicationFormScreen({super.key, required this.formType});

  @override
  ConsumerState<ApplicationFormScreen> createState() => _ApplicationFormScreenState();
}

class _ApplicationFormScreenState extends ConsumerState<ApplicationFormScreen> {
  // Common Controllers
  final _totalAreaController = TextEditingController();
  final _cultivatedAreaController = TextEditingController();
  final _landDocIdController = TextEditingController();
  
  // Form 9 Controllers
  final _cropNameController = TextEditingController();
  final _varietyController = TextEditingController();
  final _sourceController = TextEditingController();
  final _fenceController = TextEditingController();
  final _cctvController = TextEditingController();
  final _guardController = TextEditingController();
  final _accessControlController = TextEditingController();
  final _storageLocationController = TextEditingController();
  final _storageSecurityController = TextEditingController();

  // Form 10 Controllers
  final _pharmacistNameController = TextEditingController();
  final _pharmacistLicenseController = TextEditingController();
  final _saleStorageDetailsController = TextEditingController();
  final _operatingHoursController = TextEditingController();
  final _commercialRegController = TextEditingController();

  // Form 11 Controllers
  final _countryController = TextEditingController();
  final _portController = TextEditingController();
  final _carrierController = TextEditingController();
  final _plantPartsController = TextEditingController();
  final _quantityController = TextEditingController();
  final _purposeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Initialize form type in provider
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(applicationProvider.notifier).setFormType(widget.formType);
    });
  }

  @override
  void dispose() {
    _totalAreaController.dispose();
    _cultivatedAreaController.dispose();
    _landDocIdController.dispose();
    _cropNameController.dispose();
    _varietyController.dispose();
    _sourceController.dispose();
    _fenceController.dispose();
    _cctvController.dispose();
    _guardController.dispose();
    _accessControlController.dispose();
    _storageLocationController.dispose();
    _storageSecurityController.dispose();
    _pharmacistNameController.dispose();
    _pharmacistLicenseController.dispose();
    _saleStorageDetailsController.dispose();
    _operatingHoursController.dispose();
    _commercialRegController.dispose();
    _countryController.dispose();
    _portController.dispose();
    _carrierController.dispose();
    _plantPartsController.dispose();
    _quantityController.dispose();
    _purposeController.dispose();
    super.dispose();
  }

  Future<void> _pickDocument(String key, ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 80);
    if (pickedFile != null) {
      ref.read(applicationProvider.notifier).addDocument(key, File(pickedFile.path));
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = ref.watch(applicationProvider);
    final establishmentState = ref.watch(establishmentProvider);
    final notifier = ref.read(applicationProvider.notifier);

    ref.listen(applicationProvider, (previous, next) {
      if (next.isSuccess) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Application submitted successfully!')),
        );
        // Pop back to list, skipping selection screen if possible, or just pop once
        Navigator.pop(context); 
        notifier.resetForm();
      }
      if (next.error != null && !next.isLoading) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!), backgroundColor: Colors.red),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(title: Text(_getTitle(widget.formType))),
      body: appState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stepper(
              currentStep: appState.currentStep,
              onStepContinue: () {
                if (appState.currentStep == 0) {
                  if (appState.selectedEstablishmentId == null) {
                    _showError('Please select a farm/establishment');
                    return;
                  }
                } else {
                  // Specific Form Logic
                  if (widget.formType == 'GACP_FORM_9') {
                    _handleForm9Steps(appState, notifier);
                  } else if (widget.formType == 'GACP_FORM_10') {
                    _handleForm10Steps(appState, notifier);
                  } else if (widget.formType == 'GACP_FORM_11') {
                    _handleForm11Steps(appState, notifier);
                  }
                }
                
                int totalSteps = _getSteps(appState, establishmentState, notifier).length;
                if (appState.currentStep < totalSteps - 1) {
                  notifier.setStep(appState.currentStep + 1);
                }
              },
              onStepCancel: () {
                if (appState.currentStep > 0) {
                  notifier.setStep(appState.currentStep - 1);
                } else {
                  Navigator.pop(context);
                }
              },
              controlsBuilder: (context, details) {
                int totalSteps = _getSteps(appState, establishmentState, notifier).length;
                bool isLastStep = appState.currentStep == totalSteps - 1;
                
                return Padding(
                  padding: const EdgeInsets.only(top: 20),
                  child: Row(
                    children: [
                      ElevatedButton(
                        onPressed: details.onStepContinue,
                        child: Text(isLastStep ? 'Submit Application' : 'Continue'),
                      ),
                      const SizedBox(width: 12),
                      TextButton(
                        onPressed: details.onStepCancel,
                        child: const Text('Back'),
                      ),
                    ],
                  ),
                );
              },
              steps: _getSteps(appState, establishmentState, notifier),
            ),
    );
  }

  String _getTitle(String type) {
    switch (type) {
      case 'GACP_FORM_9': return 'Form 9 (Production)';
      case 'GACP_FORM_10': return 'Form 10 (Sale)';
      case 'GACP_FORM_11': return 'Form 11 (Import/Export)';
      default: return 'New Application';
    }
  }

  void _handleForm9Steps(ApplicationState state, ApplicationNotifier notifier) {
    if (state.currentStep == 1) {
       notifier.updateFormData('totalArea', double.tryParse(_totalAreaController.text));
       notifier.updateFormData('cultivatedArea', double.tryParse(_cultivatedAreaController.text));
       notifier.updateFormData('landDocumentId', _landDocIdController.text);
    } else if (state.currentStep == 2) {
       notifier.updateFormData('cropName', _cropNameController.text);
       notifier.updateFormData('cropVariety', _varietyController.text);
       notifier.updateFormData('cropSource', _sourceController.text);
    } else if (state.currentStep == 3) {
       notifier.updateFormData('fenceDescription', _fenceController.text);
       notifier.updateFormData('cctvCount', int.tryParse(_cctvController.text));
       notifier.updateFormData('guardCount', int.tryParse(_guardController.text));
       notifier.updateFormData('accessControl', _accessControlController.text);
       notifier.updateFormData('storageLocation', _storageLocationController.text);
       notifier.updateFormData('storageSecurity', _storageSecurityController.text);
    } else if (state.currentStep == 4) {
      notifier.submitApplication();
    }
  }

  void _handleForm10Steps(ApplicationState state, ApplicationNotifier notifier) {
    if (state.currentStep == 1) {
      notifier.updateFormData('pharmacistName', _pharmacistNameController.text);
      notifier.updateFormData('pharmacistLicense', _pharmacistLicenseController.text);
      notifier.updateFormData('saleStorageDetails', _saleStorageDetailsController.text);
      notifier.updateFormData('operatingHours', _operatingHoursController.text);
      notifier.updateFormData('commercialRegNumber', _commercialRegController.text);
    } else if (state.currentStep == 2) {
      notifier.submitApplication();
    }
  }

  void _handleForm11Steps(ApplicationState state, ApplicationNotifier notifier) {
    if (state.currentStep == 1) {
      notifier.updateFormData('country', _countryController.text);
      notifier.updateFormData('portOfEntryExit', _portController.text);
      notifier.updateFormData('carrierName', _carrierController.text);
      notifier.updateFormData('plantParts', _plantPartsController.text);
      notifier.updateFormData('quantity', double.tryParse(_quantityController.text));
      notifier.updateFormData('purpose', _purposeController.text);
    } else if (state.currentStep == 2) {
      notifier.submitApplication();
    }
  }

  List<Step> _getSteps(ApplicationState appState, dynamic establishmentState, ApplicationNotifier notifier) {
    List<Step> steps = [
      // Step 0: Select Establishment (Common)
      Step(
        title: const Text('Select Establishment'),
        content: establishmentState.establishments.isEmpty
            ? const Text('No establishments found. Please create one first.')
            : Column(
                children: establishmentState.establishments.map<Widget>((farm) {
                  return RadioListTile<String>(
                    title: Text(farm.name),
                    subtitle: Text(farm.address),
                    value: farm.id,
                    groupValue: appState.selectedEstablishmentId,
                    onChanged: (value) => notifier.setEstablishment(value!),
                  );
                }).toList(),
              ),
        isActive: appState.currentStep >= 0,
        state: appState.currentStep > 0 ? StepState.complete : StepState.editing,
      ),
    ];

    if (widget.formType == 'GACP_FORM_9') {
      steps.addAll([
        Step(
          title: const Text('Farm Details'),
          content: Column(
            children: [
              TextFormField(controller: _totalAreaController, decoration: const InputDecoration(labelText: 'Total Area')),
              TextFormField(controller: _cultivatedAreaController, decoration: const InputDecoration(labelText: 'Cultivated Area')),
              DropdownButtonFormField<String>(
                value: appState.formData['areaUnit'] ?? 'rai',
                decoration: const InputDecoration(labelText: 'Unit'),
                items: ['rai', 'hectare', 'sqm'].map((u) => DropdownMenuItem(value: u, child: Text(u))).toList(),
                onChanged: (v) => notifier.updateFormData('areaUnit', v),
              ),
              // ... other farm fields
            ],
          ),
          isActive: appState.currentStep >= 1,
        ),
        Step(
          title: const Text('Crop Info'),
          content: Column(
            children: [
              TextFormField(controller: _cropNameController, decoration: const InputDecoration(labelText: 'Crop Name')),
              TextFormField(controller: _varietyController, decoration: const InputDecoration(labelText: 'Variety')),
              TextFormField(controller: _sourceController, decoration: const InputDecoration(labelText: 'Source')),
            ],
          ),
          isActive: appState.currentStep >= 2,
        ),
        Step(
          title: const Text('Production'),
          content: Column(
            children: [
              TextFormField(controller: _fenceController, decoration: const InputDecoration(labelText: 'Fence Description')),
              TextFormField(controller: _storageLocationController, decoration: const InputDecoration(labelText: 'Storage Location')),
            ],
          ),
          isActive: appState.currentStep >= 3,
        ),
        Step(
          title: const Text('Documents'),
          content: Column(
            children: [
              _DocumentUploadField(
                label: 'Land Title (ภ.ท.2)',
                docKey: 'land_title_deed',
                file: appState.documents['land_title_deed'],
                onUpload: () => _pickDocument('land_title_deed', ImageSource.gallery),
                onRemove: () => notifier.removeDocument('land_title_deed'),
              ),
              _DocumentUploadField(
                label: 'SOP Manual',
                docKey: 'sop_manual',
                file: appState.documents['sop_manual'],
                onUpload: () => _pickDocument('sop_manual', ImageSource.gallery),
                onRemove: () => notifier.removeDocument('sop_manual'),
              ),
            ],
          ),
          isActive: appState.currentStep >= 4,
        ),
      ]);
    } else if (widget.formType == 'GACP_FORM_10') {
      steps.addAll([
        Step(
          title: const Text('Sale Details'),
          content: Column(
            children: [
              DropdownButtonFormField<String>(
                value: appState.formData['dispensingMethod'] ?? 'pharmacy',
                decoration: const InputDecoration(labelText: 'Dispensing Method'),
                items: ['pharmacy', 'clinic', 'other'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (v) => notifier.updateFormData('dispensingMethod', v),
              ),
              TextFormField(controller: _commercialRegController, decoration: const InputDecoration(labelText: 'Commercial Registration No.')),
              TextFormField(controller: _operatingHoursController, decoration: const InputDecoration(labelText: 'Operating Hours')),
              const SizedBox(height: 16),
              const Text('Pharmacist Information', style: TextStyle(fontWeight: FontWeight.bold)),
              TextFormField(controller: _pharmacistNameController, decoration: const InputDecoration(labelText: 'Pharmacist Name')),
              TextFormField(controller: _pharmacistLicenseController, decoration: const InputDecoration(labelText: 'License Number')),
              TextFormField(controller: _saleStorageDetailsController, decoration: const InputDecoration(labelText: 'Storage Details')),
            ],
          ),
          isActive: appState.currentStep >= 1,
        ),
        Step(
          title: const Text('Documents'),
          content: Column(
            children: [
              _DocumentUploadField(
                label: 'Pharmacist License',
                docKey: 'pharmacist_license',
                file: appState.documents['pharmacist_license'],
                onUpload: () => _pickDocument('pharmacist_license', ImageSource.gallery),
                onRemove: () => notifier.removeDocument('pharmacist_license'),
              ),
              _DocumentUploadField(
                label: 'Commercial Registration',
                docKey: 'commercial_reg',
                file: appState.documents['commercial_reg'],
                onUpload: () => _pickDocument('commercial_reg', ImageSource.gallery),
                onRemove: () => notifier.removeDocument('commercial_reg'),
              ),
              _DocumentUploadField(
                label: 'Location Map',
                docKey: 'location_map',
                file: appState.documents['location_map'],
                onUpload: () => _pickDocument('location_map', ImageSource.gallery),
                onRemove: () => notifier.removeDocument('location_map'),
              ),
            ],
          ),
          isActive: appState.currentStep >= 2,
        ),
      ]);
    } else if (widget.formType == 'GACP_FORM_11') {
      steps.addAll([
        Step(
          title: const Text('Import/Export Info'),
          content: Column(
            children: [
              DropdownButtonFormField<String>(
                value: appState.formData['importExportType'] ?? 'import',
                decoration: const InputDecoration(labelText: 'Type'),
                items: ['import', 'export'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (v) => notifier.updateFormData('importExportType', v),
              ),
              TextFormField(controller: _countryController, decoration: const InputDecoration(labelText: 'Country (Origin/Destination)')),
              TextFormField(controller: _portController, decoration: const InputDecoration(labelText: 'Port of Entry/Exit')),
              DropdownButtonFormField<String>(
                value: appState.formData['transportMode'] ?? 'air',
                decoration: const InputDecoration(labelText: 'Transport Mode'),
                items: ['air', 'sea', 'land'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (v) => notifier.updateFormData('transportMode', v),
              ),
              TextFormField(controller: _carrierController, decoration: const InputDecoration(labelText: 'Carrier Name')),
              const SizedBox(height: 16),
              const Text('Consignment Details', style: TextStyle(fontWeight: FontWeight.bold)),
              TextFormField(controller: _plantPartsController, decoration: const InputDecoration(labelText: 'Plant Parts (e.g., Flower, Seed)')),
              TextFormField(controller: _quantityController, decoration: const InputDecoration(labelText: 'Quantity (kg)')),
              TextFormField(controller: _purposeController, decoration: const InputDecoration(labelText: 'Purpose (e.g., Medical)')),
            ],
          ),
          isActive: appState.currentStep >= 1,
        ),
        Step(
          title: const Text('Documents'),
          content: Column(
            children: [
              _DocumentUploadField(
                label: 'Invoice / Manifest',
                docKey: 'invoice',
                file: appState.documents['invoice'],
                onUpload: () => _pickDocument('invoice', ImageSource.gallery),
                onRemove: () => notifier.removeDocument('invoice'),
              ),
              _DocumentUploadField(
                label: 'Phytosanitary Certificate',
                docKey: 'phyto_cert',
                file: appState.documents['phyto_cert'],
                onUpload: () => _pickDocument('phyto_cert', ImageSource.gallery),
                onRemove: () => notifier.removeDocument('phyto_cert'),
              ),
            ],
          ),
          isActive: appState.currentStep >= 2,
        ),
      ]);
    }

    return steps;
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), backgroundColor: Colors.red));
  }
}

class _DocumentUploadField extends StatelessWidget {
  final String label;
  final String docKey;
  final File? file;
  final VoidCallback onUpload;
  final VoidCallback onRemove;

  const _DocumentUploadField({
    required this.label,
    required this.docKey,
    this.file,
    required this.onUpload,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        subtitle: file != null ? Text('Selected: ${file!.path.split('/').last}') : const Text('No file selected'),
        leading: Icon(
          file != null ? LucideIcons.fileCheck : LucideIcons.file,
          color: file != null ? Colors.green : Colors.grey,
        ),
        trailing: file != null
            ? IconButton(icon: const Icon(LucideIcons.trash, color: Colors.red), onPressed: onRemove)
            : IconButton(icon: const Icon(LucideIcons.upload), onPressed: onUpload),
      ),
    );
  }
}
