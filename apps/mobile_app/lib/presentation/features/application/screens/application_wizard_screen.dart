import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

class ApplicationWizardScreen extends StatelessWidget {
  final Widget child;
  final GoRouterState state;

  const ApplicationWizardScreen(
      {super.key, required this.child, required this.state});

  @override
  Widget build(BuildContext context) {
    final currentStep = _getCurrentStep(state.uri.toString());

    return Scaffold(
      backgroundColor: Colors.grey[50], // Clean background
      appBar: AppBar(
        title: const Text('ยื่นคำขอรวม (Composite License)',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.x, color: Colors.black),
          onPressed: () => context.go('/applications'),
        ),
      ),
      body: Column(
        children: [
          // Custom Progress Header
          _buildProgressHeader(currentStep),
          const Divider(height: 1),
          // Expanded Body
          Expanded(child: child),
        ],
      ),
    );
  }

  int _getCurrentStep(String path) {
    if (path.contains('/step1')) return 0;
    if (path.contains('/step2')) return 1;
    if (path.contains('/step3')) return 2;
    if (path.contains('/step4')) return 3;
    if (path.contains('/step5')) return 4;
    if (path.contains('/step6')) return 5;
    return 0;
  }

  Widget _buildProgressHeader(int currentStep) {
    final steps = [
      {'icon': LucideIcons.sprout, 'label': 'Cultivation'}, // PT.09
      {'icon': LucideIcons.store, 'label': 'Distribution'}, // PT.11
      {'icon': LucideIcons.plane, 'label': 'Export'}, // PT.10
      {'icon': LucideIcons.factory, 'label': 'Facility'}, // KTL.1
      {'icon': LucideIcons.fileText, 'label': 'Evidence'},
      {'icon': LucideIcons.checkCircle, 'label': 'Review'},
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: List.generate(steps.length, (index) {
          final isCompleted = index < currentStep;
          final isCurrent = index == currentStep;
          final color =
              isCurrent || isCompleted ? Colors.green : Colors.grey[300];
          final iconData = steps[index]['icon'] as IconData;

          return Column(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isCurrent
                      ? Colors.green.withOpacity(0.1)
                      : Colors.transparent,
                  border: Border.all(
                      color: isCurrent || isCompleted
                          ? Colors.green
                          : Colors.grey[300]!,
                      width: 2),
                ),
                child: Center(
                  child: Icon(
                    isCompleted ? LucideIcons.check : iconData,
                    size: 20,
                    color: isCurrent || isCompleted
                        ? Colors.green
                        : Colors.grey[400],
                  ),
                ),
              ),
              const SizedBox(height: 4),
              if (isCurrent) // Only show label for current step to keep it clean? Or all? User said "Icons small".
                Text(
                  steps[index]['label'] as String,
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.green),
                ),
            ],
          );
        }),
      ),
    );
  }
}
