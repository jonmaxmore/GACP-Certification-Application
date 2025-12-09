import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step2Composite extends ConsumerWidget {
  const Step2Composite({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/step1'),
      onNext: () => context.go('/applications/create/step3'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("2. ข้อมูลการจำหน่าย (ภ.ท.11)",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const Text("Distribution Details",
              style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),
          Card(
            shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8)),
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  WizardTextInput(
                      "รายละเอียดผลิตภัณฑ์ (Product Description)",
                      state.productDescription,
                      (v) => notifier.update('productDescription', v),
                      maxLines: 3),
                  const SizedBox(height: 16),
                  const Text("ช่องทางการจำหน่าย (Sales Channels)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  _buildCheckbox(notifier, state.salesChannels, "Online"),
                  _buildCheckbox(
                      notifier, state.salesChannels, "Retail Store (หน้าร้าน)"),
                  _buildCheckbox(
                      notifier, state.salesChannels, "Wholesale (ค้าส่ง)"),
                  _buildCheckbox(
                      notifier, state.salesChannels, "Direct Sales (ขายตรง)"),
                  _buildCheckbox(
                      notifier, state.salesChannels, "Other (อื่นๆ)"),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckbox(ApplicationFormNotifier notifier,
      List<String> currentList, String label) {
    final isChecked = currentList.contains(label);
    return CheckboxListTile(
      title: Text(label),
      value: isChecked,
      onChanged: (bool? value) {
        notifier.toggleSalesChannel(label, value ?? false);
      },
      controlAffinity: ListTileControlAffinity.leading,
      dense: true,
      contentPadding: EdgeInsets.zero,
      activeColor: Colors.green,
    );
  }
}
