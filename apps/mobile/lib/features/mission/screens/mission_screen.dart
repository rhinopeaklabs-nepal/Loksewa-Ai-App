// Mission Screen — Daily/Weekly missions with progress
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/app_dialogs.dart';
import '../../../shared/widgets/section_header.dart';

class MissionScreen extends StatelessWidget {
  const MissionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildHeader(context)),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  _buildOverallProgress(context)
                      .animate()
                      .fadeIn(duration: 500.ms)
                      .slideY(begin: 0.1),
                  const SizedBox(height: 24),
                  SectionHeader(
                    title: 'Daily Missions',
                    subtitle: 'Refreshes every 24 hours',
                    actionText: 'History',
                    onAction: () {},
                  ),
                  const SizedBox(height: 12),
                  ..._buildDailyMissions(context),
                  const SizedBox(height: 28),
                  SectionHeader(
                    title: 'Weekly Challenges',
                    subtitle: 'Earn bonus XP and badges',
                    actionText: 'View all',
                    onAction: () {},
                  ),
                  const SizedBox(height: 12),
                  _buildWeeklyChallenge(context)
                      .animate(delay: 300.ms)
                      .fadeIn(duration: 500.ms),
                  const SizedBox(height: 28),
                  SectionHeader(
                    title: 'Quick Missions',
                    subtitle: 'Bonus tasks for extra rewards',
                  ),
                  const SizedBox(height: 12),
                  ..._buildQuickMissions(context),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Missions',
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Complete to earn XP and climb ranks',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              gradient: AppTheme.secondaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.local_fire_department, color: Colors.white, size: 18),
                SizedBox(width: 4),
                Text(
                  '12 days',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverallProgress(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.heroGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: AppTheme.primaryShadow,
      ),
      child: Row(
        children: [
          CircularPercentIndicator(
            radius: 50,
            lineWidth: 8,
            percent: 0.6,
            circularStrokeCap: CircularStrokeCap.round,
            backgroundColor: Colors.white.withOpacity(0.2),
            progressColor: Colors.white,
            center: const Text(
              '60%',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Today\'s Progress',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  '6 of 10\nquestions',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.bolt, color: Colors.amber, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      '+50 XP remaining',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDailyMissions(BuildContext context) {
    final missions = [
      {
        'title': 'Answer 10 GK questions',
        'subtitle': 'Practice General Knowledge',
        'progress': 0.6,
        'xp': 50,
        'icon': Icons.public,
        'color': Colors.blue,
        'completed': false,
      },
      {
        'title': 'Solve 5 math problems',
        'subtitle': 'Sharpen your arithmetic',
        'progress': 1.0,
        'xp': 30,
        'icon': Icons.calculate,
        'color': Colors.purple,
        'completed': true,
      },
      {
        'title': 'Read 1 constitution article',
        'subtitle': 'Master the basics',
        'progress': 0.0,
        'xp': 20,
        'icon': Icons.gavel,
        'color': Colors.brown,
        'completed': false,
      },
      {
        'title': 'Take 1 mock quiz',
        'subtitle': 'Test your knowledge',
        'progress': 0.0,
        'xp': 40,
        'icon': Icons.assignment,
        'color': AppTheme.primary,
        'completed': false,
      },
    ];

    return List.generate(missions.length, (i) {
      final m = missions[i];
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: _buildMissionTile(
          context,
          title: m['title'] as String,
          subtitle: m['subtitle'] as String,
          progress: m['progress'] as double,
          xp: m['xp'] as int,
          icon: m['icon'] as IconData,
          color: m['color'] as Color,
          completed: m['completed'] as bool,
          onTap: () {
            if (m['completed'] == true) {
              InfoBottomSheet.show(
                context,
                title: 'Already Completed',
                message: 'Great work! You\'ve already earned the XP for this mission.',
                actionText: 'OK',
                onAction: () {},
              );
            } else {
              context.push(AppRoutes.questionPractice);
            }
          },
        ),
      ).animate(delay: (80 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
    });
  }

  Widget _buildMissionTile(
    BuildContext context, {
    required String title,
    required String subtitle,
    required double progress,
    required int xp,
    required IconData icon,
    required Color color,
    required bool completed,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          border: Border.all(
            color: completed ? AppTheme.success : Theme.of(context).colorScheme.outline,
            width: completed ? 1.5 : 1,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                decoration: completed ? TextDecoration.lineThrough : null,
                                color: completed
                                    ? Theme.of(context).colorScheme.onSurfaceVariant
                                    : null,
                              ),
                        ),
                      ),
                      if (completed)
                        const Icon(Icons.check_circle, color: AppTheme.success, size: 18),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: progress,
                            minHeight: 6,
                            backgroundColor: color.withOpacity(0.12),
                            valueColor: AlwaysStoppedAnimation<Color>(color),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${(progress * 100).toInt()}%',
                        style: TextStyle(
                          color: color,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.secondaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.bolt, color: AppTheme.secondary, size: 12),
                  const SizedBox(width: 2),
                  Text(
                    '+$xp',
                    style: const TextStyle(
                      color: AppTheme.secondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeeklyChallenge(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.purpleGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppTheme.tertiary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'WEEKLY',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const Spacer(),
              const Icon(Icons.timer, color: Colors.white70, size: 14),
              const SizedBox(width: 4),
              const Text(
                '4 days left',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'Constitution Master',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Answer 50 Constitution questions correctly this week',
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 14,
              fontWeight: FontWeight.w500,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: 0.4,
              minHeight: 8,
              backgroundColor: Colors.white.withOpacity(0.2),
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '20/50 questions',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.bolt, color: Colors.amber, size: 14),
                  const SizedBox(width: 2),
                  const Text(
                    '+500 XP',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: FilledButton(
              onPressed: () => context.push(AppRoutes.questionPractice),
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppTheme.tertiary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Continue Challenge', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildQuickMissions(BuildContext context) {
    final quick = [
      {
        'title': 'Daily Login',
        'subtitle': 'Already claimed today',
        'icon': Icons.login,
        'color': AppTheme.primary,
        'xp': 5,
        'completed': true,
      },
      {
        'title': 'Share with friends',
        'subtitle': 'Invite 3 friends',
        'icon': Icons.share,
        'color': Colors.blue,
        'xp': 100,
        'completed': false,
      },
      {
        'title': 'Rate the app',
        'subtitle': 'Help us improve',
        'icon': Icons.star,
        'color': Colors.amber,
        'xp': 25,
        'completed': false,
      },
    ];
    return List.generate(quick.length, (i) {
      final m = quick[i];
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: _buildMissionTile(
          context,
          title: m['title'] as String,
          subtitle: m['subtitle'] as String,
          progress: m['completed'] == true ? 1.0 : 0.0,
          xp: m['xp'] as int,
          icon: m['icon'] as IconData,
          color: m['color'] as Color,
          completed: m['completed'] == true,
          onTap: () {
            if (m['completed'] == true) {
              InfoBottomSheet.show(
                context,
                title: 'Already Claimed',
                message: 'You\'ve already completed this mission.',
                actionText: 'OK',
                onAction: () {},
              );
            }
          },
        ),
      ).animate(delay: (80 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
    });
  }
}
