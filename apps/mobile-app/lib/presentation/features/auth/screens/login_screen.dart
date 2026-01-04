import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';

/// GACP Official Login Screen - Uses AppTheme constants
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isPasswordVisible = false;
  bool _isLoading = false;
  String _accountType = 'INDIVIDUAL';

  static const Map<String, Map<String, dynamic>> _accountTypes = {
    'INDIVIDUAL': {
      'label': 'บุคคลธรรมดา',
      'subtitle': 'เกษตรกรรายย่อย',
      'icon': Icons.person,
      'hint': '1-2345-67890-12-3',
      'inputLabel': 'เลขบัตรประชาชน 13 หลัก',
      'maxLength': 17
    },
    'JURISTIC': {
      'label': 'นิติบุคคล',
      'subtitle': 'บริษัท / ห้างหุ้นส่วน',
      'icon': Icons.business,
      'hint': '0-1055-12345-67-8',
      'inputLabel': 'เลขทะเบียนนิติบุคคล 13 หลัก',
      'maxLength': 17
    },
    'COMMUNITY_ENTERPRISE': {
      'label': 'วิสาหกิจชุมชน',
      'subtitle': 'กลุ่มเกษตรกร',
      'icon': Icons.groups,
      'hint': 'XXXX-XXXX-XXX',
      'inputLabel': 'เลขทะเบียนวิสาหกิจชุมชน',
      'maxLength': 20
    },
    'STAFF': {
      'label': 'เจ้าหน้าที่',
      'subtitle': 'Staff Portal',
      'icon': Icons.badge,
      'hint': 'staff@gacp.go.th',
      'inputLabel': 'Email',
      'maxLength': 50
    },
  };

  String? _validateIdentifier(String? value) {
    if (value == null || value.isEmpty)
      return 'กรุณากรอก${_accountTypes[_accountType]!['inputLabel']}';
    if (_accountType == 'STAFF') {
      if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value))
        return 'กรุณากรอก Email ให้ถูกต้อง';
      return null;
    }
    String clean = value.replaceAll('-', '');
    if (_accountType == 'INDIVIDUAL' || _accountType == 'JURISTIC') {
      if (clean.length != 13) return 'ต้องมี 13 หลัก';
      if (!RegExp(r'^\d+$').hasMatch(clean)) return 'ต้องเป็นตัวเลขเท่านั้น';
    }
    return null;
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() => _isLoading = true);

    await ref.read(authProvider.notifier).loginWithAccountType(
        _accountType,
        _identifierController.text.replaceAll('-', ''),
        _passwordController.text);
    if (!mounted) return;
    setState(() => _isLoading = false);

    final authState = ref.read(authProvider);
    if (authState.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Row(children: [
          const Icon(Icons.error_outline, color: Colors.white),
          const SizedBox(width: 12),
          Expanded(child: Text(authState.error!))
        ]),
        backgroundColor: Colors.red.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ));
    } else if (authState.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Row(children: [
          Icon(Icons.check_circle, color: Colors.white),
          SizedBox(width: 12),
          Text('เข้าสู่ระบบสำเร็จ')
        ]),
        backgroundColor: AppTheme.primaryGreen,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ));
      context.go(_accountType == 'STAFF' ? '/staff/dashboard' : '/dashboard');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildHeader(),
                  const SizedBox(height: 32),
                  _buildAccountTypeSelector(),
                  const SizedBox(height: 24),
                  _buildLoginForm(),
                  const SizedBox(height: 24),
                  _buildRegistrationLink(),
                  const SizedBox(height: 32),
                  _buildFooter(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(children: [
      Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                  color: AppTheme.primaryGreen.withOpacity(0.15),
                  blurRadius: 30,
                  offset: const Offset(0, 15))
            ]),
        child: const Icon(Icons.spa_rounded,
            size: 56, color: AppTheme.primaryGreen),
      ),
      const SizedBox(height: 24),
      Text('ระบบรับรองมาตรฐาน GACP',
          textAlign: TextAlign.center,
          style: GoogleFonts.sarabun(
              fontSize: 26,
              fontWeight: FontWeight.w900,
              color: AppTheme.primaryGreen)),
      const SizedBox(height: 8),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
            color: AppTheme.primaryGreen.withOpacity(0.08),
            borderRadius: BorderRadius.circular(20)),
        child: const Text('กรมการแพทย์แผนไทยและการแพทย์ทางเลือก',
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryGreen)),
      ),
    ]);
  }

  Widget _buildAccountTypeSelector() {
    return Container(
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 10,
                offset: const Offset(0, 4))
          ]),
      padding: const EdgeInsets.all(8),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Text('ประเภทผู้ใช้งาน',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade600))),
        Row(
          children: _accountTypes.entries.map((entry) {
            final isSelected = _accountType == entry.key;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() {
                  _accountType = entry.key;
                  _identifierController.clear();
                }),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.all(4),
                  padding:
                      const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                  decoration: BoxDecoration(
                      color: isSelected
                          ? AppTheme.primaryGreen
                          : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: isSelected
                              ? AppTheme.primaryGreen
                              : Colors.grey.shade200,
                          width: isSelected ? 2 : 1)),
                  child: Column(children: [
                    Icon(entry.value['icon'] as IconData,
                        size: 24,
                        color:
                            isSelected ? Colors.white : Colors.grey.shade600),
                    const SizedBox(height: 6),
                    Text(entry.value['label'] as String,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isSelected
                                ? Colors.white
                                : Colors.grey.shade700)),
                    Text(entry.value['subtitle'] as String,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 9,
                            color: isSelected
                                ? Colors.white70
                                : Colors.grey.shade500)),
                  ]),
                ),
              ),
            );
          }).toList(),
        ),
      ]),
    );
  }

  Widget _buildLoginForm() {
    final config = _accountTypes[_accountType]!;
    return Container(
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 24,
                offset: const Offset(0, 8))
          ]),
      padding: const EdgeInsets.all(28),
      child: Form(
        key: _formKey,
        child:
            Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          TextFormField(
            controller: _identifierController,
            keyboardType: TextInputType.number,
            maxLength: config['maxLength'] as int,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              _IdCardFormatter()
            ],
            style: const TextStyle(
                fontSize: 18, fontWeight: FontWeight.w600, letterSpacing: 1.5),
            decoration: InputDecoration(
              labelText: config['inputLabel'] as String,
              hintText: config['hint'] as String,
              prefixIcon: Icon(config['icon'] as IconData,
                  color: AppTheme.primaryGreen),
              counterText: "",
              filled: true,
              fillColor: Colors.grey.shade50,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none),
              enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.grey.shade200)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide:
                      const BorderSide(color: AppTheme.primaryGreen, width: 2)),
            ),
            validator: _validateIdentifier,
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _passwordController,
            obscureText: !_isPasswordVisible,
            style: const TextStyle(fontSize: 16),
            decoration: InputDecoration(
              labelText: 'รหัสผ่าน',
              prefixIcon:
                  const Icon(Icons.lock_outline, color: AppTheme.primaryGreen),
              suffixIcon: IconButton(
                  icon: Icon(
                      _isPasswordVisible
                          ? Icons.visibility
                          : Icons.visibility_off,
                      color: Colors.grey),
                  onPressed: () =>
                      setState(() => _isPasswordVisible = !_isPasswordVisible)),
              filled: true,
              fillColor: Colors.grey.shade50,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none),
              enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.grey.shade200)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide:
                      const BorderSide(color: AppTheme.primaryGreen, width: 2)),
            ),
            validator: (v) => v!.length < 6 ? 'รหัสผ่านสั้นเกินไป' : null,
          ),
          Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                  onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('ฟีเจอร์นี้กำลังพัฒนา'))),
                  child: const Text('ลืมรหัสผ่าน?',
                      style: TextStyle(
                          color: AppTheme.primaryGreen,
                          fontWeight: FontWeight.bold)))),
          const SizedBox(height: 16),
          SizedBox(
            height: 56,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleLogin,
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryGreen,
                  foregroundColor: Colors.white,
                  elevation: 4,
                  shadowColor: AppTheme.primaryGreen.withOpacity(0.4),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14))),
              child: _isLoading
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2.5))
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                          Text('เข้าสู่ระบบ',
                              style: TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold)),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward_rounded, size: 20)
                        ]),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _buildRegistrationLink() {
    return Column(children: [
      Text('ยังไม่มีบัญชีใช้งาน?',
          style: TextStyle(color: Colors.grey.shade600, fontSize: 15)),
      const SizedBox(height: 12),
      OutlinedButton.icon(
        onPressed: () => context.push('/register'),
        icon: const Icon(Icons.person_add_alt_1_rounded),
        label: const Text('ลงทะเบียนผู้ใช้ใหม่'),
        style: OutlinedButton.styleFrom(
            foregroundColor: AppTheme.primaryGreen,
            side: const BorderSide(color: AppTheme.primaryGreen, width: 1.5),
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12))),
      ),
    ]);
  }

  Widget _buildFooter() {
    return Column(children: [
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.verified_user_outlined,
            size: 16, color: Colors.grey.shade500),
        const SizedBox(width: 6),
        Text('มาตรฐานความปลอดภัยระดับสูง',
            style: TextStyle(color: Colors.grey.shade500, fontSize: 12))
      ]),
      const SizedBox(height: 8),
      Text('v2.6.0',
          style: TextStyle(color: Colors.grey.shade400, fontSize: 10)),
    ]);
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}

class _IdCardFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    var text = newValue.text.replaceAll('-', '');
    if (newValue.selection.baseOffset == 0) return newValue;
    String newText = '';
    for (int i = 0; i < text.length; i++) {
      if (i == 1 || i == 5 || i == 10 || i == 12) {
        if (newText.isNotEmpty) newText += '-';
      }
      newText += text[i];
    }
    return TextEditingValue(
        text: newText,
        selection: TextSelection.collapsed(offset: newText.length));
  }
}
