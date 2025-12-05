import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile_app/core/network/DioClient.dart';
import '../../data/repository/EstablishmentRepositoryImpl.dart';
import '../../domain/entity/EstablishmentEntity.dart';
import '../../domain/repository/EstablishmentRepository.dart';
import 'dart:io';

import 'package:mobile_app/core/providers/CoreProviders.dart';

final establishmentRepositoryProvider =
    Provider<EstablishmentRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return EstablishmentRepositoryImpl(dioClient);
});

// Async Notifier for List
final establishmentListProvider =
    AsyncNotifierProvider<EstablishmentNotifier, List<EstablishmentEntity>>(
        EstablishmentNotifier.new);

class EstablishmentNotifier extends AsyncNotifier<List<EstablishmentEntity>> {
  late final EstablishmentRepository _repository;

  @override
  Future<List<EstablishmentEntity>> build() async {
    _repository = ref.watch(establishmentRepositoryProvider);
    return _fetchEstablishments();
  }

  Future<List<EstablishmentEntity>> _fetchEstablishments() async {
    final result = await _repository.getEstablishments();
    return result.fold(
      (failure) => throw Exception(failure.message),
      (data) => data,
    );
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchEstablishments());
  }

  Future<void> createEstablishment({
    required String name,
    required EstablishmentType type,
    required EstablishmentAddress address,
    required EstablishmentCoordinates coordinates,
    List<File>? images,
  }) async {
    final result = await _repository.createEstablishment(
      name: name,
      type: type,
      address: address,
      coordinates: coordinates,
      images: images,
    );

    result.fold(
      (failure) => throw Exception(failure.message),
      (newEstablishment) {
        // Optimistic Update or Refresh
        refresh();
      },
    );
  }
}
