// Notifications Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text('Mark all read'),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
              child: Text(
                'TODAY',
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            _notifItem(
              context,
              icon: Icons.local_fire_department,
              color: AppTheme.secondary,
              title: 'Don\'t break your streak!',
              message: 'You\'re on a 12-day streak. Complete today\'s mission to keep it going.',
              time: '2h ago',
              unread: true,
              onTap: () => context.push(AppRoutes.mission),
            ),
            _notifItem(
              context,
              icon: Icons.bolt,
              color: AppTheme.primary,
              title: '+25 XP earned!',
              message: 'You completed "GK: World Geography" practice set.',
              time: '4h ago',
              unread: true,
            ),
            _notifItem(
              context,
              icon: Icons.military_tech,
              color: Colors.amber,
              title: 'Badge Unlocked: Math Whiz',
              message: 'You solved 50 math problems correctly. Keep it up!',
              time: '5h ago',
              unread: true,
              onTap: () => context.push(AppRoutes.badges),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
              child: Text(
                'YESTERDAY',
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            _notifItem(
              context,
              icon: Icons.emoji_events,
              color: Colors.purple,
              title: 'New leaderboard rank!',
              message: 'You climbed to #142 from #158 this week.',
              time: 'Yesterday',
              onTap: () => context.go(AppRoutes.leaderboard),
            ),
            _notifItem(
              context,
              icon: Icons.assignment,
              color: Colors.blue,
              title: 'Weekly Mock Test Available',
              message: 'New "Kharidar Mock Test" is now available. Take it now!',
              time: 'Yesterday',
              onTap: () => context.push(AppRoutes.examList),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
              child: Text(
                'THIS WEEK',
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            _notifItem(
              context,
              icon: Icons.lightbulb,
              color: Colors.orange,
              title: 'AI Suggestion',
              message: 'Practice 10 Constitution MCQs to improve your weak area.',
              time: '2 days ago',
              onTap: () => context.push(AppRoutes.questionPractice),
            ),
            _notifItem(
              context,
              icon: Icons.workspace_premium,
              color: AppTheme.warning,
              title: 'Special Offer: 50% off Pro',
              message: 'Upgrade to Pro and unlock all features. Limited time!',
              time: '3 days ago',
              onTap: () => context.push(AppRoutes.subscription),
            ),
          ],
        ),
      ),
    );
  }

  Widget _notifItem(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String message,
    required String time,
    bool unread = false,
    VoidCallback? onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: unread
                  ? color.withOpacity(0.05)
                  : Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: unread ? color.withOpacity(0.3) : Theme.of(context).colorScheme.outline,
                width: unread ? 1.5 : 1,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              title,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
                          ),
                          if (unread)
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: color,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        message,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(height: 1.4),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        time,
                        style: TextStyle(
                          color: color,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.1);
  }
}
