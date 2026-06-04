// Register Screen using GetWidget and Riverpod
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscure = true;
  bool _agree = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (!_agree) {
      GFToast.showToast(
        'Please agree to the terms and privacy policy.',
        context,
        toastPosition: GFToastPosition.BOTTOM,
        backgroundColor: Colors.red,
      );
      return;
    }

    final name = _nameCtrl.text.trim();
    final email = _emailCtrl.text.trim();
    final password = _passCtrl.text;

    try {
      await ref.read(authStateProvider.notifier).register(
            email: email,
            password: password,
            fullName: name,
          );

      if (!mounted) return;
      final authState = ref.read(authStateProvider);

      if (authState.status == AuthStatus.authenticated) {
        GFToast.showToast(
          'Account created successfully!',
          context,
          toastPosition: GFToastPosition.BOTTOM,
          backgroundColor: Colors.green,
        );
        // Navigate to OTP verification screen
        context.go('${AppRoutes.otp}?phone=${Uri.encodeComponent(email)}&from=register');
      } else if (authState.status == AuthStatus.error) {
        GFToast.showToast(
          authState.errorMessage ?? 'Registration failed',
          context,
          toastPosition: GFToastPosition.BOTTOM,
          backgroundColor: Colors.red,
        );
      }
    } catch (e) {
      if (mounted) {
        GFToast.showToast(
          e.toString(),
          context,
          toastPosition: GFToastPosition.BOTTOM,
          backgroundColor: Colors.red,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final isLoading = authState.status == AuthStatus.loading;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Create Account'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Join Loksewa AI',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Start preparing with AI-powered diagnostics and official question banks.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                  const SizedBox(height: 32),
                  
                  // Full Name Input
                  TextFormField(
                    controller: _nameCtrl,
                    decoration: InputDecoration(
                      labelText: 'Full Name',
                      hintText: 'Ram Bahadur',
                      prefixIcon: const Icon(Icons.person_rounded, size: 20),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    validator: (v) => (v == null || v.isEmpty) ? 'Full Name is required' : null,
                  ),
                  const SizedBox(height: 18),
                  
                  // Email Input
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: 'Email Address',
                      hintText: 'ram@domain.com',
                      prefixIcon: const Icon(Icons.mail_rounded, size: 20),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Email is required';
                      if (!v.contains('@') || !v.contains('.')) return 'Enter a valid email';
                      return null;
                    },
                  ),
                  const SizedBox(height: 18),
                  
                  // Password Input
                  TextFormField(
                    controller: _passCtrl,
                    obscureText: _obscure,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      hintText: 'At least 6 characters',
                      prefixIcon: const Icon(Icons.lock_rounded, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, size: 20),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    validator: (v) => (v == null || v.length < 6) ? 'Password must be at least 6 characters' : null,
                  ),
                  const SizedBox(height: 20),
                  
                  // Terms Agreement
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      GFCheckbox(
                        size: GFSize.SMALL,
                        activeBgColor: AppTheme.primary,
                        type: GFCheckboxType.square,
                        value: _agree,
                        onChanged: (v) => setState(() => _agree = v),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text.rich(
                          TextSpan(
                            text: 'I agree to the ',
                            style: Theme.of(context).textTheme.bodySmall,
                            children: const [
                              TextSpan(
                                text: 'Terms of Service',
                                style: TextStyle(
                                  color: AppTheme.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              TextSpan(text: ' and '),
                              TextSpan(
                                text: 'Privacy Policy',
                                style: TextStyle(
                                  color: AppTheme.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  
                  // Register Button
                  GFButton(
                    text: isLoading ? 'Creating Account...' : 'Create Account',
                    onPressed: isLoading ? null : _submit,
                    shape: GFButtonShape.pills,
                    size: GFSize.LARGE,
                    color: AppTheme.primary,
                    blockButton: true,
                  ),
                  const SizedBox(height: 24),
                  
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Already have an account? ',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        GestureDetector(
                          onTap: () => context.go(AppRoutes.login),
                          child: const Text(
                            'Sign In',
                            style: TextStyle(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
