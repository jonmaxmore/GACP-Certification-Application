import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

class ApplicationTypeSelectionScreen extends StatelessWidget {
  const ApplicationTypeSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Select Application Type')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildTypeCard(
            context,
            title: 'Cultivation / Production (Form 9)',
            description: 'For cultivation businesses and producers requesting permission to grow or produce controlled herbs.',
            icon: LucideIcons.sprout,
            color: Colors.green,
            type: 'GACP_FORM_9',
          ),
          const SizedBox(height: 16),
          _buildTypeCard(
            context,
            title: 'Sale / Distribution (Form 10)',
            description: 'For dispensing outlets, clinics, or businesses requesting permission to sell controlled herbs.',
            icon: LucideIcons.store,
            color: Colors.blue,
            type: 'GACP_FORM_10',
          ),
          const SizedBox(height: 16),
          _buildTypeCard(
            context,
            title: 'Import / Export (Form 11)',
            description: 'For import/export enterprises requesting permission to trade controlled herbs internationally.',
            icon: LucideIcons.container,
            color: Colors.orange,
            type: 'GACP_FORM_11',
          ),
        ],
      ),
    );
  }

  Widget _buildTypeCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Color color,
    required String type,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          // Navigate to form with type parameter
          context.push('/applications/new/$type');
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
