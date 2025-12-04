import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  final Widget child;
  const AdminDashboardScreen({super.key, required this.child});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  int _selectedIndex = 0;

  final List<NavigationDestination> _destinations = const [
    NavigationDestination(
      icon: Icon(LucideIcons.layoutDashboard),
      label: 'Overview',
    ),
    NavigationDestination(
      icon: Icon(LucideIcons.clipboardList),
      label: 'Task Queue',
    ),
    NavigationDestination(
      icon: Icon(LucideIcons.users),
      label: 'Auditors',
    ),
  ];

  void _onDestinationSelected(int index) {
    setState(() => _selectedIndex = index);
    switch (index) {
      case 0:
        context.go('/admin/dashboard');
        break;
      case 1:
        context.go('/admin/tasks');
        break;
      case 2:
        context.go('/admin/auditors'); // Placeholder
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWeb = MediaQuery.of(context).size.width > 800;

    if (isWeb) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              selectedIndex: _selectedIndex,
              onDestinationSelected: _onDestinationSelected,
              labelType: NavigationRailLabelType.all,
              leading: const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  'GACP Admin',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              destinations: _destinations.map((d) {
                return NavigationRailDestination(
                  icon: d.icon,
                  label: Text(d.label),
                );
              }).toList(),
            ),
            const VerticalDivider(thickness: 1, width: 1),
            Expanded(child: widget.child),
          ],
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('GACP Admin'),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.green),
              child: Text(
                'GACP Admin Portal',
                style: TextStyle(color: Colors.white, fontSize: 24),
              ),
            ),
            ..._destinations.asMap().entries.map((entry) {
              return ListTile(
                leading: entry.value.icon,
                title: Text(entry.value.label),
                selected: _selectedIndex == entry.key,
                onTap: () {
                  _onDestinationSelected(entry.key);
                  Navigator.pop(context); // Close drawer
                },
              );
            }),
          ],
        ),
      ),
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: _onDestinationSelected,
        destinations: _destinations,
      ),
    );
  }
}

class DashboardOverview extends StatelessWidget {
  const DashboardOverview({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Dashboard Overview',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            _buildStatCard('Total Applications', '120', Colors.blue),
            _buildStatCard('Pending Review', '15', Colors.orange),
            _buildStatCard('Unassigned Inspections', '8', Colors.purple),
            _buildStatCard('Completed', '85', Colors.green),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Card(
      elevation: 2,
      child: Container(
        width: 200,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
