import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Tracking Timeline', type: ApplicationTrackingScreen)
Widget trackingTimelineUseCase(BuildContext context) {
  return const ApplicationTrackingScreen();
}

class ApplicationTrackingScreen extends ConsumerWidget {
  const ApplicationTrackingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Mock Data
    const trackingData = {
      'appId': 'APP-2024-00129',
      'status': 'REVIEWING', // SUBMITTED, REVIEWING, INSPECTING, APPROVED
      'currentStep': 2, // 1-based index
      'officer': {
        'name': 'ภก. วิชัย ใจดี',
        'position': 'เจ้าหน้าที่ตรวจเอกสาร (Document Reviewer)',
        'phone': '02-590-7000 ต่อ 123',
        'avatar': 'assets/images/officer_avatar.png'
      },
      'history': [
        {
          'title': 'ยื่นคำขอสำเร็จ (Submitted)',
          'date': '10 ธ.ค. 2567 09:30',
          'isCompleted': true,
          'description': 'ระบบได้รับคำขอของท่านเรียบร้อยแล้ว'
        },
        {
          'title': 'ชำระค่าธรรมเนียมคำขอ (Payment)',
          'date': '10 ธ.ค. 2567 09:35',
          'isCompleted': true,
          'description': 'ชำระเงินเรียบร้อยแล้ว (Phase 1)'
        },
        {
          'title': 'ตรวจสอบเอกสาร (Document Review)',
          'date': 'กำลังดำเนิการ...',
          'isCompleted': false,
          'isCurrent': true,
          'description': 'เจ้าหน้าที่กำลังตรวจสอบความถูกต้องของเอกสาร'
        },
        {
          'title': 'ลงพื้นที่ตรวจประเมิน (Site Inspection)',
          'date': '',
          'isCompleted': false,
          'description': 'นัดหมายลงพื้นที่หลังเอกสารผ่าน'
        },
        {
          'title': 'อนุมัติใบรับรอง (Approval)',
          'date': '',
          'isCompleted': false,
          'description': 'ออกใบรับรอง GACP'
        }
      ]
    };

    final steps = trackingData['history'] as List<Map<String, dynamic>>;
    final officer = trackingData['officer'] as Map<String, String>;

    return Scaffold(
      appBar: AppBar(
        title: const Text('ติดตามสถานะ (Tracking)'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Application Header Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2563EB), Color(0xFF1E40AF)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.blue.withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4))
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('เลขที่คำขอ (Application No.)',
                        style: TextStyle(color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(trackingData['appId'].toString(),
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20)),
                          child: const Row(
                            children: [
                              Icon(LucideIcons.loader,
                                  color: Colors.white, size: 16),
                              SizedBox(width: 6),
                              Text('กำลังดำเนินการ (In Progress)',
                                  style: TextStyle(
                                      color: Colors.white, fontSize: 13)),
                            ],
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 2. Timeline
              const Text('ไทม์ไลน์การดำเนินการ (Timeline)',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              ListView.builder(
                physics: const NeverScrollableScrollPhysics(),
                shrinkWrap: true,
                itemCount: steps.length,
                itemBuilder: (context, index) {
                  final step = steps[index];
                  final isCompleted = step['isCompleted'] as bool;
                  final isCurrent = step['isCurrent'] ?? false;
                  final isLast = index == steps.length - 1;

                  return IntrinsicHeight(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Line Column
                        SizedBox(
                          width: 40,
                          child: Column(
                            children: [
                              Container(
                                width: 20,
                                height: 20,
                                decoration: BoxDecoration(
                                  color: isCompleted
                                      ? Colors.green
                                      : (isCurrent
                                          ? Colors.blue
                                          : Colors.grey[300]),
                                  shape: BoxShape.circle,
                                  border: isCurrent
                                      ? Border.all(
                                          color: Colors.blue[100]!, width: 4)
                                      : null,
                                ),
                                child: isCompleted
                                    ? const Icon(Icons.check,
                                        size: 12, color: Colors.white)
                                    : null,
                              ),
                              if (!isLast)
                                Expanded(
                                  child: Container(
                                    width: 2,
                                    color: isCompleted
                                        ? Colors.green
                                        : Colors.grey[300],
                                  ),
                                ),
                            ],
                          ),
                        ),
                        // Content Column
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(bottom: 24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  step['title'],
                                  style: TextStyle(
                                    fontWeight: isCurrent || isCompleted
                                        ? FontWeight.bold
                                        : FontWeight.normal,
                                    color: isCurrent || isCompleted
                                        ? Colors.black87
                                        : Colors.grey,
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(step['description'],
                                    style: TextStyle(
                                        color: Colors.grey[600], fontSize: 13)),
                                if (step['date'] != '') ...[
                                  const SizedBox(height: 4),
                                  Text(step['date'],
                                      style: TextStyle(
                                          color: Colors.grey[500],
                                          fontSize: 12)),
                                ]
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              const SizedBox(height: 8),
              // 3. Officer Info Card (Only if assigned)
              if (trackingData['status'] != 'SUBMITTED') ...[
                const Text('เจ้าหน้าที่ผู้รับผิดชอบ (Assigned Officer)',
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                    boxShadow: [
                      BoxShadow(
                          color: Colors.grey.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4))
                    ],
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.blue[50],
                        child: const Icon(LucideIcons.userCheck,
                            color: Colors.blue),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(officer['name']!,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 16)),
                            Text(officer['position']!,
                                style: TextStyle(
                                    color: Colors.grey[600], fontSize: 13)),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () {}, // Call
                        icon:
                            const Icon(LucideIcons.phone, color: Colors.green),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
