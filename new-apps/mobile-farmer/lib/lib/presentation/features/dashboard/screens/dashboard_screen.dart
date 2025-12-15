import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/theme_provider.dart';

/// Dashboard Screen - Aligned with Next.js Web App
/// Features: Stats Grid, Step Progress, Pending Tasks, Quick Links
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  static const _steps = [
    'ยื่นคำขอ',
    'ชำระงวด 1',
    'ตรวจเอกสาร',
    'ชำระงวด 2',
    'ตรวจสถานที่',
    'รับรอง',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final themeNotifier = ref.watch(themeModeProvider.notifier);
    final isDark = ref.watch(themeModeProvider) == ThemeMode.dark;

    final userName = authState.user?.displayName ?? 'ผู้ใช้';
    final t = isDark ? _DarkTokens() : _LightTokens();

    // Mock data - replace with real provider
    const totalApplications = 2;
    const pendingApplications = 1;
    const certifiedApplications = 1;
    const expiredApplications = 0;
    const currentStep = 3; // ตรวจเอกสาร
    const applicationId = 'GACP-2024-001234';

    return Scaffold(
      backgroundColor: t.bg,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with Greeting
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _getGreeting(),
                          style: TextStyle(
                            fontSize: 13,
                            color: t.textMuted,
                            letterSpacing: 0.05,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          userName,
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w500,
                            color: t.text,
                            letterSpacing: -0.01,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        // Theme Toggle
                        Container(
                          decoration: BoxDecoration(
                            color: t.iconBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: t.accent.withValues(alpha: 0.3),
                            ),
                          ),
                          child: IconButton(
                            icon: Icon(
                              isDark ? LucideIcons.sun : LucideIcons.moon,
                              color: t.iconColor,
                              size: 20,
                            ),
                            onPressed: () => themeNotifier.toggleTheme(),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // CTA Button
                        ElevatedButton.icon(
                          onPressed: () => context.push('/applications/new'),
                          icon: const Icon(LucideIcons.plus, size: 18),
                          label: const Text('ยื่นคำขอใหม่'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: t.accent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Stats Grid (4 columns on tablet, 2 on mobile)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.8,
                  children: [
                    _StatCard(
                      icon: LucideIcons.file,
                      label: 'คำขอทั้งหมด',
                      value: totalApplications,
                      t: t,
                    ),
                    _StatCard(
                      icon: LucideIcons.clock,
                      label: 'รอดำเนินการ',
                      value: pendingApplications,
                      t: t,
                    ),
                    _StatCard(
                      icon: LucideIcons.award,
                      label: 'ได้รับรองแล้ว',
                      value: certifiedApplications,
                      t: t,
                    ),
                    _StatCard(
                      icon: LucideIcons.alertTriangle,
                      label: 'หมดอายุ',
                      value: expiredApplications,
                      t: t,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Current Status Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: t.bgCard,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: t.border),
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
                              Text(
                                'สถานะปัจจุบัน',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: t.textMuted,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                applicationId,
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w500,
                                  color: t.text,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.statusSubmitted
                                  .withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(100),
                              border: Border.all(
                                color: AppTheme.statusSubmitted
                                    .withValues(alpha: 0.3),
                              ),
                            ),
                            child: Text(
                              'รอตรวจเอกสาร',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.statusSubmitted,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Step Progress
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: t.bgCard,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: t.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ขั้นตอนการดำเนินการ',
                        style: TextStyle(
                          fontSize: 13,
                          color: t.textMuted,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Progress bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: (currentStep - 1) / (_steps.length - 1),
                          backgroundColor: t.border,
                          valueColor: AlwaysStoppedAnimation(t.accent),
                          minHeight: 3,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Steps grid
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(_steps.length, (index) {
                          final stepNum = index + 1;
                          final isDone = stepNum < currentStep;
                          final isCurrent = stepNum == currentStep;
                          return Expanded(
                            child: Column(
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: isDone
                                        ? t.accent
                                        : isCurrent
                                            ? t.accentBg
                                            : t.border,
                                    borderRadius: BorderRadius.circular(12),
                                    border: isCurrent
                                        ? Border.all(color: t.accent, width: 2)
                                        : null,
                                  ),
                                  child: Center(
                                    child: isDone
                                        ? const Icon(
                                            LucideIcons.check,
                                            color: Colors.white,
                                            size: 16,
                                          )
                                        : Text(
                                            '$stepNum',
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                              color: isCurrent
                                                  ? t.accent
                                                  : t.textMuted,
                                            ),
                                          ),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _steps[index],
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isCurrent ? t.accent : t.textMuted,
                                    fontWeight: isCurrent
                                        ? FontWeight.w600
                                        : FontWeight.w400,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Quick Links
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: t.bgCard,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: t.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'เมนูด่วน',
                        style: TextStyle(
                          fontSize: 13,
                          color: t.textMuted,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: _QuickLink(
                              icon: LucideIcons.fileText,
                              label: 'คำขอของฉัน',
                              onTap: () => context.push('/applications'),
                              t: t,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _QuickLink(
                              icon: LucideIcons.award,
                              label: 'ใบรับรอง',
                              onTap: () => context.push('/certificates'),
                              t: t,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: _QuickLink(
                              icon: LucideIcons.compass,
                              label: 'ติดตามสถานะ',
                              onTap: () => context.push('/tracking'),
                              t: t,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _QuickLink(
                              icon: LucideIcons.creditCard,
                              label: 'การชำระเงิน',
                              onTap: () => context.push('/applications'),
                              t: t,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour >= 5 && hour < 12) return 'สวัสดีตอนเช้า';
    if (hour >= 12 && hour < 17) return 'สวัสดีตอนบ่าย';
    if (hour >= 17 && hour < 21) return 'สวัสดีตอนเย็น';
    return 'สวัสดี';
  }
}

// Stat Card Widget
class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final int value;
  final _LightTokens t;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.t,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: t.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: t.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: t.textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: t.iconBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: t.accent.withValues(alpha: 0.3)),
                ),
                child: Icon(icon, size: 18, color: t.iconColor),
              ),
            ],
          ),
          Text(
            '$value',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w600,
              color: t.accent,
              letterSpacing: -0.02,
            ),
          ),
        ],
      ),
    );
  }
}

// Quick Link Widget
class _QuickLink extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final _LightTokens t;

  const _QuickLink({
    required this.icon,
    required this.label,
    required this.onTap,
    required this.t,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: t.bg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: t.border),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: t.iconBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: t.accent.withValues(alpha: 0.3)),
              ),
              child: Icon(icon, size: 16, color: t.iconColor),
            ),
            const SizedBox(width: 10),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: t.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Design Tokens (inline for simplicity)
class _LightTokens {
  Color get bg => const Color(0xFFF8FAF9);
  Color get bgCard => const Color(0xFFFFFFFF);
  Color get border => Colors.black.withValues(alpha: 0.08);
  Color get text => const Color(0xFF1A1A1A);
  Color get textSecondary => const Color(0xFF5A5A5A);
  Color get textMuted => const Color(0xFF8A8A8A);
  Color get accent => const Color(0xFF16A34A);
  Color get accentBg => const Color(0xFF16A34A).withValues(alpha: 0.08);
  Color get iconBg => const Color(0xFFE5F9E7);
  Color get iconColor => const Color(0xFF16A34A);
}

class _DarkTokens extends _LightTokens {
  @override
  Color get bg => const Color(0xFF0A0F1C);
  @override
  Color get bgCard => const Color(0xFF0F172A).withValues(alpha: 0.6);
  @override
  Color get border => Colors.white.withValues(alpha: 0.08);
  @override
  Color get text => const Color(0xFFF8FAFC);
  @override
  Color get textSecondary => const Color(0xFF94A3B8);
  @override
  Color get textMuted => const Color(0xFF64748B);
  @override
  Color get accent => const Color(0xFF10B981);
  @override
  Color get accentBg => const Color(0xFF10B981).withValues(alpha: 0.15);
  @override
  Color get iconBg => const Color(0xFF10B981).withValues(alpha: 0.15);
  @override
  Color get iconColor => const Color(0xFF34D399);
}
