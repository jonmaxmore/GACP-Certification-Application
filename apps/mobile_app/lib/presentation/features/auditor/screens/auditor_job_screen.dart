import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../application/providers/application_provider.dart';

class AuditorJobScreen extends ConsumerStatefulWidget {
  const AuditorJobScreen({super.key});

  @override
  ConsumerState<AuditorJobScreen> createState() => _AuditorJobScreenState();
}

class _AuditorJobScreenState extends ConsumerState<AuditorJobScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(applicationProvider.notifier).fetchAuditorAssignments();
    });
  }

  @override
  Widget build(BuildContext context) {
    // In a real app, this would filter by the logged-in auditor ID
    // For now, we fetch all 'auditorAssignments' which are mocked to be relevant
    final state = ref.watch(applicationProvider);
    final jobs = state.auditorAssignments;

    return Scaffold(
      appBar: AppBar(title: const Text('My Assignments')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : jobs.isEmpty
              ? const Center(child: Text('No assignments found'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: jobs.length,
                  itemBuilder: (context, index) {
                    final job = jobs[index];
                    return Card(
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: AppTheme.primary,
                          child: Icon(LucideIcons.clipboardList,
                              color: Colors.white),
                        ),
                        title: Text(job.establishmentName),
                        subtitle: Text(
                            'Status: ${job.status}\nDate: ${DateFormat('dd MMM').format(job.createdAt)}'),
                        trailing: const Icon(LucideIcons.chevronRight),
                        onTap: () {
                          // Go to Audit Form
                          context.push('/auditor/job/${job.id}');
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
