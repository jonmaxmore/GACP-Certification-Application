import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../../../../core/theme/app_theme.dart';
import '../../establishment/providers/establishment_provider.dart';
import '../providers/application_provider.dart';
import '../providers/form_state_provider.dart';

class ApplicationWizardScreen extends ConsumerStatefulWidget {
  final String? requestType;

  const ApplicationWizardScreen({super.key, this.requestType});

  @override
  ConsumerState<ApplicationWizardScreen> createState() =>
      _ApplicationWizardScreenState();
}

class _ApplicationWizardScreenState
    extends ConsumerState<ApplicationWizardScreen> {
  final _formKeyStep1 = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    // Initialize form with initial data if needed
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      // Reset form state on entry
      ref.refresh(applicationFormProvider);
      // Fetch establishments if empty
      ref.read(establishmentProvider.notifier).loadEstablishments();

      // Check for Draft
      final notifier = ref.read(applicationFormProvider.notifier);
      if (notifier.hasDraft) {
        final shouldRestore = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Resume Application?'),
            content: const Text(
                'We found a saved draft. Would you like to continue from where you left off?'),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('No, Start New')),
              TextButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('Yes, Resume')),
            ],
          ),
        );

        if (shouldRestore == true) {
          await notifier.loadDraft();
        } else {
          await notifier
              .clearDraft(); // Optional: Clear if they want to start new
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(applicationFormProvider);
    final formNotifier = ref.read(applicationFormProvider.notifier);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.requestType == 'RENEW'
            ? 'Renwal Application'
            : 'New Application (Form 09)'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.save),
            tooltip: 'Save Draft',
            onPressed: () async {
              await ref.read(applicationFormProvider.notifier).saveDraft();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Draft Saved Locally')),
                );
              }
            },
          )
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Custom Progress Header
            _buildWizardHeader(formState.currentStep),

            // Animated Content
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                switchInCurve: Curves.easeInOut,
                switchOutCurve: Curves.easeInOut,
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.05, 0),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  );
                },
                child: KeyedSubtree(
                  key: ValueKey<int>(formState.currentStep),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: _buildCurrentStep(formState, formNotifier),
                  ),
                ),
              ),
            ),

            // Bottom Controls
            _buildWizardControls(formState, formNotifier),
          ],
        ),
      ),
    );
  }

  // --- Step 1: Info ---
  Widget _buildInfoStep(
      ApplicationFormState state, ApplicationFormNotifier notifier) {
    final establishments = ref.watch(establishmentProvider).establishments;

    return Form(
      key: _formKeyStep1,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Select Establishment',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              prefixIcon: Icon(LucideIcons.warehouse),
            ),
            value: state.formData['establishmentId'],
            hint: const Text('Choose your farm...'),
            items: establishments.map((e) {
              return DropdownMenuItem(
                value: e.id,
                child: Text(e.name, overflow: TextOverflow.ellipsis),
              );
            }).toList(),
            onChanged: (v) => notifier.updateFormData('establishmentId', v),
            validator: (v) => v == null ? 'Please select a farm' : null,
          ),
          const SizedBox(height: 24),
          const Text('Application Type',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildTypeCard(
                  'Form 09', 'Individual', state, notifier, 'type_individual'),
              const SizedBox(width: 8),
              _buildTypeCard(
                  'Form 10', 'Community', state, notifier, 'type_community'),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8)),
            child: const Row(
              children: [
                Icon(LucideIcons.info, size: 16, color: Colors.blue),
                SizedBox(width: 8),
                Expanded(
                    child: Text(
                        'Form 09 is for standard licenses. Form 10 is for community enterprises.',
                        style:
                            TextStyle(fontSize: 12, color: Colors.blueGrey))),
              ],
            ),
          ),
          const SizedBox(height: 24),
          TextFormField(
            initialValue: state.formData['applicantName'],
            decoration: const InputDecoration(
              labelText: 'Applicant Name',
              prefixIcon: Icon(LucideIcons.user),
              border: OutlineInputBorder(),
            ),
            onChanged: (v) => notifier.updateFormData('applicantName', v),
            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            initialValue: state.formData['mobile'],
            decoration: const InputDecoration(
              labelText: 'Mobile Number',
              prefixIcon: Icon(LucideIcons.phone),
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.phone,
            onChanged: (v) => notifier.updateFormData('mobile', v),
            validator: (v) =>
                v == null || v.length < 9 ? 'Invalid Number' : null,
          ),
        ],
      ),
    );
  }

  Widget _buildTypeCard(
      String title,
      String subtitle,
      ApplicationFormState state,
      ApplicationFormNotifier notifier,
      String value) {
    final isSelected = state.formData['formType'] == value;
    return Expanded(
      child: InkWell(
        onTap: () => notifier.updateFormData('formType', value),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            border: Border.all(
                color: isSelected ? AppTheme.primary : Colors.grey.shade300,
                width: isSelected ? 2 : 1),
            borderRadius: BorderRadius.circular(12),
            color: isSelected ? AppTheme.primary.withOpacity(0.05) : null,
          ),
          child: Column(
            children: [
              Text(title,
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isSelected ? AppTheme.primary : null)),
              Text(subtitle,
                  style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              if (isSelected)
                const Icon(Icons.check_circle,
                    size: 16, color: AppTheme.primary),
            ],
          ),
        ),
      ),
    );
  }

  // --- Step 2: Evidence ---
  Widget _buildEvidenceStep(
      ApplicationFormState state, ApplicationFormNotifier notifier) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Required Documents',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const Text('Please upload PDF or Image files.',
            style: TextStyle(color: Colors.grey)),
        const SizedBox(height: 16),
        _buildUploadField('Copy of ID Card', 'id_card', state, notifier),
        _buildUploadField('House Registration', 'house_reg', state, notifier),
        _buildUploadField('Land Title Deed', 'title_deed', state, notifier),
        _buildUploadField('Map Coordinates', 'map_coords', state, notifier),
        _buildUploadField('Planting Plan', 'plant_plan', state, notifier),
      ],
    );
  }

  Widget _buildUploadField(String label, String key, ApplicationFormState state,
      ApplicationFormNotifier notifier) {
    final file = state.attachedFiles[key];

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: file != null ? Colors.green.shade50 : Colors.grey.shade100,
            shape: BoxShape.circle,
          ),
          child: Icon(
            file != null ? LucideIcons.check : LucideIcons.file,
            color: file != null ? Colors.green : Colors.grey,
            size: 20,
          ),
        ),
        title: Text(label),
        subtitle: Text(
          file != null
              ? '${file.name} (${(file.size / 1024).toStringAsFixed(1)} KB)'
              : 'Required',
          style: TextStyle(
            color: file != null ? Colors.green : Colors.red,
            fontSize: 12,
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (file != null)
              IconButton(
                icon: const Icon(LucideIcons.eye, size: 20),
                onPressed: () {
                  // Simple preview via logging or simple dialog in future
                },
              ),
            IconButton(
              icon: Icon(
                  file != null ? LucideIcons.trash2 : LucideIcons.uploadCloud,
                  color: file != null ? Colors.red : AppTheme.primary),
              onPressed: () async {
                if (file != null) {
                  notifier.removeFile(key);
                } else {
                  final result = await FilePicker.platform.pickFiles(
                    type: FileType.custom,
                    allowedExtensions: ['jpg', 'png', 'pdf'],
                  );
                  if (result != null) {
                    notifier.addFile(key, result.files.first);
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  // --- Step 3: Review ---
  Widget _buildReviewStep(ApplicationFormState state) {
    return Column(
      children: [
        // Summary Card
        Card(
          elevation: 0,
          color: Colors.grey.shade50,
          shape: RoundedRectangleBorder(
              side: BorderSide(color: Colors.grey.shade200),
              borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                _buildReviewRow(
                    'Applicant', state.formData['applicantName'] ?? '-'),
                const Divider(),
                _buildReviewRow('Mobile', state.formData['mobile'] ?? '-'),
                const Divider(),
                _buildReviewRow(
                    'Files', '${state.attachedFiles.length} Attached'),
                const Divider(),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(LucideIcons.fileCheck,
                        size: 16, color: Colors.green),
                    const SizedBox(width: 8),
                    const Expanded(
                        child: Text(
                            'Please verify all information before submitting.',
                            style:
                                TextStyle(fontSize: 12, color: Colors.green))),
                  ],
                )
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // PDF Preview Button
        SizedBox(
          width: double.infinity,
          height: 50,
          child: OutlinedButton.icon(
            icon: const Icon(LucideIcons.printer),
            label: const Text('Preview Application Form (PDF)'),
            onPressed: () => _previewPdf(state),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  // --- Logic ---
  void _handleNext(
      ApplicationFormState state, ApplicationFormNotifier notifier) {
    if (state.currentStep == 0) {
      if (_formKeyStep1.currentState!.validate()) {
        if (state.formData['establishmentId'] == null) {
          ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Please select an establishment')));
          return;
        }
        notifier.nextStep();
      }
    } else if (state.currentStep == 1) {
      // Validate Files
      // Just check one for now
      if (state.attachedFiles.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Please upload at least one document')));
        return;
      }
      notifier.nextStep();
    } else if (state.currentStep == 2) {
      _submitForm(state);
    }
  }

  void _handleBack(
      ApplicationFormState state, ApplicationFormNotifier notifier) {
    notifier.prevStep();
  }

  Future<void> _submitForm(ApplicationFormState state) async {
    // Call Provider Logic
    final success =
        await ref.read(applicationProvider.notifier).createApplication(
      establishmentId: state.formData['establishmentId'],
      requestType: widget.requestType ?? 'NEW',
      formData: state.formData,
      documents: ref.read(applicationFormProvider.notifier).getXFiles(),
      applicantInfo: {
        'name': state.formData['applicantName'],
        'mobile': state.formData['mobile']
      },
    );

    if (success && mounted) {
      final appId = ref.read(applicationProvider).applicationId;
      if (appId != null) {
        context.go('/applications/$appId/pay1');
      } else {
        context.go('/applications');
      }
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Application Submitted Successfully!')));
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Error: ${ref.read(applicationProvider).error}')));
    }
  }

  Future<void> _previewPdf(ApplicationFormState state) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Header(level: 0, child: pw.Text('GACP Application Form 09')),
              pw.SizedBox(height: 20),
              pw.Text(
                  'Date: ${DateFormat('dd MMM yyyy').format(DateTime.now())}'),
              pw.Text('Applicant: ${state.formData['applicantName'] ?? '-'}'),
              pw.Text('Mobile: ${state.formData['mobile'] ?? '-'}'),
              pw.Divider(),
              pw.Text(
                  'Establishment ID: ${state.formData['establishmentId'] ?? '-'}'),
              pw.SizedBox(height: 20),
              pw.Text('Attached Documents:'),
              ...state.attachedFiles.entries.map((e) => pw.Bullet(text: e.key)),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
    );
  }
  // --- Custom Builders ---

  Widget _buildCurrentStep(
      ApplicationFormState state, ApplicationFormNotifier notifier) {
    switch (state.currentStep) {
      case 0:
        return _buildInfoStep(state, notifier);
      case 1:
        return _buildEvidenceStep(state, notifier);
      case 2:
        return _buildReviewStep(state);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildWizardHeader(int step) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, 2),
            blurRadius: 10,
          )
        ],
      ),
      child: Row(
        children: [
          _buildStepIcon(0, 'Info', step),
          _buildStepConnector(step >= 1),
          _buildStepIcon(1, 'Evidence', step),
          _buildStepConnector(step >= 2),
          _buildStepIcon(2, 'Review', step),
        ],
      ),
    );
  }

  Widget _buildStepIcon(int index, String label, int currentStep) {
    final isActive = currentStep >= index;
    final isCurrent = currentStep == index;

    return Column(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isActive ? AppTheme.primary : Colors.grey.shade200,
            shape: BoxShape.circle,
            boxShadow: isCurrent
                ? [
                    BoxShadow(
                        color: AppTheme.primary.withOpacity(0.3),
                        blurRadius: 8,
                        spreadRadius: 2)
                  ]
                : null,
          ),
          child: Center(
            child: isActive
                ? const Icon(LucideIcons.check, size: 16, color: Colors.white)
                : Text('${index + 1}',
                    style: TextStyle(
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 4),
        Text(label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
              color: isActive ? AppTheme.primary : Colors.grey,
            )),
      ],
    );
  }

  Widget _buildStepConnector(bool isActive) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(
            bottom: 20, left: 8, right: 8), // Align with circle center (approx)
        color: isActive ? AppTheme.primary : Colors.grey.shade200,
      ),
    );
  }

  Widget _buildWizardControls(
      ApplicationFormState formState, ApplicationFormNotifier formNotifier) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade100)),
      ),
      child: Row(
        children: [
          if (formState.currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () => _handleBack(formState, formNotifier),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Back'),
              ),
            ),
          if (formState.currentStep > 0) const SizedBox(width: 16),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: formState.isLoading
                  ? null
                  : () => _handleNext(formState, formNotifier),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                elevation: 4,
                shadowColor: AppTheme.primary.withOpacity(0.4),
              ),
              child: formState.isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : Text(
                      formState.currentStep == 2
                          ? 'Submit Application'
                          : 'Next Step',
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
