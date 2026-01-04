import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// 🍎 Analytics Screen
/// หน้าวิเคราะห์ข้อมูล - matches /staff/analytics
class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  String _selectedPeriod = 'month';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('วิเคราะห์ข้อมูล'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          PopupMenuButton<String>(
            onSelected: (v) => setState(() => _selectedPeriod = v),
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'week', child: Text('รายสัปดาห์')),
              const PopupMenuItem(value: 'month', child: Text('รายเดือน')),
              const PopupMenuItem(value: 'year', child: Text('รายปี')),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text(_getPeriodLabel(_selectedPeriod)),
                  const Icon(Icons.arrow_drop_down),
                ],
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary cards
            Row(
              children: [
                Expanded(
                    child: _buildSummaryCard(
                        'คำขอทั้งหมด', '156', Icons.description, Colors.blue)),
                const SizedBox(width: 12),
                Expanded(
                    child: _buildSummaryCard(
                        'อนุมัติแล้ว', '89', Icons.check_circle, Colors.green)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                    child: _buildSummaryCard(
                        'รอตรวจสอบ', '42', Icons.pending, Colors.orange)),
                const SizedBox(width: 12),
                Expanded(
                    child: _buildSummaryCard(
                        'ปฏิเสธ', '25', Icons.cancel, Colors.red)),
              ],
            ),
            const SizedBox(height: 24),

            // Chart placeholder
            Card(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'แนวโน้มการยื่นคำขอ',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      height: 200,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.bar_chart, size: 48, color: Colors.grey),
                            SizedBox(height: 8),
                            Text('กราฟแนวโน้ม',
                                style: TextStyle(color: Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Plant type breakdown
            Card(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'สัดส่วนตามชนิดพืช',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 20),
                    _buildPlantTypeRow('กัญชา', 0.45, Colors.green),
                    _buildPlantTypeRow('กระท่อม', 0.30, AppTheme.primaryGreen),
                    _buildPlantTypeRow('ขมิ้นชัน', 0.15, Colors.orange),
                    _buildPlantTypeRow('ขิง', 0.10, Colors.amber),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Regional stats
            Card(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'สถิติตามภูมิภาค',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    _buildRegionRow('ภาคเหนือ', 45),
                    _buildRegionRow('ภาคกลาง', 38),
                    _buildRegionRow('ภาคตะวันออกเฉียงเหนือ', 52),
                    _buildRegionRow('ภาคใต้', 21),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(
      String title, String value, IconData icon, Color color) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(title, style: TextStyle(color: Colors.grey.shade600)),
          ],
        ),
      ),
    );
  }

  Widget _buildPlantTypeRow(String name, double percent, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name),
              Text('${(percent * 100).toInt()}%'),
            ],
          ),
          const SizedBox(height: 4),
          LinearProgressIndicator(
            value: percent,
            backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation(color),
            minHeight: 8,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      ),
    );
  }

  Widget _buildRegionRow(String name, int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(child: Text(name)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.indigo.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '$count คำขอ',
              style: TextStyle(
                  color: Colors.indigo.shade700, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  String _getPeriodLabel(String period) {
    switch (period) {
      case 'week':
        return 'รายสัปดาห์';
      case 'month':
        return 'รายเดือน';
      case 'year':
        return 'รายปี';
      default:
        return period;
    }
  }
}
