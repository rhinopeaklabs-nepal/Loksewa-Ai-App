// Baseline Quiz — quick assessment to personalize the learning path
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/app_dialogs.dart';

class BaselineQuizScreen extends StatefulWidget {
  const BaselineQuizScreen({super.key});

  @override
  State<BaselineQuizScreen> createState() => _BaselineQuizScreenState();
}

class _BaselineQuizScreenState extends State<BaselineQuizScreen> {
  int _index = 0;
  int _correct = 0;
  int? _picked;

  final _questions = [
    {
      'q': 'What is the capital of Nepal?',
      'options': ['Pokhara', 'Kathmandu', 'Lalitpur', 'Biratnagar'],
      'answer': 1,
      'explain': 'Kathmandu has been the capital of Nepal since the 18th century.',
    },
    {
      'q': 'Who is the current Prime Minister of Nepal (as of 2024)?',
      'options': [
        'Sher Bahadur Deuba',
        'KP Sharma Oli',
        'Pushpa Kamal Dahal',
        'Baburam Bhattarai',
      ],
      'answer': 2,
      'explain': 'Pushpa Kamal Dahal "Prachanda" became PM in December 2022.',
    },
    {
      'q': 'What is 15% of 200?',
      'options': ['20', '25', '30', '35'],
      'answer': 2,
      'explain': '15% × 200 = 0.15 × 200 = 30.',
    },
    {
      'q': 'Which is the longest river in Nepal?',
      'options': ['Gandaki', 'Koshi', 'Karnali', 'Bagmati'],
      'answer': 2,
      'explain': 'Karnali is the longest river in Nepal at 507 km.',
    },
    {
      'q': 'Nepal became a federal republic in which year?',
      'options': ['2006', '2008', '2010', '2015'],
      'answer': 1,
      'explain': 'Nepal abolished the monarchy in 2008 and became a republic.',
    },
  ];

  void _next() {
    if (_picked == _questions[_index]['answer']) _correct++;
    if (_index < _questions.length - 1) {
      setState(() {
        _index++;
        _picked = null;
      });
    } else {
      _showResult();
    }
  }

  void _showResult() {
    final score = (_correct / _questions.length * 100).round();
    WelcomeResultDialog.show(
      context,
      score: score,
      onContinue: () {
        context.go(AppRoutes.register);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final q = _questions[_index];
    final options = q['options'] as List<String>;
    final progress = (_index + 1) / _questions.length;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Quick Assessment'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Progress
              Row(
                children: [
                  Text(
                    'Question ${_index + 1} of ${_questions.length}',
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                  const Spacer(),
                  Icon(Icons.timer_outlined,
                      size: 16, color: Theme.of(context).colorScheme.onSurfaceVariant),
                  const SizedBox(width: 4),
                  Text(
                    '0:${(20 - _index * 2).toString().padLeft(2, '0')}',
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 8,
                  backgroundColor: AppTheme.outline,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                q['q'] as String,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      height: 1.3,
                    ),
              ).animate(key: ValueKey(_index)).fadeIn(duration: 400.ms),
              const SizedBox(height: 24),
              Expanded(
                child: ListView.separated(
                  itemCount: options.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final isPicked = _picked == i;
                    return InkWell(
                      onTap: () => setState(() => _picked = i),
                      borderRadius: BorderRadius.circular(16),
                      child: AnimatedContainer(
                        duration: AppTheme.normal,
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: isPicked
                              ? AppTheme.primaryContainer
                              : Theme.of(context).colorScheme.surface,
                          border: Border.all(
                            color: isPicked
                                ? AppTheme.primary
                                : Theme.of(context).colorScheme.outline,
                            width: isPicked ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            AnimatedContainer(
                              duration: AppTheme.fast,
                              width: 28,
                              height: 28,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isPicked ? AppTheme.primary : Colors.transparent,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isPicked
                                      ? AppTheme.primary
                                      : Theme.of(context).colorScheme.outline,
                                  width: 2,
                                ),
                              ),
                              child: isPicked
                                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                                  : null,
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Text(
                                options[i],
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: isPicked ? FontWeight.w600 : FontWeight.w500,
                                  color: isPicked
                                      ? AppTheme.primaryDark
                                      : Theme.of(context).colorScheme.onSurface,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate(delay: (80 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
                  },
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: FilledButton(
                  onPressed: _picked == null ? null : _next,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    _index == _questions.length - 1 ? 'Finish' : 'Next',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
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
