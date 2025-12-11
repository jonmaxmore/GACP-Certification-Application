import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart'; // Import AppTheme

import 'package:hive_flutter/hive_flutter.dart';
import 'core/managers/lifecycle_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Use path-based URLs instead of hash-based (removes # from URL)
  usePathUrlStrategy();

  await Hive.initFlutter();
  await Hive.openBox('application_drafts');

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return LifecycleManager(
      child: MaterialApp.router(
        title: 'GACP Certification',
        theme: AppTheme.light,
        routerConfig: router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
