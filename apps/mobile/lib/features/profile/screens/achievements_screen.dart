import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/providers/data_providers.dart';

final userStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.watch(userRepositoryProvider).getStats();
});

class AchievementsScreen extends ConsumerWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(userStatsProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Achievements'),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(userStatsProvider);
            return ref.read(userStatsProvider.future);
          },
          child: statsAsync.when(
            data: (stats) {
              final quizzes = stats['total_mocks_completed'] ?? 0;
              final answered = stats['total_questions_answered'] ?? 0;
              final bestScore = stats['best_score'] ?? 0;
              final avgScore = stats['average_score'] ?? 0;
              final accuracy = stats['correct_rate'] ?? 0;

              // Compute milestones
              final milestoneList = [
                _Milestone(
                  title: 'First Step',
                  desc: 'Complete your first mock test.',
                  current: quizzes,
                  target: 1,
                  icon: Icons.star_rounded,
                  color: Colors.amber,
                ),
                _Milestone(
                  title: 'Knowledge Seeker',
                  desc: 'Solve 100 practice questions.',
                  current: answered,
                  target: 100,
                  icon: Icons.bolt_rounded,
                  color: AppTheme.primary,
                ),
                _Milestone(
                  title: 'Consistency King',
                  desc: 'Complete 5 mock tests.',
                  current: quizzes,
                  target: 5,
                  icon: Icons.local_fire_department_rounded,
                  color: Colors.orange,
                ),
                _Milestone(
                  title: 'Perfect Marks',
                  desc: 'Get 100% correct in any quiz.',
                  current: bestScore,
                  target: 100,
                  icon: Icons.workspace_premium_rounded,
                  color: Colors.purple,
                ),
                _Milestone(
                  title: 'Accuracy Master',
                  desc: 'Maintain average score of 80% or above.',
                  current: avgScore,
                  target: 80,
                  icon: Icons.emoji_events_rounded,
                  color: Colors.teal,
                ),
              ];

              return SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _levelCard(context, quizzes, answered).animate().fadeIn(duration: 500.ms),
                    const SizedBox(height: 24),
                    
                    SectionHeader(
                      title: 'Milestones & Trophies',
                      subtitle: 'Progress towards unlocking your badges',
                    ),
                    const SizedBox(height: 12),
                    
                    ...List.generate(milestoneList.length, (index) {
                      final m = milestoneList[index];
                      final isCompleted = m.isCompleted;
                      final progress = m.progress;
                      
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isCompleted 
                                  ? m.color.withOpacity(0.5) 
                                  : Theme.of(context).colorScheme.outline,
                              width: isCompleted ? 1.5 : 1,
                            ),
                          ),
                          child: GFListTile(
                            margin: EdgeInsets.zero,
                            padding: const EdgeInsets.all(12),
                            avatar: Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: m.color.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(m.icon, color: m.color, size: 28),
                            ),
                            titleText: m.title,
                            subTitleText: m.desc,
                            icon: isCompleted
                                ? Icon(Icons.check_circle_rounded, color: m.color, size: 24)
                                : const Icon(Icons.radio_button_unchecked_rounded, color: Colors.grey, size: 24),
                            description: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Expanded(
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(4),
                                        child: LinearProgressIndicator(
                                          value: progress,
                                          minHeight: 6,
                                          backgroundColor: Theme.of(context).colorScheme.outline,
                                          valueColor: AlwaysStoppedAnimation<Color>(m.color),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Text(
                                      '${m.current}/${m.target}',
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ).animate(delay: (50 * index).ms).fadeIn(duration: 400.ms).slideX(begin: 0.05);
                    }),
                    
                    const SizedBox(height: 24),
                    SectionHeader(
                      title: 'Badges Earned',
                      subtitle: 'Milestones you have fully achieved',
                    ),
                    const SizedBox(height: 12),
                    
                    _buildBadgesGrid(context, milestoneList),
                  ],
                ),
              );
            },
            loading: () => const Center(
              child: CircularProgressIndicator(),
            ),
            error: (err, stack) => Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 48),
                    const SizedBox(height: 16),
                    Text('Failed to load stats: $err'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.invalidate(userStatsProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _levelCard(BuildContext context, int quizzes, int answered) {
    // Basic gamified level calculation: 10 XP per answered question, 100 XP per quiz
    final int xp = (answered * 10) + (quizzes * 100);
    final int level = (xp / 1000).floor() + 1;
    final int nextLevelXp = level * 1000;
    final int prevLevelXp = (level - 1) * 1000;
    final int currentLevelProgressXp = xp - prevLevelXp;
    final double levelProgress = currentLevelProgressXp / 1000;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppTheme.heroGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: AppTheme.primaryShadow,
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  gradient: AppTheme.secondaryGradient,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                ),
                child: Center(
                  child: Text(
                    '$level',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Level $level',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      _levelTitle(level),
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'XP Progress',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: levelProgress,
                        minHeight: 8,
                        backgroundColor: Colors.white.withOpacity(0.2),
                        valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$currentLevelProgressXp / 1000',
                  style: const TextStyle(
                    color: AppTheme.primary,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${1000 - currentLevelProgressXp} XP to Level ${level + 1}',
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  String _levelTitle(int level) {
    if (level < 3) return 'Novice Explorer';
    if (level < 6) return 'Knowledge Seeker';
    if (level < 10) return 'Loksewa Scholar';
    return 'Master Scholar';
  }

  Widget _buildBadgesGrid(BuildContext context, List<_Milestone> milestones) {
    final completedMilestones = milestones.where((m) => m.isCompleted).toList();
    
    if (completedMilestones.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Theme.of(context).colorScheme.outline),
        ),
        child: Column(
          children: [
            Icon(Icons.lock_rounded, size: 48, color: Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.5)),
            const SizedBox(height: 12),
            const Text(
              'No Badges Unlocked Yet',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              'Complete milestones above to unlock badges!',
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.9,
      ),
      itemCount: completedMilestones.length,
      itemBuilder: (context, index) {
        final m = completedMilestones[index];
        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: m.color.withOpacity(0.4), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: m.color.withOpacity(0.1),
                blurRadius: 6,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: m.color.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(m.icon, color: m.color, size: 24),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4.0),
                child: Text(
                  m.title,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'UNLOCKED',
                style: TextStyle(
                  color: Colors.green,
                  fontWeight: FontWeight.w900,
                  fontSize: 8,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Milestone {
  final String title;
  final String desc;
  final int current;
  final int target;
  final IconData icon;
  final Color color;

  _Milestone({
    required this.title,
    required this.desc,
    required this.current,
    required this.target,
    required this.icon,
    required this.color,
  });

  bool get isCompleted => current >= target;
  double get progress => (current / target).clamp(0.0, 1.0);
}
