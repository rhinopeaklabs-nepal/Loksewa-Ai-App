// Welcome Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/gradient_background.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GradientBackground(
        gradient: AppTheme.heroGradient,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                const Spacer(flex: 1),
                // Hero illustration
                Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.school_rounded,
                      size: 110,
                      color: Colors.white,
                    ),
                  ),
                )
                    .animate()
                    .scale(duration: 700.ms, curve: Curves.elasticOut)
                    .fadeIn(duration: 500.ms),
                const SizedBox(height: 40),
                Text(
                  'Welcome to Loksewa AI',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.2,
                    letterSpacing: -0.5,
                  ),
                )
                    .animate(delay: 300.ms)
                    .fadeIn(duration: 600.ms)
                    .slideY(begin: 0.2, end: 0),
                const SizedBox(height: 12),
                Text(
                  'Your personal AI tutor for Loksewa exams.\nPractice, learn, and rank up — every day.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.white.withOpacity(0.9),
                    height: 1.5,
                    fontWeight: FontWeight.w500,
                  ),
                )
                    .animate(delay: 500.ms)
                    .fadeIn(duration: 600.ms),
                const Spacer(flex: 1),
                PrimaryButton(
                  text: 'Get Started',
                  icon: Icons.arrow_forward_rounded,
                  onPressed: () => context.push(AppRoutes.languageSelect),
                  backgroundColor: Colors.white,
                  foregroundColor: AppTheme.primary,
                ).animate(delay: 700.ms).fadeIn(duration: 600.ms).slideY(begin: 0.2, end: 0),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.push(AppRoutes.login),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
                  ),
                  child: const Text(
                    'I already have an account',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                )
                    .animate(delay: 800.ms)
                    .fadeIn(duration: 600.ms),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
