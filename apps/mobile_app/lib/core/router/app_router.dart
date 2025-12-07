import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../presentation/navigation/app_shell.dart';
import '../../presentation/features/establishment/screens/establishment_list_screen.dart';
import '../../presentation/features/establishment/screens/establishment_form_screen.dart';
import '../../presentation/features/dashboard/screens/dashboard_screen.dart';
import '../../presentation/features/admin/screens/admin_login_screen.dart';
import '../../presentation/features/admin/screens/admin_dashboard_screen.dart';
import '../../presentation/features/admin/screens/task_queue_screen.dart';
import '../../presentation/features/auditor/screens/my_assignments_screen.dart';
import '../../presentation/features/auditor/screens/inspection_form_screen.dart';
import '../../presentation/features/auditor/screens/auditor_dashboard_screen.dart';
import '../../presentation/features/admin/screens/application_detail_screen.dart';
import '../../presentation/features/application/screens/application_form_screen.dart';
import '../../presentation/features/application/screens/notification_screen.dart';
import '../../presentation/features/application/screens/service_selection_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/admin/login', // Default to login for now
    routes: [
      // Admin Routes
      GoRoute(
        path: '/admin/login',
        builder: (context, state) => const AdminLoginScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          // Check if we are in admin mode
          if (state.fullPath?.startsWith('/admin') ?? false) {
            return AdminShell(child: child); // Use new Shell
          }
          return AppShell(child: child);
        },
        routes: [
          // Admin Dashboard Routes
          GoRoute(
            path: '/admin/dashboard',
            builder: (context, state) =>
                const DashboardOverview(), // Correct Widget from admin_dashboard_screen.dart
          ),
          GoRoute(
            path: '/admin/tasks',
            builder: (context, state) => const TaskQueueScreen(),
          ),
          GoRoute(
            path: '/admin/application/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return ApplicationDetailScreen(applicationId: id);
            },
          ),

          // Original Farmer Routes (kept for reference/future use)
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),

// ...

          GoRoute(
            path: '/applications/new',
            builder: (context, state) => const ServiceSelectionScreen(),
          ),
          GoRoute(
            path: '/applications/form',
            builder: (context, state) => ApplicationFormScreen(
              requestType: state.extra as String?,
            ),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationScreen(),
          ),
          GoRoute(
            path: '/applications',
            redirect: (context, state) => '/applications/new',
          ),
          GoRoute(
            path: '/establishments',
            builder: (context, state) => const EstablishmentListScreen(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const EstablishmentFormScreen(),
              ),
            ],
          ),
        ],
      ),

      // Auditor Shell
      ShellRoute(
        builder: (context, state, child) {
          return AuditorDashboardScreen(child: child);
        },
        routes: [
          GoRoute(
            path: '/auditor/assignments',
            builder: (context, state) =>
                const MyAssignmentsScreen(), // Maps to "My Jobs"
          ),
          GoRoute(
            path: '/auditor/history',
            builder: (context, state) => const AuditorHistoryScreen(),
          ),
          GoRoute(
            path: '/auditor/profile',
            builder: (context, state) => const AuditorProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path:
            '/auditor/inspection/:id', // Keep inspection outside shell if desired, or inside? Usually checklist needs full screen. I'll make it outside or standard Push.
        parentNavigatorKey: _rootNavigatorKey, // Push on top of shell
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return InspectionFormScreen(applicationId: id);
        },
      ),
    ],
  );
});

// Simple Admin Shell for Layout
class AdminShell extends StatelessWidget {
  final Widget child;
  const AdminShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: 0,
            onDestinationSelected: (int index) {
              // Navigation logic here
            },
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.dashboard),
                label: Text('Dashboard'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.list),
                label: Text('Applications'),
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
