// Streak Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/providers/data_providers.dart';
import '../../../shared/widgets/section_header.dart';

class StreakScreen extends ConsumerWidget {
  const StreakScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(modelStudyProgressProvider);

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
              progressAsync.when(
                data: (progressList) {
                  // Get max streak days from the user study progress
                  final streakDays = progressList.isNotEmpty
                      ? progressList.map((e) => e.streakDays).reduce((a, b) => a > b ? a : b)
                      : 12;

                  return Container(
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
                        Text(
                          '$streakDays',
                          style: const TextStyle(
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
                                'Personal Best: ${streakDays > 24 ? streakDays : 24} days',
                                style: const TextStyle(
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
                  ).animate().scale(duration: 600.ms, curve: Curves.elasticOut);
                },
                loading: () => const Center(child: GFLoader(type: GFLoaderType.circle)),
                error: (_, __) => Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    gradient: AppTheme.secondaryGradient,
                    borderRadius: BorderRadius.circular(28),
                  ),
                  child: const Center(
                    child: Text('Failed to load streak details', style: TextStyle(color: Colors.white)),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              _buildCalendarGrid(context),
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
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: AppTheme.info),
                    SizedBox(width: 12),
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

  Widget _buildCalendarGrid(BuildContext context) {
    final now = DateTime.now();
    final firstDayOfMonth = DateTime(now.year, now.month, 1);
    final totalDays = DateTime(now.year, now.month + 1, 0).day;
    final startWeekday = firstDayOfMonth.weekday; // 1 = Monday, 7 = Sunday
    
    // Adjust start weekday to be 0-indexed (0 = Monday, 6 = Sunday)
    final offset = startWeekday - 1;
    
    // Simulate streak dates: active dates are the last 12 days including today
    final activeDays = <int>{};
    for (int i = 0; i < 12; i++) {
      final activeDate = now.subtract(Duration(days: i));
      if (activeDate.month == now.month) {
        activeDays.add(activeDate.day);
      }
    }

    final weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Streak Calendar',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: weekdays
                .map((w) => Text(
                      w,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 8),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
            ),
            itemCount: totalDays + offset,
            itemBuilder: (context, idx) {
              if (idx < offset) {
                return const SizedBox();
              }
              final day = idx - offset + 1;
              final isActive = activeDays.contains(day);
              final isToday = day == now.day;

              return Container(
                decoration: BoxDecoration(
                  color: isActive
                      ? AppTheme.secondary.withOpacity(0.2)
                      : isToday
                          ? Theme.of(context).colorScheme.outline
                          : Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                  shape: BoxShape.circle,
                  border: isToday ? Border.all(color: AppTheme.secondary, width: 2) : null,
                ),
                alignment: Alignment.center,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Text(
                      '$day',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: (isActive || isToday) ? FontWeight.bold : FontWeight.normal,
                        color: isActive ? AppTheme.secondary : Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                    if (isActive)
                      const Positioned(
                        bottom: 2,
                        child: Icon(Icons.local_fire_department, size: 8, color: AppTheme.secondary),
                      ),
                  ],
                ),
              );
            },
          ),
        ],
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
