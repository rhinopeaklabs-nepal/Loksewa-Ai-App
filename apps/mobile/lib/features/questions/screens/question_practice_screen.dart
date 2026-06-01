// Question Practice Widget — reusable for mission and exam
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../app/theme.dart';

enum QuestionType { mcq, trueFalse, fillBlank, descriptive }

class QuestionData {
  final String id;
  final String question;
  final List<String> options;
  final int correctIndex;
  final String explanation;
  final String? imageUrl;
  final QuestionType type;
  final String subject;
  final String difficulty;

  const QuestionData({
    required this.id,
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
    this.imageUrl,
    this.type = QuestionType.mcq,
    this.subject = 'GK',
    this.difficulty = 'Medium',
  });
}

class QuestionPracticeScreen extends StatefulWidget {
  const QuestionPracticeScreen({super.key});

  @override
  State<QuestionPracticeScreen> createState() => _QuestionPracticeScreenState();
}

class _QuestionPracticeScreenState extends State<QuestionPracticeScreen> {
  int _index = 0;
  int? _picked;
  bool _answered = false;
  int _correct = 0;
  int _xpEarned = 0;

  final _questions = const [
    QuestionData(
      id: 'q1',
      question: 'Which article of the Constitution of Nepal defines Nepal as a federal democratic republic?',
      options: ['Article 1', 'Article 4', 'Article 12', 'Article 56'],
      correctIndex: 1,
      explanation:
          'Article 4 of the Constitution of Nepal 2015 describes Nepal as "a federal, democratic, republican State".',
      subject: 'Constitution',
      difficulty: 'Easy',
    ),
    QuestionData(
      id: 'q2',
      question: 'What is the value of sin 30° + cos 60°?',
      options: ['0.5', '1', '1.5', '2'],
      correctIndex: 1,
      explanation: 'sin 30° = 0.5 and cos 60° = 0.5, so their sum = 1.',
      subject: 'Math',
      difficulty: 'Easy',
    ),
    QuestionData(
      id: 'q3',
      question: 'The capital of Province No. 1 (Koshi) is:',
      options: ['Biratnagar', 'Itahari', 'Dharan', 'Biratchowk'],
      correctIndex: 0,
      explanation:
          'Biratnagar is the temporary capital of Koshi Province. The permanent capital is yet to be decided.',
      subject: 'GK',
      difficulty: 'Medium',
    ),
    QuestionData(
      id: 'q4',
      question: 'Who wrote the Nepali novel "Paribartan"?',
      options: ['Parijat', 'Laxmi Prasad Devkota', 'BP Koirala', 'Gopal Prasad Rimal'],
      correctIndex: 0,
      explanation:
          '"Paribartan" is a famous novel by Parijat (Bishnu Kumari Waiba).',
      subject: 'Nepali',
      difficulty: 'Hard',
    ),
    QuestionData(
      id: 'q5',
      question: 'The chemical symbol of gold is:',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      correctIndex: 2,
      explanation: 'Au comes from the Latin word "aurum" meaning "shining dawn".',
      subject: 'Science',
      difficulty: 'Easy',
    ),
  ];

  void _submit() {
    if (_picked == null) return;
    setState(() {
      _answered = true;
      if (_picked == _questions[_index].correctIndex) {
        _correct++;
        _xpEarned += 10;
      }
    });
  }

  void _next() {
    if (_index < _questions.length - 1) {
      setState(() {
        _index++;
        _picked = null;
        _answered = false;
      });
    } else {
      _showResult();
    }
  }

