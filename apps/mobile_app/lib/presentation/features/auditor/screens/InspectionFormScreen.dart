import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../data/services/OfflineService.dart';

class InspectionFormScreen extends ConsumerStatefulWidget {
  final String applicationId;
  const InspectionFormScreen({super.key, required this.applicationId});

  @override
  ConsumerState<InspectionFormScreen> createState() => _InspectionFormScreenState();
}

class _InspectionFormScreenState extends ConsumerState<InspectionFormScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Mock checklist data
  final Map<String, bool?> _checklist = {
    'Site is clean and free of waste': null,
    'Water source is protected': null,
    'Equipment is sanitized': null,
    'Records are up to date': null,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inspection Form'),
      ),
      body: Stepper(
        type: StepperType.vertical,
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() => _currentStep += 1);
          } else {
            // Submit form
            _submitInspection();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep -= 1);
          }
        },
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 20),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: details.onStepContinue,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                    ),
                    child: Text(_currentStep == 2 ? 'Submit' : 'Next'),
                  ),
                ),
                const SizedBox(width: 12),
                if (_currentStep > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: details.onStepCancel,
                      child: const Text('Back'),
                    ),
                  ),
              ],
            ),
          );
        },
        steps: [
          Step(
            title: const Text('General Information'),
            content: Column(
              children: [
                TextFormField(
                  initialValue: widget.applicationId,
                  readOnly: true,
                  decoration: const InputDecoration(
                    labelText: 'Application ID',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'Inspector Name',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  initialValue: DateTime.now().toString().split(' ')[0],
                  decoration: const InputDecoration(
                    labelText: 'Inspection Date',
                    border: OutlineInputBorder(),
                    suffixIcon: Icon(LucideIcons.calendar),
                  ),
                ),
              ],
            ),
            isActive: _currentStep >= 0,
          ),
          Step(
            title: const Text('Checklist'),
            content: Column(
              children: _checklist.keys.map((key) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(key, style: const TextStyle(fontWeight: FontWeight.bold)),
                        Row(
                          children: [
                            Expanded(
                              child: RadioListTile<bool?>(
                                title: const Text('Pass'),
                                value: true,
                                groupValue: _checklist[key],
                                onChanged: (val) => setState(() => _checklist[key] = val),
                                contentPadding: EdgeInsets.zero,
                                activeColor: Colors.green,
                              ),
                            ),
                            Expanded(
                              child: RadioListTile<bool?>(
                                title: const Text('Fail'),
                                value: false,
                                groupValue: _checklist[key],
                                onChanged: (val) => setState(() => _checklist[key] = val),
                                contentPadding: EdgeInsets.zero,
                                activeColor: Colors.red,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            isActive: _currentStep >= 1,
          ),
          Step(
            title: const Text('Photos & Evidence'),
            content: Column(
              children: [
                Container(
                  height: 150,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey),
                  ),
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(LucideIcons.camera, size: 48, color: Colors.grey),
                      SizedBox(height: 8),
                      Text('Tap to add photos'),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Additional Comments',
                    border: OutlineInputBorder(),
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

  Future<void> _submitInspection() async {
    // Validate checklist
    if (_checklist.containsValue(null)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all checklist items')),
      );
      return;
    }

    final offlineService = ref.read(offlineServiceProvider);
    final isConnected = await offlineService.isConnected();

    final inspectionData = {
      'applicationId': widget.applicationId,
      'checklist': _checklist,
      'comments': 'Inspection completed via mobile app',
      'completedAt': DateTime.now().toIso8601String(),
    };

    if (isConnected) {
      // TODO: Call API to submit
      // await api.submitInspection(inspectionData);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Inspection submitted successfully')),
      );
    } else {
      // Save locally
      await offlineService.saveInspectionLocally(widget.applicationId, inspectionData);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No internet. Saved locally. Will sync when online.')),
      );
    }
    
    if (mounted) {
      Navigator.pop(context);
    }
  }
}
