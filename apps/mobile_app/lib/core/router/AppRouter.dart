import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../presentation/navigation/AppShell.dart';
import '../../presentation/features/establishment/screens/EstablishmentListScreen.dart';
import '../../presentation/features/establishment/screens/EstablishmentFormScreen.dart';
import '../../presentation/features/dashboard/screens/DashboardScreen.dart';
import '../../presentation/features/application/screens/ApplicationFormScreen.dart';
import '../../presentation/features/application/screens/ApplicationTypeSelectionScreen.dart';
import '../../presentation/features/admin/screens/AdminLoginScreen.dart';
import '../../presentation/features/admin/screens/admin_DashboardScreen.dart';
import '../../presentation/features/admin/screens/TaskQueueScreen.dart';
import '../../presentation/features/auditor/screens/MyAssignmentsScreen.dart';
import '../../presentation/features/auditor/screens/InspectionFormScreen.dart';

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
             return AdminDashboardScreen(child: child);
          }
          return AppShell(child: child);
        },
        routes: [
          // Admin Dashboard Routes
          GoRoute(
            path: '/admin/dashboard',
            builder: (context, state) => const DashboardOverview(),
          ),
          GoRoute(
            path: '/admin/tasks',
            builder: (context, state) => const TaskQueueScreen(),
          ),
          
          // Original Farmer Routes (kept for reference/future use)
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
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

      // Auditor Routes (Mobile)
      GoRoute(
        path: '/auditor/assignments',
        builder: (context, state) => const MyAssignmentsScreen(),
      ),
      GoRoute(
        path: '/auditor/inspection/:id',
        builder: (context, state) {
           final id = state.pathParameters['id']!;
           return InspectionFormScreen(applicationId: id);
        },
      ),
    ],
  );
});
