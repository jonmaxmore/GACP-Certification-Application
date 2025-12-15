// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'application_repository.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ApplicationModel _$ApplicationModelFromJson(Map<String, dynamic> json) {
  return _ApplicationModel.fromJson(json);
}

/// @nodoc
mixin _$ApplicationModel {
  @JsonKey(name: '_id')
  String get id => throw _privateConstructorUsedError;
  String get formType => throw _privateConstructorUsedError; // '09', '10', '11'
  String get serviceType =>
      throw _privateConstructorUsedError; // 'NEW', 'RENEW'
  String get workflowState =>
      throw _privateConstructorUsedError; // 'WAITING_PAYMENT_1', 'SUBMITTED', etc.
  String get applicantType => throw _privateConstructorUsedError;
  Map<String, dynamic>? get establishmentId =>
      throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this ApplicationModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ApplicationModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ApplicationModelCopyWith<ApplicationModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ApplicationModelCopyWith<$Res> {
  factory $ApplicationModelCopyWith(
          ApplicationModel value, $Res Function(ApplicationModel) then) =
      _$ApplicationModelCopyWithImpl<$Res, ApplicationModel>;
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String formType,
      String serviceType,
      String workflowState,
      String applicantType,
      Map<String, dynamic>? establishmentId,
      DateTime? createdAt});
}

/// @nodoc
class _$ApplicationModelCopyWithImpl<$Res, $Val extends ApplicationModel>
    implements $ApplicationModelCopyWith<$Res> {
  _$ApplicationModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ApplicationModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? formType = null,
    Object? serviceType = null,
    Object? workflowState = null,
    Object? applicantType = null,
    Object? establishmentId = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      formType: null == formType
          ? _value.formType
          : formType // ignore: cast_nullable_to_non_nullable
              as String,
      serviceType: null == serviceType
          ? _value.serviceType
          : serviceType // ignore: cast_nullable_to_non_nullable
              as String,
      workflowState: null == workflowState
          ? _value.workflowState
          : workflowState // ignore: cast_nullable_to_non_nullable
              as String,
      applicantType: null == applicantType
          ? _value.applicantType
          : applicantType // ignore: cast_nullable_to_non_nullable
              as String,
      establishmentId: freezed == establishmentId
          ? _value.establishmentId
          : establishmentId // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ApplicationModelImplCopyWith<$Res>
    implements $ApplicationModelCopyWith<$Res> {
  factory _$$ApplicationModelImplCopyWith(_$ApplicationModelImpl value,
          $Res Function(_$ApplicationModelImpl) then) =
      __$$ApplicationModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String formType,
      String serviceType,
      String workflowState,
      String applicantType,
      Map<String, dynamic>? establishmentId,
      DateTime? createdAt});
}

/// @nodoc
class __$$ApplicationModelImplCopyWithImpl<$Res>
    extends _$ApplicationModelCopyWithImpl<$Res, _$ApplicationModelImpl>
    implements _$$ApplicationModelImplCopyWith<$Res> {
  __$$ApplicationModelImplCopyWithImpl(_$ApplicationModelImpl _value,
      $Res Function(_$ApplicationModelImpl) _then)
      : super(_value, _then);

  /// Create a copy of ApplicationModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? formType = null,
    Object? serviceType = null,
    Object? workflowState = null,
    Object? applicantType = null,
    Object? establishmentId = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_$ApplicationModelImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      formType: null == formType
          ? _value.formType
          : formType // ignore: cast_nullable_to_non_nullable
              as String,
      serviceType: null == serviceType
          ? _value.serviceType
          : serviceType // ignore: cast_nullable_to_non_nullable
              as String,
      workflowState: null == workflowState
          ? _value.workflowState
          : workflowState // ignore: cast_nullable_to_non_nullable
              as String,
      applicantType: null == applicantType
          ? _value.applicantType
          : applicantType // ignore: cast_nullable_to_non_nullable
              as String,
      establishmentId: freezed == establishmentId
          ? _value._establishmentId
          : establishmentId // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ApplicationModelImpl implements _ApplicationModel {
  const _$ApplicationModelImpl(
      {@JsonKey(name: '_id') required this.id,
      required this.formType,
      required this.serviceType,
      required this.workflowState,
      required this.applicantType,
      required final Map<String, dynamic>? establishmentId,
      this.createdAt})
      : _establishmentId = establishmentId;

  factory _$ApplicationModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ApplicationModelImplFromJson(json);

  @override
  @JsonKey(name: '_id')
  final String id;
  @override
  final String formType;
// '09', '10', '11'
  @override
  final String serviceType;
// 'NEW', 'RENEW'
  @override
  final String workflowState;
// 'WAITING_PAYMENT_1', 'SUBMITTED', etc.
  @override
  final String applicantType;
  final Map<String, dynamic>? _establishmentId;
  @override
  Map<String, dynamic>? get establishmentId {
    final value = _establishmentId;
    if (value == null) return null;
    if (_establishmentId is EqualUnmodifiableMapView) return _establishmentId;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final DateTime? createdAt;

  @override
  String toString() {
    return 'ApplicationModel(id: $id, formType: $formType, serviceType: $serviceType, workflowState: $workflowState, applicantType: $applicantType, establishmentId: $establishmentId, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ApplicationModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.formType, formType) ||
                other.formType == formType) &&
            (identical(other.serviceType, serviceType) ||
                other.serviceType == serviceType) &&
            (identical(other.workflowState, workflowState) ||
                other.workflowState == workflowState) &&
            (identical(other.applicantType, applicantType) ||
                other.applicantType == applicantType) &&
            const DeepCollectionEquality()
                .equals(other._establishmentId, _establishmentId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      formType,
      serviceType,
      workflowState,
      applicantType,
      const DeepCollectionEquality().hash(_establishmentId),
      createdAt);

  /// Create a copy of ApplicationModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ApplicationModelImplCopyWith<_$ApplicationModelImpl> get copyWith =>
      __$$ApplicationModelImplCopyWithImpl<_$ApplicationModelImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ApplicationModelImplToJson(
      this,
    );
  }
}

abstract class _ApplicationModel implements ApplicationModel {
  const factory _ApplicationModel(
      {@JsonKey(name: '_id') required final String id,
      required final String formType,
      required final String serviceType,
      required final String workflowState,
      required final String applicantType,
      required final Map<String, dynamic>? establishmentId,
      final DateTime? createdAt}) = _$ApplicationModelImpl;

  factory _ApplicationModel.fromJson(Map<String, dynamic> json) =
      _$ApplicationModelImpl.fromJson;

  @override
  @JsonKey(name: '_id')
  String get id;
  @override
  String get formType; // '09', '10', '11'
  @override
  String get serviceType; // 'NEW', 'RENEW'
  @override
  String get workflowState; // 'WAITING_PAYMENT_1', 'SUBMITTED', etc.
  @override
  String get applicantType;
  @override
  Map<String, dynamic>? get establishmentId;
  @override
  DateTime? get createdAt;

  /// Create a copy of ApplicationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ApplicationModelImplCopyWith<_$ApplicationModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
