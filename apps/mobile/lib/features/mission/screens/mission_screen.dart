// Mission Screen — Daily/Weekly missions with progress
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/providers/data_providers.dart';
import '../../../shared/widgets/section_header.dart';

class MissionScreen extends ConsumerStatefulWidget {
  const MissionScreen({super.key});

  @override
  ConsumerState<MissionScreen> createState() => _MissionScreenState();
}

class _MissionScreenState extends ConsumerState<MissionScreen> {
  // Track claimed mission IDs locally
  final Set<String> _claimedMissions = {};

  // Track progress of missions
  late List<Map<String, dynamic>> _dailyMissions;
  late List<Map<String, dynamic>> _quickMissions;
  late Map<String, dynamic> _weeklyChallenge;

  @override
  void initState() {
    super.initState();
    _dailyMissions = [
      {
        'id': 'daily_1',
        'title': 'Answer 10 GK questions',
        'subtitle': 'Practice General Knowledge',
        'progress': 0.6,
        'xp': 50,
        'icon': Icons.public,
        'color': Colors.blue,
      },
      {
        'id': 'daily_2',
        'title': 'Solve 5 math problems',
        'subtitle': 'Sharpen your arithmetic',
        'progress': 1.0, // Completed, ready to claim
        'xp': 30,
        'icon': Icons.calculate,
        'color': Colors.purple,
      },
      {
        'id': 'daily_3',
        'title': 'Read 1 constitution article',
        'subtitle': 'Master the basics',
        'progress': 0.0,
        'xp': 20,
        'icon': Icons.gavel,
        'color': Colors.brown,
      },
      {
        'id': 'daily_4',
        'title': 'Take 1 mock quiz',
        'subtitle': 'Test your knowledge',
        'progress': 1.0, // Completed, ready to claim
        'xp': 40,
        'icon': Icons.assignment,
        'color': AppTheme.primary,
      },
    ];

    _weeklyChallenge = {
      'id': 'weekly_1',
      'title': 'Constitution Master',
      'subtitle': 'Answer 50 Constitution questions correctly this week',
      'progress': 0.4,
      'xp': 500,
      'color': Colors.deepPurple,
    };

    _quickMissions = [
      {
        'id': 'quick_1',
        'title': 'Daily Login',
        'subtitle': 'Claim your daily login reward',
        'progress': 1.0,
        'icon': Icons.login,
        'color': AppTheme.primary,
        'xp': 10,
      },
      {
        'id': 'quick_2',
        'title': 'Share with friends',
        'subtitle': 'Invite 3 friends to prepare together',
        'progress': 0.0,
        'icon': Icons.share,
        'color': Colors.blue,
        'xp': 100,
      },
      {
        'id': 'quick_3',
        'title': 'Rate the app',
        'subtitle': 'Help us improve your experience',
        'progress': 1.0,
        'icon': Icons.star,
        'color': Colors.amber,
        'xp': 25,
      },
    ];
  }

