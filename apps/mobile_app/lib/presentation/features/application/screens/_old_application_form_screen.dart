import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/application_provider.dart';
import '../../establishment/providers/establishment_provider.dart';

// Steps Components (Simplified for the sake of "Full Implementation" in this context)
// In a real large app, these would be separate widgets.

class ApplicationFormScreen extends ConsumerStatefulWidget {
  final String? requestType; // 'NEW', 'RENEW', 'SUBSTITUTE'

  const ApplicationFormScreen({super.key, this.requestType});

  @override
  ConsumerState<ApplicationFormScreen> createState() =>
      _ApplicationFormScreenState();
}

class _ApplicationFormScreenState extends ConsumerState<ApplicationFormScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Form Data
  final Map<String, dynamic> _formData = {};
  final Map<String, XFile> _documents = {};

  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    // If we need establishment ID, typically it's selected in previous screen
    // or we can show a dropdown here if missing.
    // For now, let's assume we proceed with form filling.

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.requestType == 'RENEW'
            ? 'Renwal Application'
            : 'New Application (Form 09)'),
      ),
      body: Stepper(
        type: StepperType.horizontal,
        currentStep: _currentStep,
        onStepContinue: _nextStep,
        onStepCancel: _prevStep,
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 24.0),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : details.onStepContinue,
                    child: _isSubmitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : Text(_currentStep == 2 ? 'Submit' : 'Next'),
                  ),
                ),
                if (_currentStep > 0) ...[
                  const SizedBox(width: 16),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: details.onStepCancel,
                      child: const Text('Back'),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
        steps: [
          Step(
            title: const Text('Info'),
            content: _buildInfoStep(),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Site'),
            content: _buildSiteStep(),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Docs'),
            content: _buildDocsStep(),
            isActive: _currentStep >= 2,
            state: _currentStep > 2 ? StepState.complete : StepState.indexed,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoStep() {
    return Column(
      children: [
        TextFormField(
          decoration: const InputDecoration(
            labelText: 'Applicant Name',
            prefixIcon: Icon(LucideIcons.user),
          ),
          onChanged: (v) => _formData['applicantName'] = v,
        ),
        const SizedBox(height: 16),
        TextFormField(
          decoration: const InputDecoration(
            labelText: 'Telephone',
            prefixIcon: Icon(LucideIcons.phone),
          ),
          keyboardType: TextInputType.phone,
          onChanged: (v) => _formData['mobile'] = v,
        ),
      ],
    );
  }

  Widget _buildSiteStep() {
    return Column(
      children: [
        TextFormField(
          decoration: const InputDecoration(
            labelText: 'Crop Variety (e.g. Cannabis Sativa)',
            prefixIcon: Icon(LucideIcons.sprout),
          ),
          onChanged: (v) => _formData['cropVariety'] = v,
        ),
        const SizedBox(height: 16),
        TextFormField(
          decoration: const InputDecoration(
            labelText: 'Growing Area (sqm)',
            prefixIcon: Icon(LucideIcons.ruler),
          ),
          keyboardType: TextInputType.number,
          onChanged: (v) => _formData['growingArea'] = v,
        ),
      ],
    );
  }

  Widget _buildDocsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Required Documents',
            style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        _buildUploadButton('ID Card', 'id_card'),
        const SizedBox(height: 12),
        _buildUploadButton('Land Title Deed', 'title_deed'),
      ],
    );
  }

  Widget _buildUploadButton(String label, String key) {
    final file = _documents[key];
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Icon(
            file != null ? LucideIcons.checkCircle : LucideIcons.upload,
            color: file != null ? Colors.green : Colors.grey),
        title: Text(label),
        subtitle: file != null ? const Text('Uploaded') : const Text('Tap to upload'),
        onTap: () async {
          final ImagePicker picker = ImagePicker();
          final XFile? image =
              await picker.pickImage(source: ImageSource.gallery);
          if (image != null) {
            setState(() {
              _documents[key] = image;
            });
          }
        },
        trailing: file != null
            ? IconButton(
                icon: const Icon(LucideIcons.trash2, color: Colors.red),
                onPressed: () => setState(() => _documents.remove(key)),
              )
            : null,
      ),
    );
  }

  void _nextStep() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
    } else {
      _submitForm();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    } else {
      context.pop();
    }
  }

  Future<void> _submitForm() async {
    setState(() => _isSubmitting = true);

    // Get selected Establishment from Provider if available (or assume passed safely)
    // For this implementation, we take the first available or handle error
    final establishments = ref.read(establishmentProvider).establishments;
    String? establishmentId;
    if (establishments.isNotEmpty) {
      establishmentId = establishments.first.id;
    } else {
      // Fallback or Error
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No Establishment Selected')));
      setState(() => _isSubmitting = false);
      return;
    }

    final success = await ref
        .read(applicationProvider.notifier)
        .createApplication(
            establishmentId: establishmentId,
            requestType: widget.requestType ?? 'NEW',
            formData: _formData,
            documents: _documents);

    setState(() => _isSubmitting = false);

    if (success && mounted) {
      // Get the Created App ID from state
      final appId = ref.read(applicationProvider).applicationId;

      if (appId != null) {
        // Redirect to Payment Screen
        context.go('/applications/$appId/pay1');
      } else {
        // Fallback
        context.go('/applications');
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(
              'Submission Failed: ${ref.read(applicationProvider).error}')));
    }
  }
}
