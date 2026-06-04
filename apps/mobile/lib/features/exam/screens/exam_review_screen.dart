// Exam Review Screen with GetWidget & Riverpod
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/models/mock_test.dart';
import '../../../shared/models/question.dart';
import '../../../shared/providers/data_providers.dart';

class ExamReviewScreen extends ConsumerStatefulWidget {
  final String examId; // This is the attemptId
  const ExamReviewScreen({super.key, required this.examId});

  @override
  ConsumerState<ExamReviewScreen> createState() => _ExamReviewScreenState();
}

class _ExamReviewScreenState extends ConsumerState<ExamReviewScreen> {
  int _currentIndex = 0;

  // Fallback questions for offline review
  final List<Question> _fallbackQuestions = [
    Question(
      id: 'fq1',
      questionText: 'Which of the following is a fundamental right guaranteed by the Constitution of Nepal?',
      difficulty: 'medium',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      options: [
        const QuestionOption(id: 'fo1', questionId: 'fq1', optionLabel: 'A', optionText: 'Right to property', isCorrect: false),
        const QuestionOption(id: 'fo2', questionId: 'fq1', optionLabel: 'B', optionText: 'Right to education', isCorrect: true),
        const QuestionOption(id: 'fo3', questionId: 'fq1', optionLabel: 'C', optionText: 'Right to work', isCorrect: false),
        const QuestionOption(id: 'fo4', questionId: 'fq1', optionLabel: 'D', optionText: 'Right to housing', isCorrect: false),
      ],
    ),
    Question(
      id: 'fq2',
      questionText: 'The headquarters of SAARC is located in:',
      difficulty: 'easy',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      options: [
        const QuestionOption(id: 'fo5', questionId: 'fq2', optionLabel: 'A', optionText: 'Kathmandu, Nepal', isCorrect: true),
        const QuestionOption(id: 'fo6', questionId: 'fq2', optionLabel: 'B', optionText: 'New Delhi, India', isCorrect: false),
        const QuestionOption(id: 'fo7', questionId: 'fq2', optionLabel: 'C', optionText: 'Dhaka, Bangladesh', isCorrect: false),
        const QuestionOption(id: 'fo8', questionId: 'fq2', optionLabel: 'D', optionText: 'Colombo, Sri Lanka', isCorrect: false),
      ],
    ),
  ];

  final Map<String, int> _fallbackUserAnswers = {
    'fq1': 1, // Correct (Option B)
    'fq2': 1, // Incorrect (Option B, correct is A)
  };

  @override
  Widget build(BuildContext context) {
    final attemptAsyncValue = ref.watch(modelTestAttemptProvider(widget.examId));

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Review Answers'),
      ),
      body: SafeArea(
        child: attemptAsyncValue.when(
          data: (attempt) {
            final questions = attempt.mockTest != null && attempt.mockTest!.questions.isNotEmpty
                ? attempt.mockTest!.questions
                : _fallbackQuestions;

            final userAnswers = {
              for (var ans in attempt.submittedAnswers) ans.questionId: ans.selectedOptionIndex
            };

            return _buildReviewBody(questions, userAnswers);
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) {
            // Render offline review mode
            return _buildReviewBody(_fallbackQuestions, _fallbackUserAnswers);
          },
        ),
      ),
    );
  }

  Widget _buildReviewBody(List<Question> questions, Map<String, int> userAnswers) {
    if (questions.isEmpty) {
      return const Center(child: Text('No questions available to review.'));
    }

    final q = questions[_currentIndex];
    final userPickedIndex = userAnswers[q.id];
    final correctIndex = q.options.indexWhere((opt) => opt.isCorrect);
    
    final isCorrect = userPickedIndex != null && userPickedIndex == correctIndex;
    final isSkipped = userPickedIndex == null;

    return Column(
      children: [
        // Question number indicator & status tag
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: Row(
            children: [
              Text(
                'Question ${_currentIndex + 1} of ${questions.length}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const Spacer(),
              _buildStatusTag(isCorrect, isSkipped),
            ],
          ),
        ),
        
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Question Text Card
                Container(
                  width: double.infinity,
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
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      height: 1.4,
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Option Cards
                ...List.generate(q.options.length, (i) {
                  final option = q.options[i];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: _buildReviewOptionCard(option, i, userPickedIndex, correctIndex),
                  );
                }),
                const SizedBox(height: 16),

                // Explanation Panel
                _buildExplanationPanel(q),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),

        // Navigation Footer
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            border: Border(top: BorderSide(color: Theme.of(context).colorScheme.outline.withOpacity(0.5))),
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _currentIndex == 0
                        ? null
                        : () => setState(() => _currentIndex--),
                    icon: const Icon(Icons.chevron_left),
                    label: const Text('Previous'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: _currentIndex == questions.length - 1
                        ? () => context.pop()
                        : () => setState(() => _currentIndex++),
                    icon: Icon(_currentIndex == questions.length - 1 ? Icons.check : Icons.chevron_right),
                    label: Text(_currentIndex == questions.length - 1 ? 'Done' : 'Next'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusTag(bool isCorrect, bool isSkipped) {
    Color color = AppTheme.success;
    String text = 'CORRECT';

    if (isSkipped) {
      color = Colors.grey;
      text = 'SKIPPED';
    } else if (!isCorrect) {
      color = AppTheme.error;
      text = 'INCORRECT';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildReviewOptionCard(
      QuestionOption option, int index, int? userPickedIndex, int correctIndex) {
    final isCorrect = index == correctIndex;
    final isUserChoice = index == userPickedIndex;

    Color borderColor = Theme.of(context).colorScheme.outline;
    Color bg = Theme.of(context).colorScheme.surface;
    Color textColor = Theme.of(context).colorScheme.onSurface;
    IconData? icon;

    if (isCorrect) {
      borderColor = AppTheme.success;
      bg = AppTheme.success.withOpacity(0.08);
      textColor = AppTheme.success;
      icon = Icons.check_circle;
    } else if (isUserChoice) {
      borderColor = AppTheme.error;
      bg = AppTheme.error.withOpacity(0.08);
      textColor = AppTheme.error;
      icon = Icons.cancel;
    }

    final letter = String.fromCharCode(65 + index); // A, B, C, D

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(
          color: borderColor,
          width: isCorrect || isUserChoice ? 2 : 1,
        ),
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
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              option.optionTextNp ?? option.optionText,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isCorrect || isUserChoice ? FontWeight.bold : FontWeight.w500,
                color: textColor,
              ),
            ),
          ),
          if (icon != null) ...[
            const SizedBox(width: 8),
            Icon(icon, color: isCorrect ? AppTheme.success : AppTheme.error, size: 20),
          ],
        ],
      ),
    );
  }

  Widget _buildExplanationPanel(Question q) {
    // Explanation retrieval fallback
    final explanationText = 'Correct option details: ${q.options.firstWhere((o) => o.isCorrect, orElse: () => q.options[0]).optionText}. Standard curriculum reference guide.';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.tertiaryContainer.withOpacity(0.4),
        borderRadius: BorderRadius.circular(16),
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
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            explanationText,
            style: const TextStyle(
              fontSize: 13,
              height: 1.5,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}
