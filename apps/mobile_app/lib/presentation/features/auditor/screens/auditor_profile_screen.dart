import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';

class AuditorProfileScreen extends ConsumerWidget {
  const AuditorProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;

    return Scaffold(
      appBar: AppBar(title: const Text('ข้อมูลผู้ตรวจสอบ (Profile)')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircleAvatar(
              radius: 50,
              backgroundColor: Colors.blue,
              child: Icon(Icons.person, size: 50, color: Colors.white),
            ),
            const SizedBox(height: 24),
            Text('${user?.firstName ?? ''} ${user?.lastName ?? 'Unknown Auditor'}',
                style:
                    const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Role: ${user?.role ?? 'AUDITOR'}',
                style: const TextStyle(fontSize: 16, color: Colors.blue)),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () {
                ref.read(authProvider.notifier).logout();
              },
              icon: const Icon(Icons.logout),
              label: const Text('ออกจากระบบ (Logout)'),
              style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red, foregroundColor: Colors.white),
            )
          ],
        ),
      ),
    );
  }
}
