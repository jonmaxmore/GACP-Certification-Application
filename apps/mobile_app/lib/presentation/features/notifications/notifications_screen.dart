import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/dio_client.dart';

/// Notification Model - Same structure as Web
class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String type; // INFO, SUCCESS, WARNING, DANGER
  final bool read;
  final DateTime createdAt;
  final String? actionUrl;
  final String? actionLabel;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.read,
    required this.createdAt,
    this.actionUrl,
    this.actionLabel,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'INFO',
      read: json['read'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      actionUrl: json['actionUrl'],
      actionLabel: json['actionLabel'],
    );
  }

  NotificationItem copyWith({bool? read}) {
    return NotificationItem(
      id: id,
      title: title,
      message: message,
      type: type,
      read: read ?? this.read,
      createdAt: createdAt,
      actionUrl: actionUrl,
      actionLabel: actionLabel,
    );
  }
}

/// Demo notifications - Same as Web version
final _demoNotifications = [
  NotificationItem(
    id: '1',
    title: 'ยินดีต้อนรับสู่ระบบ GACP',
    message: 'ระบบพร้อมให้บริการแล้ว คุณสามารถเริ่มยื่นคำขอรับรองมาตรฐานได้เลย',
    type: 'SUCCESS',
    read: false,
    createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
    actionUrl: '/applications/new',
    actionLabel: 'ยื่นคำขอใหม่',
  ),
  NotificationItem(
    id: '2',
    title: 'เอกสารถูกตรวจสอบแล้ว',
    message:
        'คำขอ #APP-2024-001 ผ่านการตรวจเอกสารเบื้องต้น กรุณาชำระเงินงวดที่ 2',
    type: 'INFO',
    read: false,
    createdAt: DateTime.now().subtract(const Duration(hours: 2)),
    actionUrl: '/payments',
    actionLabel: 'ชำระเงิน',
  ),
  NotificationItem(
    id: '3',
    title: 'นัดหมายตรวจประเมินสถานที่',
    message:
        'เจ้าหน้าที่จะเข้าตรวจประเมินสถานที่ในวันที่ 20 ธ.ค. 2567 เวลา 10:00 น.',
    type: 'WARNING',
    read: true,
    createdAt: DateTime.now().subtract(const Duration(days: 1)),
    actionUrl: '/tracking',
    actionLabel: 'ดูรายละเอียด',
  ),
];

