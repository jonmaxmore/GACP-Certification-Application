import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step1Composite extends ConsumerWidget {
  const Step1Composite({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(applicationFormProvider);
    final notifier = ref.read(applicationFormProvider.notifier);

    return WizardScaffold(
      onNext: () => context.go('/applications/create/step2'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("1. ข้อมูลการเพาะปลูก (ภ.ท.09)",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const Text("Cultivation Details",
              style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),

          // Card 1: Applicant Info (Short)
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
                  const Text("ข้อมูลผู้ขอ (Applicant)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  WizardTextInput(
                      "ชื่อ-สกุล / นิติบุคคล (Name)",
                      state.entityName,
                      (v) => notifier.update('entityName', v)),
                  WizardTextInput("เลขบัตรประชาชน / นิติบุคคล (ID)",
                      state.idCard, (v) => notifier.update('idCard', v)),
                  WizardTextInput("เบอร์โทรศัพท์ (Phone)", state.phone,
                      (v) => notifier.update('phone', v)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Card 2: Cultivation (Strain & Quantity)
          Card(
            shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.green[200]!),
                borderRadius: BorderRadius.circular(8)),
            color: Colors.green[50]?.withOpacity(0.5),
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("รายละเอียดสายพันธุ์ (Strain)",
                      style: TextStyle(
                          fontWeight: FontWeight.bold, color: Colors.green)),
                  const SizedBox(height: 10),
                  WizardTextInput(
                      "ชื่อสายพันธุ์ (Strain Name)",
                      state.strainName,
                      (v) => notifier.update('strainName', v)),
                  WizardTextInput("จำนวนต้น (Quantity)", state.quantity,
                      (v) => notifier.update('quantity', v)),
                  const SizedBox(height: 10),
                  const Text("วัตถุประสงค์ (Objective)",
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  WizardRadioTile("เพื่อการแพทย์ (Medical)", "medical",
                      state.objective, (v) => notifier.update('objective', v)),
                  WizardRadioTile(
                      "เพื่อการค้า/ส่งออก (Commercial/Export)",
                      "export",
                      state.objective,
                      (v) => notifier.update('objective', v)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
