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
              color: Theme.of(context).primaryColor.withValues(alpha: 0.05),
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
                        color: Colors.green.withValues(alpha: 0.1),
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

            const SizedBox(height: 24),
            const Divider(thickness: 8, color: Color(0xFFF1F5F9)),
            const SizedBox(height: 24),

            // Farm History Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ประวัติฟาร์ม (Farm History)',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  _buildHistoryItem(
                    icon: LucideIcons.sprout,
                    title: 'เปิดใช้งานแปลงปลูก A',
                    subtitle: 'เริ่มปลูก: 15 ม.ค. 2567',
                    time: 'สำเร็จ',
                    color: Colors.green,
                  ),
                  _buildHistoryItem(
                    icon: LucideIcons.box,
                    title: 'เก็บเกี่ยวรุ่นการผลิต #001',
                    subtitle: 'ผลผลิต: 500 kg',
                    time: 'รอตรวจสอบ',
                    color: Colors.orange,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Application History Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ประวัติคำขอ (Applications)',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  _buildHistoryItem(
                    icon: LucideIcons.fileCheck,
                    title: 'ยื่นคำขอรับรอง GACP',
                    subtitle: 'เลขที่: APP-2024-001',
                    time: 'อนุมัติแล้ว',
                    color: Colors.blue,
                  ),
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

  Widget _buildHistoryItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required String time,
    required Color color,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(subtitle,
                    style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              time,
              style: TextStyle(
                  color: color, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
