// Achievements Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/widgets/section_header.dart';

class AchievementsScreen extends StatelessWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Achievements'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _levelCard(context).animate().fadeIn(duration: 500.ms).scale(begin: const Offset(0.95, 0.95)),
              const SizedBox(height: 24),
              SectionHeader(
                title: 'Milestones',
                subtitle: 'Major achievements unlocked',
              ),
              const SizedBox(height: 12),
              ...List.generate(_milestones.length, (i) {
                final m = _milestones[i];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _milestoneCard(context, m, i),
                );
              }),
              const SizedBox(height: 16),
              SectionHeader(
                title: 'Stats',
                subtitle: 'Your learning journey',
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _statBox(context, '348', 'Quizzes Done', AppTheme.primary, Icons.quiz)),
                  const SizedBox(width: 10),
                  Expanded(child: _statBox(context, '4,250', 'Questions', Colors.purple, Icons.help)),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _statBox(context, '85%', 'Avg Accuracy', AppTheme.success, Icons.gps_fixed)),
                  const SizedBox(width: 10),
                  Expanded(child: _statBox(context, '142h', 'Study Time', AppTheme.tertiary, Icons.timer)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _levelCard(BuildContext context) {
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
                ),
                child: const Center(
                  child: Text(
                    '8',
                    style: TextStyle(
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
                    const Text(
                      'Level 8',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      'Knowledge Seeker',
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
                        value: 0.82,
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
                child: const Text(
                  '2,450 / 3,000',
                  style: TextStyle(
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
            '550 XP to Level 9',
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

  Widget _milestoneCard(BuildContext context, Map<String, dynamic> m, int i) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: (m['color'] as Color).withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(m['icon'] as IconData, color: m['color'] as Color, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  m['title'] as String,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  m['desc'] as String,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      m['date'] as String,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 11),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: (m['color'] as Color).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        m['reward'] as String,
                        style: TextStyle(
                          color: m['color'] as Color,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate(delay: (60 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
  }

  Widget _statBox(BuildContext context, String value, String label, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }

  static const _milestones = [
    {
      'title': 'First Quiz Completed',
      'desc': 'You started your journey',
      'date': '15 Dec 2024',
      'icon': Icons.star,
      'color': Colors.amber,
      'reward': '+10 XP',
    },
    {
      'title': '100 Questions Solved',
      'desc': 'A solid foundation',
      'date': '20 Dec 2024',
      'icon': Icons.bolt,
      'color': AppTheme.primary,
      'reward': '+50 XP',
    },
    {
      'title': '7-Day Streak',
      'desc': 'Consistency is key',
      'date': '2 Jan 2025',
      'icon': Icons.local_fire_department,
      'color': Colors.orange,
      'reward': '+100 XP',
    },
    {
      'title': 'First Perfect Score',
      'desc': '100% in a mock test',
      'date': '15 Jan 2025',
      'icon': Icons.workspace_premium,
      'color': Colors.purple,
      'reward': '+200 XP',
    },
    {
      'title': 'Top 200 Rank',
      'desc': 'You\'re climbing!',
      'date': '20 Jan 2025',
      'icon': Icons.emoji_events,
      'color': AppTheme.warning,
      'reward': '+300 XP',
    },
  ];
}
