// Streak Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/widgets/section_header.dart';

class StreakScreen extends StatelessWidget {
  const StreakScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Streak'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            children: [
              // Hero card
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  gradient: AppTheme.secondaryGradient,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.secondary.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Icon(Icons.local_fire_department, color: Colors.white, size: 80),
                    const SizedBox(height: 8),
                    const Text(
                      '12',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 64,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      'Day Streak',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.emoji_events, color: AppTheme.secondary, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            'Personal Best: 24 days',
                            style: TextStyle(
                              color: AppTheme.secondary,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
              const SizedBox(height: 24),
              SectionHeader(
                title: 'This Week',
                subtitle: 'Solve today to keep streak alive',
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(7, (i) {
                  final days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                  final isCompleted = i < 5;
                  final isToday = i == 5;
                  return Column(
                    children: [
                      Text(
                        days[i],
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: isCompleted
                              ? AppTheme.success
                              : isToday
                                  ? AppTheme.secondary
                                  : Theme.of(context).colorScheme.surfaceVariant,
                          shape: BoxShape.circle,
                        ),
                        child: isCompleted
                            ? const Icon(Icons.check, color: Colors.white, size: 20)
                            : isToday
                                ? const Icon(Icons.local_fire_department, color: Colors.white, size: 18)
                                : null,
                      ),
                    ],
                  );
                }),
              ).animate(delay: 200.ms).fadeIn(duration: 500.ms),
              const SizedBox(height: 24),
              SectionHeader(
                title: 'Streak Rewards',
                subtitle: 'Keep learning to earn more',
              ),
              const SizedBox(height: 12),
              _rewardCard(context, 7, 'Week Warrior', '+200 XP', AppTheme.primary, true),
              const SizedBox(height: 8),
              _rewardCard(context, 14, 'Fortnight Force', '+500 XP + Badge', Colors.purple, false),
              const SizedBox(height: 8),
              _rewardCard(context, 30, 'Monthly Master', '+1500 XP + Premium', AppTheme.secondary, false),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.info.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: AppTheme.info),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Streak freezes: You have 2 available. They auto-apply if you miss a day.',
                        style: TextStyle(
                          color: AppTheme.info,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _rewardCard(BuildContext context, int days, String title, String reward, Color color, bool isAchieved) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isAchieved ? color.withOpacity(0.05) : Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isAchieved ? color : Theme.of(context).colorScheme.outline,
          width: isAchieved ? 1.5 : 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: isAchieved ? color : color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.local_fire_department,
              color: isAchieved ? Colors.white : color,
              size: 28,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '$days-Day Streak',
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                    ),
                    if (isAchieved) ...[
                      const SizedBox(width: 6),
                      const Icon(Icons.check_circle, color: AppTheme.success, size: 14),
                    ],
                  ],
                ),
                Text(title, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: isAchieved ? color : color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              reward,
              style: TextStyle(
                color: isAchieved ? Colors.white : color,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
