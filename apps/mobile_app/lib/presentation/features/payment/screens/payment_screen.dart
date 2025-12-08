import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart'; // Ensure this is in pubspec
import '../../../../core/theme/app_theme.dart';
import '../providers/payment_provider.dart';
import '../../application/providers/application_provider.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  final String applicationId;

  const PaymentScreen({super.key, required this.applicationId});

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen>
    with WidgetsBindingObserver {
  // State to hold fetched amount
  double _amount = 0.0;
  String _paymentType = 'Application Fee';
  bool _isLoadingApp = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _fetchAppDetails();
  }

  Future<void> _fetchAppDetails() async {
    await ref
        .read(applicationProvider.notifier)
        .fetchApplicationById(widget.applicationId);

    final appState = ref.read(applicationProvider);
    final status = appState.currentApplication?['status'];

    if (mounted) {
      setState(() {
        if (status == 'WAITING_PAYMENT_2') {
          _amount = 25000.0;
          _paymentType = 'Audit Fee (Phase 2)';
        } else {
          _amount = 5000.0;
          _paymentType = 'Application Fee';
        }
        _isLoadingApp = false;
      });
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // Detect when app resumes (coming back from Browser/Gateway)
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Auto-refresh application status when returning
      _refreshStatus();
    }
  }

  Future<void> _refreshStatus() async {
    await ref
        .read(applicationProvider.notifier)
        .fetchApplicationById(widget.applicationId);

    // If status changed to PAID/SUBMITTED, navigate away
    final appState = ref.read(applicationProvider);
    final status = appState.currentApplication?['status'];

    // Check for Phase 1 success (SUBMITTED) or Phase 2 success (AUDITOR_ASSIGNMENT)
    if (status == 'SUBMITTED' ||
        status == 'AUDITOR_ASSIGNMENT' ||
        status == 'APPROVED') {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment Verified! Status: $status')),
        );
        context.go('/applications');
      }
    }
  }

  Future<void> _handlePayment() async {
    final success = await ref.read(paymentProvider.notifier).getPaymentUrl(
          applicationId: widget.applicationId,
          amount: _amount,
        );

    if (success) {
      final urlStr = ref.read(paymentProvider).paymentUrl;
      if (urlStr != null) {
        final uri = Uri.parse(urlStr);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Could not launch payment gateway')),
            );
          }
        }
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
                  Text('Payment Error: ${ref.read(paymentProvider).error}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final paymentState = ref.watch(paymentProvider);

    if (_isLoadingApp) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: Text('Payment: $_paymentType')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.creditCard,
                    size: 64, color: AppTheme.primary),
              ),
              const SizedBox(height: 24),
              Text(
                _paymentType,
                style: const TextStyle(fontSize: 18, color: Colors.grey),
              ),
              const SizedBox(height: 8),
              Text(
                '${NumberFormat("#,##0").format(_amount)} THB',
                style: const TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primary),
              ),
              const SizedBox(height: 48),
              if (paymentState.isLoading)
                const CircularProgressIndicator()
              else
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _handlePayment,
                    icon: const Icon(LucideIcons.externalLink),
                    label: const Text('Pay Now (Secure Gateway)'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      textStyle: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              const SizedBox(height: 24),
              // Dev Mode: Force Success Button
              if (kDebugMode)
                TextButton.icon(
                  onPressed: () async {
                    // Simulate Success based on amount/type
                    // If 25000 -> Phase 2, else Phase 1
                    Map<String, dynamic>? result;
                    if (_amount > 10000) {
                      result = await ref
                          .read(applicationProvider.notifier)
                          .payPhase2();
                    } else {
                      result = await ref
                          .read(applicationProvider.notifier)
                          .payPhase1();
                    }

                    if (result != null) {
                      _refreshStatus();
                    }
                  },
                  icon: const Icon(LucideIcons.zap, color: Colors.orange),
                  label: Text('Dev: Force Payment Success ($_paymentType)',
                      style: const TextStyle(color: Colors.orange)),
                ),
              const SizedBox(height: 12),
              TextButton.icon(
                onPressed: _refreshStatus,
                icon: const Icon(LucideIcons.refreshCw),
                label: const Text('Check Status'),
              ),
              const SizedBox(height: 8),
              Text(
                'You will be redirected to the secure payment gateway.\nAfter payment, return here to confirm.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[500], fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
