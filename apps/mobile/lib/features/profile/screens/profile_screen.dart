import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/app_dialogs.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/providers/data_providers.dart';

final userStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.watch(userRepositoryProvider).getStats();
});

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.user;
    final statsAsync = ref.watch(userStatsProvider);

    final name = user?.name ?? 'Guest User';
    final email = user?.email ?? '';
    final initials = name.isNotEmpty
        ? name.trim().split(RegExp(r'\s+')).map((s) => s[0]).take(2).join().toUpperCase()
        : 'U';

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(userStatsProvider);
            return ref.read(userStatsProvider.future);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            child: Column(
              children: [
                // Header
                Row(
                  children: [
                    Text(
                      'Profile',
                      style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: () => context.push(AppRoutes.settings),
                      icon: const Icon(Icons.settings_outlined),
                      style: IconButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.surface,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: BorderSide(color: Theme.of(context).colorScheme.outline),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Profile Card Container
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: AppTheme.heroGradient,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: AppTheme.primaryShadow,
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          GFAvatar(
                            size: GFSize.LARGE,
                            shape: GFAvatarShape.circle,
                            backgroundImage: user?.avatarUrl != null && user!.avatarUrl!.isNotEmpty
                                ? CachedNetworkImageProvider(user!.avatarUrl!)
                                : null,
                            backgroundColor: AppTheme.secondary,
                            child: user?.avatarUrl == null || user!.avatarUrl!.isEmpty
                                ? Text(
                                    initials,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  )
                                : null,
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  email,
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      statsAsync.when(
                        data: (stats) {
                          final quizzes = stats['total_mocks_completed'] ?? 0;
                          final accuracy = stats['correct_rate'] ?? 0;
                          final answered = stats['total_questions_answered'] ?? 0;
                          final bestScore = stats['best_score'] ?? 0;
                          return Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _statBadge('$quizzes', 'Quizzes'),
                              _statBadge('$accuracy%', 'Accuracy'),
                              _statBadge('$answered', 'Questions'),
                              _statBadge('$bestScore%', 'Best Score'),
                            ],
                          );
                        },
                        loading: () => const Center(
                          child: CircularProgressIndicator(color: Colors.white),
                        ),
                        error: (_, __) => Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _statBadge('0', 'Quizzes'),
                            _statBadge('0%', 'Accuracy'),
                            _statBadge('0', 'Questions'),
                            _statBadge('0%', 'Best Score'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1),
                const SizedBox(height: 24),

                // Menu items container using GFListTile
                Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Theme.of(context).colorScheme.outline),
                  ),
                  child: Column(
                    children: [
                      GFListTile(
                        onTap: () => context.push(AppRoutes.achievements),
                        margin: EdgeInsets.zero,
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        avatar: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.secondary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.military_tech_rounded, color: AppTheme.secondary, size: 20),
                        ),
                        titleText: 'Achievements',
                        subTitleText: 'View your milestones & trophies',
                        icon: const Icon(Icons.chevron_right, size: 20),
                      ),
                      _divider(context),
                      GFListTile(
                        onTap: () => context.push(AppRoutes.subscription),
                        margin: EdgeInsets.zero,
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        avatar: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.amber.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.workspace_premium_rounded, color: Colors.amber, size: 20),
                        ),
                        titleText: 'Subscription',
                        subTitleText: user?.subscriptionId != null ? 'Premium Active' : 'Upgrade to Premium Plan',
                        icon: const Icon(Icons.chevron_right, size: 20),
                      ),
                      _divider(context),
                      GFListTile(
                        onTap: () => context.push(AppRoutes.settings),
                        margin: EdgeInsets.zero,
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        avatar: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.settings_outlined, color: AppTheme.primary, size: 20),
                        ),
                        titleText: 'Settings',
                        subTitleText: 'Theme, notifications & language',
                        icon: const Icon(Icons.chevron_right, size: 20),
                      ),
                      _divider(context),
                      GFListTile(
                        onTap: () {
                          InfoBottomSheet.show(
                            context,
                            title: 'Help & Support',
                            message: 'Need assistance? Email us at support@loksewaai.com or visit our site.',
                            actionText: 'Close',
                            onAction: () {},
                          );
                        },
                        margin: EdgeInsets.zero,
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        avatar: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.help_outline_rounded, color: Colors.blue, size: 20),
                        ),
                        titleText: 'Help & Support',
                        subTitleText: 'Contact support team',
                        icon: const Icon(Icons.chevron_right, size: 20),
                      ),
                      _divider(context),
                      GFListTile(
                        onTap: () async {
                          final ok = await ConfirmDialog.show(
                            context,
                            title: 'Sign Out?',
                            message: 'Are you sure you want to sign out?',
                            confirmText: 'Sign Out',
                            isDestructive: true,
                          );
                          if (ok && context.mounted) {
                            await ref.read(authStateProvider.notifier).logout();
                            if (context.mounted) {
                              context.go(AppRoutes.login);
                            }
                          }
                        },
                        margin: EdgeInsets.zero,
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        avatar: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppTheme.error.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.logout_rounded, color: AppTheme.error, size: 20),
                        ),
                        titleText: 'Sign Out',
                        subTitleText: 'Logout from your account',
                        icon: const Icon(Icons.chevron_right, size: 20),
                      ),
                    ],
                  ),
                ).animate(delay: 200.ms).fadeIn(duration: 500.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _statBadge(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _divider(BuildContext context) {
    return Divider(
      height: 1,
      indent: 70,
      color: Theme.of(context).colorScheme.outline,
    );
  }
}
