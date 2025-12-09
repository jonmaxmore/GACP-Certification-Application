import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step3SiteAndScope extends ConsumerWidget {
  const Step3SiteAndScope({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/step2'),
      onNext: () => context.go('/applications/create/step4'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "3. สถานที่และวัตถุประสงค์ (Site & Scope)",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 20),

          // 1. Establishment Selection (Smart One-Stop)
          Card(
            shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.green[300]!),
                borderRadius: BorderRadius.circular(8)),
            color: Colors.green[50]?.withOpacity(0.3),
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("เลือกสถานที่ (Select Establishment)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                    initialValue: state.establishmentId.isNotEmpty
                        ? state.establishmentId
                        : null,
                    hint: const Text("เลือกสถานที่ที่ลงทะเบียนไว้..."),
                    items: const [
                      DropdownMenuItem(
                          value: "mock_farm_a",
                          child: Text("Farm A (Chiang Mai)")),
                      DropdownMenuItem(
                          value: "mock_farm_b",
                          child: Text("Farm B (Sakon Nakhon)")),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        notifier.update('establishmentId', val);
                        // Map ID to Name & Address (Mock Logic)
                        if (val == 'mock_farm_a') {
                          notifier.update(
                              'establishmentName', 'Farm A (Chiang Mai)');
                          notifier.update(
                              'locationAddress', '123 Moo 1, Chiang Mai');
                          notifier.update('lat', '18.7883, 98.9853');
                        } else if (val == 'mock_farm_b') {
                          notifier.update(
                              'establishmentName', 'Farm B (Sakon Nakhon)');
                          notifier.update(
                              'locationAddress', '456 Moo 2, Sakon Nakhon');
                          notifier.update('lat', '17.1612, 104.1488');
                        }
                      }
                    },
                  ),
                  if (state.locationAddress.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Text("ที่อยู่: ${state.locationAddress}",
                        style:
                            TextStyle(color: Colors.grey[700], fontSize: 13)),
                  ]
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 2. Scope Selection
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Text("วัตถุประสงค์ (Scope of Operation)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const Divider(),
                  SwitchListTile(
                    title: const Text("การเพาะปลูก (Cultivation)"),
                    subtitle: const Text("ต้องการขอรับรอง GACP"),
                    value: true, // Always true for this app context currently
                    onChanged: (v) {},
                    activeTrackColor: Colors.green,
                  ),
                  SwitchListTile(
                    title: const Text("การจำหน่าย (Distribution)"),
                    value: state.salesChannels.isNotEmpty,
                    onChanged: (v) {
                      // Dummy logic to simulate toggle. Using salesChannels as proxy for now.
                      if (v) {
                        notifier.toggleSalesChannel("Wholesale", true);
                      } else {
                        notifier.update('salesChannels', []);
                      }
                    },
                    activeTrackColor: Colors.green,
                  ),
                  SwitchListTile(
                    title: const Text("การส่งออก (Export)"),
                    subtitle: const Text("ต้องการหนังสือรับรองเพื่อส่งออก"),
                    value: state.isExportEnabled,
                    onChanged: (v) => notifier.update('isExportEnabled', v),
                    activeTrackColor: Colors.green,
                  ),
                ],
              ),
            ),
          ),

          // 3. Export Details (Context Aware)
          if (state.isExportEnabled) ...[
            const SizedBox(height: 16),
            Card(
              color: Colors.orange[50], // Highlight
              elevation: 0,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(LucideIcons.plane, size: 16, color: Colors.orange),
                        SizedBox(width: 8),
                        Text("ข้อมูลการส่งออก (Export Details)",
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.deepOrange)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    WizardTextInput(
                        "ประเทศปลายทาง (Destination)",
                        state.exportDestination,
                        (v) => notifier.update('exportDestination', v)),
                    WizardTextInput(
                        "วิธีการขนส่ง (Transport Method)",
                        state.transportMethod,
                        (v) => notifier.update('transportMethod', v)),
                  ],
                ),
              ),
            )
          ]
        ],
      ),
    );
  }
}
