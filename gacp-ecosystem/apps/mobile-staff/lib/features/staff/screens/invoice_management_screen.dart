import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/theme/app_theme.dart';

/// Invoice Management Screen for ACCOUNTANT role
class InvoiceManagementScreen extends StatelessWidget {
  const InvoiceManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ใบแจ้งหนี้'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Summary Cards
          Row(
            children: [
              _buildStatCard('รอชำระ', 8, Colors.orange),
              const SizedBox(width: 12),
              _buildStatCard('ชำระแล้ว', 24, Colors.green),
              const SizedBox(width: 12),
              _buildStatCard('เกินกำหนด', 2, Colors.red),
            ],
          ),
          const SizedBox(height: 24),

          const Text('ใบแจ้งหนี้ล่าสุด',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),

          ...List.generate(5, (i) => _buildInvoiceItem(i)),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Text(count.toString(),
                style: TextStyle(
                    fontSize: 24, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: TextStyle(color: color, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildInvoiceItem(int index) {
    final amounts = ['15,000', '22,500', '18,000', '35,000', '12,000'];
    final statuses = ['รอชำระ', 'ชำระแล้ว', 'ชำระแล้ว', 'รอชำระ', 'เกินกำหนด'];
    final colors = [
      Colors.orange,
      Colors.green,
      Colors.green,
      Colors.orange,
      Colors.red
    ];

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: colors[index].withValues(alpha: 0.1),
              child: Icon(LucideIcons.fileText, color: colors[index], size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('INV-2567-00${index + 1}',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text('กำหนดชำระ ${index + 10} ธ.ค.',
                      style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('฿${amounts[index]}',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: colors[index].withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(statuses[index],
                      style: TextStyle(fontSize: 10, color: colors[index])),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
