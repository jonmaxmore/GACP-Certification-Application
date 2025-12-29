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

  // Controllers (V2 Standard)
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneNumberController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _idCardController = TextEditingController();
  final _laserCodeController = TextEditingController();

  XFile? _idCardImage;
  bool _isLoading = false;
  bool _obscurePassword = true; // Password visibility toggle
  bool _obscureConfirmPassword = true;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
        maxWidth: 1024,
        maxHeight: 1024);
    if (image != null) {
      setState(() => _idCardImage = image);
    }
  }

  void _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    // Optional Image Check
    if (_idCardImage == null) {
      // For V2, we might want to allow without image or enforce it.
      // Current Schema says optional, but logic says strict. Let's warn but allow?
      // No, UI should probably enforce it for "KYC" feel.
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload your ID Card image')),
      );
      return;
    }

    setState(() => _isLoading = true);

    // V2 Data Payload - Matches Backend Schema Strictly
    final data = {
      'firstName': _firstNameController.text.trim(),
      'lastName': _lastNameController.text.trim(),
      'email': _emailController.text.trim(),
      'phoneNumber': _phoneNumberController.text.trim(),
      'password': _passwordController.text.trim(),
      'idCard': _idCardController.text.trim(),
      'laserCode': _laserCodeController.text.trim(),
      'farmerType': 'INDIVIDUAL' // Default
    };

    try {
      await ref.read(authProvider.notifier).register(data, _idCardImage!);

      if (!mounted) return;
      setState(() => _isLoading = false);

      final authState = ref.read(authProvider);

      if (authState.error != null) {
        // Show EXACT error from backend
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(authState.error!), backgroundColor: Colors.red));
      } else {
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Text('Registration Complete'),
            content:
                const Text('Your account has been created. Please log in.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop(); // Close Dialog
                  context.pop(); // Back to Login
                },
                child: const Text('OK'),
              )
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('System Error: $e'), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Farmer Registration V2')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('New Account',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center),
                const SizedBox(height: 24),

                // Name
                Row(
                  children: [
                    Expanded(
                        child: TextFormField(
                            controller: _firstNameController,
                            decoration: const InputDecoration(
                                labelText: 'First Name',
                                prefixIcon: Icon(LucideIcons.user)),
                            validator: (v) => v!.isEmpty ? 'Required' : null)),
                    const SizedBox(width: 16),
                    Expanded(
                        child: TextFormField(
                            controller: _lastNameController,
                            decoration: const InputDecoration(
                                labelText: 'Last Name',
                                prefixIcon: Icon(LucideIcons.user)),
                            validator: (v) => v!.isEmpty ? 'Required' : null)),
                  ],
                ),
                const SizedBox(height: 16),

                // Contact
                TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress, // Apple QA Fix
                    decoration: const InputDecoration(
                        labelText: 'Email', prefixIcon: Icon(LucideIcons.mail)),
                    validator: (v) =>
                        v!.contains('@') ? null : 'Invalid Email'),
                const SizedBox(height: 16),
                TextFormField(
                    controller: _phoneNumberController,
                    keyboardType: TextInputType.phone, // Apple QA Fix
                    decoration: const InputDecoration(
                        labelText: 'Mobile Number',
                        prefixIcon: Icon(LucideIcons.phone)),
                    validator: (v) =>
                        v!.length >= 10 ? null : 'Invalid Mobile'),
                const SizedBox(height: 16),

                // Security
                TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(LucideIcons.lock),
                        suffixIcon: IconButton(
                          // Apple QA: Password visibility
                          icon: Icon(_obscurePassword
                              ? LucideIcons.eyeOff
                              : LucideIcons.eye),
                          onPressed: () => setState(
                              () => _obscurePassword = !_obscurePassword),
                        )),
                    validator: (v) => v!.length >= 6 ? null : 'Min 6 Chars'),
                const SizedBox(height: 16),
                TextFormField(
                    controller: _confirmPasswordController,
                    obscureText: _obscureConfirmPassword,
                    decoration: InputDecoration(
                        labelText: 'Confirm Password',
                        prefixIcon: const Icon(LucideIcons.lock),
                        suffixIcon: IconButton(
                          icon: Icon(_obscureConfirmPassword
                              ? LucideIcons.eyeOff
                              : LucideIcons.eye),
                          onPressed: () => setState(() =>
                              _obscureConfirmPassword =
                                  !_obscureConfirmPassword),
                        )),
                    validator: (v) =>
                        v == _passwordController.text ? null : 'Mismatch'),
                const SizedBox(height: 16),

                // Identity (Strict)
                TextFormField(
                    controller: _idCardController,
                    maxLength: 13,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                        labelText: 'ID Card (13 Digits)',
                        prefixIcon: const Icon(LucideIcons.creditCard),
                        suffixIcon: IconButton(
                          icon: const Icon(LucideIcons.scan),
                          onPressed: () => ScaffoldMessenger.of(context)
                              .showSnackBar(const SnackBar(
                                  content: Text('OCR Scanning Coming Soon'))),
                        ),
                        counterText: ''),
                    validator: (v) =>
                        v!.length == 13 ? null : 'Must be 13 Digits'),
                const SizedBox(height: 16),
                TextFormField(
                    controller: _laserCodeController,
                    decoration: InputDecoration(
                        labelText: 'Laser Code (Back)',
                        prefixIcon: const Icon(LucideIcons.scanLine),
                        suffixIcon: IconButton(
                          icon: const Icon(LucideIcons.helpCircle),
                          onPressed: () => showDialog(
                            context: context,
                            builder: (c) => const AlertDialog(
                              title: Text('Laser Code'),
                              content: Text(
                                  'The code on the back of your ID card (e.g., ME0-xxxxxxx-xx).'),
                            ),
                          ),
                        )),
                    validator: (v) => v!.isEmpty ? 'Required' : null),
                const SizedBox(height: 24),

                // Upload
                GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    height: 150,
                    decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey)),
                    child: _idCardImage == null
                        ? const Center(
                            child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                Icon(LucideIcons.upload),
                                Text('Upload ID Card')
                              ]))
                        : kIsWeb
                            ? Image.network(_idCardImage!.path)
                            : Image.file(File(_idCardImage!.path)),
                  ),
                ),
                const SizedBox(height: 32),

                ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Colors.green.shade700,
                      foregroundColor: Colors.white),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Register Now'),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
