import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// 🍎 Admin Dashboard Screen
/// หน้า Dashboard สำหรับ Admin - matches /staff/dashboard/admin
class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgGray,
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {},
          ),
        ],
      ),
      drawer: _buildAdminDrawer(context),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome card
            Card(
              color: Colors.deepPurple,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              child: const Padding(
                padding: EdgeInsets.all(24),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: Colors.white24,
                      child: Icon(Icons.admin_panel_settings,
                          color: Colors.white, size: 32),
                    ),
                    SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'สวัสดี, ผู้ดูแลระบบ',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'ระบบจัดการ GACP',
                            style: TextStyle(color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Quick stats
            Row(
              children: [
                Expanded(
                    child: _buildStatCard(
                        'ผู้ใช้ทั้งหมด', '1,245', Icons.people, Colors.blue)),
                const SizedBox(width: 12),
                Expanded(
                    child: _buildStatCard(
                        'เจ้าหน้าที่', '28', Icons.badge, Colors.green)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                    child: _buildStatCard(
                        'คำขอใหม่', '36', Icons.fiber_new, Colors.orange)),
                const SizedBox(width: 12),
                Expanded(
                    child: _buildStatCard('ใบรับรอง', '892', Icons.verified,
                        AppTheme.primaryGreen)),
              ],
            ),
            const SizedBox(height: 24),

            // Admin actions
            const Text(
              'ฟังก์ชันผู้ดูแลระบบ',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildAdminAction(
              context,
              'จัดการผู้ใช้',
              'เพิ่ม แก้ไข ลบบัญชีผู้ใช้',
              Icons.manage_accounts,
              Colors.blue,
              () => Navigator.pushNamed(context, '/admin/users'),
            ),
            _buildAdminAction(
              context,
              'จัดการเจ้าหน้าที่',
              'กำหนดสิทธิ์และบทบาท',
              Icons.supervisor_account,
              Colors.green,
              () {},
            ),
            _buildAdminAction(
              context,
              'รายงาน KPI',
              'ดูและส่งออกรายงาน',
              Icons.analytics,
              Colors.orange,
              () => Navigator.pushNamed(context, '/admin/kpi'),
            ),
            _buildAdminAction(
              context,
              'การตั้งค่าระบบ',
              'กำหนดค่าระบบ',
              Icons.settings,
              Colors.purple,
              () {},
            ),
            _buildAdminAction(
              context,
              'Audit Logs',
              'ประวัติการใช้งานระบบ',
              Icons.history,
              Colors.grey,
              () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
      String title, String value, IconData icon, Color color) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(title, style: TextStyle(color: Colors.grey.shade600)),
          ],
        ),
      ),
    );
  }

  Widget _buildAdminAction(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }

  Widget _buildAdminDrawer(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: Colors.deepPurple),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.white24,
                  child: Icon(Icons.admin_panel_settings, color: Colors.white),
                ),
                const SizedBox(height: 12),
                const Text(
                  'ผู้ดูแลระบบ',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold),
                ),
                Text(
                  'admin@gacp.go.th',
                  style: TextStyle(color: Colors.white.withOpacity(0.7)),
                ),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard),
            title: const Text('Dashboard'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.people),
            title: const Text('จัดการผู้ใช้'),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.analytics),
            title: const Text('รายงาน KPI'),
            onTap: () {},
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title:
                const Text('ออกจากระบบ', style: TextStyle(color: Colors.red)),
            onTap: () {
              Navigator.of(context)
                  .pushNamedAndRemoveUntil('/staff/login', (route) => false);
            },
          ),
        ],
      ),
    );
  }
}
