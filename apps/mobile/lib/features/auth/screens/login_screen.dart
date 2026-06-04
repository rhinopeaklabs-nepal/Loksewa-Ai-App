// Login Screen using GetWidget and Riverpod
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscure = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    final email = _emailCtrl.text.trim();
    final password = _passCtrl.text;

    try {
      await ref.read(authStateProvider.notifier).login(
            email: email,
            password: password,
          );
      
      if (!mounted) return;
      final authState = ref.read(authStateProvider);

      if (authState.status == AuthStatus.authenticated) {
        GFToast.showToast(
          'Welcome back to Loksewa AI!',
          context,
          toastPosition: GFToastPosition.BOTTOM,
          backgroundColor: Colors.green,
        );
        context.go(AppRoutes.home);
      } else if (authState.status == AuthStatus.error) {
        GFToast.showToast(
          authState.errorMessage ?? 'Authentication failed. Please check your credentials.',
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
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: const Icon(Icons.auto_awesome, color: Colors.white, size: 36),
                    ),
                  ),
                  const SizedBox(height: 28),
                  Center(
                    child: Text(
                      'Welcome back',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: Text(
                      'Sign in to sync your mock test scores and AI tutor logs.',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ),
                  const SizedBox(height: 36),
                  
                  // Email Input using TextFormField
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: 'Email Address',
                      hintText: 'name@domain.com',
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
                  
                  // Password Input using TextFormField
                  TextFormField(
                    controller: _passCtrl,
                    obscureText: _obscure,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      hintText: '••••••••',
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
                  
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => context.push(AppRoutes.forgotPassword),
                      child: const Text('Forgot password?'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Login Button using GFButton
                  GFButton(
                    text: isLoading ? 'Signing In...' : 'Sign In',
                    onPressed: isLoading ? null : _submit,
                    shape: GFButtonShape.pills,
                    size: GFSize.LARGE,
                    color: AppTheme.primary,
                    blockButton: true,
                  ),
                  const SizedBox(height: 24),
                  
                  // Divider
                  Row(
                    children: [
                      Expanded(child: Divider(color: Theme.of(context).colorScheme.outline)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'or continue with',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ),
                      Expanded(child: Divider(color: Theme.of(context).colorScheme.outline)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  
                  // Social Login buttons using GFButton
                  Row(
                    children: [
                      Expanded(
                        child: GFButton(
                          text: 'Google',
                          icon: const Icon(Icons.g_mobiledata_rounded, color: Colors.red, size: 28),
                          type: GFButtonType.outline,
                          shape: GFButtonShape.pills,
                          size: GFSize.LARGE,
                          color: Theme.of(context).colorScheme.outline,
                          textColor: Theme.of(context).colorScheme.onSurface,
                          onPressed: () {
                            GFToast.showToast(
                              'Google login is not live yet.',
                              context,
                              toastPosition: GFToastPosition.BOTTOM,
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GFButton(
                          text: 'Facebook',
                          icon: const Icon(Icons.facebook_rounded, color: Colors.blue, size: 22),
                          type: GFButtonType.outline,
                          shape: GFButtonShape.pills,
                          size: GFSize.LARGE,
                          color: Theme.of(context).colorScheme.outline,
                          textColor: Theme.of(context).colorScheme.onSurface,
                          onPressed: () {
                            GFToast.showToast(
                              'Facebook login is not live yet.',
                              context,
                              toastPosition: GFToastPosition.BOTTOM,
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 36),
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Don't have an account? ",
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        GestureDetector(
                          onTap: () => context.push(AppRoutes.register),
                          child: const Text(
                            'Sign Up',
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
