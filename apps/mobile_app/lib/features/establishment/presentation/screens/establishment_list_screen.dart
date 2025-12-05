import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_app/features/establishment/domain/entity/establishment_entity.dart';
import '../provider/establishment_provider.dart';

class EstablishmentListScreen extends ConsumerWidget {
  const EstablishmentListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final establishmentState = ref.watch(establishmentListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Establishments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/establishment/create'),
          ),
        ],
      ),
      body: establishmentState.when(
        data: (establishments) {
          if (establishments.isEmpty) {
            return const Center(
                child: Text('No establishments found. Create one!'));
          }
          return RefreshIndicator(
            onRefresh: () =>
                ref.read(establishmentListProvider.notifier).refresh(),
            child: ListView.builder(
              itemCount: establishments.length,
              itemBuilder: (context, index) {
                final est = establishments[index];
                return Card(
                  margin: const EdgeInsets.all(8.0),
                  child: ListTile(
                    leading: est.images.isNotEmpty
                        ? Image.network(est.images.first,
                            width: 50, height: 50, fit: BoxFit.cover)
                        : const Icon(Icons.store),
                    title: Text(est.name),
                    subtitle: Text('${est.type.name} - ${est.address.city}'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      // Navigate to detail
                    },
                  ),
                );
              },
            ),
          );
        },
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Error: $err'),
              ElevatedButton(
                onPressed: () =>
                    ref.read(establishmentListProvider.notifier).refresh(),
                child: const Text('Retry'),
              )
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}