  void _showResult() {
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
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.celebration_rounded,
                  size: 60, color: Colors.white),
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
              'You scored $_correct/${_questions.length} and earned $_xpEarned XP!',
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
                onPressed: () => Navigator.of(context).pop(),
                style: FilledButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text('Done', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final q = _questions[_index];
    final progress = (_index + 1) / _questions.length;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Text('Question ${_index + 1}/${_questions.length}'),
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
            // Progress
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 8,
                  backgroundColor: Theme.of(context).colorScheme.outline,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                ),
              ),
            ),
            // Tags
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
                      q.subject,
                      style: TextStyle(
                        color: AppTheme.tertiary,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _difficultyColor(q.difficulty).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      q.difficulty,
                      style: TextStyle(
                        color: _difficultyColor(q.difficulty),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      q.question,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            height: 1.4,
                          ),
                    ).animate(key: ValueKey(_index)).fadeIn(duration: 400.ms),
                    const SizedBox(height: 24),
                    ...List.generate(q.options.length, (i) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildOption(context, q, i),
                      ).animate(delay: (80 * i).ms).fadeIn(duration: 400.ms).slideX(begin: 0.1);
                    }),
                    if (_answered) ...[
                      const SizedBox(height: 16),
                      _buildExplanation(context, q).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1),
                    ],
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
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
              ),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: FilledButton(
                    onPressed: _picked == null ? null : (_answered ? _next : _submit),
                    style: FilledButton.styleFrom(
                      backgroundColor: _answered
                          ? (_picked == q.correctIndex ? AppTheme.success : AppTheme.error)
                          : AppTheme.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Text(
                      _answered
                          ? (_index == _questions.length - 1 ? 'Finish' : 'Next Question')
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

  Widget _buildOption(BuildContext context, QuestionData q, int i) {
    final isPicked = _picked == i;
    final isCorrect = q.correctIndex == i;

    Color borderColor = Theme.of(context).colorScheme.outline;
    Color bg = Theme.of(context).colorScheme.surface;
    Color textColor = Theme.of(context).colorScheme.onSurface;

    if (_answered) {
      if (isCorrect) {
        borderColor = AppTheme.success;
        bg = AppTheme.success.withOpacity(0.08);
        textColor = AppTheme.success;
      } else if (isPicked) {
        borderColor = AppTheme.error;
        bg = AppTheme.error.withOpacity(0.08);
        textColor = AppTheme.error;
      }
    } else if (isPicked) {
      borderColor = AppTheme.primary;
      bg = AppTheme.primaryContainer;
      textColor = AppTheme.primaryDark;
    }

    final letter = String.fromCharCode(65 + i);

    return InkWell(
      onTap: _answered ? null : () => setState(() => _picked = i),
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: AppTheme.normal,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(color: borderColor, width: isPicked || (_answered && isCorrect) ? 2 : 1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: _answered && isCorrect
                    ? AppTheme.success
                    : _answered && isPicked
                        ? AppTheme.error
                        : isPicked
                            ? AppTheme.primary
                            : Theme.of(context).colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(10),
              ),
              child: _answered && isCorrect
                  ? const Icon(Icons.check, size: 18, color: Colors.white)
                  : _answered && isPicked
                      ? const Icon(Icons.close, size: 18, color: Colors.white)
                      : Text(
                          letter,
                          style: TextStyle(
                            color: isPicked
                                ? Colors.white
                                : Theme.of(context).colorScheme.onSurface,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                q.options[i],
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: isPicked || (_answered && isCorrect) ? FontWeight.w700 : FontWeight.w500,
                  color: textColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExplanation(BuildContext context, QuestionData q) {
    final isCorrect = _picked == q.correctIndex;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCorrect
            ? AppTheme.success.withOpacity(0.06)
            : AppTheme.error.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCorrect ? AppTheme.success : AppTheme.error,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isCorrect ? Icons.check_circle : Icons.info_rounded,
                color: isCorrect ? AppTheme.success : AppTheme.error,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                isCorrect ? 'Correct! +10 XP' : 'Incorrect',
                style: TextStyle(
                  color: isCorrect ? AppTheme.success : AppTheme.error,
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            q.explanation,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface,
                  height: 1.5,
                ),
          ),
        ],
      ),
    );
  }

  Color _difficultyColor(String d) {
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
