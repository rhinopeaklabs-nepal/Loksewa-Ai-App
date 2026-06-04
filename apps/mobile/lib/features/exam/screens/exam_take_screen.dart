// Exam Take Screen — full mock test with timer & swipable PageView
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/models/mock_test.dart';
import '../../../shared/models/question.dart';
import '../../../shared/providers/data_providers.dart';

class ExamTakeScreen extends ConsumerStatefulWidget {
  final String examId;
  const ExamTakeScreen({super.key, required this.examId});

  @override
  ConsumerState<ExamTakeScreen> createState() => _ExamTakeScreenState();
}

class _ExamTakeScreenState extends ConsumerState<ExamTakeScreen> {
  late PageController _pageController;
  int _currentIndex = 0;
  
  // Test Session Status
  String? _attemptId;
  List<Question> _questions = [];
  bool _isLoading = true;
  bool _submitted = false;

  // Local answer tracking: questionId -> selectedOptionIndex
  final Map<String, int> _selectedAnswers = {};
  
  // Tracking user actions
  final Set<int> _visitedIndices = {0};
  final Set<int> _markedIndices = {};

  // Countdown timer
  int _secondsLeft = 60 * 60; // Default 60 mins fallback
  Timer? _timer;

  // Fallback local questions
  final List<Question> _localFallbackQuestions = [
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
    Question(
      id: 'fq3',
      questionText: 'Solve for x: 3x + 5 = 20',
      difficulty: 'easy',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      options: [
        const QuestionOption(id: 'fo9', questionId: 'fq3', optionLabel: 'A', optionText: 'x = 3', isCorrect: false),
        const QuestionOption(id: 'fo10', questionId: 'fq3', optionLabel: 'B', optionText: 'x = 4', isCorrect: false),
        const QuestionOption(id: 'fo11', questionId: 'fq3', optionLabel: 'C', optionText: 'x = 5', isCorrect: true),
        const QuestionOption(id: 'fo12', questionId: 'fq3', optionLabel: 'D', optionText: 'x = 6', isCorrect: false),
      ],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _initTestSession();
  }

  Future<void> _initTestSession() async {
    try {
      final repo = ref.read(mockTestRepositoryProvider);
      
      // Start test session in backend
      final attempt = await repo.startTest(widget.examId);
      
      if (mounted) {
        setState(() {
          _attemptId = attempt.id;
          
          // Eagerly loaded mockTest questions or fallback
          if (attempt.mockTest != null && attempt.mockTest!.questions.isNotEmpty) {
            _questions = attempt.mockTest!.questions;
          } else {
            // Load questions list using query parameter if needed
            _questions = _localFallbackQuestions;
          }

          _secondsLeft = (attempt.mockTest?.timeLimitMinutes ?? 45) * 60;
          _isLoading = false;
        });
        _startTimer();
      }
    } catch (e) {
      // Offline fallback
      if (mounted) {
        setState(() {
          _attemptId = 'mock_attempt_local';
          _questions = _localFallbackQuestions;
          _secondsLeft = 45 * 60; // 45 minutes
          _isLoading = false;
        });
        _startTimer();
      }
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      setState(() {
        _secondsLeft--;
        if (_secondsLeft <= 0) {
          _secondsLeft = 0;
          t.cancel();
          if (!_submitted) _autoSubmit();
        }
      });
    });
  }

  void _autoSubmit() {
    _submitExamBackend();
  }

