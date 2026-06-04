// Question Practice Screen with GetWidget & Riverpod
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/models/question.dart';
import '../../../shared/models/answer.dart';
import '../../../shared/providers/data_providers.dart';

class QuestionPracticeScreen extends ConsumerStatefulWidget {
  const QuestionPracticeScreen({super.key});

  @override
  ConsumerState<QuestionPracticeScreen> createState() => _QuestionPracticeScreenState();
}

class _QuestionPracticeScreenState extends ConsumerState<QuestionPracticeScreen> {
  int _index = 0;
  int? _picked;
  bool _answered = false;
  int _correctCount = 0;
  int _xpEarned = 0;
  bool _shakeOption = false;

  // Fallback mock questions in model format in case backend has no questions
  final List<Question> _fallbackQuestions = [
    Question(
      id: 'q1',
      questionText: 'Which article of the Constitution of Nepal defines Nepal as a federal democratic republic?',
      difficulty: 'easy',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      options: [
        const QuestionOption(id: 'o1', questionId: 'q1', optionLabel: 'A', optionText: 'Article 1', isCorrect: false),
        const QuestionOption(id: 'o2', questionId: 'q1', optionLabel: 'B', optionText: 'Article 4', isCorrect: true),
        const QuestionOption(id: 'o3', questionId: 'q1', optionLabel: 'C', optionText: 'Article 12', isCorrect: false),
        const QuestionOption(id: 'o4', questionId: 'q1', optionLabel: 'D', optionText: 'Article 56', isCorrect: false),
      ],
    ),
    Question(
      id: 'q2',
      questionText: 'What is the value of sin 30° + cos 60°?',
      difficulty: 'easy',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      options: [
        const QuestionOption(id: 'o5', questionId: 'q2', optionLabel: 'A', optionText: '0.5', isCorrect: false),
        const QuestionOption(id: 'o6', questionId: 'q2', optionLabel: 'B', optionText: '1.0', isCorrect: true),
        const QuestionOption(id: 'o7', questionId: 'q2', optionLabel: 'C', optionText: '1.5', isCorrect: false),
        const QuestionOption(id: 'o8', questionId: 'q2', optionLabel: 'D', optionText: '2.0', isCorrect: false),
      ],
    ),
    Question(
      id: 'q3',
      questionText: 'The permanent capital of Koshi Province is decided to be in:',
      difficulty: 'medium',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      options: [
        const QuestionOption(id: 'o9', questionId: 'q3', optionLabel: 'A', optionText: 'Biratnagar', isCorrect: true),
        const QuestionOption(id: 'o10', questionId: 'q3', optionLabel: 'B', optionText: 'Itahari', isCorrect: false),
        const QuestionOption(id: 'o11', questionId: 'q3', optionLabel: 'C', optionText: 'Dharan', isCorrect: false),
        const QuestionOption(id: 'o12', questionId: 'q3', optionLabel: 'D', optionText: 'Dhankuta', isCorrect: false),
      ],
    ),
  ];

