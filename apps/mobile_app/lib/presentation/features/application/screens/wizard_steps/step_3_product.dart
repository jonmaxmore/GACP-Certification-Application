import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step3Product extends ConsumerWidget {
  const Step3Product({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(applicationFormProvider.notifier);
    final state = ref.watch(applicationFormProvider);

    return WizardScaffold(
      onBack: () => context.go('/applications/create/objective'),
      onNext: () => context.go('/applications/create/standard'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("ประเภทการดำเนินการ",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          WizardRadioTile('การผลิต (ปลูก) และเก็บเกี่ยว', 'production',
              state.processType, (v) => notifier.update('processType', v)),
          WizardRadioTile('การแปรรูป', 'processing', state.processType,
              (v) => notifier.update('processType', v)),
          const Divider(),
          const Text("ส่วนของพืชที่ใช้",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          WizardRadioTile('เมล็ด', 'seed', state.plantPart,
              (v) => notifier.update('plantPart', v)),
          WizardRadioTile('ส่วนอื่นที่ไม่ใช่เมล็ด', 'other', state.plantPart,
              (v) => notifier.update('plantPart', v)),
          WizardRadioTile('ผลิตภัณฑ์แปรรูป', 'product', state.plantPart,
              (v) => notifier.update('plantPart', v)),
          const Divider(),
          WizardTextInput('ชื่อสายพันธุ์', state.strainName,
              (v) => notifier.update('strainName', v)),
          const SizedBox(height: 10),
          const Text("แหล่งที่มา",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          WizardRadioTile('ในประเทศ', 'domestic', state.sourceOrigin,
              (v) => notifier.update('sourceOrigin', v)),
          WizardRadioTile('นำเข้า', 'import', state.sourceOrigin,
              (v) => notifier.update('sourceOrigin', v)),
          WizardTextInput('ระบุแหล่งที่มา (ชื่อบริษัท/ประเทศ)',
              state.sourceName, (v) => notifier.update('sourceName', v)),
          WizardTextInput('ปริมาณ (ระบุหน่วย)', state.quantity,
              (v) => notifier.update('quantity', v)),
        ],
      ),
    );
  }
}
