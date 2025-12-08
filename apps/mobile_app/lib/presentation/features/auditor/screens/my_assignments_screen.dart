import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../application/providers/application_provider.dart';

class MyAssignmentsScreen extends ConsumerStatefulWidget {
  const MyAssignmentsScreen({super.key});

  @override
  ConsumerState<MyAssignmentsScreen> createState() =>
      _MyAssignmentsScreenState();
}

class _MyAssignmentsScreenState extends ConsumerState<MyAssignmentsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(applicationProvider.notifier).fetchAuditorAssignments();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(applicationProvider);
    final myJobs = state.auditorAssignments;

    return Scaffold(
      appBar: AppBar(
        title: const Text('งานตรวจของฉัน (My Inspections)'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () => ref
                .read(applicationProvider.notifier)
                .fetchAuditorAssignments(),
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : myJobs.isEmpty
              ? const Center(child: Text('ไม่มีงานตรวจ (No Assignments)'))
              : ListView.builder(
                  itemCount: myJobs.length,
                  itemBuilder: (context, index) {
                    final app = myJobs[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Colors.orange,
                          child: Icon(LucideIcons.clipboardCheck,
                              color: Colors.white),
                        ),
                        title: Text(
                            'Inspection #${app.id.substring(0, 8).toUpperCase()}'), // Entity ID
                        subtitle: Text(
                            'Farm: ${app.establishmentName}\nStatus: ${app.status}'),
                        trailing: const Icon(LucideIcons.chevronRight),
                        onTap: () {
                          // Navigate to Inspection Form
                          context.push('/auditor/inspection/${app.id}');
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
