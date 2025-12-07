import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'User Profile', type: UserProfileScreen)
Widget userProfileUseCase(BuildContext context) {
  return const UserProfileScreen();
}

class UserProfileScreen extends ConsumerWidget {
  const UserProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Mock Data for Phase 1
    const user = {
      'name': 'นายสมชาย รักเกษตร',
      'role': 'เกษตรกร (Farmer)',
      'email': 'somchai.f@example.com',
      'phone': '081-234-5678',
      'address': '123 หมู่ 4 ต.แม่เหียะ อ.เมือง จ.เชียงใหม่ 50100',
      'registeredDate': '12 ม.ค. 2567',
      'status': 'Active'
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text('ข้อมูลผู้ใช้งาน (Profile)'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header Profile
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 32),
              color: Theme.of(context).primaryColor.withOpacity(0.05),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 50,
                    backgroundImage:
                        AssetImage('assets/images/user_avatar.png'), // Mock
                    child: Icon(LucideIcons.user, size: 50), // Fallback
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user['name']!,
                    style: const TextStyle(
                        fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.green)),
                    child: Text(
                      user['role']!,
                      style: const TextStyle(
                          color: Colors.green, fontWeight: FontWeight.bold),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Info Sections
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  _buildProfileItem(
                      LucideIcons.mail, 'อีเมล (Email)', user['email']!),
                  const Divider(),
                  _buildProfileItem(
                      LucideIcons.phone, 'เบอร์โทร (Phone)', user['phone']!),
                  const Divider(),
                  _buildProfileItem(LucideIcons.mapPin, 'ที่อยู่ (Address)',
                      user['address']!),
                  const Divider(),
                  _buildProfileItem(LucideIcons.calendar, 'วันที่ลงทะเบียน',
                      user['registeredDate']!),
                ],
              ),
            ),

            const SizedBox(height: 32),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    // Logout Logic
                  },
                  icon: const Icon(LucideIcons.logOut, color: Colors.red),
                  label: const Text('ออกจากระบบ (Logout)',
                      style: TextStyle(color: Colors.red)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                    side: const BorderSide(color: Colors.red),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildProfileItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.grey, size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                const SizedBox(height: 4),
                Text(value, style: const TextStyle(fontSize: 16)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
