// Subjects Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';

class SubjectsScreen extends StatelessWidget {
  const SubjectsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final subjects = [
      {'id': 'gk', 'name': 'General Knowledge', 'desc': '125 topics • 2,450 Qs', 'icon': Icons.public, 'color': Colors.blue, 'progress': 0.65},
      {'id': 'math', 'name': 'Mathematics', 'desc': '85 topics • 1,820 Qs', 'icon': Icons.calculate, 'color': Colors.purple, 'progress': 0.45},
      {'id': 'english', 'name': 'English', 'desc': '64 topics • 1,250 Qs', 'icon': Icons.translate, 'color': Colors.indigo, 'progress': 0.78},
      {'id': 'nepali', 'name': 'Nepali', 'desc': '92 topics • 1,540 Qs', 'icon': Icons.menu_book, 'color': Colors.red, 'progress': 0.32},
      {'id': 'science', 'name': 'Science', 'desc': '108 topics • 1,920 Qs', 'icon': Icons.science, 'color': Colors.teal, 'progress': 0.55},
      {'id': 'reasoning', 'name': 'Reasoning', 'desc': '56 topics • 980 Qs', 'icon': Icons.psychology, 'color': Colors.orange, 'progress': 0.62},
      {'id': 'constitution', 'name': 'Constitution', 'desc': '42 topics • 720 Qs', 'icon': Icons.gavel, 'color': Colors.brown, 'progress': 0.25},
      {'id': 'current', 'name': 'Current Affairs', 'desc': 'Updated daily', 'icon': Icons.newspaper, 'color': Colors.amber, 'progress': 0.40},
      {'id': 'economics', 'name': 'Economics', 'desc': '38 topics • 650 Qs', 'icon': Icons.trending_up, 'color': Colors.green, 'progress': 0.20},
      {'id': 'management', 'name': 'Management', 'desc': '46 topics • 780 Qs', 'icon': Icons.business_center, 'color': Colors.cyan, 'progress': 0.30},
      {'id': 'computer', 'name': 'Computer', 'desc': '52 topics • 880 Qs', 'icon': Icons.computer, 'color': Colors.deepPurple, 'progress': 0.15},
      {'id': 'history', 'name': 'History', 'desc': '78 topics • 1,320 Qs', 'icon': Icons.history_edu, 'color': Colors.deepOrange, 'progress': 0.50},
    ];
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Subjects'),
      ),
      body: SafeArea(
        child: GridView.builder(
          padding: const EdgeInsets.all(20),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.95,
          ),
          itemCount: subjects.length,
          itemBuilder: (context, i) {
            final s = subjects[i];
            return _buildSubjectCard(context, s, i);
          },
        ),
      ),
    );
  }

  Widget _buildSubjectCard(BuildContext context, Map<String, dynamic> s, int i) {
    return InkWell(
      onTap: () => context.push('${AppRoutes.subjectDetail}?id=${s['id']}'),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Theme.of(context).colorScheme.outline),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: (s['color'] as Color).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(s['icon'] as IconData, color: s['color'] as Color, size: 22),
                ),
                Text(
                  '${(s['progress'] as double * 100).toInt()}%',
                  style: TextStyle(
                    color: s['color'] as Color,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
            const Spacer(),
            Text(
              s['name'] as String,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, height: 1.2),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              s['desc'] as String,
              style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: s['progress'] as double,
                minHeight: 5,
                backgroundColor: (s['color'] as Color).withOpacity(0.12),
                valueColor: AlwaysStoppedAnimation<Color>(s['color'] as Color),
              ),
            ),
          ],
        ),
      ),
    ).animate(delay: (40 * i).ms).fadeIn(duration: 400.ms).scale(begin: const Offset(0.9, 0.9));
  }
}
