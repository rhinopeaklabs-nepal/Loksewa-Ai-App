// Exam List Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/section_header.dart';

class ExamListScreen extends StatelessWidget {
  const ExamListScreen({super.key});

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
                  _buildCategoryChips(context).animate().fadeIn(duration: 500.ms),
                  const SizedBox(height: 20),
                  SectionHeader(
                    title: 'Featured Mock Tests',
                    subtitle: 'Most popular exams',
                    actionText: 'See all',
                    onAction: () {},
                  ),
                  const SizedBox(height: 12),
                  ..._buildFeaturedExams(context),
                  const SizedBox(height: 28),
                  SectionHeader(
                    title: 'Subject-wise Tests',
                    subtitle: 'Target specific topics',
                  ),
                  const SizedBox(height: 12),
                  ..._buildSubjectExams(context),
                  const SizedBox(height: 28),
                  SectionHeader(
                    title: 'Full Model Sets',
                    subtitle: 'Real exam simulation',
                  ),
                  const SizedBox(height: 12),
                  ..._buildModelSets(context),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Mock Exams',
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            'Practice with real exam patterns',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChips(BuildContext context) {
    final cats = [
      {'label': 'All', 'icon': Icons.apps_rounded, 'selected': true},
      {'label': 'GK', 'icon': Icons.public, 'selected': false},
      {'label': 'Math', 'icon': Icons.calculate, 'selected': false},
      {'label': 'English', 'icon': Icons.translate, 'selected': false},
      {'label': 'Reasoning', 'icon': Icons.psychology, 'selected': false},
    ];
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: cats.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final c = cats[i];
          final selected = c['selected'] as bool;
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: selected ? AppTheme.primary : Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: selected ? AppTheme.primary : Theme.of(context).colorScheme.outline,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  c['icon'] as IconData,
                  size: 16,
                  color: selected ? Colors.white : Theme.of(context).colorScheme.onSurface,
                ),
                const SizedBox(width: 6),
                Text(
                  c['label'] as String,
                  style: TextStyle(
                    color: selected ? Colors.white : Theme.of(context).colorScheme.onSurface,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  List<Widget> _buildFeaturedExams(BuildContext context) {
    final exams = [
      {
        'title': 'Kharidar Mock Test - 1',
        'subtitle': 'Full-length • 100 Qs',
        'duration': '2 hours',
        'questions': 100,
        'difficulty': 'Hard',
        'color': AppTheme.primary,
        'participants': 12450,
        'rating': 4.8,
      },
      {
        'title': 'Nayab Subba Practice Set',
        'subtitle': 'GK + Math + English',
        'duration': '1.5 hours',
        'questions': 75,
        'difficulty': 'Medium',
        'color': Colors.purple,
        'participants': 8230,
        'rating': 4.7,
      },
    ];
    return List.generate(exams.length, (i) {
      final e = exams[i];
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: _buildExamCard(
          context,
          title: e['title'] as String,
          subtitle: e['subtitle'] as String,
          duration: e['duration'] as String,
          questions: e['questions'] as int,
          difficulty: e['difficulty'] as String,
          color: e['color'] as Color,
          participants: e['participants'] as int,
          rating: e['rating'] as double,
          featured: true,
        ),
      ).animate(delay: (80 * i).ms).fadeIn(duration: 400.ms).slideY(begin: 0.1);
    });
  }

  List<Widget> _buildSubjectExams(BuildContext context) {
    final exams = [
      {
        'title': 'GK Booster: World Geography',
        'duration': '30 min',
        'questions': 25,
        'difficulty': 'Easy',
        'color': Colors.blue,
      },
      {
        'title': 'Math: Profit & Loss',
        'duration': '25 min',
        'questions': 20,
        'difficulty': 'Medium',
        'color': Colors.purple,
      },
      {
        'title': 'English Vocabulary',
        'duration': '20 min',
        'questions': 30,
        'difficulty': 'Easy',
        'color': Colors.indigo,
      },
      {
        'title': 'Reasoning: Series',
        'duration': '25 min',
        'questions': 20,
        'difficulty': 'Hard',
        'color': Colors.orange,
      },
    ];
    return List.generate(exams.length, (i) {
      final e = exams[i];
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: _buildExamCard(
          context,
          title: e['title'] as String,
          subtitle: 'Subject practice',
          duration: e['duration'] as String,
          questions: e['questions'] as int,
          difficulty: e['difficulty'] as String,
          color: e['color'] as Color,
        ),
      ).animate(delay: (60 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.05);
    });
  }

  List<Widget> _buildModelSets(BuildContext context) {
    final exams = [
      {
        'title': '2079 Kharidar Model Set',
        'duration': '2 hours',
        'questions': 100,
        'difficulty': 'Hard',
        'color': Colors.red,
      },
      {
        'title': '2080 Nayab Subba Model',
        'duration': '2.5 hours',
        'questions': 125,
        'difficulty': 'Hard',
        'color': Colors.deepPurple,
      },
    ];
    return List.generate(exams.length, (i) {
      final e = exams[i];
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: _buildExamCard(
          context,
          title: e['title'] as String,
          subtitle: 'Real past paper',
          duration: e['duration'] as String,
          questions: e['questions'] as int,
          difficulty: e['difficulty'] as String,
          color: e['color'] as Color,
        ),
      ).animate(delay: (60 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.05);
    });
  }

  Widget _buildExamCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required String duration,
    required int questions,
    required String difficulty,
    required Color color,
    int? participants,
    double? rating,
    bool featured = false,
  }) {
    return InkWell(
      onTap: () => context.push('${AppRoutes.examTake}?id=exam_1'),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: featured
                ? color.withOpacity(0.4)
                : Theme.of(context).colorScheme.outline,
            width: featured ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.assignment, color: color, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _diffColor(difficulty).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    difficulty,
                    style: TextStyle(
                      color: _diffColor(difficulty),
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                _infoBadge(context, Icons.timer_outlined, duration),
                const SizedBox(width: 12),
                _infoBadge(context, Icons.help_outline, '$questions Qs'),
                const Spacer(),
                if (participants != null) ...[
                  const Icon(Icons.people, size: 12, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    '${participants}+',
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                if (rating != null) ...[
                  const Icon(Icons.star, size: 12, color: AppTheme.warning),
                  const SizedBox(width: 2),
                  Text(
                    rating.toString(),
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoBadge(BuildContext context, IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Theme.of(context).colorScheme.onSurfaceVariant),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Color _diffColor(String d) {
    switch (d) {
      case 'Easy':
        return AppTheme.success;
      case 'Hard':
        return AppTheme.error;
      default:
        return AppTheme.warning;
    }
  }
}
