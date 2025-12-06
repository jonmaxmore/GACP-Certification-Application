import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class TaskQueueScreen extends ConsumerStatefulWidget {
  const TaskQueueScreen({super.key});

  @override
  ConsumerState<TaskQueueScreen> createState() => _TaskQueueScreenState();
}

class _TaskQueueScreenState extends ConsumerState<TaskQueueScreen> {
  // Mock data for now
  final List<Map<String, dynamic>> _tasks = [
    {
      'id': '1',
      'appNo': 'GACP-2023-001',
      'farmer': 'Somchai Farmer',
      'province': 'Chiang Mai',
      'status': 'Pending Review',
    },
    {
      'id': '2',
      'appNo': 'GACP-2023-002',
      'farmer': 'Somsri Grower',
      'province': 'Chiang Rai',
      'status': 'Pending Inspection',
    },
  ];

  void _showAssignDialog(BuildContext context, Map<String, dynamic> task) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Assign Auditor for ${task['appNo']}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Select an auditor based on expertise:'),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Auditor',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'auditor1', child: Text('Auditor A (Chiang Mai)')),
                DropdownMenuItem(value: 'auditor2', child: Text('Auditor B (Chiang Rai)')),
              ],
              onChanged: (value) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement assignment logic
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Job assigned successfully')),
              );
            },
            child: const Text('Assign'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Task Queue',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Card(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  columns: const [
                    DataColumn(label: Text('Application No.')),
                    DataColumn(label: Text('Farmer')),
                    DataColumn(label: Text('Province')),
                    DataColumn(label: Text('Status')),
                    DataColumn(label: Text('Action')),
                  ],
                  rows: _tasks.map((task) {
                    return DataRow(cells: [
                      DataCell(Text(task['appNo'])),
                      DataCell(Text(task['farmer'])),
                      DataCell(Text(task['province'])),
                      DataCell(
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.orange.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.orange),
                          ),
                          child: Text(
                            task['status'],
                            style: const TextStyle(color: Colors.orange, fontSize: 12),
                          ),
                        ),
                      ),
                      DataCell(
                        ElevatedButton(
                          onPressed: () => _showAssignDialog(context, task),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                          ),
                          child: const Text('Assign'),
                        ),
                      ),
                    ]);
                  }).toList(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
