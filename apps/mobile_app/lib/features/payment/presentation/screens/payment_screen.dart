import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../payment_providers.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  final String applicationId;
  final String phase;

  const PaymentScreen({
    super.key,
    required this.applicationId,
    required this.phase, // 'PAYMENT_1' or 'PAYMENT_2' ideally, or as defined in workflow
  });

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  File? _slipImage;

  // Logic from GACP Regulations
  // Phase 1: Application Fee (5,000 THB)
  // Phase 2: Inspection/License Fee (25,000 THB) - Example
  double get _amount => widget.phase.contains('1') ? 5000 : 25000;

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _slipImage = File(pickedFile.path);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(paymentProvider);

    ref.listen(paymentProvider, (prev, next) {
      if (next.isSuccess) {
        context.pop(); // Return to list
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Payment Confirmed! Waiting for admin approval.'),
              backgroundColor: Colors.green),
        );
      } else if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error: ${next.error}'),
              backgroundColor: Colors.red),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('ชำระค่าธรรมเนียม')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Text(
              'ยอดที่ต้องชำระ',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Text(
              '฿${_amount.toStringAsFixed(0)}',
              style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Colors.green),
            ),
            const SizedBox(height: 24),

            // QR Code Placeholder
            Container(
              height: 250,
              width: 250,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
                color: Colors.white,
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.qr_code_2, size: 150),
                  Text('PromptPay QR Code'),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Slip Upload
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('หลักฐานการโอนเงิน',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: _pickImage,
              child: Container(
                height: 150,
                width: double.infinity,
                decoration: BoxDecoration(
                  border:
                      Border.all(color: Colors.grey, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey.shade50,
                ),
                child: _slipImage != null
                    ? Image.file(_slipImage!, fit: BoxFit.cover)
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.imagePlus,
                              size: 40, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('แตะเพื่อแนบสลิป'),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 32),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: state.isLoading
                    ? null
                    : () {
                        if (_slipImage == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('กรุณาแนบสลิปการโอนเงิน')),
                          );
                          return;
                        }
                        ref.read(paymentProvider.notifier).confirmPayment(
                              applicationId: widget.applicationId,
                              phase: widget.phase,
                              amount: _amount,
                              slipImage: _slipImage,
                            );
                      },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.green,
                ),
                child: state.isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('ยืนยันการชำระเงิน',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
