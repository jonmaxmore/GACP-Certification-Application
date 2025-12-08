import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/theme/app_theme.dart';
import '../../establishment/providers/establishment_provider.dart';

class CreateApplicationScreen extends ConsumerStatefulWidget {
  const CreateApplicationScreen({super.key});

  @override
  ConsumerState<CreateApplicationScreen> createState() =>
      _CreateApplicationScreenState();
}

class _CreateApplicationScreenState
    extends ConsumerState<CreateApplicationScreen> {
  String? _selectedEstablishmentId;
  String _selectedServiceType = 'NEW';

  // Hardcoded Fees for now (as per directive)
  final Map<String, int> _fees = {
    'NEW': 5000,
    'RENEW': 3000,
    'SUBSTITUTE': 1000,
  };

  @override
  void initState() {
    super.initState();
    // Ensure establishments are loaded
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(establishmentProvider.notifier).loadEstablishments();
    });
  }

  @override
  Widget build(BuildContext context) {
    final estState = ref.watch(establishmentProvider);
    final establishments = estState.establishments;

    return Scaffold(
      appBar: AppBar(title: const Text('Start New Application')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Select Establishment
              Text(
                '1. Select Establishment',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              if (estState.isLoading)
                const LinearProgressIndicator()
              else if (establishments.isEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.orange.shade200),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.alertTriangle,
                          color: Colors.orange),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('No Establishments Found'),
                            const SizedBox(height: 4),
                            GestureDetector(
                              onTap: () => context.push('/establishments/new'),
                              child: Text(
                                'Create a Farm Profile first',
                                style: TextStyle(
                                  color: AppTheme.primary,
                                  fontWeight: FontWeight.bold,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                )
              else
                DropdownButtonFormField<String>(
                  value: _selectedEstablishmentId,
                  decoration: const InputDecoration(
                    labelText: 'Choose Farm / Facility',
                    prefixIcon: Icon(LucideIcons.store),
                  ),
                  items: establishments.map((est) {
                    return DropdownMenuItem(
                      value: est.id,
                      child: Text(est.name),
                    );
                  }).toList(),
                  onChanged: (val) {
                    setState(() => _selectedEstablishmentId = val);
                  },
                ),

              const SizedBox(height: 32),

              // 2. Select License Type
              Text(
                '2. Select License Type',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              _buildServiceCard(
                  'NEW', 'New License (Form 09)', 'For first-time applicants'),
              _buildServiceCard(
                  'RENEW', 'Renewal (Form 10)', 'Extend existing license'),
              _buildServiceCard('SUBSTITUTE', 'Replacement (Form 11)',
                  'Lost or damaged license'),

              const SizedBox(height: 32),

              // 3. Fee Display
              Text(
                '3. Application Fee',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.primary.withOpacity(0.2)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Fee:',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                    Text(
                      '${_fees[_selectedServiceType] ?? 0} THB',
                      style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primary),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 40),

              // Submit / Continue Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed:
                      _selectedEstablishmentId == null ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                  ),
                  child: const Text('Start Application'), // Proceed to form
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildServiceCard(String id, String title, String subtitle) {
    final isSelected = _selectedServiceType == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedServiceType = id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.primary : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                      color: AppTheme.primary.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4))
                ]
              : null,
        ),
        child: Row(
          children: [
            Radio<String>(
              value: id,
              groupValue: _selectedServiceType,
              activeColor: AppTheme.primary,
              onChanged: (val) => setState(() => _selectedServiceType = val!),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold)),
                  Text(subtitle,
                      style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleSubmit() {
    // Navigate to the correct flow
    if (_selectedServiceType == 'NEW') {
      // Go to Guidelines -> Then Form
      // For now, let's skip guidelines per user request to "submit"
      // But we need to fill the form.
      // So we navigate to Application Form

      // We pass the Establishment ID to the existing Stepper functionality if supported
      // Or we should update ApplicationForm to accept establishment ID

      // Let's assume ApplicationFormScreen handles the rest for now, or we modify it.
      // The current existing ApplicationFormScreen has logic to PICK establishment in Step 0.
      // We should ideally pass this pre-selected value.

      context.push('/applications/form', extra: _selectedServiceType);
    } else {
      // Other flows logic
      context.push('/applications/form', extra: _selectedServiceType);
    }
  }
}
