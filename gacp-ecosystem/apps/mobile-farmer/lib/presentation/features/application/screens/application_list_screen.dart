import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../domain/entities/application_entity.dart';
import '../providers/application_provider.dart';

class ApplicationListScreen extends ConsumerStatefulWidget {
  const ApplicationListScreen({super.key});

  @override
  ConsumerState<ApplicationListScreen> createState() =>
      _ApplicationListScreenState();
}

class _ApplicationListScreenState extends ConsumerState<ApplicationListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(applicationProvider.notifier).fetchMyApplications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(applicationProvider);
    final applications = state.myApplications;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () =>
                ref.read(applicationProvider.notifier).fetchMyApplications(),
          ),
          const SizedBox(width: 16),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/applications/create/step0'),
        icon: const Icon(LucideIcons.plus),
        label: const Text('New Application'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? Center(child: Text('Error: ${state.error}'))
              : applications.isEmpty
                  ? _buildEmptyState()
                  : LayoutBuilder(
                      builder: (context, constraints) {
                        if (constraints.maxWidth > 800) {
                          return _buildDesktopTable(applications);
                        } else {
                          return _buildMobileList(applications);
                        }
                      },
                    ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.fileSpreadsheet, size: 64, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            'No applications found',
            style: TextStyle(fontSize: 18, color: Colors.grey[600]),
          ),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: () => context.push('/applications/create/step0'),
            child: const Text('Create your first application'),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileList(List<ApplicationEntity> applications) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: applications.length,
      itemBuilder: (context, index) {
        final app = applications[index];
        return _buildApplicationCard(app);
      },
    );
  }

  Widget _buildApplicationCard(ApplicationEntity app) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _handleCardTap(app),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row: Status + Date
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatusBadge(app.status),
                  Text(
                    DateFormat('dd MMM yyyy').format(app.createdAt),
                    style: TextStyle(color: Colors.grey[500], fontSize: 12),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Establishment Name
              Text(
                app.establishmentName,
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),

              // Crop Info
              Row(
                children: [
                  const Icon(LucideIcons.sprout, size: 14, color: Colors.green),
                  const SizedBox(width: 4),
                  Text('${app.type} • ${app.cropName}'),
                ],
              ),

              // Phase 3.6: Digital License
              if (app.status == 'APPROVED') ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                      color: Colors.amber.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.amber.shade200)),
                  child: const Row(children: [
                    Icon(LucideIcons.award, color: Colors.amber),
                    SizedBox(width: 8),
                    Expanded(
                        child: Text(
                            'License: PT09-66/0001\n(Tap to view certificate)',
                            style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.brown)))
                  ]),
                )
              ],

              // Action Button if Action Needed
              if (app.status == 'WAITING_PAYMENT_1' ||
                  app.status == 'WAITING_PAYMENT_2' ||
                  app.status == 'PAYMENT_1_RETRY') ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _goToPayment(app.id),
                    icon: const Icon(LucideIcons.creditCard, size: 16),
                    label: const Text('Pay Now'),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: (app.status == 'PAYMENT_1_RETRY')
                            ? Colors.red
                            : Colors.orange,
                        foregroundColor: Colors.white),
                  ),
                )
              ] else if (app.status == 'REVISION_REQ') ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => context.push(
                        '/applications/create/step1?id=${app.id}'), // Assume edit flow
                    icon: const Icon(LucideIcons.edit, size: 16),
                    label: const Text('Revise Application'),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber[700],
                        foregroundColor: Colors.white),
                  ),
                )
              ]
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDesktopTable(List<ApplicationEntity> applications) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: DataTable(
            showCheckboxColumn: false,
            columns: const [
              DataColumn(label: Text('Establishment')),
              DataColumn(label: Text('Type')),
              DataColumn(label: Text('Crop')),
              DataColumn(label: Text('Date')),
              DataColumn(label: Text('Status')),
              DataColumn(label: Text('Actions')),
            ],
            rows: applications.map((app) {
              return DataRow(
                onSelectChanged: (_) => _handleCardTap(app),
                cells: [
                  DataCell(Text(app.establishmentName,
                      style: const TextStyle(fontWeight: FontWeight.bold))),
                  DataCell(Text(app.type)),
                  DataCell(Text(app.cropName)),
                  DataCell(
                      Text(DateFormat('dd MMM yyyy').format(app.createdAt))),
                  DataCell(_buildStatusBadge(app.status)),
                  DataCell(app.status.contains('WAITING_PAYMENT')
                      ? ElevatedButton(
                          onPressed: () => _goToPayment(app.id),
                          child: const Text('Pay'),
                        )
                      : IconButton(
                          icon: const Icon(LucideIcons.chevronRight),
                          onPressed: () => _handleCardTap(app),
                        )),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status.toUpperCase()) {
      case 'APPROVED':
        color = Colors.green;
        break;
      case 'REJECTED':
        color = Colors.red;
        break;
      case 'WAITING_PAYMENT_1':
      case 'WAITING_PAYMENT_2':
        color = Colors.orange;
        break;
      case 'SUBMITTED':
      case 'PENDING_REVIEW':
        color = Colors.blue;
        break;
      case 'DRAFT':
        color = Colors.grey;
        break;
      case 'REVISION_REQ':
      case 'PAYMENT_1_RETRY':
        color = Colors.red;
        break;
      default:
        color = Colors.blue;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        status.toUpperCase().replaceAll('_', ' '),
        style:
            TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 10),
      ),
    );
  }

  void _handleCardTap(ApplicationEntity app) {
    if (app.status.contains('WAITING_PAYMENT') ||
        app.status == 'PAYMENT_1_RETRY') {
      _goToPayment(app.id);
    } else if (app.status == 'REVISION_REQ') {
      context.push('/applications/create/step1?id=${app.id}');
    } else {
      context.push('/applications/${app.id}/status'); // Tracking
    }
  }

  void _goToPayment(String appId) {
    context.go('/applications/$appId/pay1');
  }
}
