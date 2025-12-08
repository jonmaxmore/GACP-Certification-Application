import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/establishment_provider.dart';

class EstablishmentFormScreen extends ConsumerStatefulWidget {
  const EstablishmentFormScreen({super.key});

  @override
  ConsumerState<EstablishmentFormScreen> createState() =>
      _EstablishmentFormScreenState();
}

class _EstablishmentFormScreenState
    extends ConsumerState<EstablishmentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _titleDeedController = TextEditingController(); // New
  final _securityController = TextEditingController(); // New

  // Mapping Display Text (Thai) -> Backend Value
  final Map<String, String> _typeMap = {
    'เพาะปลูก (Cultivation)': 'farm',
    'แปรรูป (Processing)': 'processing',
    'จำหน่าย (Distribution)': 'shop',
  };

  late String _selectedType;

  @override
  void initState() {
    super.initState();
    // Default to first value
    _selectedType = _typeMap.values.first;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _titleDeedController.dispose();
    _securityController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return;
        }
      }

      Position position = await Geolocator.getCurrentPosition();
      ref.read(establishmentProvider.notifier).setLocation(
            LatLng(position.latitude, position.longitude),
          );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('เกิดข้อผิดพลาดในการดึงตำแหน่ง: $e')),
        );
      }
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 80);
    if (pickedFile != null) {
      ref.read(establishmentProvider.notifier).setImage(pickedFile);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(establishmentProvider);
    final notifier = ref.read(establishmentProvider.notifier);

    // Listen for success
    ref.listen(establishmentProvider, (previous, next) {
      if (next.isSuccess) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('บันทึกข้อมูลแปลงปลูกสำเร็จ!')),
        );
        Navigator.pop(context);
        notifier.resetForm();
      }
      if (next.error != null && !next.isLoading) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!), backgroundColor: Colors.red),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('ลงทะเบียนแปลงปลูก')),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Name
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'ชื่อแปลงปลูก / สถานที่',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(LucideIcons.building),
                      ),
                      validator: (v) =>
                          v?.isEmpty == true ? 'กรุณาระบุข้อมูล' : null,
                    ),
                    const SizedBox(height: 16),

                    // Type Dropdown (Thai)
                    DropdownButtonFormField<String>(
                      initialValue: _selectedType,
                      decoration: const InputDecoration(
                        labelText: 'ประเภท',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(LucideIcons.tag),
                      ),
                      items: _typeMap.entries
                          .map((e) => DropdownMenuItem(
                                value: e.value,
                                child: Text(e.key),
                              ))
                          .toList(),
                      onChanged: (v) => setState(() => _selectedType = v!),
                    ),
                    const SizedBox(height: 16),

                    // Address
                    TextFormField(
                      controller: _addressController,
                      decoration: const InputDecoration(
                        labelText: 'ที่อยู่',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(LucideIcons.mapPin),
                      ),
                      maxLines: 2,
                      validator: (v) =>
                          v?.isEmpty == true ? 'กรุณาระบุข้อมูล' : null,
                    ),
                    const SizedBox(height: 16),

                    // Title Deed No (GACP)
                    TextFormField(
                      controller: _titleDeedController,
                      decoration: const InputDecoration(
                        labelText: 'เลขที่โฉนด (Title Deed No.)',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(LucideIcons.fileText),
                      ),
                      validator: (v) =>
                          v?.isEmpty == true ? 'กรุณาระบุเลขโฉนด' : null,
                    ),
                    const SizedBox(height: 16),

                    // Security (GACP)
                    TextFormField(
                      controller: _securityController,
                      decoration: const InputDecoration(
                        labelText: 'ระบบความปลอดภัย (Security)',
                        hintText: 'e.g. รั้วลวดหนาม 2m, กล้อง CCTV 4 ตัว',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(LucideIcons.shield),
                      ),
                      maxLines: 2,
                      validator: (v) => v?.isEmpty == true
                          ? 'กรุณาระบุระบบรักษาความปลอดภัย'
                          : null,
                    ),

                    const SizedBox(height: 24),

                    // Location Map
                    const Text('ตำแหน่งพิกัด (ปักหมุด)',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Container(
                      height: 300,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: state.selectedLocation == null
                          ? Center(
                              child: TextButton.icon(
                                onPressed: _getCurrentLocation,
                                icon: const Icon(LucideIcons.locate),
                                label: const Text('ค้นหาตำแหน่งปัจจุบัน'),
                              ),
                            )
                          : Stack(
                              children: [
                                FlutterMap(
                                  // Use Key to prevent unnecessary full-map rebuilds if possible
                                  key: ValueKey(state.selectedLocation),
                                  options: MapOptions(
                                    initialCenter: state.selectedLocation!,
                                    initialZoom: 15,
                                    onTap: (tapPosition, point) {
                                      ref
                                          .read(establishmentProvider.notifier)
                                          .setLocation(point);
                                    },
                                  ),
                                  children: [
                                    TileLayer(
                                      urlTemplate:
                                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                      userAgentPackageName: 'com.gacp.app',
                                    ),
                                    MarkerLayer(
                                      markers: [
                                        Marker(
                                          point: state.selectedLocation!,
                                          width: 40,
                                          height: 40,
                                          child: const Icon(LucideIcons.mapPin,
                                              color: Colors.red, size: 40),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Positioned(
                                  right: 8,
                                  bottom: 8,
                                  child: FloatingActionButton.small(
                                    heroTag: 'locate_btn',
                                    onPressed: _getCurrentLocation,
                                    child: const Icon(LucideIcons.locate),
                                  ),
                                ),
                              ],
                            ),
                    ),
                    const SizedBox(height: 24),

                    // Image Picker
                    const Text('รูปถ่ายประกอบ',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    if (state.selectedImage != null)
                      Stack(
                        children: [
                          Container(
                            height: 200,
                            width: double.infinity,
                            child: kIsWeb
                                ? Image.network(
                                    state.selectedImage!.path,
                                    fit: BoxFit.cover,
                                  )
                                : Image.file(
                                    File(state.selectedImage!.path),
                                    fit: BoxFit.cover,
                                  ),
                          ),
                          Positioned(
                            right: 0,
                            top: 0,
                            child: IconButton(
                              icon: const Icon(Icons.close, color: Colors.red),
                              onPressed: () => notifier.setImage(null),
                            ),
                          ),
                        ],
                      )
                    else
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => _pickImage(ImageSource.camera),
                              icon: const Icon(LucideIcons.camera),
                              label: const Text('กล้องถ่ายรูป'),
                              style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.all(16)),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => _pickImage(ImageSource.gallery),
                              icon: const Icon(LucideIcons.image),
                              label: const Text('อัลบั้มภาพ'),
                              style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.all(16)),
                            ),
                          ),
                        ],
                      ),

                    const SizedBox(height: 32),

                    // Submit Button
                    ElevatedButton(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          notifier.createEstablishment(
                            name: _nameController.text,
                            type: _selectedType,
                            address: _addressController.text,
                            titleDeedNo: _titleDeedController.text,
                            security: _securityController.text,
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.all(16),
                      ),
                      child: const Text('บันทึกข้อมูล'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
