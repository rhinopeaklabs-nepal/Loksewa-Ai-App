// Exam Target Screen — choose which Loksewa exam to prepare for
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';

class ExamTargetScreen extends StatefulWidget {
  const ExamTargetScreen({super.key});

  @override
  State<ExamTargetScreen> createState() => _ExamTargetScreenState();
}

class _ExamTargetScreenState extends State<ExamTargetScreen> {
  String? _selected;

  final _exams = [
    {
      'id': 'nayan',
      'name': 'Nayab Subba',
      'subtitle': 'Non-gazetted 2nd class',
      'icon': Icons.account_balance,
      'color': AppTheme.primary,
    },
    {
      'id': 'kharidar',
      'name': 'Kharidar',
      'subtitle': 'Non-gazetted 3rd class',
      'icon': Icons.assignment_ind,
      'color': Colors.blue,
    },
    {
      'id': 'section_officer',
      'name': 'Section Officer',
      'subtitle': 'Gazetted 3rd class',
      'icon': Icons.business_center,
      'color': Colors.purple,
    },
    {
      'id': 'na_su',
      'name': 'Nayab Subba (Sahayak)',
      'subtitle': 'Assistant level',
      'icon': Icons.support_agent,
      'color': Colors.orange,
    },
    {
      'id': 'adarsa',
      'name': 'Adarsa Baal',
      'subtitle': 'ASO preparation',
      'icon': Icons.shield,
      'color': Colors.red,
    },
    {
      'id': 'loksewa_other',
      'name': 'Other Loksewa',
      'subtitle': 'Custom preparation',
      'icon': Icons.more_horiz,
      'color': Colors.teal,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Exam Target'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              Text(
                'Which exam are you preparing for?',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                "We'll build your study plan around this.",
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.separated(
                  itemCount: _exams.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final exam = _exams[i];
                    final isSelected = _selected == exam['id'];
                    return InkWell(
                      onTap: () => setState(() => _selected = exam['id'] as String),
                      borderRadius: BorderRadius.circular(20),
                      child: AnimatedContainer(
                        duration: AppTheme.normal,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (exam['color'] as Color).withOpacity(0.08)
                              : Theme.of(context).colorScheme.surface,
                          border: Border.all(
                            color: isSelected
                                ? exam['color'] as Color
                                : Theme.of(context).colorScheme.outline,
                            width: isSelected ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: (exam['color'] as Color).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(
                                exam['icon'] as IconData,
                                color: exam['color'] as Color,
                                size: 26,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    exam['name'] as String,
                                    style: Theme.of(context).textTheme.titleMedium,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    exam['subtitle'] as String,
                                    style: Theme.of(context).textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                            AnimatedContainer(
                              duration: AppTheme.normal,
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isSelected
                                    ? exam['color'] as Color
                                    : Colors.transparent,
                                border: Border.all(
                                  color: isSelected
                                      ? exam['color'] as Color
                                      : Theme.of(context).colorScheme.outline,
                                  width: 2,
                                ),
                              ),
                              child: isSelected
                                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                                  : null,
                            ),
                          ],
                        ),
                      ),
                    ).animate(delay: (60 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
                  },
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: FilledButton(
                  onPressed: _selected == null
                      ? null
                      : () => context.push(AppRoutes.baselineQuiz),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Continue', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward_rounded),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
