import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../ApplicationProviders.dart';
import '../../establishment/presentation/provider/EstablishmentProvider.dart';
import '../../establishment/domain/entity/EstablishmentEntity.dart';

// Helper for Color
Color _getColorForStatus(String status) {
  switch (status) {
    case 'APPROVED':
      return Colors.green;
    case 'REJECTED':
      return Colors.red;
    case 'SUBMITTED':
      return Colors.blue;
    default:
      return Colors.orange;
  }
}

// ------------------------------------------
// 1. Application List Screen
// ------------------------------------------
class ApplicationListScreen extends ConsumerWidget {
  const ApplicationListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncList = ref.watch(myApplicationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('รายการคำขอใบอนุญาต'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus),
            onPressed: () => context.push('/applications/create'),
          ),
        ],
      ),
      body: asyncList.when(
        data: (apps) {
          if (apps.isEmpty) {
            return const Center(child: Text('ยังไม่มีคำขอใบอนุญาต'));
          }
          return ListView.builder(
            itemCount: apps.length,
            itemBuilder: (context, index) {
              final app = apps[index];
              return Card(
                margin: const EdgeInsets.all(8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _getColorForStatus(app.workflowState),
                    child:
                        const Icon(LucideIcons.fileText, color: Colors.white),
                  ),
                  title: Text('ใบอนุญาต ภ.ท.${app.formType}'),
                  subtitle: Text(
                    'สถานะ: ${app.workflowState}\nสถานที่: ${app.establishmentId?['name'] ?? '-'}',
                  ),
                  isThreeLine: true,
                  trailing: (app.workflowState == 'WAITING_PAYMENT_1' ||
                          app.workflowState == 'WAITING_PAYMENT_2')
                      ? ElevatedButton(
                          style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green),
                          onPressed: () {
                            context.push('/payments', extra: {
                              'id': app.id,
                              'phase': app.workflowState
                            });
                          },
                          child: const Text('ชำระเงิน',
                              style: TextStyle(fontSize: 12)),
                        )
                      : const Icon(LucideIcons.chevronRight),
                ),
              );
            },
          );
        },
        error: (err, stack) => Center(child: Text('Error: $err')),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

// ------------------------------------------
// 2. Application Form Screen
// ------------------------------------------
class ApplicationFormScreen extends ConsumerStatefulWidget {
  const ApplicationFormScreen({super.key});

  @override
  ConsumerState<ApplicationFormScreen> createState() =>
      _ApplicationFormScreenState();
}

class _ApplicationFormScreenState extends ConsumerState<ApplicationFormScreen> {
  final _formKey = GlobalKey<FormState>();

  String _selectedFormType = '09'; // Default
  String _applicantType = 'Individual';
  String? _selectedEstablishmentId;

  @override
  Widget build(BuildContext context) {
    final establishmentState = ref.watch(establishmentListProvider);
    final submitState = ref.watch(applicationSubmitProvider);

    // Initial load of establishments if needed
    // establishmentListProvider is an AsyncNotifier, it loads automatically on watch.

    // Listen for submit success/error
    ref.listen(applicationSubmitProvider, (previous, next) {
      if (next.isSuccess) {
        context.pop(); // Go back to list
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('ยื่นคำขอสำเร็จ!',
                  style: TextStyle(color: Colors.white)),
              backgroundColor: Colors.green),
        );
      } else if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('เกิดข้อผิดพลาด: ${next.error}'),
              backgroundColor: Colors.red),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('ยื่นคำขอใหม่')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Form Type
              DropdownButtonFormField<String>(
                value: _selectedFormType,
                decoration: const InputDecoration(labelText: 'ประเภทแบบคำขอ'),
                items: const [
                  DropdownMenuItem(
                      value: '09', child: Text('ภ.ท.09 (ปลูก/ผลิต)')),
                  DropdownMenuItem(value: '10', child: Text('ภ.ท.10 (นำเข้า)')),
                  DropdownMenuItem(
                      value: '11', child: Text('ภ.ท.11 (จำหน่าย)')),
                ],
                onChanged: (v) => setState(() => _selectedFormType = v!),
              ),
              const SizedBox(height: 16),

              // 2. Applicant Type
              DropdownButtonFormField<String>(
                value: _applicantType,
                decoration: const InputDecoration(labelText: 'ประเภทผู้ขอ'),
                items: const [
                  DropdownMenuItem(
                      value: 'Individual', child: Text('บุคคลธรรมดา')),
                  DropdownMenuItem(
                      value: 'Corporate', child: Text('นิติบุคคล')),
                  DropdownMenuItem(
                      value: 'CommunityEnterprise',
                      child: Text('วิสาหกิจชุมชน')),
                ],
                onChanged: (v) => setState(() => _applicantType = v!),
              ),
              const SizedBox(height: 16),

              // 3. Select Establishment (Inter-feature dependency)
              establishmentState.when(
                data: (establishments) {
                  return DropdownButtonFormField<String>(
                    value: _selectedEstablishmentId,
                    decoration: const InputDecoration(
                        labelText: 'เลือกสถานที่ประกอบการ'),
                    hint: const Text('เลือกสถานที่...'),
                    validator: (v) => v == null ? 'กรุณาเลือกสถานที่' : null,
                    items: establishments.map((est) {
                      return DropdownMenuItem(
                        value: est.id, // Assuming Entity has ID
                        child: Text('${est.name} (${est.type.name})'),
                      );
                    }).toList(),
                    onChanged: (v) =>
                        setState(() => _selectedEstablishmentId = v),
                  );
                },
                error: (err, stack) => Text('โหลดข้อมูลสถานที่ไม่สำเร็จ: $err',
                    style: const TextStyle(color: Colors.red)),
                loading: () => const LinearProgressIndicator(),
              ),
              const SizedBox(height: 32),

              // Submit Button
              ElevatedButton(
                onPressed: submitState.isLoading
                    ? null
                    : () {
                        if (_formKey.currentState!.validate()) {
                          ref.read(applicationSubmitProvider.notifier).submit(
                                formType: _selectedFormType,
                                establishmentId: _selectedEstablishmentId!,
                                applicantType: _applicantType,
                              );
                        }
                      },
                style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16)),
                child: submitState.isLoading
                    ? const CircularProgressIndicator()
                    : const Text('ยืนยันส่งคำขอ'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
