import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final String? phoneNumber;
  final String? address;
  final String? province;
  final String? district;
  final String? subdistrict;
  final String? zipCode;
  final DateTime? registeredAt;

  const UserEntity({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    this.phoneNumber,
    this.address,
    this.province,
    this.district,
    this.subdistrict,
    this.zipCode,
    this.registeredAt,
  });

  @override
  List<Object?> get props => [
        id,
        email,
        firstName,
        lastName,
        role,
        phoneNumber,
        address,
        province,
        district,
        subdistrict,
        zipCode,
        registeredAt,
      ];
}
