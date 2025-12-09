import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../presentation/navigation/app_shell.dart';
import '../../presentation/features/establishment/screens/establishment_list_screen.dart';
import '../../presentation/features/establishment/screens/establishment_form_screen.dart';
import '../../presentation/features/dashboard/screens/dashboard_screen.dart';
import '../../presentation/features/admin/screens/admin_dashboard_screen.dart';
import '../../presentation/features/admin/screens/task_queue_screen.dart';
import '../../presentation/features/admin/screens/application_detail_screen.dart';
import '../../presentation/features/auth/screens/login_screen.dart';
import '../../presentation/features/auth/screens/register_screen.dart';
import '../../presentation/features/dashboard/screens/user_profile_screen.dart';

import '../../presentation/features/application/screens/notification_screen.dart';
import '../../presentation/features/application/screens/service_selection_screen.dart';
import '../../presentation/features/application/screens/guidelines_screen.dart';
import '../../presentation/features/application/screens/application_tracking_screen.dart';
import '../../presentation/features/auditor/screens/auditor_history_screen.dart';
import '../../presentation/features/auditor/screens/auditor_profile_screen.dart';

import '../../presentation/features/auditor/screens/auditor_dashboard_screen.dart';
import '../../presentation/features/auditor/screens/my_assignments_screen.dart';
import '../../presentation/features/auditor/screens/inspection_form_screen.dart';
import '../../presentation/features/auth/providers/auth_provider.dart';
import '../../presentation/features/application/screens/application_list_screen.dart';

import '../../presentation/features/application/screens/payment_screen.dart';
import '../../presentation/features/auditor/screens/auditor_job_screen.dart';
import '../../presentation/features/auditor/screens/audit_form_screen.dart';
import '../../presentation/features/application/screens/application_wizard_screen.dart';
import '../../presentation/features/application/screens/wizard_steps/step_1_terms_and_conditions.dart';
import '../../presentation/features/application/screens/wizard_steps/step_2_applicant_info.dart';
import '../../presentation/features/application/screens/wizard_steps/step_3_site_and_scope.dart';
import '../../presentation/features/application/screens/wizard_steps/step_4_product_details.dart';
import '../../presentation/features/application/screens/wizard_steps/step_5_operation_sop.dart';
import '../../presentation/features/application/screens/wizard_steps/step_6_evidence.dart';
import '../../presentation/features/application/screens/wizard_steps/step_7_review.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/dashboard',
    refreshListenable: GoRouterRefreshStream(authNotifier.stream),
    redirect: (context, state) {
      final isLoggedIn = ref.read(authProvider).isAuthenticated;
      final isLoggingIn =
          state.fullPath == '/login' || state.fullPath == '/register';

      if (!isLoggedIn && !isLoggingIn) {
        return '/login';
      }

      if (isLoggedIn && isLoggingIn) {
        return '/dashboard';
      }

      return null;
    },
    routes: [
      // Authentication Routes (Outside Shell)
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // App Shell
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          // Check if we are in admin mode
          if (state.fullPath?.startsWith('/admin') ?? false) {
            return AdminShell(child: child); // Uses imported widget
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

          // Original Farmer Routes
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationScreen(),
          ),
          GoRoute(
            path: '/applications',
            builder: (context, state) => const ApplicationListScreen(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const ServiceSelectionScreen(),
              ),
              // Composite Wizard Route-Based
              ShellRoute(
                builder: (context, state, child) {
                  return ApplicationWizardScreen(state: state, child: child);
                },
                routes: [
                  GoRoute(
                    path: 'create/step1',
                    builder: (context, state) => Step1Terms(
                      applicationId: state.uri.queryParameters['id'],
                    ),
                  ),
                  GoRoute(
                    path: 'create/step2',
                    builder: (context, state) => const Step2ApplicantInfo(),
                  ),
                  GoRoute(
                    path: 'create/step3',
                    builder: (context, state) => const Step3SiteAndScope(),
                  ),
                  GoRoute(
                    path: 'create/step4',
                    builder: (context, state) => const Step4ProductDetails(),
                  ),
                  GoRoute(
                    path: 'create/step5',
                    builder: (context, state) => const Step5OperationSOP(),
                  ),
                  GoRoute(
                    path: 'create/step6',
                    builder: (context, state) => const Step6Evidence(),
                  ),
                  GoRoute(
                    path: 'create/step7',
                    builder: (context, state) => const Step7Review(),
                  ),
                ],
              ),
              GoRoute(
                path: 'guidelines',
                builder: (context, state) =>
                    GuidelinesScreen(requestType: state.extra as String),
              ),
              GoRoute(
                path: ':id/pay1',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return PaymentScreen(applicationId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/auditor',
            builder: (context, state) => const AuditorJobScreen(),
            routes: [
              GoRoute(
                path: 'job/:id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return AuditFormScreen(applicationId: id);
                },
              ),
            ],
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
          GoRoute(
            path: '/profile',
            builder: (context, state) => const UserProfileScreen(),
          ),
          GoRoute(
            path: '/application/tracking',
            builder: (context, state) => const ApplicationTrackingScreen(),
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
        path: '/auditor/inspection/:id', // Keep inspection outside shell
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

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen(
          (dynamic _) => notifyListeners(),
        );
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
