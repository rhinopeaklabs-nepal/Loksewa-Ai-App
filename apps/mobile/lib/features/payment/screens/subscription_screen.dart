// Subscription Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/widgets/app_dialogs.dart';
import '../../../shared/widgets/primary_button.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  int _selectedPlan = 1; // 0=monthly, 1=yearly

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.heroGradient),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => context.pop(),
                      icon: const Icon(Icons.close, color: Colors.white),
                    ),
                    const Spacer(),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Icon(Icons.workspace_premium, color: Colors.amber, size: 80),
              const SizedBox(height: 12),
              const Text(
                'Loksewa AI Pro',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                ),
              ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Text(
                  'Unlock unlimited learning and crush your Loksewa exam',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                ),
              ).animate(delay: 200.ms).fadeIn(duration: 500.ms),
              const SizedBox(height: 24),
              Expanded(
                child: Container(
                  margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ...List.generate(_benefits.length, (i) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Row(
                              children: [
                                Container(
                                  width: 24,
                                  height: 24,
                                  decoration: BoxDecoration(
                                    color: AppTheme.primary,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.check, size: 14, color: Colors.white),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    _benefits[i],
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                          ).animate(delay: (60 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
                        }),
                        const SizedBox(height: 16),
                        // Plan selector
                        Row(
                          children: [
                            Expanded(
                              child: _planOption(
                                context,
                                title: 'Monthly',
                                price: 'Rs. 499',
                                period: '/month',
                                index: 0,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _planOption(
                                context,
                                title: 'Yearly',
                                price: 'Rs. 3,999',
                                period: '/year',
                                index: 1,
                                save: 'Save 33%',
                              ),
                            ),
                          ],
                        ).animate(delay: 400.ms).fadeIn(duration: 500.ms),
                        const SizedBox(height: 20),
                        PrimaryButton(
                          text: 'Continue',
                          icon: Icons.arrow_forward_rounded,
                          onPressed: () {
                            SuccessDialog.show(
                              context,
                              title: 'Subscription Activated!',
                              message: 'Welcome to Loksewa AI Pro. Enjoy unlimited learning!',
                              onContinue: () => context.pop(),
                            );
                          },
                        ),
                        const SizedBox(height: 12),
                        Center(
                          child: Text(
                            'Cancel anytime. Auto-renews until cancelled.',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _planOption(BuildContext context, {required String title, required String price, required String period, required int index, String? save}) {
    final selected = _selectedPlan == index;
    return InkWell(
      onTap: () => setState(() => _selectedPlan = index),
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: AppTheme.normal,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primaryContainer : Theme.of(context).colorScheme.surface,
          border: Border.all(
            color: selected ? AppTheme.primary : Theme.of(context).colorScheme.outline,
            width: selected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                if (save != null) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.secondary,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      save,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 6),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  price,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: selected ? AppTheme.primaryDark : null,
                  ),
                ),
                Text(
                  period,
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static const _benefits = [
    'Unlimited practice questions',
    'Full-length mock tests',
    'AI tutor with no limits',
    'Detailed performance analytics',
    'Personalized study plan',
    'Ad-free experience',
    'Priority support',
  ];
}
