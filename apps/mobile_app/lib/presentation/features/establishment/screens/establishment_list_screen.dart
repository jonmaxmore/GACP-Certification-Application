import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/ui/responsive_layout.dart';
import '../providers/establishment_provider.dart';
import '../../../../domain/entities/establishment_entity.dart';

class EstablishmentListScreen extends ConsumerWidget {
  const EstablishmentListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(establishmentProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Sites'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus),
            onPressed: () {
              context.go('/establishments/new');
            },
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? Center(child: Text('Error: ${state.error}'))
              : ResponsiveLayout(
                  mobileBody: _MobileList(establishments: state.establishments),
                  desktopBody: _DesktopTable(establishments: state.establishments),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/establishments/new'),
        child: const Icon(LucideIcons.plus),
      ),
    );
  }
}

class _MobileList extends StatelessWidget {
  final List<EstablishmentEntity> establishments;
  const _MobileList({required this.establishments});

  @override
  Widget build(BuildContext context) {
    if (establishments.isEmpty) {
      return const Center(child: Text('No establishments found.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: establishments.length,
      itemBuilder: (context, index) {
        final item = establishments[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.green.shade100,
              backgroundImage: item.imageUrl != null ? NetworkImage(item.imageUrl!) : null,
              child: item.imageUrl == null ? Icon(LucideIcons.sprout, color: Colors.green.shade800) : null,
            ),
            title: Text(item.name),
            subtitle: Text(item.type),
            trailing: _StatusBadge(status: item.status),
          ),
        );
      },
    );
  }
}

class _DesktopTable extends StatelessWidget {
  final List<EstablishmentEntity> establishments;
  const _DesktopTable({required this.establishments});

  @override
  Widget build(BuildContext context) {
    if (establishments.isEmpty) {
      return const Center(child: Text('No establishments found.'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Card(
        child: SizedBox(
          width: double.infinity,
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Name')),
              DataColumn(label: Text('Type')),
              DataColumn(label: Text('Address')),
              DataColumn(label: Text('Status')),
              DataColumn(label: Text('Actions')),
            ],
            rows: establishments.map((item) {
              return DataRow(cells: [
                DataCell(Text(item.name)),
                DataCell(Text(item.type)),
                DataCell(Text(item.address)),
                DataCell(_StatusBadge(status: item.status)),
                DataCell(Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(icon: const Icon(LucideIcons.pencil, size: 18), onPressed: () {}),
                    IconButton(icon: const Icon(LucideIcons.trash, size: 18), onPressed: () {}),
                  ],
                )),
              ]);
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final isActive = status == 'Active';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? Colors.green.shade100 : Colors.orange.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: isActive ? Colors.green.shade800 : Colors.orange.shade800,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
