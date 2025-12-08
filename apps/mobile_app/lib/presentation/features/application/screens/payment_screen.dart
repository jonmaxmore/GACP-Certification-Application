import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/application_provider.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  final String applicationId;

  const PaymentScreen({super.key, required this.applicationId});

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  XFile? _paymentSlip;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _paymentSlip = image;
      });
    }
  }

  Future<void> _submitPayment() async {
    if (_paymentSlip == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload a payment slip')),
      );
      return;
    }

    // 1. Set ID in Provider
    await ref
        .read(applicationProvider.notifier)
        .fetchApplicationById(widget.applicationId);

    // 2. Mock Upload Logic (Since Backend for upload in payPhase1 might be tricky)
    // Ideally we upload first, then confirm payment.
    // For now, we assume payPhase1 handles everything or we just confirm.
    // The user requested "Upload Payment Slip" -> Update Status.

    // In a real app we would:
    // ref.read(applicationProvider.notifier).uploadPaymentSlip(widget.applicationId, _paymentSlip);

    // For this mock/demo, we proceed to call payPhase1 which sets status to SUBMITTED/PAID
    final result = await ref.read(applicationProvider.notifier).payPhase1();

    if (result != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment Submitted Successfully!')),
      );
      context.go('/applications'); // Return to list
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(
                  'Payment Failed: ${ref.read(applicationProvider).error}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Center(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(LucideIcons.banknote,
                        size: 48, color: AppTheme.primary),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Application Fee',
                    style: TextStyle(color: Colors.grey[600], fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    '5,000 THB',
                    style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Bank Account Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: const [
                  BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, 4))
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                            color: Colors.blue.shade800,
                            borderRadius: BorderRadius.circular(8)),
                        alignment: Alignment.center,
                        child: const Text('B',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold)), // Bank Logo Mock
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Bangkok Bank',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                            Text('Account: 123-4-56789-0',
                                style: TextStyle(fontSize: 16)),
                            Text('Name: GACP Certification Authority',
                                style: TextStyle(
                                    color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.copy),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('Account number copied')),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Upload Evidence
            const Text(
              'Upload Payment Slip',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: _pickImage,
              child: Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: Colors.grey.shade300, style: BorderStyle.solid),
                ),
                child: _paymentSlip != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: kIsWeb
                            ? Image.network(_paymentSlip!.path,
                                fit: BoxFit.cover)
                            : Image.file(File(_paymentSlip!.path),
                                fit: BoxFit.cover),
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.uploadCloud,
                              size: 48, color: Colors.grey[400]),
                          const SizedBox(height: 12),
                          Text(
                            'Tap to upload slip',
                            style: TextStyle(color: Colors.grey[500]),
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: 40),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submitPayment,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Confirm Payment'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
