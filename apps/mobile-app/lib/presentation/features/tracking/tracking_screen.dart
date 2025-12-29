import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/dio_client.dart';

/// Application Tracking Status
class TrackingStep {
  final String id;
  final String title;
  final String description;
  final String status; // COMPLETED, CURRENT, PENDING
  final DateTime? completedAt;
  final String? note;

  TrackingStep({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    this.completedAt,
    this.note,
  });

  bool get isCompleted => status == 'COMPLETED';
  bool get isCurrent => status == 'CURRENT';
  bool get isPending => status == 'PENDING';
}

/// Application Tracking
class ApplicationTracking {
  final String applicationId;
  final String applicationNumber;
  final String establishmentName;
  final String currentStatus;
  final List<TrackingStep> steps;

  ApplicationTracking({
    required this.applicationId,
    required this.applicationNumber,
    required this.establishmentName,
    required this.currentStatus,
    required this.steps,
  });

  int get completedSteps => steps.where((s) => s.isCompleted).length;
  double get progress => steps.isEmpty ? 0 : completedSteps / steps.length;
}

/// Demo tracking data
final _demoTracking = ApplicationTracking(
  applicationId: 'APP-2024-001',
  applicationNumber: 'APP-2024-001',
  establishmentName: 'สวนเกษตรอินทรีย์สุขภาพดี',
  currentStatus: 'DOCUMENT_REVIEW',
  steps: [
    TrackingStep(
      id: '1',
      title: 'ยื่นคำขอ',
      description: 'ส่งคำขอรับรองมาตรฐาน GACP เรียบร้อยแล้ว',
      status: 'COMPLETED',
      completedAt: DateTime.now().subtract(const Duration(days: 30)),
    ),
    TrackingStep(
      id: '2',
      title: 'ชำระเงินงวดที่ 1',
      description: 'ชำระค่าธรรมเนียมการยื่นคำขอ 50%',
      status: 'COMPLETED',
      completedAt: DateTime.now().subtract(const Duration(days: 28)),
    ),
    TrackingStep(
      id: '3',
      title: 'ตรวจสอบเอกสาร',
      description: 'เจ้าหน้าที่กำลังตรวจสอบเอกสารประกอบคำขอ',
      status: 'CURRENT',
      note: 'อยู่ระหว่างดำเนินการ คาดว่าจะแล้วเสร็จภายใน 3-5 วันทำการ',
    ),
    TrackingStep(
      id: '4',
      title: 'ชำระเงินงวดที่ 2',
      description: 'ชำระค่าธรรมเนียมส่วนที่เหลือ 50%',
      status: 'PENDING',
    ),
    TrackingStep(
      id: '5',
      title: 'นัดหมายตรวจประเมิน',
      description: 'กำหนดวันเข้าตรวจประเมินสถานประกอบการ',
      status: 'PENDING',
    ),
    TrackingStep(
      id: '6',
      title: 'ตรวจประเมินสถานที่',
      description: 'เจ้าหน้าที่เข้าตรวจประเมินสถานประกอบการ',
      status: 'PENDING',
    ),
    TrackingStep(
      id: '7',
      title: 'พิจารณาผลการตรวจ',
      description: 'คณะกรรมการพิจารณาผลการตรวจประเมิน',
      status: 'PENDING',
    ),
    TrackingStep(
      id: '8',
      title: 'ออกใบรับรอง',
      description: 'ได้รับใบรับรองมาตรฐาน GACP',
      status: 'PENDING',
    ),
  ],
);

/// Tracking Screen - Synchronized with Web version
class TrackingScreen extends ConsumerStatefulWidget {
  const TrackingScreen({super.key});

  @override
  ConsumerState<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends ConsumerState<TrackingScreen> {
  final _storage = const FlutterSecureStorage();
  late DioClient _dioClient;

  bool _isLoading = true;
  ApplicationTracking? _tracking;

  @override
  void initState() {
    super.initState();
    _dioClient = DioClient(_storage);
    _loadTracking();
  }

  Future<void> _loadTracking() async {
    setState(() => _isLoading = true);
    try {
      final response = await _dioClient.get('/v2/applications/tracking');
      if (response.statusCode == 200 && response.data['success'] == true) {
        // Parse real data
        setState(() {
          _tracking = _demoTracking; // For now use demo
          _isLoading = false;
        });
      } else {
        setState(() {
          _tracking = _demoTracking;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _tracking = _demoTracking;
        _isLoading = false;
      });
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ติดตามสถานะ'),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _tracking == null
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _loadTracking,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Application info card
                        _buildApplicationCard(),
                        const SizedBox(height: 24),

                        // Progress
                        _buildProgressSection(),
                        const SizedBox(height: 24),

                        // Timeline
                        _buildTimeline(),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildApplicationCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).primaryColor,
            Theme.of(context).primaryColor.withValues(alpha: 0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.article, color: Colors.white),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _tracking!.applicationNumber,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _tracking!.establishmentName,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(100),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.schedule,
                    size: 16, color: Colors.white.withValues(alpha: 0.9)),
                const SizedBox(width: 8),
                Text(
                  'กำลังตรวจสอบเอกสาร',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.9),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressSection() {
    final progress = _tracking!.progress;
    final completed = _tracking!.completedSteps;
    final total = _tracking!.steps.length;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'ความคืบหน้า',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              Text(
                '$completed/$total ขั้นตอน',
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 10,
              backgroundColor: Colors.grey.withValues(alpha: 0.2),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${(progress * 100).toInt()}% เสร็จสิ้น',
            style: TextStyle(
              fontSize: 13,
              color: Theme.of(context).primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeline() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'ขั้นตอนการดำเนินการ',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 20),
          ..._tracking!.steps.asMap().entries.map((entry) {
            final index = entry.key;
            final step = entry.value;
            final isLast = index == _tracking!.steps.length - 1;
            return _buildTimelineItem(step, isLast);
          }),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(TrackingStep step, bool isLast) {
    Color color;
    IconData icon;

    if (step.isCompleted) {
      color = Colors.green;
      icon = Icons.check_circle;
    } else if (step.isCurrent) {
      color = Theme.of(context).primaryColor;
      icon = Icons.radio_button_checked;
    } else {
      color = Colors.grey;
      icon = Icons.radio_button_unchecked;
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline indicator
          Column(
            children: [
              Icon(icon, color: color, size: 24),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: step.isCompleted
                        ? Colors.green.withValues(alpha: 0.3)
                        : Colors.grey.withValues(alpha: 0.2),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),

          // Content
          Expanded(
            child: Container(
              margin: EdgeInsets.only(bottom: isLast ? 0 : 24),
              padding:
                  step.isCurrent ? const EdgeInsets.all(16) : EdgeInsets.zero,
              decoration: step.isCurrent
                  ? BoxDecoration(
                      color: Theme.of(context)
                          .primaryColor
                          .withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: Theme.of(context)
                              .primaryColor
                              .withValues(alpha: 0.2)),
                    )
                  : null,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        step.title,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: step.isPending ? Colors.grey : null,
                        ),
                      ),
                      if (step.completedAt != null)
                        Text(
                          _formatDate(step.completedAt),
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey[500]),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    step.description,
                    style: TextStyle(
                      fontSize: 13,
                      color:
                          step.isPending ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                  if (step.note != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline,
                              size: 16, color: Colors.orange),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              step.note!,
                              style: const TextStyle(
                                  fontSize: 12, color: Colors.orange),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
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
              Icons.explore,
              size: 40,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'ยังไม่มีคำขอที่ติดตามได้',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Text(
            'ยื่นคำขอรับรองเพื่อติดตามสถานะ',
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }
}
