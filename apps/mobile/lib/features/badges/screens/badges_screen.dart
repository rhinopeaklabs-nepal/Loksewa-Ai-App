// Badges Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/widgets/section_header.dart';

class BadgesScreen extends StatelessWidget {
  const BadgesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final badges = [
      {'name': 'First Steps', 'desc': 'Complete your first quiz', 'icon': Icons.star, 'color': Colors.amber, 'unlocked': true, 'progress': 1.0},
      {'name': 'Quick Learner', 'desc': 'Answer 10 questions in a row', 'icon': Icons.bolt, 'color': Colors.blue, 'unlocked': true, 'progress': 1.0},
      {'name': 'Math Whiz', 'desc': 'Solve 50 math problems', 'icon': Icons.calculate, 'color': Colors.purple, 'unlocked': true, 'progress': 1.0},
      {'name': 'GK Master', 'desc': 'Score 100% in 5 GK quizzes', 'icon': Icons.public, 'color': Colors.teal, 'unlocked': true, 'progress': 1.0},
      {'name': 'Streak Keeper', 'desc': '7-day streak', 'icon': Icons.local_fire_department, 'color': Colors.orange, 'unlocked': true, 'progress': 1.0},
      {'name': 'Week Warrior', 'desc': '14-day streak', 'icon': Icons.shield, 'color': Colors.red, 'unlocked': false, 'progress': 0.86},
      {'name': 'Constitution Pro', 'desc': 'Master 100 Constitution Qs', 'icon': Icons.gavel, 'color': Colors.brown, 'unlocked': false, 'progress': 0.65},
      {'name': 'English Expert', 'desc': '90% accuracy in English', 'icon': Icons.translate, 'color': Colors.indigo, 'unlocked': false, 'progress': 0.45},
      {'name': 'Speed Demon', 'desc': '10 questions in 60 seconds', 'icon': Icons.flash_on, 'color': Colors.amber, 'unlocked': false, 'progress': 0.0},
      {'name': 'Top 100', 'desc': 'Reach leaderboard top 100', 'icon': Icons.emoji_events, 'color': Colors.deepOrange, 'unlocked': false, 'progress': 0.0},
    ];

    final unlocked = badges.where((b) => b['unlocked'] == true).length;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Badges'),
      ),
      body: SafeArea(
        child: Column(
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
                            '$unlocked / ${badges.length}',
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
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.85,
                ),
                itemCount: badges.length,
                itemBuilder: (context, i) {
                  final b = badges[i];
                  return _buildBadgeCard(context, b, i);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadgeCard(BuildContext context, Map<String, dynamic> b, int index) {
    final isUnlocked = b['unlocked'] as bool;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isUnlocked
              ? (b['color'] as Color).withOpacity(0.4)
              : Theme.of(context).colorScheme.outline,
          width: isUnlocked ? 1.5 : 1,
        ),
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: isUnlocked
                      ? (b['color'] as Color).withOpacity(0.15)
                      : Theme.of(context).colorScheme.surfaceVariant,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isUnlocked
                        ? (b['color'] as Color)
                        : Theme.of(context).colorScheme.outline,
                    width: 2,
                  ),
                ),
                child: Icon(
                  b['icon'] as IconData,
                  color: isUnlocked
                      ? b['color'] as Color
                      : Theme.of(context).colorScheme.onSurfaceVariant,
                  size: 28,
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
                      size: 12,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            b['name'] as String,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: isUnlocked ? null : Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            b['desc'] as String,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 9, color: AppTheme.textSecondary, height: 1.2),
          ),
          if (!isUnlocked) ...[
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: LinearProgressIndicator(
                value: b['progress'] as double,
                minHeight: 4,
                backgroundColor: Theme.of(context).colorScheme.outline,
                valueColor: AlwaysStoppedAnimation<Color>(b['color'] as Color),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '${((b['progress'] as double) * 100).toInt()}%',
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: b['color'] as Color,
              ),
            ),
          ],
        ],
      ),
    ).animate(delay: (40 * index).ms).fadeIn(duration: 400.ms).scale(begin: const Offset(0.8, 0.8));
  }
}
