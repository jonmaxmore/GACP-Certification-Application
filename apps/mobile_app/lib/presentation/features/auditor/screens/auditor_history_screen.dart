import 'package:flutter/material.dart';

class AuditorHistoryScreen extends StatelessWidget {
  const AuditorHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ประวัติการตรวจสอบ (History)')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('ยังไม่มีประวัติการตรวจสอบ',
                style: TextStyle(fontSize: 18, color: Colors.grey)),
            Text('(No Inspection History)',
                style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
