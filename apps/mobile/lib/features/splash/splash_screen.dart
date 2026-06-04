// Splash Screen — animated brand intro using GetWidget components
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../app/router.dart';
import '../../app/theme.dart';
import '../../shared/providers/auth_provider.dart';
import '../../shared/providers/data_providers.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _controller.forward();
    _navigate();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _navigate() async {
    // Keep splash visible for at least 2.2 seconds for branding
    await Future.delayed(const Duration(milliseconds: 2200));
    if (!mounted) return;

    try {
      final signedIn = await ref.read(authRepositoryProvider).isSignedIn;
      if (!mounted) return;

      if (signedIn) {
        // Run checkAuth to load user profile
        await ref.read(authStateProvider.notifier).checkAuth();
        if (!mounted) return;

        final authState = ref.read(authStateProvider);
        if (authState.status == AuthStatus.authenticated) {
          context.go(AppRoutes.home);
          return;
        }
      }
    } catch (_) {
      // Fallback on error
    }

    if (mounted) {
      context.go(AppRoutes.welcome);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.heroGradient),
        child: SafeArea(
          child: Stack(
            children: [
              // Decorative background circles
              Positioned(
                top: -100,
                right: -80,
                child: Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              Positioned(
                bottom: -120,
                left: -100,
                child: Container(
                  width: 320,
                  height: 320,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.04),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo using GetWidget GFAnimation
                    GFAnimation(
                      controller: _controller,
                      type: GFAnimationType.scaleTransition,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(32),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.15),
                              blurRadius: 30,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.auto_awesome,
                            size: 64,
                            color: AppTheme.primary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Loksewa AI',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your AI-powered civil service coach',
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.white.withOpacity(0.85),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 48),
                    // Loader using GetWidget GFLoader
                    const GFLoader(
                      type: GFLoaderType.circle,
                      loaderColorOne: Colors.white,
                      loaderColorTwo: Colors.white70,
                      loaderColorThree: Colors.white54,
                    ),
                  ],
                ),
              ),
              Positioned(
                bottom: 32,
                left: 0,
                right: 0,
                child: Text(
                  'Made with ❤ in Nepal',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
