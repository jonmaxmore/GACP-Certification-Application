import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminShell extends StatelessWidget {
  final Widget child;
  const AdminShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    // Determine current index based on location string
    final location = GoRouterState.of(context).matchedLocation;
    int selectedIndex = 0;
    if (location.startsWith('/admin/tasks')) {
      selectedIndex = 1;
    } else if (location.startsWith('/admin/dashboard')) {
      selectedIndex = 0;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Console'),
        backgroundColor: Colors.blueGrey[900],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
              onPressed: () => context.go('/admin/login'),
              icon: const Icon(Icons.logout))
        ],
      ),
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: selectedIndex,
            onDestinationSelected: (int index) {
              if (index == 0) {
                context.go('/admin/dashboard');
              } else if (index == 1) {
                context.go('/admin/tasks');
              }
            },
            labelType: NavigationRailLabelType.all,
            backgroundColor: Colors.blueGrey[50], // Softer background
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.dashboard),
                label: Text('Overview'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.task), // Tasks
                label: Text('Tasks'),
              ),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: child),
        ],
      ),
    );
  }
}
