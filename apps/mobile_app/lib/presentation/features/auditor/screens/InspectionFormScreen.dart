import 'package:flutter/material.dart';
import 'package:flutter_riverpod/FlutterRiverpod.dart';
import 'package:lucide_icons/LucideIcons.dart';
import 'package:mobile_app/core/providers/CoreProviders.dart';

class InspectionFormScreen extends ConsumerStatefulWidget {
  final String applicationId;
  const InspectionFormScreen({super.key, required this.applicationId});

  @override
  ConsumerState<InspectionFormScreen> createState() =>
      _InspectionFormScreenState();
}

class _InspectionFormScreenState extends ConsumerState<InspectionFormScreen> {
  int _currentStep = 0;
  bool _isSubmitting = false;

  // GACP 5 Categories
  final Map<String, Map<String, bool?>> _checklist = {
    '1. Site (สถานที่)': {
      'Cleanliness (ความสะอาด)': null,
      'Water Source (แหล่งน้ำ)': null,
      'Waste Management (การจัดการขยะ)': null,
    },
    '2. Cultivation (การปลูก)': {
      'Soil Quality (คุณภาพดิน)': null,
      'Seeds Source (ที่มาเมล็ดพันธุ์)': null,
      'Fertilizer Usage (การใช้ปุ๋ย)': null,
    },
    '3. Harvest (การเก็บเกี่ยว)': {
      'Harvest Method (วิธีการเก็บเกี่ยว)': null,
      'Tools Hygiene (ความสะอาดเครื่องมือ)': null,
    },
    '4. Processing (การแปรรูป)': {
      'Drying Area (พื้นที่ตากแห้ง)': null,
      'Packaging (บรรจุภัณฑ์)': null,
    },
    '5. Personnel (บุคลากร)': {
      'Hygiene Training (การฝึกอบรมสุขลักษณะ)': null,
      'Protective Gear (อุปกรณ์ป้องกัน)': null,
    }
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Digital Audit Form'),
      ),
      body: Stepper(
        type: StepperType.vertical,
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 5) {
            setState(() => _currentStep += 1);
          } else {
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
                if (_currentStep < 5)
                  Expanded(
                    child: ElevatedButton(
                      onPressed: details.onStepContinue,
                      child: const Text('Next'),
                    ),
                  ),
                if (_currentStep == 5)
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : details.onStepContinue,
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green),
                      child: _isSubmitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Submit Audit Result'),
                    ),
                  ),
                if (_currentStep > 0) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: details.onStepCancel,
                      child: const Text('Back'),
                    ),
                  ),
                ]
              ],
            ),
          );
        },
        steps: [
          // Step 0: General
          Step(
            title: const Text('General Info'),
            content: Column(
              children: [
                ListTile(
                    title: Text('App ID: ${widget.applicationId}'),
                    leading: const Icon(LucideIcons.fileText)),
                ListTile(
                    title: Text(
                        'Date: ${DateTime.now().toString().split(' ')[0]}'),
                    leading: const Icon(LucideIcons.calendar)),
              ],
            ),
            isActive: _currentStep >= 0,
          ),

          // Steps 1-5: Categories
          ..._checklist.entries.map((entry) {
            int index = _checklist.keys.toList().indexOf(entry.key) + 1;
            return Step(
              title: Text(entry.key),
              content: Column(
                children: entry.value.entries.map((checkItem) {
                  return Card(
                    child: Column(
                      children: [
                        ListTile(title: Text(checkItem.key)),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            TextButton.icon(
                              icon: Icon(Icons.check_circle,
                                  color: checkItem.value == true
                                      ? Colors.green
                                      : Colors.grey),
                              label: const Text('Pass'),
                              onPressed: () {
                                setState(() {
                                  entry.value[checkItem.key] = true;
                                });
                              },
                            ),
                            TextButton.icon(
                              icon: Icon(Icons.cancel,
                                  color: checkItem.value == false
                                      ? Colors.red
                                      : Colors.grey),
                              label: const Text('Fail'),
                              onPressed: () {
                                setState(() {
                                  entry.value[checkItem.key] = false;
                                });
                              },
                            ),
                          ],
                        )
                      ],
                    ),
                  );
                }).toList(),
              ),
              isActive: _currentStep >= index,
            );
          }).toList(),
        ],
      ),
    );
  }

  Future<void> _submitInspection() async {
    // Validate
    bool allAnswered = true;
    _checklist.forEach((cat, items) {
      if (items.containsValue(null)) allAnswered = false;
    });

    if (!allAnswered) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please complete all items!')));
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final dio = ref.read(dioClientProvider);
      // Calculate Score logic (simple average)
      int total = 0;
      int passed = 0;
      _checklist.forEach((cat, items) {
        items.forEach((k, v) {
          total++;
          if (v == true) passed++;
        });
      });
      double score = (passed / total) * 100;
      String result = score >= 80 ? 'PASSED' : 'FAILED';

      final response = await dio
          .post('/v2/applications/${widget.applicationId}/audit-result', data: {
        'result': result,
        'score': score,
        'checklistData': _checklist.toString(),
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Audit Submitted Successfully!'),
            backgroundColor: Colors.green));
      } else {
        throw Exception('Failed to submit');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }
}
