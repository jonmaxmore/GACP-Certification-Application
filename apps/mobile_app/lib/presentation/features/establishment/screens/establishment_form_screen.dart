import 'dart:io';
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
  ConsumerState<EstablishmentFormScreen> createState() => _EstablishmentFormScreenState();
}

class _EstablishmentFormScreenState extends ConsumerState<EstablishmentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  String _selectedType = 'Cultivation';

  final List<String> _types = ['Cultivation', 'Processing', 'Distribution'];

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error getting location: $e')),
      );
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 80);
    if (pickedFile != null) {
      ref.read(establishmentProvider.notifier).setImage(File(pickedFile.path));
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
          const SnackBar(content: Text('Establishment created successfully!')),
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
      appBar: AppBar(title: const Text('New Establishment')),
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
                        labelText: 'Establishment Name',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(LucideIcons.building),
                      ),
                      validator: (v) => v?.isEmpty == true ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),

                    // Type
                    DropdownButtonFormField<String>(
                      value: _selectedType,
                      decoration: const InputDecoration(
                        labelText: 'Type',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(LucideIcons.tag),
                      ),
                      items: _types.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                      onChanged: (v) => setState(() => _selectedType = v!),
                    ),
                    const SizedBox(height: 16),

                    // Address
                    TextFormField(
                      controller: _addressController,
                      decoration: const InputDecoration(
                        labelText: 'Address',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(LucideIcons.mapPin),
                      ),
                      maxLines: 2,
                      validator: (v) => v?.isEmpty == true ? 'Required' : null,
                    ),
                    const SizedBox(height: 24),

                    // Location Map
                    const Text('Location', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Container(
                      height: 200,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: state.selectedLocation == null
                          ? Center(
                              child: TextButton.icon(
                                onPressed: _getCurrentLocation,
                                icon: const Icon(LucideIcons.locate),
                                label: const Text('Get Current Location'),
                              ),
                            )
                          : Stack(
                              children: [
                                FlutterMap(
                                  options: MapOptions(
                                    center: state.selectedLocation!,
                                    zoom: 15,
                                  ),
                                  children: [
                                    TileLayer(
                                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                      userAgentPackageName: 'com.gacp.app',
                                    ),
                                    MarkerLayer(
                                      markers: [
                                        Marker(
                                          point: state.selectedLocation!,
                                          width: 40,
                                          height: 40,
                                          builder: (ctx) => const Icon(LucideIcons.mapPin, color: Colors.red, size: 40),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Positioned(
                                  right: 8,
                                  bottom: 8,
                                  child: FloatingActionButton.small(
                                    onPressed: _getCurrentLocation,
                                    child: const Icon(LucideIcons.locate),
                                  ),
                                ),
                              ],
                            ),
                    ),
                    const SizedBox(height: 24),

                    // Image Picker
                    const Text('Evidence Photo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    if (state.selectedImage != null)
                      Stack(
                        children: [
                          Image.file(
                            state.selectedImage!,
                            height: 200,
                            width: double.infinity,
                            fit: BoxFit.cover,
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
                              label: const Text('Camera'),
                              style: OutlinedButton.styleFrom(padding: const EdgeInsets.all(16)),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => _pickImage(ImageSource.gallery),
                              icon: const Icon(LucideIcons.image),
                              label: const Text('Gallery'),
                              style: OutlinedButton.styleFrom(padding: const EdgeInsets.all(16)),
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
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.all(16),
                      ),
                      child: const Text('Submit Establishment'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
