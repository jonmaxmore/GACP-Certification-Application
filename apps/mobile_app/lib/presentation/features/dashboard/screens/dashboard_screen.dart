import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/ui/responsive_layout.dart';
import '../providers/dashboard_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Workspace'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bell),
            onPressed: () {},
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? Center(child: Text('Error: ${state.error}'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: ResponsiveLayout(
                    mobileBody: _DashboardContent(stats: state.stats, crossAxisCount: 2),
                    desktopBody: _DashboardContent(stats: state.stats, crossAxisCount: 4),
                  ),
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/applications/new'),
        icon: const Icon(LucideIcons.plus),
        label: const Text('New Application'),
      ),
    );
  }
}

class _DashboardContent extends StatelessWidget {
  final dynamic stats;
  final int crossAxisCount;

  const _DashboardContent({required this.stats, required this.crossAxisCount});

  @override
  Widget build(BuildContext context) {
    if (stats == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Quick Actions Section (Google Drive Style)
        const Text(
          'Quick Actions',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            _QuickActionButton(
              icon: LucideIcons.filePlus,
              label: 'New Application',
              onTap: () => context.push('/applications/new'),
            ),
            const SizedBox(width: 12),
            _QuickActionButton(
              icon: LucideIcons.mapPin,
              label: 'Add Site',
              onTap: () => context.push('/establishments/new'),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Overview Section
        const Text(
          'Overview',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: crossAxisCount,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _StatCard(
              title: 'Total Applications',
              value: stats.totalApplications.toString(),
              icon: LucideIcons.fileText,
              color: Colors.blue,
            ),
            _StatCard(
              title: 'Pending Review',
              value: stats.pendingApplications.toString(),
              icon: LucideIcons.clock,
              color: Colors.orange,
            ),
            _StatCard(
              title: 'Approved',
              value: stats.approvedApplications.toString(),
              icon: LucideIcons.checkCircle,
              color: Colors.green,
            ),
            _StatCard(
              title: 'My Sites',
              value: stats.totalEstablishments.toString(),
              icon: LucideIcons.sprout,
              color: Colors.purple,
            ),
          ],
        ),
      ],
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.withOpacity(0.2)),
          ),
          child: Column(
            children: [
              Icon(icon, size: 28, color: Theme.of(context).primaryColor),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Theme.of(context).colorScheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              backgroundColor: color.withOpacity(0.1),
              child: Icon(icon, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
