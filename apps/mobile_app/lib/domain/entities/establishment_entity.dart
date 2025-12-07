import 'package:equatable/equatable.dart';

class EstablishmentEntity extends Equatable {
  final String id;
  final String name;
  final String type;
  final String address;
  final String status;
  final double? latitude;
  final double? longitude;
  final String? imageUrl;

  final String titleDeedNo;
  final String security;

  // Credibility Fields
  final DateTime? updatedAt;
  final DateTime? licenseExpiredAt;
  final String? licenseNumber;

  const EstablishmentEntity({
    required this.id,
    required this.name,
    required this.type,
    required this.address,
    required this.status,
    this.latitude,
    this.longitude,
    this.imageUrl,
    this.titleDeedNo = '',
    this.security = '',
    this.updatedAt,
    this.licenseExpiredAt,
    this.licenseNumber,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        type,
        address,
        status,
        latitude,
        longitude,
        imageUrl,
        titleDeedNo,
        security,
        updatedAt,
        licenseExpiredAt,
        licenseNumber,
      ];
}
