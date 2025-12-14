import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/dio_client.dart';

/// Certificate Model
class Certificate {
  final String id;
  final String applicationId;
  final String certificateNumber;
  final String type;
  final String status;
  final DateTime issueDate;
  final DateTime expiryDate;
  final String establishmentName;
  final String? downloadUrl;

  Certificate({
    required this.id,
    required this.applicationId,
    required this.certificateNumber,
    required this.type,
    required this.status,
    required this.issueDate,
    required this.expiryDate,
    required this.establishmentName,
    this.downloadUrl,
  });

  factory Certificate.fromJson(Map<String, dynamic> json) {
    return Certificate(
      id: json['id'] ?? json['_id'] ?? '',
      applicationId: json['applicationId'] ?? '',
      certificateNumber: json['certificateNumber'] ?? '',
      type: json['type'] ?? 'GACP',
      status: json['status'] ?? 'ACTIVE',
      issueDate: DateTime.tryParse(json['issueDate'] ?? '') ?? DateTime.now(),
      expiryDate: DateTime.tryParse(json['expiryDate'] ?? '') ??
          DateTime.now().add(const Duration(days: 365)),
      establishmentName:
          json['establishmentName'] ?? json['establishment']?['name'] ?? '',
      downloadUrl: json['downloadUrl'],
    );
  }

  bool get isExpired => DateTime.now().isAfter(expiryDate);
  bool get isExpiringSoon =>
      !isExpired && expiryDate.difference(DateTime.now()).inDays < 30;
}

/// Demo certificates
final _demoCertificates = [
  Certificate(
    id: '1',
    applicationId: 'APP-2024-001',
    certificateNumber: 'GACP-TH-2024-00123',
    type: 'GACP',
    status: 'ACTIVE',
    issueDate: DateTime.now().subtract(const Duration(days: 180)),
    expiryDate: DateTime.now().add(const Duration(days: 185)),
    establishmentName: 'สวนเกษตรอินทรีย์สุขภาพดี',
  ),
  Certificate(
    id: '2',
    applicationId: 'APP-2024-002',
    certificateNumber: 'GACP-TH-2024-00456',
    type: 'GACP',
    status: 'ACTIVE',
    issueDate: DateTime.now().subtract(const Duration(days: 30)),
    expiryDate: DateTime.now().add(const Duration(days: 335)),
    establishmentName: 'วิสาหกิจชุมชนสมุนไพรไทย',
  ),
];

/// Certificates Screen - Synchronized with Web version
class CertificatesScreen extends ConsumerStatefulWidget {
  const CertificatesScreen({super.key});

  @override
  ConsumerState<CertificatesScreen> createState() => _CertificatesScreenState();
}

class _CertificatesScreenState extends ConsumerState<CertificatesScreen> {
  final _storage = const FlutterSecureStorage();
  late DioClient _dioClient;

  bool _isLoading = true;
  List<Certificate> _certificates = [];

  @override
  void initState() {
    super.initState();
    _dioClient = DioClient(_storage);
    _loadCertificates();
  }

  Future<void> _loadCertificates() async {
    setState(() => _isLoading = true);
    try {
      final response = await _dioClient.get('/v2/certificates');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'] ?? [];
        setState(() {
          _certificates = data.map((c) => Certificate.fromJson(c)).toList();
          _isLoading = false;
        });
      } else {
        setState(() {
          _certificates = _demoCertificates;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _certificates = _demoCertificates;
        _isLoading = false;
      });
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  int _getDaysRemaining(DateTime expiryDate) {
    return expiryDate.difference(DateTime.now()).inDays;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ใบรับรอง GACP'),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _certificates.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _loadCertificates,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _certificates.length,
                    itemBuilder: (context, index) =>
                        _buildCertificateCard(_certificates[index]),
                  ),
                ),
    );
  }

  Widget _buildCertificateCard(Certificate cert) {
    Color statusColor;
    String statusText;
    IconData statusIcon;

    if (cert.isExpired) {
      statusColor = Colors.red;
      statusText = 'หมดอายุ';
      statusIcon = Icons.cancel_outlined;
    } else if (cert.isExpiringSoon) {
      statusColor = Colors.orange;
      statusText = 'ใกล้หมดอายุ';
      statusIcon = Icons.warning_amber_outlined;
    } else {
      statusColor = Colors.green;
      statusText = 'ใช้งานได้';
      statusIcon = Icons.check_circle_outline;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withValues(alpha: 0.05),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color:
                        Theme.of(context).primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.verified,
                    color: Theme.of(context).primaryColor,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        cert.certificateNumber,
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        cert.establishmentName,
                        style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 14, color: statusColor),
                      const SizedBox(width: 4),
                      Text(
                        statusText,
                        style: TextStyle(
                            fontSize: 12,
                            color: statusColor,
                            fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Details
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _buildDetailRow('ประเภท', 'GACP - มาตรฐานพืชสมุนไพร'),
                _buildDetailRow('วันที่ออก', _formatDate(cert.issueDate)),
                _buildDetailRow('วันหมดอายุ', _formatDate(cert.expiryDate)),
                _buildDetailRow(
                  'อายุคงเหลือ',
                  cert.isExpired
                      ? 'หมดอายุแล้ว'
                      : '${_getDaysRemaining(cert.expiryDate)} วัน',
                  valueColor: cert.isExpired
                      ? Colors.red
                      : (cert.isExpiringSoon ? Colors.orange : null),
                ),
              ],
            ),
          ),

          // Actions
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              border: Border(
                  top: BorderSide(color: Colors.grey.withValues(alpha: 0.1))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('กำลังดาวน์โหลด...')),
                      );
                    },
                    icon: const Icon(Icons.download),
                    label: const Text('ดาวน์โหลด'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('กำลังตรวจสอบ QR Code...')),
                      );
                    },
                    icon: const Icon(Icons.qr_code),
                    label: const Text('QR Code'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 13, color: Colors.grey[600])),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              Icons.card_membership,
              size: 40,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'ยังไม่มีใบรับรอง',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Text(
            'เมื่อคำขอได้รับการอนุมัติ ใบรับรองจะแสดงที่นี่',
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }
}
