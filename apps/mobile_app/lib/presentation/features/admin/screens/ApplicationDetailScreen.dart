import 'package:flutter/material.dart';
import 'package:flutter_riverpod/FlutterRiverpod.dart';

import 'package:google_fonts/GoogleFonts.dart';
import 'package:intl/intl.dart';
import '../../../../domain/entities/ApplicationEntity.dart';
import '../providers/AdminApplicationProvider.dart';

class ApplicationDetailScreen extends ConsumerWidget {
  final String applicationId;

  const ApplicationDetailScreen({super.key, required this.applicationId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncApplication =
        ref.watch(applicationDetailProvider(applicationId));
    final statusState = ref.watch(applicationStatusProvider);

    // Listen for status update success
    ref.listen(applicationStatusProvider, (previous, next) {
      if (next.isSuccess) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Status updated successfully')),
        );
      }
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error: ${next.error}'),
              backgroundColor: Colors.red),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Application Details'),
        actions: [
          if (statusState.isLoading)
            const Center(
                child: Padding(
              padding: EdgeInsets.only(right: 16.0),
              child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2)),
            ))
        ],
      ),
      body: asyncApplication.when(
        data: (application) => _buildContent(context, ref, application),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildContent(
      BuildContext context, WidgetRef ref, ApplicationEntity application) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(application),
          const SizedBox(height: 24),
          _buildSectionTitle('Establishment Information'),
          _buildInfoRow('Establishment Name', application.establishmentName),
          _buildInfoRow('Establishment ID', application.establishmentId),
          const Divider(height: 32),
          _buildSectionTitle('Form Data (${application.type})'),
          if (application.type == 'GACP_FORM_9')
            _buildForm9Details(application),
          if (application.type == 'GACP_FORM_10')
            _buildForm10Details(application),
          if (application.type == 'GACP_FORM_11')
            _buildForm11Details(application),
          const Divider(height: 32),
          _buildSectionTitle('Documents'),
          if (application.documents.isEmpty)
            const Text('No documents attached',
                style: TextStyle(color: Colors.grey))
          else
            ...application.documents.map((doc) => ListTile(
                  leading: const Icon(Icons.description),
                  title: Text(doc.split('/').last),
                  trailing: IconButton(
                    icon: const Icon(Icons.download),
                    onPressed: () {
                      // Implement download logic or open URL
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Download not implemented in demo')),
                      );
                    },
                  ),
                )),
          const SizedBox(height: 40),
          if (application.status == 'Pending')
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () =>
                        _showRejectDialog(context, ref, application.id),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Reject / Request Revision'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: FilledButton(
                    onPressed: () {
                      ref
                          .read(applicationStatusProvider.notifier)
                          .updateStatus(application.id, 'Approved');
                    },
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Approve'),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildHeader(ApplicationEntity application) {
    Color statusColor;
    switch (application.status.toLowerCase()) {
      case 'approved':
        statusColor = Colors.green;
        break;
      case 'rejected':
        statusColor = Colors.red;
        break;
      default:
        statusColor = Colors.orange;
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('ID: ${application.id.substring(0, 8)}...',
                    style: GoogleFonts.sarabun(color: Colors.grey)),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: statusColor),
                  ),
                  child: Text(
                    application.status.toUpperCase(),
                    style: GoogleFonts.sarabun(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Text(
                  'Submitted: ${DateFormat('dd MMM yyyy, HH:mm').format(application.createdAt)}',
                  style: GoogleFonts.sarabun(color: Colors.grey[700]),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildForm9Details(ApplicationEntity app) {
    return Column(
      children: [
        _buildInfoRow('Crop Name', app.cropName),
        _buildInfoRow('Variety', app.cropVariety),
        _buildInfoRow('Source', app.cropSource),
        _buildInfoRow('Planting Method', app.plantingMethod),
        const SizedBox(height: 16),
        _buildInfoRow('Total Area', '${app.totalArea} ${app.areaUnit}'),
        _buildInfoRow(
            'Cultivated Area', '${app.cultivatedArea} ${app.areaUnit}'),
        _buildInfoRow('Land Ownership', app.landOwnershipType),
        _buildInfoRow('Water Source', app.waterSourceType),
        _buildInfoRow('Soil Type', app.soilType),
      ],
    );
  }

  Widget _buildForm10Details(ApplicationEntity app) {
    return Column(
      children: [
        _buildInfoRow('Dispensing Method', app.dispensingMethod),
        _buildInfoRow('Pharmacist Name', app.pharmacistName),
        _buildInfoRow('License Number', app.pharmacistLicense),
        _buildInfoRow('Operating Hours', app.operatingHours),
        _buildInfoRow('Commercial Reg. No.', app.commercialRegNumber),
      ],
    );
  }

  Widget _buildForm11Details(ApplicationEntity app) {
    return Column(
      children: [
        _buildInfoRow('Type', app.importExportType.toUpperCase()),
        _buildInfoRow('Country', app.country),
        _buildInfoRow('Port of Entry/Exit', app.portOfEntryExit),
        _buildInfoRow('Transport Mode', app.transportMode),
        _buildInfoRow('Carrier', app.carrierName),
        _buildInfoRow(
            'Expected Date',
            app.expectedDate != null
                ? DateFormat('dd MMM yyyy').format(app.expectedDate!)
                : '-'),
        _buildInfoRow('Plant Parts', app.plantParts),
        _buildInfoRow('Quantity', '${app.quantity} kg'),
        _buildInfoRow('Purpose', app.purpose),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text(
        title,
        style: GoogleFonts.sarabun(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: GoogleFonts.sarabun(
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value ?? '-',
              style: GoogleFonts.sarabun(
                color: Colors.black87,
                fontWeight: FontWeight.w400,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showRejectDialog(BuildContext context, WidgetRef ref, String appId) {
    final noteController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject Application'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
                'Please provide a reason for rejection or revision request:'),
            const SizedBox(height: 16),
            TextField(
              controller: noteController,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Reason...',
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              ref
                  .read(applicationStatusProvider.notifier)
                  .updateStatus(appId, 'Rejected', notes: noteController.text);
              Navigator.pop(context);
            },
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Reject'),
          ),
        ],
      ),
    );
  }
}
