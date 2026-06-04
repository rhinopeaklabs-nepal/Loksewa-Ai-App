// Badges Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/providers/data_providers.dart';

class BadgesScreen extends ConsumerStatefulWidget {
  const BadgesScreen({super.key});

  @override
  ConsumerState<BadgesScreen> createState() => _BadgesScreenState();
}

class _BadgesScreenState extends ConsumerState<BadgesScreen> {
  // Set to store indices of currently toggled badges (showing descriptions/progress)
  final Set<int> _toggledIndices = {};

  final List<Map<String, dynamic>> _badges = [
    {
      'name': 'First Steps',
      'desc': 'Complete your first quiz',
      'icon': Icons.star,
      'color': Colors.amber,
      'unlocked': true,
      'progress': 1.0,
      'reward': '+100 XP'
    },
    {
      'name': 'Quick Learner',
      'desc': 'Answer 10 questions in a row',
      'icon': Icons.bolt,
      'color': Colors.blue,
      'unlocked': true,
      'progress': 1.0,
      'reward': '+200 XP'
    },
    {
      'name': 'Math Whiz',
      'desc': 'Solve 50 math problems',
      'icon': Icons.calculate,
      'color': Colors.purple,
      'unlocked': true,
      'progress': 1.0,
      'reward': '+300 XP'
    },
    {
      'name': 'GK Master',
      'desc': 'Score 100% in 5 GK quizzes',
      'icon': Icons.public,
      'color': Colors.teal,
      'unlocked': true,
      'progress': 1.0,
      'reward': '+400 XP'
    },
    {
      'name': 'Streak Keeper',
      'desc': '7-day streak',
      'icon': Icons.local_fire_department,
      'color': Colors.orange,
      'unlocked': true,
      'progress': 1.0,
      'reward': '+500 XP'
    },
    {
      'name': 'Daily Champion',
      'desc': 'Complete all daily missions',
      'icon': Icons.emoji_events,
      'color': Colors.amber,
      'unlocked': false,
      'progress': 0.6,
      'reward': '+250 XP'
    },
    {
      'name': 'Exam Ace',
      'desc': 'Score 90%+ in full mock exam',
      'icon': Icons.check_circle_outline,
      'color': Colors.indigo,
      'unlocked': false,
      'progress': 0.8,
      'reward': '+500 XP'
    },
    {
      'name': 'Week Warrior',
      'desc': '14-day study streak',
      'icon': Icons.shield,
      'color': Colors.red,
      'unlocked': false,
      'progress': 0.86,
      'reward': '+600 XP'
    },
    {
      'name': 'Constitution Pro',
      'desc': 'Master 100 Constitution Qs',
      'icon': Icons.gavel,
      'color': Colors.brown,
      'unlocked': false,
      'progress': 0.65,
      'reward': '+350 XP'
    },
    {
      'name': 'English Expert',
      'desc': '90% accuracy in English',
      'icon': Icons.translate,
      'color': Colors.indigo,
      'unlocked': false,
      'progress': 0.45,
      'reward': '+300 XP'
    },
    {
      'name': 'Speed Demon',
      'desc': '10 Qs in 60 seconds',
      'icon': Icons.flash_on,
      'color': Colors.amber,
      'unlocked': false,
      'progress': 0.2,
      'reward': '+150 XP'
    },
    {
      'name': 'Top 100',
      'desc': 'Leaderboard Top 100 rank',
      'icon': Icons.military_tech,
      'color': Colors.deepOrange,
      'unlocked': false,
      'progress': 0.0,
      'reward': '+1000 XP'
    },
  ];

  @override
  Widget build(BuildContext context) {
    // Read user statistics to dynamically update some locks if needed
    final progressAsync = ref.watch(modelStudyProgressProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Badges'),
      ),
      body: SafeArea(
        child: progressAsync.when(
          data: (progressList) {
            final unlocked = _badges.where((b) => b['unlocked'] == true).length;

            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: AppTheme.purpleGradient,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.military_tech, color: Colors.white, size: 40),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '$unlocked / ${_badges.length}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const Text(
                                'Badges Earned',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.95, 0.95)),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      const Icon(Icons.touch_app, size: 16, color: AppTheme.textSecondary),
                      const SizedBox(width: 6),
                      Text(
                        'Tap any badge to toggle details & progress',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 0.82,
                    ),
                    itemCount: _badges.length,
                    itemBuilder: (context, i) {
                      final b = _badges[i];
                      return _buildBadgeCard(context, b, i);
                    },
                  ),
                ),
              ],
            );
          },
          loading: () => const Center(child: GFLoader(type: GFLoaderType.circle)),
          error: (err, _) => Center(child: Text('Error loading achievements: $err')),
        ),
      ),
    );
  }

  Widget _buildBadgeCard(BuildContext context, Map<String, dynamic> b, int index) {
    final isUnlocked = b['unlocked'] as bool;
    final isToggled = _toggledIndices.contains(index);
    final badgeColor = b['color'] as Color;

    return GestureDetector(
      onTap: () {
        setState(() {
          if (isToggled) {
            _toggledIndices.remove(index);
          } else {
            _toggledIndices.add(index);
          }
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isUnlocked
                ? badgeColor.withOpacity(isToggled ? 0.8 : 0.4)
                : Theme.of(context).colorScheme.outline,
            width: isToggled ? 2.0 : (isUnlocked ? 1.5 : 1),
          ),
          boxShadow: isToggled
              ? [
                  BoxShadow(
                    color: badgeColor.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  )
                ]
              : null,
        ),
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: isToggled
              ? Column(
                  key: ValueKey('desc_$index'),
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      b['name'] as String,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      b['desc'] as String,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 8,
                        color: AppTheme.textSecondary,
                        height: 1.1,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: LinearProgressIndicator(
                        value: b['progress'] as double,
                        minHeight: 4,
                        backgroundColor: Theme.of(context).colorScheme.outline,
                        valueColor: AlwaysStoppedAnimation<Color>(badgeColor),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${((b['progress'] as double) * 100).toInt()}%',
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: badgeColor,
                      ),
                    ),
                  ],
                )
              : Column(
                  key: ValueKey('icon_$index'),
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 54,
                          height: 54,
                          decoration: BoxDecoration(
                            color: isUnlocked
                                ? badgeColor.withOpacity(0.15)
                                : Theme.of(context).colorScheme.surfaceVariant,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isUnlocked ? badgeColor : Theme.of(context).colorScheme.outline,
                              width: 2,
                            ),
                          ),
                          child: Icon(
                            b['icon'] as IconData,
                            color: isUnlocked ? badgeColor : Theme.of(context).colorScheme.onSurfaceVariant,
                            size: 24,
                          ),
                        ),
                        if (!isUnlocked)
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.surface,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.lock,
                                size: 10,
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      b['name'] as String,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: isUnlocked ? null : Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      b['reward'] as String,
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: isUnlocked ? badgeColor : AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    ).animate(delay: (30 * index).ms).fadeIn(duration: 350.ms).scale(begin: const Offset(0.9, 0.9));
  }
}