  Future<void> _submitExamBackend() async {
    if (_submitted) return;
    setState(() => _submitted = true);
    _timer?.cancel();

    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final repo = ref.read(mockTestRepositoryProvider);
      final attemptId = _attemptId ?? 'mock_attempt_local';

      // Map answers to the model type
      final List<TestAnswer> answers = _selectedAnswers.entries.map((e) {
        return TestAnswer(questionId: e.key, selectedOptionIndex: e.value);
      }).toList();

      if (attemptId != 'mock_attempt_local') {
        // Save answers and submit
        await repo.saveAnswers(attemptId, answers);
        await repo.submitTest(attemptId);
      }

      if (mounted) {
        Navigator.pop(context); // pop loading dialog
        context.go('${AppRoutes.examResult}?id=$attemptId');
      }
    } catch (e) {
      // Fallback redirect if backend submission fails
      if (mounted) {
        Navigator.pop(context); // pop loading dialog
        context.go('${AppRoutes.examResult}?id=${_attemptId ?? 'mock_attempt_local'}');
      }
    }
  }

  // Dynamic answer saving in background
  Future<void> _saveAnswerBackground(String qId, int optionIndex) async {
    final attemptId = _attemptId;
    if (attemptId == null || attemptId == 'mock_attempt_local') return;

    try {
      final repo = ref.read(mockTestRepositoryProvider);
      await repo.saveAnswers(attemptId, [
        TestAnswer(questionId: qId, selectedOptionIndex: optionIndex)
      ]);
    } catch (_) {
      // Fail silently in background to keep test uninterrupted
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentIndex = index;
      _visitedIndices.add(index);
    });
  }

  void _showQuestionPalette() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.65,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.outline,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  const Text(
                    'Question Palette',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const Spacer(),
                  Text(
                    '${_selectedAnswers.length}/${_questions.length} Answered',
                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 5,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                ),
                itemCount: _questions.length,
                itemBuilder: (context, i) {
                  final q = _questions[i];
                  final isAnswered = _selectedAnswers.containsKey(q.id);
                  final isMarked = _markedIndices.contains(i);
                  final isVisited = _visitedIndices.contains(i);

                  Color bg = Theme.of(context).colorScheme.surfaceVariant;
                  Color fg = Theme.of(context).colorScheme.onSurfaceVariant;

                  if (isMarked) {
                    bg = Colors.orange;
                    fg = Colors.white;
                  } else if (isAnswered) {
                    bg = AppTheme.success;
                    fg = Colors.white;
                  } else if (isVisited) {
                    bg = AppTheme.error.withOpacity(0.12);
                    fg = AppTheme.error;
                  }

                  final isCurrent = i == _currentIndex;

                  return InkWell(
                    onTap: () {
                      _pageController.animateToPage(
                        i,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                      Navigator.pop(context);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      decoration: BoxDecoration(
                        color: bg,
                        borderRadius: BorderRadius.circular(12),
                        border: isCurrent
                            ? Border.all(color: AppTheme.primary, width: 2.5)
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${i + 1}',
                        style: TextStyle(
                          color: fg,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _legendItem(AppTheme.success, 'Answered'),
                  _legendItem(Colors.orange, 'Marked'),
                  _legendItem(AppTheme.error.withOpacity(0.3), 'Visited'),
                  _legendItem(Theme.of(context).colorScheme.surfaceVariant, 'Unvisited'),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _confirmSubmit();
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text('Submit Exam', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _legendItem(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Future<void> _confirmSubmit() async {
    final unanswered = _questions.length - _selectedAnswers.length;
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Submit Exam?'),
        content: Text(
          unanswered > 0
              ? 'You have $unanswered unanswered questions remaining. Are you sure you want to finish the exam?'
              : 'You have answered all questions. Would you like to finish and view your score?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppTheme.primary),
            child: const Text('Submit'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      _submitExamBackend();
    }
  }

  Future<void> _exitAttempt() async {
    final bool? exit = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Exit Exam?'),
        content: const Text('Are you sure you want to exit? Your current answers will be saved, but the timer will continue running or expire.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: GFColors.DANGER),
            child: const Text('Exit'),
          ),
        ],
      ),
    );

    if (exit == true && mounted) {
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    final minutes = (_secondsLeft ~/ 60).toString().padLeft(2, '0');
    final seconds = (_secondsLeft % 60).toString().padLeft(2, '0');
    final isLowTime = _secondsLeft < 300; // less than 5 mins

    return WillPopScope(
      onWillPop: () async {
        await _exitAttempt();
        return false;
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.close_rounded),
            onPressed: _exitAttempt,
          ),
          title: Text('Question ${_currentIndex + 1}/${_questions.length}'),
          actions: [
            // Timer Badge
            Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: isLowTime ? AppTheme.error.withOpacity(0.12) : AppTheme.primaryContainer,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.timer,
                    size: 14,
                    color: isLowTime ? AppTheme.error : AppTheme.primaryDark,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '$minutes:$seconds',
                    style: TextStyle(
                      color: isLowTime ? AppTheme.error : AppTheme.primaryDark,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            // Grid Navigator trigger
            IconButton(
              onPressed: _showQuestionPalette,
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.grid_view_rounded),
                  if (_selectedAnswers.isNotEmpty)
                    Positioned(
                      top: -4,
                      right: -4,
                      child: Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${_selectedAnswers.length}',
                          style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
        body: Column(
          children: [
            // Linear Progress Indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 4.0),
              child: LinearProgressIndicator(
                value: (_currentIndex + 1) / _questions.length,
                minHeight: 6,
                backgroundColor: Theme.of(context).colorScheme.outline.withOpacity(0.3),
                valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
              ),
            ),
            
            // Swipeable PageView of Questions
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _questions.length,
                onPageChanged: _onPageChanged,
                itemBuilder: (context, qIndex) {
                  final q = _questions[qIndex];
                  final selectedIdx = _selectedAnswers[q.id];

                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Card with question
                        GFCard(
                          margin: EdgeInsets.zero,
                          padding: const EdgeInsets.all(16),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Theme.of(context).colorScheme.outline.withOpacity(0.5)),
                          content: Text(
                            q.questionTextNp ?? q.questionText,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              height: 1.4,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        
                        // Option Buttons
                        ...List.generate(q.options.length, (optIdx) {
                          final option = q.options[optIdx];
                          final isSelected = selectedIdx == optIdx;
                          final optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                          Color borderColor = Theme.of(context).colorScheme.outline;
                          Color bg = Theme.of(context).colorScheme.surface;
                          Color textColor = Theme.of(context).colorScheme.onSurface;

                          if (isSelected) {
                            borderColor = AppTheme.primary;
                            bg = AppTheme.primaryContainer;
                            textColor = AppTheme.primaryDark;
                          }

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: InkWell(
                              onTap: () {
                                setState(() {
                                  _selectedAnswers[q.id] = optIdx;
                                });
                                // Save answer in background to API client
                                _saveAnswerBackground(q.id, optIdx);
                              },
                              borderRadius: BorderRadius.circular(16),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: bg,
                                  border: Border.all(
                                    color: borderColor,
                                    width: isSelected ? 2 : 1,
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
                                        color: isSelected
                                            ? AppTheme.primary
                                            : Theme.of(context).colorScheme.surfaceVariant,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        optionLabel,
                                        style: TextStyle(
                                          color: isSelected ? Colors.white : Theme.of(context).colorScheme.onSurface,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        option.optionTextNp ?? option.optionText,
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                          color: textColor,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Bottom Navigation Actions
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
                    // Mark for review toggle
                    GFButton(
                      onPressed: () {
                        setState(() {
                          if (_markedIndices.contains(_currentIndex)) {
                            _markedIndices.remove(_currentIndex);
                          } else {
                            _markedIndices.add(_currentIndex);
                          }
                        });
                      },
                      text: _markedIndices.contains(_currentIndex) ? 'Marked' : 'Mark Review',
                      icon: Icon(
                        _markedIndices.contains(_currentIndex) ? Icons.bookmark : Icons.bookmark_border,
                        color: Colors.white,
                        size: 16,
                      ),
                      color: _markedIndices.contains(_currentIndex) ? Colors.orange : Colors.grey,
                      size: GFSize.MEDIUM,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (_currentIndex > 0) ...[
                            GFButton(
                              onPressed: () {
                                _pageController.previousPage(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                              },
                              text: 'Prev',
                              color: GFColors.LIGHT,
                              textStyle: const TextStyle(color: Colors.black87),
                              size: GFSize.MEDIUM,
                            ),
                            const SizedBox(width: 12),
                          ],
                          GFButton(
                            onPressed: () {
                              if (_currentIndex == _questions.length - 1) {
                                _confirmSubmit();
                              } else {
                                _pageController.nextPage(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                              }
                            },
                            text: _currentIndex == _questions.length - 1 ? 'Submit' : 'Next',
                            color: AppTheme.primary,
                            size: GFSize.MEDIUM,
                          ),
                        ],
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
}
