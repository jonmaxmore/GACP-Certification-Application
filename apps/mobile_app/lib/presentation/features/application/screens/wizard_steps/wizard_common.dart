import 'package:flutter/material.dart';

import '../../providers/form_state_provider.dart';

// Common Widgets for Wizard Steps

class WizardScaffold extends StatelessWidget {
  final Widget child;
  final VoidCallback? onBack;
  final VoidCallback? onNext;
  final String nextLabel;

  const WizardScaffold(
      {super.key,
      required this.child,
      this.onBack,
      this.onNext,
      this.nextLabel = "ถัดไป"});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          child,
          const SizedBox(height: 30),
          Row(
            children: [
              if (onBack != null)
                Expanded(
                    child: OutlinedButton(
                        onPressed: onBack, child: const Text("ย้อนกลับ"))),
              if (onBack != null && onNext != null) const SizedBox(width: 16),
              if (onNext != null)
                Expanded(
                    child: FilledButton(
                        onPressed: onNext, child: Text(nextLabel))),
            ],
          ),
          const SizedBox(height: 50),
        ],
      ),
    );
  }
}

class WizardTextInput extends StatelessWidget {
  final String label;
  final String? value;
  final Function(String) onChanged;
  final int maxLines;

  const WizardTextInput(this.label, this.value, this.onChanged,
      {super.key, this.maxLines = 1});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        initialValue: value,
        maxLines: maxLines,
        decoration: InputDecoration(
            labelText: label, border: const OutlineInputBorder()),
        onChanged: onChanged,
      ),
    );
  }
}

class WizardRadioTile extends StatelessWidget {
  final String title;
  final String value;
  final String? groupValue;
  final Function(String) onChanged;

  const WizardRadioTile(this.title, this.value, this.groupValue, this.onChanged,
      {super.key});

  @override
  Widget build(BuildContext context) {
    return RadioListTile<String>(
      title: Text(title),
      value: value,
      groupValue: groupValue,
      onChanged: (v) => onChanged(v!),
      dense: true,
      contentPadding: EdgeInsets.zero,
    );
  }
}

class WizardDocTile extends StatelessWidget {
  final String title;
  final String keyName;
  final ApplicationFormState state;
  final Function(String) onTap;

  const WizardDocTile(this.title, this.keyName, this.state, this.onTap,
      {super.key});

  @override
  Widget build(BuildContext context) {
    // state.attachments is Map<String, File>
    final file = state.attachments[keyName];
    return Card(
      child: ListTile(
        leading: Icon(file != null ? Icons.check_circle : Icons.cloud_upload,
            color: file != null ? Colors.green : Colors.grey),
        title: Text(title, style: const TextStyle(fontSize: 14)),
        subtitle: file != null
            ? const Text("แนบแล้ว", style: TextStyle(color: Colors.green))
            : null,
        onTap: () => onTap(keyName),
      ),
    );
  }
}

class WizardSummaryRow extends StatelessWidget {
  final String label;
  final String? value;
  const WizardSummaryRow(this.label, this.value, {super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value ?? "-",
              style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
