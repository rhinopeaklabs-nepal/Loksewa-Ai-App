// Exam Review Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';

class ExamReviewScreen extends StatefulWidget {
  final String examId;
  const ExamReviewScreen({super.key, required this.examId});

  @override
  State<ExamReviewScreen> createState() => _ExamReviewScreenState();
}

class _ExamReviewScreenState extends State<ExamReviewScreen> {
  int _index = 0;
  final _userAnswers = {0: 1, 1: 0, 2: 2, 3: 1, 4: 0};

  final _questions = const [
    {
      'q': 'Which of the following is a fundamental right guaranteed by the Constitution of Nepal?',
      'options': [
        'Right to property',
        'Right to education',
        'Right to work',
        'Right to housing',
      ],
      'answer': 1,
      'explain': 'Right to education (Article 31) is a fundamental right.',
    },
    {
      'q': 'The headquarters of SAARC is located in:',
      'options': ['Kathmandu', 'New Delhi', 'Dhaka', 'Colombo'],
      'answer': 0,
      'explain': 'SAARC Secretariat is in Kathmandu, Nepal.',
    },
    {
      'q': 'Find the value of x: 3x + 5 = 20',
      'options': ['3', '4', '5', '6'],
      'answer': 2,
      'explain': '3x = 15, so x = 5.',
    },
    {
      'q': 'The longest mountain range in the world is:',
      'options': ['Rockies', 'Andes', 'Himalayas', 'Alps'],
      'answer': 1,
      'explain': 'The Andes is the longest continental mountain range at 7,000 km.',
    },
    {
      'q': 'Who is the author of "Muna Madan"?',
      'options': [
        'Laxmi Prasad Devkota',
        'Parijat',
        'Bhanubhakta Acharya',
        'Motiram Bhatta',
      ],
      'answer': 0,
      'explain': 'Laxmi Prasad Devkota wrote the epic poem "Muna Madan".',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final q = _questions[_index];
    final correctIdx = q['answer'] as int;
    final userIdx = _userAnswers[_index];

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Review Answers'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                '${_index + 1}/${_questions.length}',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: userIdx == correctIdx
                            ? AppTheme.success.withOpacity(0.15)
                            : AppTheme.error.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        userIdx == correctIdx ? '✓ Your answer was correct' : '✗ Your answer was incorrect',
                        style: TextStyle(
                          color: userIdx == correctIdx ? AppTheme.success : AppTheme.error,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      q['q'] as String,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            height: 1.4,
                          ),
                    ),
                    const SizedBox(height: 24),
                    ...List.generate(q['options'].length, (i) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildReviewOption(context, q, i, userIdx),
                      );
                    }),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.tertiaryContainer.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.tertiary.withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.lightbulb_rounded, color: AppTheme.tertiary, size: 18),
                              const SizedBox(width: 6),
                              Text(
                                'Explanation',
                                style: TextStyle(
                                  color: AppTheme.tertiary,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            q['explain'] as String,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  height: 1.5,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                border: Border(top: BorderSide(color: Theme.of(context).colorScheme.outline)),
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _index == 0 ? null : () => setState(() => _index--),
                        icon: const Icon(Icons.chevron_left),
                        label: const Text('Previous'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: _index == _questions.length - 1
                            ? () => context.pop()
                            : () => setState(() => _index++),
                        icon: Icon(_index == _questions.length - 1 ? Icons.check : Icons.chevron_right),
                        label: Text(_index == _questions.length - 1 ? 'Done' : 'Next'),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewOption(BuildContext context, dynamic q, int i, int userIdx) {
    final isCorrect = q['answer'] == i;
    final isUserChoice = userIdx == i;

    Color borderColor = Theme.of(context).colorScheme.outline;
    Color bg = Theme.of(context).colorScheme.surface;
    Color textColor = Theme.of(context).colorScheme.onSurface;
    IconData? trailingIcon;

    if (isCorrect) {
      borderColor = AppTheme.success;
      bg = AppTheme.success.withOpacity(0.08);
      textColor = AppTheme.success;
      trailingIcon = Icons.check_circle;
    } else if (isUserChoice) {
      borderColor = AppTheme.error;
      bg = AppTheme.error.withOpacity(0.08);
      textColor = AppTheme.error;
      trailingIcon = Icons.cancel;
    }

    final letter = String.fromCharCode(65 + i);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: borderColor, width: isCorrect || isUserChoice ? 2 : 1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: isCorrect
                  ? AppTheme.success
                  : isUserChoice
                      ? AppTheme.error
                      : Theme.of(context).colorScheme.surfaceVariant,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              letter,
              style: TextStyle(
                color: (isCorrect || isUserChoice) ? Colors.white : Theme.of(context).colorScheme.onSurface,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              q['options'][i] as String,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isCorrect || isUserChoice ? FontWeight.w700 : FontWeight.w500,
                color: textColor,
              ),
            ),
          ),
          if (trailingIcon != null)
            Icon(trailingIcon, color: isCorrect ? AppTheme.success : AppTheme.error, size: 20),
        ],
      ),
    );
  }
}
