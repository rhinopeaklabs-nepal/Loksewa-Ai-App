// Subject Detail Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/section_header.dart';

class SubjectDetailScreen extends StatelessWidget {
  final String subjectId;
  const SubjectDetailScreen({super.key, required this.subjectId});

  @override
  Widget build(BuildContext context) {
    final subjectData = _getSubjectData(subjectId);
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [subjectData['color'] as Color, (subjectData['color'] as Color).withOpacity(0.7)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: (subjectData['color'] as Color).withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Icon(subjectData['icon'] as IconData, color: Colors.white, size: 48),
                    const SizedBox(height: 12),
                    Text(
                      subjectData['name'] as String,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subjectData['desc'] as String,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _stat('125', 'Topics'),
                        _stat('2,450', 'Questions'),
                        _stat('65%', 'Done'),
                      ],
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  SectionHeader(
                    title: 'Chapters',
                    subtitle: 'Master each topic systematically',
                  ),
                  const SizedBox(height: 12),
                  ...List.generate(_chapters.length, (i) {
                    final c = _chapters[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _chapterTile(context, c, i, subjectData['color'] as Color),
                    );
                  }),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _stat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.85),
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _chapterTile(BuildContext context, Map<String, dynamic> c, int i, Color color) {
    return InkWell(
      onTap: () => context.push(AppRoutes.questionPractice),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Theme.of(context).colorScheme.outline),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${i + 1}',
                style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 16),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c['title'] as String,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${c['qs']} Qs • ${c['time']}',
                    style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
            if (c['completed'] == true)
              const Icon(Icons.check_circle, color: AppTheme.success, size: 20)
            else
              const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
          ],
        ),
      ),
    ).animate(delay: (50 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
  }

  static const _chapters = [
    {'title': 'Introduction & Basics', 'qs': 25, 'time': '20 min', 'completed': true},
    {'title': 'Historical Background', 'qs': 40, 'time': '30 min', 'completed': true},
    {'title': 'Key Concepts', 'qs': 35, 'time': '25 min', 'completed': false},
    {'title': 'Advanced Topics', 'qs': 50, 'time': '45 min', 'completed': false},
    {'title': 'Practice Problems', 'qs': 60, 'time': '60 min', 'completed': false},
    {'title': 'Mock Test 1', 'qs': 100, 'time': '90 min', 'completed': false},
    {'title': 'Revision & Recap', 'qs': 30, 'time': '20 min', 'completed': false},
  ];

  Map<String, dynamic> _getSubjectData(String id) {
    final map = {
      'gk': {'name': 'General Knowledge', 'desc': 'Nepal, world, current affairs', 'icon': Icons.public, 'color': Colors.blue},
      'math': {'name': 'Mathematics', 'desc': 'Arithmetic, algebra, geometry', 'icon': Icons.calculate, 'color': Colors.purple},
      'english': {'name': 'English', 'desc': 'Grammar, vocabulary, comprehension', 'icon': Icons.translate, 'color': Colors.indigo},
      'nepali': {'name': 'Nepali', 'desc': 'Literature, grammar, composition', 'icon': Icons.menu_book, 'color': Colors.red},
      'science': {'name': 'Science', 'desc': 'Physics, chemistry, biology', 'icon': Icons.science, 'color': Colors.teal},
      'reasoning': {'name': 'Reasoning', 'desc': 'Verbal, non-verbal, analytical', 'icon': Icons.psychology, 'color': Colors.orange},
      'constitution': {'name': 'Constitution', 'desc': 'Articles, schedules, provisions', 'icon': Icons.gavel, 'color': Colors.brown},
      'current': {'name': 'Current Affairs', 'desc': 'National & international news', 'icon': Icons.newspaper, 'color': Colors.amber},
      'economics': {'name': 'Economics', 'desc': 'Micro, macro, Nepali economy', 'icon': Icons.trending_up, 'color': Colors.green},
      'management': {'name': 'Management', 'desc': 'Principles, HR, finance', 'icon': Icons.business_center, 'color': Colors.cyan},
      'computer': {'name': 'Computer', 'desc': 'Basics, MS Office, internet', 'icon': Icons.computer, 'color': Colors.deepPurple},
      'history': {'name': 'History', 'desc': 'Nepali & world history', 'icon': Icons.history_edu, 'color': Colors.deepOrange},
    };
    return map[id] ?? map['gk']!;
  }
}
