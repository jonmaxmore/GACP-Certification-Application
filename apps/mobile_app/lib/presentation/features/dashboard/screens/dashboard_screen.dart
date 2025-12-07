import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/ui/responsive_layout.dart';
import '../../establishment/providers/establishment_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/weather_widget.dart';
import '../widgets/quick_action_card.dart';
import '../widgets/farm_status_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch Providers
    final dashboardState = ref.watch(dashboardProvider);
    final establishmentState = ref.watch(establishmentProvider);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Hero Section (Gradient + Weather)
              _buildHeroSection(context),

              // 2. Quick Actions Grid
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'เมนูด่วน (Pro Actions)',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    _buildQuickActionGrid(context),
                  ],
                ),
              ),

              // 3. My Farms Carousel
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'แปลงปลูกของฉัน (My Farms)',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        TextButton(
                          onPressed: () => context.push('/establishments'),
                          child: const Text('ดูทั้งหมด'),
                        ),
                      ],
                    ),
                    if (establishmentState.isLoading)
                      const Center(child: CircularProgressIndicator())
                    else if (establishmentState.establishments.isEmpty)
                      _buildEmptyFarmState(context)
                    else
                      SizedBox(
                        height: 200,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: establishmentState.establishments.length,
                          itemBuilder: (context, index) {
                            final farm =
                                establishmentState.establishments[index];
                            return FarmStatusCard(
                              establishment: farm,
                              onTap: () {
                                // Navigate to Farm Detail? For now just edit
                                // context.push('/establishments/edit/${farm.id}');
                              },
                            );
                          },
                        ),
                      ),
                  ],
                ),
              ),

              // 4. Recent Activity (Quick List)
              // Implementation of Recent Activity
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF1E293B), // Navy
            Color(0xFF0F172A), // Darker Navy
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'สวัสดี, สมชาย 🙏', // Mock User
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'วันนี้อากาศเป็นใจแก่การเพาะปลูก',
                    style: TextStyle(color: Colors.white.withOpacity(0.8)),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => context.push('/profile'),
                child: const CircleAvatar(
                  backgroundImage:
                      AssetImage('assets/images/user_avatar.png'), // Mock
                  radius: 24,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const WeatherWidget(),
        ],
      ),
    );
  }

  Widget _buildQuickActionGrid(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        QuickActionCard(
          label: 'ขอใบรับรองใหม่',
          icon: LucideIcons.plusCircle,
          color: Colors.green,
          isPrimary: true,
          onTap: () => context.push('/applications/new'),
        ),
        QuickActionCard(
          label: 'ติดตามสถานะ',
          icon: LucideIcons.activity,
          color: Colors.blue,
          onTap: () => context.push('/application/tracking'),
        ),
        QuickActionCard(
          label: 'แจ้งเตือน',
          icon: LucideIcons.bell,
          color: Colors.orange,
          badgeCount: 3, // Mock
          onTap: () => context.push('/notifications'),
        ),
        QuickActionCard(
          label: 'คู่มือ GACP',
          icon: LucideIcons.bookOpen,
          color: Colors.purple,
          onTap: () {},
        ),
      ],
    );
  }

  Widget _buildEmptyFarmState(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Icon(LucideIcons.sprout, size: 48, color: Colors.grey[400]),
          const SizedBox(height: 12),
          Text(
            'ยังไม่มีแปลงปลูก',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600]),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => context.push('/establishments/new'),
            icon: const Icon(LucideIcons.plus),
            label: const Text('เพิ่มแปลงปลูกแรกของคุณ'),
          ),
        ],
      ),
    );
  }
}
