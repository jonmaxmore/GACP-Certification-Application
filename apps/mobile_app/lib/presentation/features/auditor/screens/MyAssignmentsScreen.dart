import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

class MyAssignmentsScreen extends ConsumerStatefulWidget {
  const MyAssignmentsScreen({super.key});

  @override
  ConsumerState<MyAssignmentsScreen> createState() => _MyAssignmentsScreenState();
}

class _MyAssignmentsScreenState extends ConsumerState<MyAssignmentsScreen> {
  // Mock data
  final List<Map<String, dynamic>> _assignments = [
    {
      'id': '1',
      'appNo': 'GACP-2023-001',
      'farmer': 'Somchai Farmer',
      'location': 'Mae Rim, Chiang Mai',
      'status': 'Assigned',
      'date': '2023-10-25',
    },
    {
      'id': '2',
      'appNo': 'GACP-2023-005',
      'farmer': 'Mana Organic',
      'location': 'Fang, Chiang Mai',
      'status': 'In Progress',
      'date': '2023-10-26',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Assignments'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.filter),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _assignments.length,
        itemBuilder: (context, index) {
          final job = _assignments[index];
          final isStarted = job['status'] == 'In Progress';

          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        job['appNo'],
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isStarted ? Colors.blue.withValues(alpha: 0.1) : Colors.orange.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          job['status'],
                          style: TextStyle(
                            color: isStarted ? Colors.blue : Colors.orange,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(LucideIcons.user, size: 16, color: Colors.grey),
                      const SizedBox(width: 8),
                      Text(job['farmer']),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(LucideIcons.mapPin, size: 16, color: Colors.grey),
                      const SizedBox(width: 8),
                      Text(job['location']),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(LucideIcons.calendar, size: 16, color: Colors.grey),
                      const SizedBox(width: 8),
                      Text('Due: ${job['date']}'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            // View details
                          },
                          child: const Text('View Details'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            if (isStarted) {
                              context.push('/auditor/inspection/${job['id']}');
                            } else {
                              // Accept job logic
                              setState(() {
                                job['status'] = 'In Progress';
                              });
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isStarted ? Colors.blue : Colors.green,
                            foregroundColor: Colors.white,
                          ),
                          child: Text(isStarted ? 'Continue' : 'Accept Job'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
