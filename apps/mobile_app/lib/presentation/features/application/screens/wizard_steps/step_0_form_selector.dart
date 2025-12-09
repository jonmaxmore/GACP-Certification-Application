import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step0FormSelector extends ConsumerWidget {
  const Step0FormSelector({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(applicationFormProvider.notifier);
    final state = ref.watch(applicationFormProvider);

    return WizardScaffold(
      onNext: () => context.go('/applications/create/applicant-info'),
      child: Column(
        children: [
          const Text("เลือกประเภทแบบฟอร์ม",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          WizardRadioTile('กทล. 1: ขอรับรองแหล่งผลิต (GACP)', 'ktl1',
              state.formType, (v) => notifier.update('formType', v)),
          WizardRadioTile('ภ.ท. 9: ขออนุญาตวิจัย', 'pt09', state.formType,
              (v) => notifier.update('formType', v)),
          WizardRadioTile('ภ.ท. 10: ขออนุญาตส่งออก', 'pt10', state.formType,
              (v) => notifier.update('formType', v)),
          WizardRadioTile('ภ.ท. 11: ขออนุญาตจำหน่าย', 'pt11', state.formType,
              (v) => notifier.update('formType', v)),
          const Divider(height: 30),
          const Text("ประเภทคำขอ",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),
          WizardRadioTile('ขอใหม่ (New)', 'new', state.requestCategory,
              (v) => notifier.update('requestCategory', v)),
          WizardRadioTile('ต่ออายุ (Renew)', 'renew', state.requestCategory,
              (v) => notifier.update('requestCategory', v)),
        ],
      ),
    );
  }
}
