import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_app/features/establishment/domain/entity/EstablishmentEntity.dart';
import '../provider/EstablishmentProvider.dart';

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
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _zipCodeController = TextEditingController();

  EstablishmentType _selectedType = EstablishmentType.farm;
  List<File> _selectedImages = [];
  EstablishmentCoordinates? _coordinates;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _zipCodeController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.camera);
    if (pickedFile != null) {
      setState(() {
        _selectedImages.add(File(pickedFile.path));
      });
    }
  }

  Future<void> _getCurrentLocation() async {
    // Mock Location for now (Bangkok)
    setState(() {
      _coordinates =
          const EstablishmentCoordinates(lat: 13.7563, lng: 100.5018);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Location acquired: Bangkok')),
    );
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      if (_coordinates == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please tag your location')),
        );
        return;
      }

      setState(() => _isSubmitting = true);

      try {
        await ref.read(establishmentListProvider.notifier).createEstablishment(
              name: _nameController.text,
              type: _selectedType,
              address: EstablishmentAddress(
                street: _streetController.text,
                city: _cityController.text,
                zipCode: _zipCodeController.text,
              ),
              coordinates: _coordinates!,
              images: _selectedImages,
            );

        if (mounted) {
          context.pop();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Establishment Created!')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${e.toString()}')),
          );
        }
      } finally {
        if (mounted) setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Establishment')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration:
                    const InputDecoration(labelText: 'Establishment Name'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<EstablishmentType>(
                value: _selectedType,
                decoration: const InputDecoration(labelText: 'Type'),
                items: EstablishmentType.values.map((type) {
                  return DropdownMenuItem(
                    value: type,
                    child: Text(type.name.toUpperCase()),
                  );
                }).toList(),
                onChanged: (v) => setState(() => _selectedType = v!),
              ),
              const SizedBox(height: 16),
              const Text('Address',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              TextFormField(
                controller: _streetController,
                decoration: const InputDecoration(labelText: 'Street/No.'),
              ),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _cityController,
                      decoration: const InputDecoration(labelText: 'City'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextFormField(
                      controller: _zipCodeController,
                      decoration: const InputDecoration(labelText: 'Zip Code'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Location',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  TextButton.icon(
                    icon: const Icon(Icons.gps_fixed),
                    label: Text(_coordinates == null
                        ? 'Get GPS'
                        : '${_coordinates!.lat.toStringAsFixed(4)}, ${_coordinates!.lng.toStringAsFixed(4)}'),
                    onPressed: _getCurrentLocation,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text('Images',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              SizedBox(
                height: 100,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    ..._selectedImages.map((f) => Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: Image.file(f, width: 100, fit: BoxFit.cover),
                        )),
                    IconButton(
                      icon: const Icon(Icons.add_a_photo, size: 40),
                      onPressed: _pickImage,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator()
                    : const Text('Create Establishment'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
