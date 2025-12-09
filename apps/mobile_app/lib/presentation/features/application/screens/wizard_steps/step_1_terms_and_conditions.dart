import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/form_state_provider.dart';
import 'wizard_common.dart';

class Step1Terms extends ConsumerStatefulWidget {
  final String? applicationId;
  const Step1Terms({super.key, this.applicationId});

  @override
  ConsumerState<Step1Terms> createState() => _Step1TermsState();
}

class _Step1TermsState extends ConsumerState<Step1Terms> {
  bool _accepted = false;

  @override
  void initState() {
    super.initState();
    if (widget.applicationId != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref
            .read(applicationFormProvider.notifier)
            .loadApplication(widget.applicationId!);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return WizardScaffold(
      onNext: _accepted ? () => context.go('/applications/create/step2') : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "ข้อตกลงและเงื่อนไข (Terms & Conditions)",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 10),
          Container(
            height: 300,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
              color: Colors.grey[50],
            ),
            child: const SingleChildScrollView(
              child: Text("""
1. ข้าพเจ้ายินยอมให้ข้อมูลส่วนบุคคลเพื่อการดำเนินการขอรับรอง GACP
2. ข้าพเจ้ารับรองว่าข้อมูลที่ให้เป็นความจริงทุกประการ
3. หากตรวจพบว่าข้อมูลเป็นเท็จ การคำขอจะถูกยกเลิกทันที
4. ข้าพเจ้าเข้าใจว่าการชำระเงินค่าธรรมเนียมไม่สามารถขอคืนได้
...
(รายละเอียดเพิ่มเติมตามกฎหมาย)
                """, style: TextStyle(height: 1.5)),
            ),
          ),
          const SizedBox(height: 20),
          CheckboxListTile(
            value: _accepted,
            onChanged: (val) {
              setState(() {
                _accepted = val ?? false;
              });
            },
            title: const Text("ข้าพเจ้าได้อ่านและยอมรับเงื่อนไขข้างต้น"),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
            activeColor: Colors.green,
          ),
        ],
      ),
    );
  }
}
