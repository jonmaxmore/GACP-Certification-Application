import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../presentation/navigation/app_shell.dart';
import '../../presentation/features/establishment/screens/establishment_list_screen.dart';
import '../../presentation/features/establishment/screens/establishment_form_screen.dart';
import '../../presentation/features/dashboard/screens/dashboard_screen.dart';
import '../../presentation/features/application/screens/application_form_screen.dart';
import '../../presentation/features/application/screens/application_type_selection_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/dashboard',
    routes: [
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return AppShell(child: child);
        },
        routes: [
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
          GoRoute(
            path: '/applications',
            builder: (context, state) => const Center(child: Text('Applications List')), // Placeholder for list
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const ApplicationTypeSelectionScreen(),
                routes: [
                  GoRoute(
                    path: ':type',
                    builder: (context, state) {
                      final type = state.pathParameters['type']!;
                      return ApplicationFormScreen(formType: type);
                    },
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const Center(child: Text('Profile Screen')),
          ),
        ],
      ),
    ],
  );
});
