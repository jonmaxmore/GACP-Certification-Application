import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../application/providers/application_provider.dart';

class InspectionFormScreen extends ConsumerStatefulWidget {
  final String applicationId;
  const InspectionFormScreen({super.key, required this.applicationId});

  @override
  ConsumerState<InspectionFormScreen> createState() =>
      _InspectionFormScreenState();
}

class _InspectionFormScreenState extends ConsumerState<InspectionFormScreen> {
  // Mock Checklist
  final Map<String, bool> _checklist = {
    '1. พื้นที่ปลูกปลอดภัย (Safety Area)': false,
    '2. แหล่งน้ำสะอาด (Clean Water)': false,
    '3. การจัดการศัตรูพืช (Pest Control)': false,
    '4. การเก็บเกี่ยวถูกสุขลักษณะ (Harvest Hygiene)': false,
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(applicationProvider.notifier)
          .fetchApplicationById(widget.applicationId);
    });
  }

  Future<void> _submitResult(bool pass) async {
    final success = await ref
        .read(applicationProvider.notifier)
        .submitAudit(pass: pass, notes: 'Inspection Completed via Mobile App');

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(pass ? 'Certified ✅' : 'Audit Failed ❌'),
          backgroundColor: pass ? Colors.green : Colors.red,
        ),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(applicationProvider);
    final app = state.currentApplication;

    // Calculate Score
    final checkedCount = _checklist.values.where((v) => v).length;
    final progress = checkedCount / _checklist.length;

    return Scaffold(
      appBar: AppBar(title: const Text('แบบประเมิน GACP (Checklist)')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : app == null
              ? const Center(child: Text('Data Not Found'))
              : Column(
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.all(16),
                      color: Colors.blue[50],
                      child: Row(
                        children: [
                          const Icon(LucideIcons.clipboardList,
                              size: 32, color: Colors.blue),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                  'App ID: ${widget.applicationId.substring(0, 6)}...',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold)),
                              Text('Result: ${app['status']}'),
                            ],
                          )
                        ],
                      ),
                    ),
                    const Divider(height: 1),

                    // Checklist
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.all(16),
                        children: _checklist.keys.map((key) {
                          return CheckboxListTile(
                            title: Text(key),
                            value: _checklist[key],
                            onChanged: (val) {
                              setState(() {
                                _checklist[key] = val!;
                              });
                            },
                          );
                        }).toList(),
                      ),
                    ),

                    // Actions
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                              color: Colors.black12,
                              blurRadius: 4,
                              offset: Offset(0, -2))
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          LinearProgressIndicator(
                              value: progress, minHeight: 8),
                          const SizedBox(height: 8),
                          Text('${(progress * 100).toInt()}% Completed'),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _submitResult(false), // Fail
                                  icon: const Icon(LucideIcons.x),
                                  label: const Text('ไม่ผ่าน (Fail)'),
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.red),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: progress == 1.0
                                      ? () => _submitResult(true)
                                      : null, // Pass only if full
                                  icon: const Icon(LucideIcons.check),
                                  label: const Text('ผ่านการรับรอง (Certify)'),
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.green),
                                ),
                              ),
                            ],
                          )
                        ],
                      ),
                    )
                  ],
                ),
    );
  }
}
