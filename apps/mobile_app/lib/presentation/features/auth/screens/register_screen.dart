import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../auth/providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  XFile? _idCardImage;
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _idCardImage = image;
      });
    }
  }

  void _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    if (_idCardImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload your ID Card image')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final data = {
      'firstName': _firstNameController.text.trim(),
      'lastName': _lastNameController.text.trim(),
      'email': _emailController.text.trim(),
      'password': _passwordController.text.trim(),
    };

    await ref.read(authProvider.notifier).register(data, _idCardImage!);

    setState(() => _isLoading = false);

    // Check Result
    final authState = ref.read(authProvider);
    if (authState.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(authState.error!), backgroundColor: Colors.red));
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Registration Successful! Please Login.'),
            backgroundColor: Colors.green));
        context.pop(); // Go back to Login
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Farmer Registration')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Create Account',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Name Fields
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _firstNameController,
                        decoration: const InputDecoration(
                            labelText: 'First Name',
                            prefixIcon: Icon(LucideIcons.user)),
                        validator: (v) => v!.isEmpty ? 'Required' : null,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _lastNameController,
                        decoration: const InputDecoration(
                            labelText: 'Last Name',
                            prefixIcon: Icon(LucideIcons.user)),
                        validator: (v) => v!.isEmpty ? 'Required' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Email
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                      labelText: 'Email', prefixIcon: Icon(LucideIcons.mail)),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 16),

                // Password
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                      labelText: 'Password',
                      prefixIcon: Icon(LucideIcons.lock)),
                  validator: (v) => v!.length < 6 ? 'Min 6 chars' : null,
                ),
                const SizedBox(height: 16),

                // Confirm Password
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                      labelText: 'Confirm Password',
                      prefixIcon: Icon(LucideIcons.lock)),
                  validator: (v) => v != _passwordController.text
                      ? 'Passwords do not match'
                      : null,
                ),
                const SizedBox(height: 24),

                // ID Card Upload
                GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    height: 150,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade400),
                    ),
                    child: _idCardImage == null
                        ? const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(LucideIcons.upload,
                                  size: 40, color: Colors.grey),
                              Text('Tap to upload ID Card Image'),
                            ],
                          )
                        : kIsWeb
                            ? Image.network(_idCardImage!.path,
                                fit: BoxFit.cover)
                            : Image.file(File(_idCardImage!.path),
                                fit: BoxFit.cover),
                  ),
                ),
                const SizedBox(height: 32),

                // Submit Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Register'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
