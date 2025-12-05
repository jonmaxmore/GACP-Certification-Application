// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ApplicationRepository.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ApplicationModelImpl _$$ApplicationModelImplFromJson(
        Map<String, dynamic> json) =>
    _$ApplicationModelImpl(
      id: json['_id'] as String,
      formType: json['formType'] as String,
      serviceType: json['serviceType'] as String,
      workflowState: json['workflowState'] as String,
      applicantType: json['applicantType'] as String,
      establishmentId: json['establishmentId'] as Map<String, dynamic>?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$ApplicationModelImplToJson(
        _$ApplicationModelImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'formType': instance.formType,
      'serviceType': instance.serviceType,
      'workflowState': instance.workflowState,
      'applicantType': instance.applicantType,
      'establishmentId': instance.establishmentId,
      'createdAt': instance.createdAt?.toIso8601String(),
    };
