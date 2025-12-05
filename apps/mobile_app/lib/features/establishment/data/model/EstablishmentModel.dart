import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entity/EstablishmentEntity.dart';

part 'EstablishmentModel.freezed.dart';
part 'EstablishmentModel.g.dart';

@freezed
class EstablishmentModel with _$EstablishmentModel {
  const EstablishmentModel._();

  const factory EstablishmentModel({
    String? id,
    required String name,
    required EstablishmentType type,
    required EstablishmentAddressModel address,
    required EstablishmentCoordinatesModel coordinates,
    @Default([]) List<String> images,
  }) = _EstablishmentModel;

  factory EstablishmentModel.fromJson(Map<String, dynamic> json) =>
      _$EstablishmentModelFromJson(json);

  EstablishmentEntity toEntity() {
    return EstablishmentEntity(
      id: id,
      name: name,
      type: type,
      address: address.toEntity(),
      coordinates: coordinates.toEntity(),
      images: images,
    );
  }
}

@freezed
class EstablishmentAddressModel with _$EstablishmentAddressModel {
  const EstablishmentAddressModel._();

  const factory EstablishmentAddressModel({
    required String street,
    required String city,
    required String zipCode,
  }) = _EstablishmentAddressModel;

  factory EstablishmentAddressModel.fromJson(Map<String, dynamic> json) =>
      _$EstablishmentAddressModelFromJson(json);

  EstablishmentAddress toEntity() {
    return EstablishmentAddress(
      street: street,
      city: city,
      zipCode: zipCode,
    );
  }
}

@freezed
class EstablishmentCoordinatesModel with _$EstablishmentCoordinatesModel {
  const EstablishmentCoordinatesModel._();

  const factory EstablishmentCoordinatesModel({
    required double lat,
    required double lng,
  }) = _EstablishmentCoordinatesModel;

  factory EstablishmentCoordinatesModel.fromJson(Map<String, dynamic> json) =>
      _$EstablishmentCoordinatesModelFromJson(json);

  EstablishmentCoordinates toEntity() {
    return EstablishmentCoordinates(
      lat: lat,
      lng: lng,
    );
  }
}