  void _claimReward(String id, int xp) {
    setState(() {
      _claimedMissions.add(id);
    });

    showDialog(
      context: context,
      builder: (context) => GFAlert(
        alignment: Alignment.center,
        type: GFAlertType.rounded,
        title: 'Congratulations!',
        content: Text('You have claimed your reward of +$xp XP!\nKeep up the great work.'),
        bottomBar: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            GFButton(
              onPressed: () => Navigator.pop(context),
              text: 'Awesome!',
              color: GFColors.SUCCESS,
              shape: GFButtonShape.pills,
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Integrate with study progress provider to fetch real stats if needed
    final progressAsync = ref.watch(modelStudyProgressProvider);

    // Calculate completed count for circular indicator
    int totalMissionsCount = _dailyMissions.length + _quickMissions.length;
    int completedMissionsCount = 0;
    for (var m in _dailyMissions) {
      if (m['progress'] >= 1.0) completedMissionsCount++;
    }
    for (var m in _quickMissions) {
      if (m['progress'] >= 1.0) completedMissionsCount++;
    }

    double overallProgress = totalMissionsCount > 0 ? (completedMissionsCount / totalMissionsCount) : 0.0;

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
                  _buildOverallProgress(context, completedMissionsCount, totalMissionsCount, overallProgress)
                      .animate()
                      .fadeIn(duration: 500.ms)
                      .slideY(begin: 0.1),
                  const SizedBox(height: 24),
                  SectionHeader(
                    title: 'Daily Missions',
                    subtitle: 'Refreshes every 24 hours',
                  ),
                  const SizedBox(height: 12),
                  ..._buildDailyMissionsList(context),
                  const SizedBox(height: 28),
                  SectionHeader(
                    title: 'Weekly Challenges',
                    subtitle: 'Earn bonus XP and badges',
                  ),
                  const SizedBox(height: 12),
                  _buildWeeklyChallengeWidget(context)
                      .animate(delay: 300.ms)
                      .fadeIn(duration: 500.ms),
                  const SizedBox(height: 28),
                  SectionHeader(
                    title: 'Quick Missions',
                    subtitle: 'Bonus tasks for extra rewards',
                  ),
                  const SizedBox(height: 12),
                  ..._buildQuickMissionsList(context),
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

  Widget _buildOverallProgress(BuildContext context, int completed, int total, double progress) {
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
            percent: progress.clamp(0.0, 1.0),
            circularStrokeCap: CircularStrokeCap.round,
            backgroundColor: Colors.white.withOpacity(0.2),
            progressColor: Colors.white,
            center: Text(
              '${(progress * 100).toStringAsFixed(0)}%',
              style: const TextStyle(
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
                Text(
                  '$completed of $total\nmissions completed',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDailyMissionsList(BuildContext context) {
    return List.generate(_dailyMissions.length, (i) {
      final m = _dailyMissions[i];
      final isClaimed = _claimedMissions.contains(m['id']);

      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: _buildMissionTile(
          context,
          id: m['id'] as String,
          title: m['title'] as String,
          subtitle: m['subtitle'] as String,
          progress: m['progress'] as double,
          xp: m['xp'] as int,
          icon: m['icon'] as IconData,
          color: m['color'] as Color,
          isClaimed: isClaimed,
          onTap: () {
            if (m['progress'] < 1.0) {
              context.push(AppRoutes.questionPractice);
            }
          },
        ),
      ).animate(delay: (80 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
    });
  }

  Widget _buildWeeklyChallengeWidget(BuildContext context) {
    final m = _weeklyChallenge;
    final isClaimed = _claimedMissions.contains(m['id']);
    final isCompleted = m['progress'] >= 1.0;

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
          Text(
            m['title'] as String,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            m['subtitle'] as String,
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
              value: m['progress'] as double,
              minHeight: 8,
              backgroundColor: Colors.white.withOpacity(0.2),
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${(m['progress'] * 50).toInt()}/50 questions',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.bolt, color: Colors.amber, size: 14),
                  const SizedBox(width: 2),
                  Text(
                    '+${m['xp']} XP',
                    style: const TextStyle(
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
            child: isClaimed
                ? GFButton(
                    onPressed: null,
                    text: 'Claimed',
                    color: GFColors.LIGHT,
                    shape: GFButtonShape.pills,
                  )
                : isCompleted
                    ? GFButton(
                        onPressed: () => _claimReward(m['id'] as String, m['xp'] as int),
                        text: 'Claim Reward',
                        color: GFColors.SUCCESS,
                        shape: GFButtonShape.pills,
                        textStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                      )
                    : FilledButton(
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

  List<Widget> _buildQuickMissionsList(BuildContext context) {
    return List.generate(_quickMissions.length, (i) {
      final m = _quickMissions[i];
      final isClaimed = _claimedMissions.contains(m['id']);

      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: _buildMissionTile(
          context,
          id: m['id'] as String,
          title: m['title'] as String,
          subtitle: m['subtitle'] as String,
          progress: m['progress'] as double,
          xp: m['xp'] as int,
          icon: m['icon'] as IconData,
          color: m['color'] as Color,
          isClaimed: isClaimed,
          onTap: () {},
        ),
      ).animate(delay: (80 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
    });
  }

  Widget _buildMissionTile(
    BuildContext context, {
    required String id,
    required String title,
    required String subtitle,
    required double progress,
    required int xp,
    required IconData icon,
    required Color color,
    required bool isClaimed,
    required VoidCallback onTap,
  }) {
    final isCompleted = progress >= 1.0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border.all(
          color: isClaimed
              ? Theme.of(context).colorScheme.outline
              : (isCompleted ? AppTheme.success : Theme.of(context).colorScheme.outline),
          width: isCompleted && !isClaimed ? 1.5 : 1,
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
                              decoration: isClaimed ? TextDecoration.lineThrough : null,
                              color: isClaimed
                                  ? Theme.of(context).colorScheme.onSurfaceVariant
                                  : null,
                            ),
                      ),
                    ),
                    if (isClaimed)
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
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
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
              if (isCompleted && !isClaimed) ...[
                const SizedBox(height: 8),
                GFButton(
                  onPressed: () => _claimReward(id, xp),
                  text: 'Claim',
                  color: GFColors.SUCCESS,
                  size: GFSize.SMALL,
                  shape: GFButtonShape.pills,
                ),
              ] else if (isClaimed) ...[
                const SizedBox(height: 8),
                GFBadge(
                  text: 'Claimed',
                  color: GFColors.LIGHT,
                  shape: GFBadgeShape.standard,
                  textStyle: const TextStyle(color: AppTheme.textSecondary, fontSize: 10),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