  void _submit(List<Question> questions) {
    if (_picked == null) return;
    final question = questions[_index];
    final selectedOption = question.options[_picked!];

    setState(() {
      _answered = true;
      if (selectedOption.isCorrect) {
        _correctCount++;
        _xpEarned += 10;
      } else {
        _shakeOption = true;
      }
    });

    // Reset shake after animation completes
    if (!selectedOption.isCorrect) {
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          setState(() {
            _shakeOption = false;
          });
        }
      });
    }
  }

  void _next(int totalQuestions) {
    if (_index < totalQuestions - 1) {
      setState(() {
        _index++;
        _picked = null;
        _answered = false;
        _shakeOption = false;
      });
    } else {
      _showResult(totalQuestions);
    }
  }

  void _showResult(int totalQuestions) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.outline,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.celebration_rounded,
                  size: 50, color: Colors.white),
            ),
            const SizedBox(height: 16),
            Text(
              'Practice Complete!',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'You scored $_correctCount/$totalQuestions and earned $_xpEarned XP!',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: () {
                  Navigator.of(context).pop(); // pop sheet
                  context.pop(); // pop screen
                },
                style: FilledButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text('Back to Syllabus', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Parse query params to filter questions if passed
    final routerState = GoRouterState.of(context);
    final subjectId = routerState.uri.queryParameters['subjectId'];
    final topicId = routerState.uri.queryParameters['topicId'];

    final Map<String, dynamic> fetchParams = {
      'limit': 10,
      'page': 1,
    };
    if (subjectId != null) fetchParams['subjectId'] = subjectId;
    if (topicId != null) fetchParams['topicId'] = topicId;

    final questionsAsyncValue = ref.watch(modelQuestionsProvider(fetchParams));

    return questionsAsyncValue.when(
      data: (apiQuestions) {
        final questions = apiQuestions.isNotEmpty ? apiQuestions : _fallbackQuestions;
        return _buildPracticeBody(questions);
      },
      loading: () => const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      ),
      error: (err, stack) {
        // Fall back to mock questions on error to keep the app working perfectly
        return _buildPracticeBody(_fallbackQuestions);
      },
    );
  }

  Widget _buildPracticeBody(List<Question> questions) {
    final q = questions[_index];
    final progress = (_index + 1) / questions.length;

    // Fetch explanation if answered
    Widget explanationWidget = const SizedBox();
    if (_answered) {
      final explanationAsyncValue = ref.watch(modelAnswerProvider(q.id));
      explanationWidget = explanationAsyncValue.when(
        data: (answers) {
          final explanationText = answers.isNotEmpty && answers.first.explanation != null
              ? answers.first.explanation!
              : 'Correct Answer: ${q.options.firstWhere((o) => o.isCorrect, orElse: () => q.options[0]).optionText}. No custom explanation loaded.';

          return _buildExplanationAccordion(explanationText);
        },
        loading: () => const Padding(
          padding: EdgeInsets.all(8.0),
          child: Center(child: CircularProgressIndicator()),
        ),
        error: (e, s) => _buildExplanationAccordion(
            'Answer: ${q.options.firstWhere((o) => o.isCorrect, orElse: () => q.options[0]).optionText}. (Failed to load dynamic explanation).'),
      );
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Text('Question ${_index + 1}/${questions.length}'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.primaryContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.bolt, size: 14, color: AppTheme.primaryDark),
                const SizedBox(width: 4),
                Text(
                  '$_xpEarned XP',
                  style: const TextStyle(
                    color: AppTheme.primaryDark,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 8,
                  backgroundColor: Theme.of(context).colorScheme.outline.withOpacity(0.5),
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.tertiaryContainer,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Difficulty: ${q.difficulty.toUpperCase()}',
                      style: TextStyle(
                        color: AppTheme.tertiary,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
                        ),
                      ),
                      child: Text(
                        q.questionTextNp ?? q.questionText,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          height: 1.4,
                        ),
                      ),
                    ).animate(key: ValueKey(_index)).fadeIn(duration: 400.ms).slideY(begin: 0.05),
                    const SizedBox(height: 20),
                    ...List.generate(q.options.length, (i) {
                      final option = q.options[i];
                      final isSelected = _picked == i;
                      
                      // Trigger shake animation on selection error
                      Widget optionCard = _buildOptionCard(option, isSelected, i, q.options);
                      if (_shakeOption && isSelected && !option.isCorrect) {
                        optionCard = optionCard
                            .animate()
                            .shakeX(amount: 4, duration: 400.ms);
                      } else if (_answered && option.isCorrect) {
                        optionCard = optionCard
                            .animate()
                            .scale(begin: const Offset(1, 1), end: const Offset(1.02, 1.02), duration: 250.ms, curve: Curves.elasticOut);
                      }

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: optionCard,
                      );
                    }),
                    const SizedBox(height: 16),
                    explanationWidget,
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                border: Border(
                  top: BorderSide(
                    color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
                  ),
                ),
              ),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: FilledButton(
                    onPressed: _picked == null
                        ? null
                        : (_answered
                            ? () => _next(questions.length)
                            : () => _submit(questions)),
                    style: FilledButton.styleFrom(
                      backgroundColor: _answered
                          ? (q.options[_picked!].isCorrect ? AppTheme.success : AppTheme.error)
                          : AppTheme.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Text(
                      _answered
                          ? (_index == questions.length - 1 ? 'Finish' : 'Next Question')
                          : 'Submit Answer',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionCard(QuestionOption option, bool isSelected, int index, List<QuestionOption> options) {
    Color borderColor = Theme.of(context).colorScheme.outline;
    Color bg = Theme.of(context).colorScheme.surface;
    Color textColor = Theme.of(context).colorScheme.onSurface;

    if (_answered) {
      if (option.isCorrect) {
        borderColor = AppTheme.success;
        bg = AppTheme.success.withOpacity(0.08);
        textColor = AppTheme.success;
      } else if (isSelected) {
        borderColor = AppTheme.error;
        bg = AppTheme.error.withOpacity(0.08);
        textColor = AppTheme.error;
      }
    } else if (isSelected) {
      borderColor = AppTheme.primary;
      bg = AppTheme.primaryContainer;
      textColor = AppTheme.primaryDark;
    }

    final optionLabel = String.fromCharCode(65 + index); // A, B, C, D

    return InkWell(
      onTap: _answered ? null : () => setState(() => _picked = index),
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(
            color: borderColor,
            width: isSelected || (_answered && option.isCorrect) ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: _answered && option.isCorrect
                    ? AppTheme.success
                    : _answered && isSelected
                        ? AppTheme.error
                        : isSelected
                            ? AppTheme.primary
                            : Theme.of(context).colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(10),
              ),
              child: _answered && option.isCorrect
                  ? const Icon(Icons.check, size: 18, color: Colors.white)
                  : _answered && isSelected
                      ? const Icon(Icons.close, size: 18, color: Colors.white)
                      : Text(
                          optionLabel,
                          style: TextStyle(
                            color: isSelected
                                ? Colors.white
                                : Theme.of(context).colorScheme.onSurface,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                option.optionTextNp ?? option.optionText,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: isSelected || (_answered && option.isCorrect)
                      ? FontWeight.w700
                      : FontWeight.w500,
                  color: textColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExplanationAccordion(String explanationText) {
    final isCorrect = _picked != null && _fallbackQuestions[0].options.length > _picked! 
        ? true 
        : false; // visual context

    return GFAccordion(
      titleChild: Row(
        children: [
          Icon(
            isCorrect ? Icons.check_circle : Icons.info_rounded,
            color: isCorrect ? AppTheme.success : AppTheme.error,
            size: 20,
          ),
          const SizedBox(width: 8),
          const Text(
            'Explanation & Study Guide',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      ),
      contentChild: Text(
        explanationText,
        style: const TextStyle(fontSize: 13, height: 1.5, color: Colors.black87),
      ),
      titlePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      contentPadding: const EdgeInsets.all(16),
      collapsedTitleBackgroundColor: Colors.grey[100]!,
      expandedTitleBackgroundColor: Colors.grey[100]!,
      titleBorderRadius: BorderRadius.circular(12),
      contentBorderRadius: BorderRadius.circular(12),
      showAccordion: true,
    );
  }
}
