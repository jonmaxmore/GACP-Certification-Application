import 'package:equatable/equatable.dart';

enum EstablishmentType {
  farm,
  shop,
  processing,
  extraction,
}

class EstablishmentEntity extends Equatable {
  final String? id;
  final String name;
  final EstablishmentType type;
  final EstablishmentAddress address;
  final EstablishmentCoordinates coordinates;
  final List<String> images;

  const EstablishmentEntity({
    this.id,
    required this.name,
    required this.type,
    required this.address,
    required this.coordinates,
    required this.images,
  });

  @override
  List<Object?> get props => [id, name, type, address, coordinates, images];
}

class EstablishmentAddress extends Equatable {
  final String street;
  final String city;
  final String zipCode;

  const EstablishmentAddress({
    required this.street,
    required this.city,
    required this.zipCode,
  });

  @override
  List<Object?> get props => [street, city, zipCode];
}

class EstablishmentCoordinates extends Equatable {
  final double lat;
  final double lng;

  const EstablishmentCoordinates({
    required this.lat,
    required this.lng,
  });

  @override
  List<Object?> get props => [lat, lng];
}
