import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../application/providers/application_provider.dart';

class ApplicationDetailScreen extends ConsumerStatefulWidget {
  final String applicationId;
  const ApplicationDetailScreen({super.key, required this.applicationId});

  @override
  ConsumerState<ApplicationDetailScreen> createState() =>
      _ApplicationDetailScreenState();
}

class _ApplicationDetailScreenState
    extends ConsumerState<ApplicationDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(applicationProvider.notifier)
          .fetchApplicationById(widget.applicationId);
    });
  }

  Future<void> _handleReview(bool approve) async {
    // Call simulate review
    final success = await ref
        .read(applicationProvider.notifier)
        .simulateOfficerReview(approve: approve);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Application ${approve ? "Approved" : "Rejected"}')),
      );
      // Refresh
      ref
          .read(applicationProvider.notifier)
          .fetchApplicationById(widget.applicationId);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content:
                Text('Action failed: ${ref.read(applicationProvider).error}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(applicationProvider);
    final app = state.currentApplication; // Map<String, dynamic>?

    if (state.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (app == null) {
      return const Scaffold(body: Center(child: Text('Application not found')));
    }

    final status = app['status'] ?? 'UNKNOWN';

    return Scaffold(
      appBar: AppBar(
        title: Text('Application #${app['_id']?.substring(0, 8)}'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _getStatusColor(status).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _getStatusColor(status)),
              ),
              child: Row(
                children: [
                  Icon(LucideIcons.info, color: _getStatusColor(status)),
                  const SizedBox(width: 12),
                  Text(
                    'Status: $status',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _getStatusColor(status),
                        fontSize: 16),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Form Payload (Simplified View)
            const Text('Application Data',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Text(app.toString()), // Dump for internal view
            ),

            const SizedBox(height: 24),
            if (status == 'SUBMITTED' || status == 'WAITING_PAYMENT_1') ...[
              const Divider(),
              const SizedBox(height: 16),
              const Text('Officer Actions',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _handleReview(false),
                      icon: const Icon(LucideIcons.xCircle),
                      label: const Text('Reject Docs'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _handleReview(true),
                      icon: const Icon(LucideIcons.checkCircle),
                      label: const Text('Approve Docs'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ] else if (status == 'AUDITOR_ASSIGNMENT') ...[
              const Divider(),
              const SizedBox(height: 16),
              const Text('Auditor Assignment',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _showAuditorAssignmentDialog(context),
                  icon: const Icon(LucideIcons.userPlus),
                  label: const Text('Assign Auditor'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _showAuditorAssignmentDialog(BuildContext context) async {
    // Mock Auditor List
    final auditors = [
      {'id': 'auditor-1', 'name': 'Dr. Somchai (Lead Auditor)'},
      {'id': 'auditor-2', 'name': 'Ms. Malee (Inspector)'},
      {'id': 'auditor-3', 'name': 'Mr. John (Inspector)'},
    ];

    await showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select Auditor',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ...auditors.map((auditor) {
                return ListTile(
                  leading: const CircleAvatar(child: Icon(LucideIcons.user)),
                  title: Text(auditor['name']!),
                  onTap: () {
                    Navigator.pop(context); // Close sheet
                    _performAssignment(auditor['id']!);
                  },
                );
              }),
            ],
          ),
        );
      },
    );
  }

  Future<void> _performAssignment(String auditorId) async {
    final success = await ref.read(applicationProvider.notifier).assignAuditor(
          auditorId: auditorId,
          date: DateTime.now().toIso8601String(),
        );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Auditor Assigned Successfully')),
      );
      // Refresh
      ref
          .read(applicationProvider.notifier)
          .fetchApplicationById(widget.applicationId);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(
                'Assignment Failed: ${ref.read(applicationProvider).error}')),
      );
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'APPROVED':
      case 'PASS':
        return Colors.green;
      case 'REJECTED':
      case 'FAIL':
        return Colors.red;
      case 'WAITING_PAYMENT_1':
      case 'WAITING_PAYMENT_2':
      case 'AUDITOR_ASSIGNMENT':
        return Colors.orange;
      case 'SUBMITTED':
      case 'AUDIT_IN_PROGRESS':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}
