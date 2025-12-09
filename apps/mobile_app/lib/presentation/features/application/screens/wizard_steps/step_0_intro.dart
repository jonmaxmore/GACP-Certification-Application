import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import '../../models/gacp_application_models.dart';

class Step0PlantSelection extends ConsumerWidget {
  const Step0PlantSelection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(applicationFormProvider.notifier);

    // Master Spec: 6 Plants
    final plants = plantConfigs.values.toList();

    return Scaffold(
      appBar: AppBar(title: const Text("เลือกพืชที่ขอรับรอง (Select Plant)")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text(
              "กรุณาเลือกพืชที่ท่านต้องการขอรับรอง GACP",
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.85,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: plants.length,
                itemBuilder: (context, index) {
                  final plant = plants[index];
                  return _PlantCard(
                    plant: plant,
                    onTap: () {
                      notifier.setPlant(plant.id);
                      context.go('/applications/create/step1');
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlantCard extends StatelessWidget {
  final PlantConfig plant;
  final VoidCallback onTap;

  const _PlantCard({required this.plant, required this.onTap});

  @override
  Widget build(BuildContext context) {
    // Determine Color/Icon based on Group
    final isHighControl = plant.group == PlantGroup.highControl;
    final color = isHighControl ? Colors.teal : Colors.orange;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 35,
              backgroundColor: color.withOpacity(0.2),
              child: Icon(isHighControl ? Icons.security : Icons.spa,
                  color: color, size: 35),
            ),
            const SizedBox(height: 12),
            Text(plant.nameTH,
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Text(plant.nameEN, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                  color: isHighControl
                      ? Colors.red.shade100
                      : Colors.green.shade100,
                  borderRadius: BorderRadius.circular(4)),
              child: Text(
                isHighControl
                    ? "ควบคุมพิเศษ (High)"
                    : "สมุนไพรทั่วไป (General)",
                style: TextStyle(
                    fontSize: 10,
                    color: isHighControl
                        ? Colors.red.shade900
                        : Colors.green.shade900),
              ),
            )
          ],
        ),
      ),
    );
  }
}