/// Notifications Screen - Synchronized with Web version
class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  final _storage = const FlutterSecureStorage();
  late DioClient _dioClient;

  bool _isLoading = true;
  List<NotificationItem> _notifications = [];
  String _filter = 'ALL'; // ALL or UNREAD

  @override
  void initState() {
    super.initState();
    _dioClient = DioClient(_storage);
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final response = await _dioClient.get('/v2/notifications');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'] ?? [];
        setState(() {
          _notifications =
              data.map((n) => NotificationItem.fromJson(n)).toList();
          _isLoading = false;
        });
      } else {
        // Fallback to demo
        setState(() {
          _notifications = _demoNotifications;
          _isLoading = false;
        });
      }
    } catch (e) {
      // Use demo data
      setState(() {
        _notifications = _demoNotifications;
        _isLoading = false;
      });
    }
  }

  Future<void> _markAsRead(String id) async {
    try {
      await _dioClient.post('/v2/notifications/$id/read');
    } catch (_) {}

    setState(() {
      _notifications = _notifications
          .map((n) => n.id == id ? n.copyWith(read: true) : n)
          .toList();
    });
  }

  Future<void> _markAllAsRead() async {
    try {
      await _dioClient.post('/v2/notifications/read-all');
    } catch (_) {}

    setState(() {
      _notifications =
          _notifications.map((n) => n.copyWith(read: true)).toList();
    });
  }

  int get _unreadCount => _notifications.where((n) => !n.read).length;

  List<NotificationItem> get _filteredNotifications {
    if (_filter == 'UNREAD') {
      return _notifications.where((n) => !n.read).toList();
    }
    return _notifications;
  }

  // Format time - Same logic as Web version
  String _formatTime(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes} นาทีที่แล้ว';
    if (diff.inHours < 24) return '${diff.inHours} ชั่วโมงที่แล้ว';
    if (diff.inDays < 7) return '${diff.inDays} วันที่แล้ว';
    return '${date.day}/${date.month}';
  }

  // Get type config - Same as Web version
  ({Color color, Color bg, IconData icon}) _getTypeConfig(String type) {
    switch (type) {
      case 'SUCCESS':
        return (
          color: Colors.green,
          bg: Colors.green.withValues(alpha: 0.1),
          icon: Icons.check_circle_outline
        );
      case 'WARNING':
        return (
          color: Colors.orange,
          bg: Colors.orange.withValues(alpha: 0.1),
          icon: Icons.warning_amber_outlined
        );
      case 'DANGER':
        return (
          color: Colors.red,
          bg: Colors.red.withValues(alpha: 0.1),
          icon: Icons.cancel_outlined
        );
      default:
        return (
          color: Colors.blue,
          bg: Colors.blue.withValues(alpha: 0.1),
          icon: Icons.info_outline
        );
    }
  }

  void _handleAction(String? actionUrl) {
    if (actionUrl == null) return;
    // Navigate based on action URL
    if (actionUrl.contains('applications')) {
      context.go('/applications');
    } else if (actionUrl.contains('payments')) {
      context.go('/payments');
    } else if (actionUrl.contains('tracking')) {
      context.go('/tracking');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('การแจ้งเตือน'),
            if (_unreadCount > 0) ...[
              const SizedBox(width: 12),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(
                  '$_unreadCount ใหม่',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (_unreadCount > 0)
            TextButton.icon(
              onPressed: _markAllAsRead,
              icon: const Icon(Icons.done_all, size: 18),
              label: const Text('อ่านทั้งหมด'),
            ),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs - Same as Web
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                _buildFilterChip('ALL', 'ทั้งหมด', _notifications.length),
                const SizedBox(width: 8),
                _buildFilterChip('UNREAD', 'ยังไม่อ่าน', _unreadCount),
              ],
            ),
          ),

          // Notifications List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredNotifications.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        onRefresh: _loadNotifications,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _filteredNotifications.length,
                          itemBuilder: (context, index) =>
                              _buildNotificationCard(
                                  _filteredNotifications[index]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label, int count) {
    final isSelected = _filter == key;
    return GestureDetector(
      onTap: () => setState(() => _filter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color:
              isSelected ? Theme.of(context).primaryColor : Colors.transparent,
          borderRadius: BorderRadius.circular(100),
          border: isSelected
              ? null
              : Border.all(color: Colors.grey.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey[600],
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.2)
                    : Theme.of(context).primaryColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(100),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  color: isSelected
                      ? Colors.white
                      : Theme.of(context).primaryColor,
                  fontSize: 11,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem n) {
    final config = _getTypeConfig(n.type);

    return GestureDetector(
      onTap: () {
        if (!n.read) _markAsRead(n.id);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: n.read ? Theme.of(context).cardColor : config.bg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: n.read
                ? Colors.grey.withValues(alpha: 0.2)
                : config.color.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: config.bg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(config.icon, color: config.color),
            ),
            const SizedBox(width: 16),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            if (!n.read)
                              Container(
                                width: 8,
                                height: 8,
                                margin: const EdgeInsets.only(right: 8),
                                decoration: BoxDecoration(
                                  color: config.color,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            Expanded(
                              child: Text(
                                n.title,
                                style: const TextStyle(
                                    fontSize: 15, fontWeight: FontWeight.w500),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        _formatTime(n.createdAt),
                        style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    n.message,
                    style: TextStyle(
                        fontSize: 13, color: Colors.grey[600], height: 1.5),
                  ),

                  // Action button
                  if (n.actionUrl != null) ...[
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: () => _handleAction(n.actionUrl),
                      icon: const Icon(Icons.arrow_forward, size: 16),
                      label: Text(n.actionLabel ?? 'ดูรายละเอียด'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        textStyle: const TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
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
              Icons.notifications_none,
              size: 40,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            _filter == 'UNREAD'
                ? 'ไม่มีการแจ้งเตือนที่ยังไม่อ่าน'
                : 'ไม่มีการแจ้งเตือน',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Text(
            'เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่',
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }
}
