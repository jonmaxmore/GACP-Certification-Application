import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/dio_client.dart';

/// Document Model
class Document {
  final String id;
  final String name;
  final String type;
  final String category;
  final int size;
  final String status;
  final DateTime uploadedAt;
  final String? url;

  Document({
    required this.id,
    required this.name,
    required this.type,
    required this.category,
    required this.size,
    required this.status,
    required this.uploadedAt,
    this.url,
  });

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? json['originalName'] ?? '',
      type: json['type'] ?? json['mimeType'] ?? 'application/pdf',
      category: json['category'] ?? 'OTHER',
      size: json['size'] ?? 0,
      status: json['status'] ?? 'PENDING',
      uploadedAt:
          DateTime.tryParse(json['uploadedAt'] ?? json['createdAt'] ?? '') ??
              DateTime.now(),
      url: json['url'],
    );
  }

  String get sizeFormatted {
    if (size < 1024) return '$size B';
    if (size < 1024 * 1024) return '${(size / 1024).toStringAsFixed(1)} KB';
    return '${(size / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  IconData get icon {
    if (type.contains('pdf')) return Icons.picture_as_pdf;
    if (type.contains('image')) return Icons.image;
    if (type.contains('word') || type.contains('doc')) return Icons.description;
    return Icons.insert_drive_file;
  }

  Color get iconColor {
    if (type.contains('pdf')) return Colors.red;
    if (type.contains('image')) return Colors.blue;
    if (type.contains('word') || type.contains('doc')) return Colors.indigo;
    return Colors.grey;
  }
}

/// Demo documents
final _demoDocuments = [
  Document(
    id: '1',
    name: 'สำเนาบัตรประชาชน.pdf',
    type: 'application/pdf',
    category: 'ID_CARD',
    size: 1024 * 500,
    status: 'APPROVED',
    uploadedAt: DateTime.now().subtract(const Duration(days: 30)),
  ),
  Document(
    id: '2',
    name: 'ทะเบียนบ้าน.pdf',
    type: 'application/pdf',
    category: 'HOUSE_REGISTRATION',
    size: 1024 * 800,
    status: 'APPROVED',
    uploadedAt: DateTime.now().subtract(const Duration(days: 28)),
  ),
  Document(
    id: '3',
    name: 'แผนที่สถานประกอบการ.jpg',
    type: 'image/jpeg',
    category: 'MAP',
    size: 1024 * 1024 * 2,
    status: 'PENDING',
    uploadedAt: DateTime.now().subtract(const Duration(days: 5)),
  ),
];

/// Documents Screen - Synchronized with Web version
class DocumentsScreen extends ConsumerStatefulWidget {
  const DocumentsScreen({super.key});

  @override
  ConsumerState<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends ConsumerState<DocumentsScreen> {
  final _storage = const FlutterSecureStorage();
  late DioClient _dioClient;

  bool _isLoading = true;
  List<Document> _documents = [];
  String _selectedCategory = 'ALL';

  final _categories = [
    {'key': 'ALL', 'label': 'ทั้งหมด'},
    {'key': 'ID_CARD', 'label': 'สำเนาบัตร'},
    {'key': 'HOUSE_REGISTRATION', 'label': 'ทะเบียนบ้าน'},
    {'key': 'MAP', 'label': 'แผนที่'},
    {'key': 'PHOTO', 'label': 'รูปถ่าย'},
    {'key': 'OTHER', 'label': 'อื่นๆ'},
  ];

  @override
  void initState() {
    super.initState();
    _dioClient = DioClient(_storage);
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    setState(() => _isLoading = true);
    try {
      final response = await _dioClient.get('/v2/documents');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'] ?? [];
        setState(() {
          _documents = data.map((d) => Document.fromJson(d)).toList();
          _isLoading = false;
        });
      } else {
        setState(() {
          _documents = _demoDocuments;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _documents = _demoDocuments;
        _isLoading = false;
      });
    }
  }

  List<Document> get _filteredDocuments {
    if (_selectedCategory == 'ALL') return _documents;
    return _documents.where((d) => d.category == _selectedCategory).toList();
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  ({Color color, String label, IconData icon}) _getStatusConfig(String status) {
    switch (status) {
      case 'APPROVED':
        return (
          color: Colors.green,
          label: 'อนุมัติ',
          icon: Icons.check_circle
        );
      case 'REJECTED':
        return (color: Colors.red, label: 'ไม่ผ่าน', icon: Icons.cancel);
      default:
        return (color: Colors.orange, label: 'รอตรวจสอบ', icon: Icons.schedule);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('เอกสาร'),
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('ฟีเจอร์อัพโหลดจะเปิดใช้งานเร็วๆ นี้')),
              );
            },
            icon: const Icon(Icons.upload_file),
            tooltip: 'อัพโหลดเอกสาร',
          ),
        ],
      ),
      body: Column(
        children: [
          // Category filter
          SizedBox(
            height: 50,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategory == cat['key'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat['label']!),
                    selected: isSelected,
                    onSelected: (_) =>
                        setState(() => _selectedCategory = cat['key']!),
                  ),
                );
              },
            ),
          ),

          // Documents list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredDocuments.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        onRefresh: _loadDocuments,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filteredDocuments.length,
                          itemBuilder: (context, index) =>
                              _buildDocumentCard(_filteredDocuments[index]),
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('ฟีเจอร์อัพโหลดจะเปิดใช้งานเร็วๆ นี้')),
          );
        },
        icon: const Icon(Icons.add),
        label: const Text('อัพโหลด'),
      ),
    );
  }

  Widget _buildDocumentCard(Document doc) {
    final statusConfig = _getStatusConfig(doc.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: doc.iconColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(doc.icon, color: doc.iconColor),
        ),
        title: Text(
          doc.name,
          style: const TextStyle(fontWeight: FontWeight.w500),
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              '${doc.sizeFormatted} • ${_formatDate(doc.uploadedAt)}',
              style: TextStyle(fontSize: 12, color: Colors.grey[500]),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: statusConfig.color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(100),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(statusConfig.icon, size: 12, color: statusConfig.color),
                  const SizedBox(width: 4),
                  Text(
                    statusConfig.label,
                    style: TextStyle(
                        fontSize: 11,
                        color: statusConfig.color,
                        fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ],
        ),
        trailing: PopupMenuButton(
          icon: const Icon(Icons.more_vert),
          itemBuilder: (context) => [
            const PopupMenuItem(value: 'view', child: Text('ดู')),
            const PopupMenuItem(value: 'download', child: Text('ดาวน์โหลด')),
            const PopupMenuItem(value: 'delete', child: Text('ลบ')),
          ],
          onSelected: (value) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('เลือก: $value')),
            );
          },
        ),
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
              Icons.folder_open,
              size: 40,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'ยังไม่มีเอกสาร',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Text(
            'อัพโหลดเอกสารประกอบคำขอของคุณ',
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }
}
