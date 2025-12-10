import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../application/providers/application_provider.dart';

class AuditFormScreen extends ConsumerStatefulWidget {
  final String applicationId;
  const AuditFormScreen({super.key, required this.applicationId});

  @override
  ConsumerState<AuditFormScreen> createState() => _AuditFormScreenState();
}

class _AuditFormScreenState extends ConsumerState<AuditFormScreen> {
  // Simple Checklist
  final Map<String, bool> _checklist = {
    '1. Soil Test Passed': false,
    '2. Water Source Verified': false,
    '3. Seed Source Verified': false,
    '4. Planting Area Secure': false,
    '5. GAP Record Keeping ': false,
    '6. Harvesting Tools Clean': false,
  };

  bool _isSubmitting = false;

  int get _score {
    final int checked = _checklist.values.where((v) => v).length;
    return ((checked / _checklist.length) * 100).round();
  }

  Future<void> _submitAudit() async {
    setState(() => _isSubmitting = true);

    // Logic: > 80% = PASS
    final pass = _score >= 80;

    await ref
        .read(applicationProvider.notifier)
        .fetchApplicationById(widget.applicationId); // Ensure loaded

    final success = await ref
        .read(applicationProvider.notifier)
        .submitAudit(pass: pass, notes: 'Score: $_score%');

    setState(() => _isSubmitting = false);

    if (success && mounted) {
      // Mock License Generation Alert (if passed)
      if (pass) {
        await showDialog(
            context: context,
            builder: (_) => AlertDialog(
                  title: const Text('Certification Approved!'),
                  content: const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.award, size: 64, color: Colors.amber),
                      SizedBox(height: 16),
                      Text('License Issued: PT09-66/0001'),
                    ],
                  ),
                  actions: [
                    TextButton(
                        onPressed: () => context.pop(), child: const Text('OK'))
                  ],
                ));
      }

      if (mounted) context.pop(); // Back to list
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Submission Failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Audit Checklist (GACP)')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Score Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: _score >= 80 ? Colors.green.shade50 : Colors.red.shade50,
                borderRadius: BorderRadius.circular(16),
                border:
                    Border.all(color: _score >= 80 ? Colors.green : Colors.red),
              ),
              child: Column(
                children: [
                  Text('Current Score',
                      style: TextStyle(color: Colors.grey[700])),
                  Text(
                    '$_score%',
                    style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: _score >= 80 ? Colors.green : Colors.red),
                  ),
                  Text(
                    _score >= 80 ? 'PASS' : 'FAIL',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _score >= 80 ? Colors.green : Colors.red),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Checklist
            ..._checklist.keys.map((key) {
              return CheckboxListTile(
                title: Text(key),
                value: _checklist[key],
                onChanged: (val) {
                  setState(() {
                    _checklist[key] = val ?? false;
                  });
                },
              );
            }),

            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitAudit,
                style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16)),
                child: _isSubmitting
                    ? const CircularProgressIndicator()
                    : const Text('Submit Assessment'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
