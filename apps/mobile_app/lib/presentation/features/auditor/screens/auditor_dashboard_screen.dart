import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

class AuditorDashboardScreen extends StatefulWidget {
  final Widget child;
  const AuditorDashboardScreen({super.key, required this.child});

  @override
  State<AuditorDashboardScreen> createState() => _AuditorDashboardScreenState();
}

class _AuditorDashboardScreenState extends State<AuditorDashboardScreen> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    switch (index) {
      case 0:
        context.go('/auditor/assignments');
        break;
      case 1:
        context.go('/auditor/history');
        break;
      case 2:
        context.go('/auditor/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.clipboardList),
            label: 'My Jobs',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.history),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.user),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.green,
        onTap: _onItemTapped,
      ),
    );
  }
}
