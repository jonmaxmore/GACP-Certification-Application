import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/admin_provider.dart';

class DashboardOverview extends ConsumerStatefulWidget {
  const DashboardOverview({super.key});

  @override
  ConsumerState<DashboardOverview> createState() => _DashboardOverviewState();
}

class _DashboardOverviewState extends ConsumerState<DashboardOverview> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminProvider.notifier).fetchDashboardStats();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminProvider);
    final stats = state.stats ?? {};

    return Scaffold(
      appBar: AppBar(title: const Text('ภาพรวมระบบ (System Overview)')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                await ref.read(adminProvider.notifier).fetchDashboardStats();
              },
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'สถานะใบสมัคร (Application Status)',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    // Stat Cards Grid
                    LayoutBuilder(
                      builder: (context, constraints) {
                        int columns = 1;
                        if (constraints.maxWidth > 900) {
                          columns = 4;
                        } else if (constraints.maxWidth > 600) {
                          columns = 2;
                        }

                        return GridView.count(
                          crossAxisCount: columns,
                          childAspectRatio: columns == 1 ? 2.5 : 1.5,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                          children: [
                            _buildStatCard(
                                'ทั้งหมด (Total)',
                                '${stats['total'] ?? 0}',
                                Colors.blue,
                                LucideIcons.fileText),
                            _buildStatCard(
                                'รอตรวจ (Pending)',
                                '${stats['pending'] ?? 0}',
                                Colors.orange,
                                LucideIcons.clock),
                            _buildStatCard(
                                'อนุมัติแล้ว (Approved)',
                                '${stats['approved'] ?? 0}',
                                Colors.green,
                                LucideIcons.checkCircle),
                            _buildStatCard(
                                'รายได้ (Revenue)',
                                '฿${stats['revenue'] ?? 0}',
                                Colors.purple,
                                LucideIcons.coins),
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 32),
                    const Text(
                      'สถิติรายเดือน (Monthly Trend)',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    // ... Chart logic remains same logic but static for now ...
                    const SizedBox(height: 16),
                    Container(
                      height: 300,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 10),
                          ]),
                      child: BarChart(
                        BarChartData(
                          alignment: BarChartAlignment.spaceAround,
                          maxY: 100,
                          barTouchData: BarTouchData(enabled: false),
                          titlesData: FlTitlesData(
                            show: true,
                            bottomTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                getTitlesWidget: (value, meta) {
                                  const titles = [
                                    'ม.ค.',
                                    'ก.พ.',
                                    'มี.ค.',
                                    'เม.ย.',
                                    'พ.ค.'
                                  ];
                                  if (value.toInt() < titles.length) {
                                    return Text(titles[value.toInt()]);
                                  }
                                  return const Text('');
                                },
                              ),
                            ),
                            leftTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false)),
                            topTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false)),
                            rightTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false)),
                          ),
                          borderData: FlBorderData(show: false),
                          barGroups: [
                            _makeBarGroup(0, 30, Colors.blue),
                            _makeBarGroup(1, 50, Colors.blue),
                            _makeBarGroup(2, 40, Colors.blue),
                            _makeBarGroup(3, 80, Colors.orange),
                            _makeBarGroup(4, 60, Colors.blue),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  BarChartGroupData _makeBarGroup(int x, double y, Color color) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: color,
          width: 20,
          borderRadius: BorderRadius.circular(4),
        ),
      ],
    );
  }

  Widget _buildStatCard(
      String title, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color, color.withValues(alpha: 0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.4),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween, // Distribute space
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: Colors.white, size: 24),
              ),
              const Icon(LucideIcons.trendingUp,
                  color: Colors.white70, size: 16),
            ],
          ),
          const SizedBox(height: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9), fontSize: 14),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          )
        ],
      ),
    );
  }
}
