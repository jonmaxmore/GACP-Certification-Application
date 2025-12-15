import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../features/auth/providers/auth_provider.dart';

/// Staff App Shell - Role-based navigation for staff users
/// Different navigation items based on staff role
class StaffAppShell extends ConsumerStatefulWidget {
  final Widget child;
  const StaffAppShell({super.key, required this.child});

  @override
  ConsumerState<StaffAppShell> createState() => _StaffAppShellState();
}

class _StaffAppShellState extends ConsumerState<StaffAppShell> {
  int _currentIndex = 0;

  // Navigation items by role
  static const Map<String, List<_StaffNavItem>> _roleNavItems = {
    'REVIEWER_AUDITOR': [
      _StaffNavItem(
          icon: LucideIcons.layoutDashboard,
          label: 'Dashboard',
          path: '/staff/dashboard'),
      _StaffNavItem(
          icon: LucideIcons.fileText,
          label: 'ตรวจเอกสาร',
          path: '/staff/documents'),
      _StaffNavItem(
          icon: LucideIcons.clipboardCheck,
          label: 'ตรวจประเมิน',
          path: '/staff/audits'),
      _StaffNavItem(
          icon: LucideIcons.user, label: 'โปรไฟล์', path: '/staff/profile'),
    ],
    'SCHEDULER': [
      _StaffNavItem(
          icon: LucideIcons.layoutDashboard,
          label: 'Dashboard',
          path: '/staff/dashboard'),
      _StaffNavItem(
          icon: LucideIcons.calendar,
          label: 'จัดตาราง',
          path: '/staff/scheduling'),
      _StaffNavItem(
          icon: LucideIcons.video, label: 'VDO Call', path: '/staff/vdo-calls'),
      _StaffNavItem(
          icon: LucideIcons.user, label: 'โปรไฟล์', path: '/staff/profile'),
    ],
    'ACCOUNTANT': [
      _StaffNavItem(
          icon: LucideIcons.layoutDashboard,
          label: 'Dashboard',
          path: '/staff/dashboard'),
      _StaffNavItem(
          icon: LucideIcons.fileText,
          label: 'ใบเสนอราคา',
          path: '/staff/quotes'),
      _StaffNavItem(
          icon: LucideIcons.receipt,
          label: 'ใบแจ้งหนี้',
          path: '/staff/invoices'),
      _StaffNavItem(
          icon: LucideIcons.user, label: 'โปรไฟล์', path: '/staff/profile'),
    ],
    'ADMIN': [
      _StaffNavItem(
          icon: LucideIcons.layoutDashboard,
          label: 'Dashboard',
          path: '/staff/dashboard'),
      _StaffNavItem(
          icon: LucideIcons.users,
          label: 'จัดการ Staff',
          path: '/staff/manage'),
      _StaffNavItem(
          icon: LucideIcons.barChart, label: 'รายงาน', path: '/staff/reports'),
      _StaffNavItem(
          icon: LucideIcons.settings,
          label: 'ตั้งค่า',
          path: '/staff/settings'),
    ],
    'SUPER_ADMIN': [
      _StaffNavItem(
          icon: LucideIcons.layoutDashboard,
          label: 'Dashboard',
          path: '/staff/dashboard'),
      _StaffNavItem(
          icon: LucideIcons.users,
          label: 'จัดการ Staff',
          path: '/staff/manage'),
      _StaffNavItem(
          icon: LucideIcons.barChart, label: 'รายงาน', path: '/staff/reports'),
      _StaffNavItem(
          icon: LucideIcons.shield, label: 'ระบบ', path: '/staff/system'),
    ],
  };

  List<_StaffNavItem> _getNavItems(String role) {
    return _roleNavItems[role] ?? _roleNavItems['REVIEWER_AUDITOR']!;
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final role = authState.user?.role ?? 'REVIEWER_AUDITOR';
    final navItems = _getNavItems(role);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          border: Border(
            top: BorderSide(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.08),
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: navItems.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                final isSelected = _currentIndex == index;

                return Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _currentIndex = index);
                      context.go(item.path);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primary.withValues(alpha: 0.1)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            item.icon,
                            size: 22,
                            color: isSelected
                                ? AppTheme.primary
                                : isDark
                                    ? Colors.white54
                                    : Colors.grey[600],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.label,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                              color: isSelected
                                  ? AppTheme.primary
                                  : isDark
                                      ? Colors.white54
                                      : Colors.grey[600],
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class _StaffNavItem {
  final IconData icon;
  final String label;
  final String path;

  const _StaffNavItem({
    required this.icon,
    required this.label,
    required this.path,
  });
}
