// Exam Target Screen — choose which Loksewa exam to prepare for using GetWidget
import 'package:flutter/material.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';

class ExamTargetScreen extends StatefulWidget {
  const ExamTargetScreen({super.key});

  @override
  State<ExamTargetScreen> createState() => _ExamTargetScreenState();
}

class _ExamTargetScreenState extends State<ExamTargetScreen> {
  String? _selected = 'kharidar';

  final List<Map<String, dynamic>> _exams = [
    {
      'id': 'section_officer',
      'name': 'Section Officer',
      'subtitle': 'Gazetted 3rd class officer prep',
      'icon': Icons.business_center_rounded,
      'color': Colors.purple,
    },
    {
      'id': 'nayan',
      'name': 'Nayab Subba',
      'subtitle': 'Non-gazetted 2nd class officer prep',
      'icon': Icons.account_balance_rounded,
      'color': AppTheme.primary,
    },
    {
      'id': 'kharidar',
      'name': 'Kharidar',
      'subtitle': 'Non-gazetted 3rd class assistant prep',
      'icon': Icons.assignment_ind_rounded,
      'color': Colors.blue,
    },
    {
      'id': 'teacher_service',
      'name': 'Teacher Service',
      'subtitle': 'TSC teaching license and post prep',
      'icon': Icons.school_rounded,
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
        centerTitle: true,
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
                "We'll customize your diagnostic quiz and prep materials accordingly.",
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.separated(
                  itemCount: _exams.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final exam = _exams[i];
                    final isSelected = _selected == exam['id'];
                    final color = exam['color'] as Color;
                    return GFCard(
                      margin: EdgeInsets.zero,
                      padding: const EdgeInsets.all(4),
                      borderRadius: BorderRadius.circular(16),
                      color: isSelected
                          ? color.withOpacity(0.08)
                          : Theme.of(context).cardColor,
                      border: Border.all(
                        color: isSelected
                            ? color
                            : Theme.of(context).colorScheme.outline.withOpacity(0.5),
                        width: isSelected ? 2.0 : 1.0,
                      ),
                      content: InkWell(
                        onTap: () => setState(() => _selected = exam['id'] as String),
                        borderRadius: BorderRadius.circular(16),
                        child: GFListTile(
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                          avatar: GFAvatar(
                            backgroundColor: color.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(12),
                            child: Icon(
                              exam['icon'] as IconData,
                              color: color,
                              size: 24,
                            ),
                          ),
                          title: Text(
                            exam['name'] as String,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          subTitle: Text(
                            exam['subtitle'] as String,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                          icon: GFRadio<String>(
                            value: exam['id'] as String,
                            groupValue: _selected ?? '',
                            onChanged: (value) {
                              setState(() {
                                _selected = value;
                              });
                            },
                            type: GFRadioType.basic,
                            size: GFSize.SMALL,
                            activeBorderColor: color,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              GFButton(
                text: 'Continue to Baseline Quiz',
                icon: const Icon(
                  Icons.arrow_forward_rounded,
                  color: Colors.white,
                  size: 18,
                ),
                position: GFPosition.end,
                onPressed: _selected == null
                    ? null
                    : () => context.push(AppRoutes.baselineQuiz),
                shape: GFButtonShape.pills,
                size: GFSize.LARGE,
                color: AppTheme.primary,
                blockButton: true,
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
