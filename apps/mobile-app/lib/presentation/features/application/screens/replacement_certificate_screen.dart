import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// 🍎 Replacement Certificate Screen
/// หน้าขอใบแทนใบรับรอง - matches /applications/replacement
class ReplacementCertificateScreen extends StatefulWidget {
  const ReplacementCertificateScreen({super.key});

  @override
  State<ReplacementCertificateScreen> createState() =>
      _ReplacementCertificateScreenState();
}

class _ReplacementCertificateScreenState
    extends State<ReplacementCertificateScreen> {
  String _replacementReason = '';
  final _formKey = GlobalKey<FormState>();

  final List<Map<String, dynamic>> _reasons = [
    {'id': 'lost', 'title': 'สูญหาย', 'icon': Icons.search_off},
    {'id': 'damaged', 'title': 'ชำรุด/เสียหาย', 'icon': Icons.broken_image},
    {'id': 'stolen', 'title': 'ถูกขโมย', 'icon': Icons.report},
    {'id': 'other', 'title': 'อื่นๆ', 'icon': Icons.more_horiz},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('ขอใบแทนใบรับรอง'),
        backgroundColor: AppTheme.primaryGreen,
        foregroundColor: Colors.white,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Info card
              Card(
                color: Colors.blue.shade50,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, color: Colors.blue.shade700),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'ใบแทนใบรับรอง ใช้สำหรับกรณีที่ใบรับรองต้นฉบับสูญหายหรือชำรุด',
                          style: TextStyle(color: Colors.blue.shade700),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Certificate number
              const Text(
                'เลขที่ใบรับรองเดิม',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              TextFormField(
                decoration: InputDecoration(
                  hintText: 'GACP-XXXX-XXXX',
                  filled: true,
                  fillColor: Colors.white,
                  prefixIcon: const Icon(Icons.badge),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                validator: (v) =>
                    v?.isEmpty == true ? 'กรุณากรอกเลขที่ใบรับรอง' : null,
              ),
              const SizedBox(height: 20),

              // Reason selection
              const Text(
                'สาเหตุที่ขอใบแทน',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ..._reasons.map((reason) => _buildReasonOption(reason)),

              if (_replacementReason == 'other') ...[
                const SizedBox(height: 12),
                TextFormField(
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'กรุณาระบุสาเหตุ...',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],

              const SizedBox(height: 20),

              // Police report if stolen/lost
              if (_replacementReason == 'lost' ||
                  _replacementReason == 'stolen') ...[
                const Text(
                  'หลักฐานการแจ้งความ',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.upload_file),
                  label: const Text('อัปโหลดใบแจ้งความ'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.all(20),
                    minimumSize: const Size(double.infinity, 60),
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Photo if damaged
              if (_replacementReason == 'damaged') ...[
                const Text(
                  'รูปถ่ายใบรับรองที่ชำรุด',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('ถ่ายรูปใบรับรอง'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.all(20),
                    minimumSize: const Size(double.infinity, 60),
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Declaration
              Card(
                color: Colors.orange.shade50,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.warning_amber, color: Colors.orange.shade700),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'ข้าพเจ้าขอรับรองว่าข้อมูลทั้งหมดเป็นความจริง หากพบว่าเป็นเท็จยินดีรับผิดตามกฎหมาย',
                          style: TextStyle(
                              color: Colors.orange.shade700, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Submit
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed:
                      _replacementReason.isNotEmpty ? _submitReplacement : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('ยื่นคำขอใบแทน',
                      style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReasonOption(Map<String, dynamic> reason) {
    final isSelected = _replacementReason == reason['id'];
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isSelected ? AppTheme.primaryGreen : Colors.transparent,
          width: 2,
        ),
      ),
      child: RadioListTile<String>(
        value: reason['id'],
        groupValue: _replacementReason,
        onChanged: (v) => setState(() => _replacementReason = v ?? ''),
        title: Row(
          children: [
            Icon(reason['icon'],
                color: isSelected ? AppTheme.primaryGreen : Colors.grey),
            const SizedBox(width: 12),
            Text(reason['title']),
          ],
        ),
        activeColor: AppTheme.primaryGreen,
      ),
    );
  }

  void _submitReplacement() {
    if (_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ยื่นคำขอใบแทนสำเร็จ')),
      );
      Navigator.pop(context);
    }
  }
}
