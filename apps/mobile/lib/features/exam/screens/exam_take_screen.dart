// Exam Take Screen — full mock test with timer
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/app_dialogs.dart';
import '../../../shared/widgets/gradient_background.dart';

class ExamTakeScreen extends StatefulWidget {
  final String examId;
  const ExamTakeScreen({super.key, required this.examId});

  @override
  State<ExamTakeScreen> createState() => _ExamTakeScreenState();
}

class _ExamTakeScreenState extends State<ExamTakeScreen> {
  int _index = 0;
  int? _picked;
  bool _answered = false;
  int _correct = 0;
  int _secondsLeft = 45 * 60; // 45 mins
  Timer? _timer;
  bool _submitted = false;
  final Set<int> _visited = {0};
  final Set<int> _answeredSet = {};
  final Set<int> _marked = {};

  @override
  void initState() {
    super.initState();
    _startTimer();
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
    setState(() => _submitted = true);
    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      context.go('${AppRoutes.examResult}?id=${widget.examId}');
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

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

  void _submit() {
    setState(() {
      _answered = true;
      _answeredSet.add(_index);
      if (_picked == _questions[_index]['answer']) _correct++;
    });
  }

  void _next() {
    if (_index < _questions.length - 1) {
      setState(() {
        _index++;
        _picked = null;
        _answered = false;
        _visited.add(_index);
      });
    }
  }

  void _prev() {
    if (_index > 0) {
      setState(() {
        _index--;
        _picked = null;
        _answered = _answeredSet.contains(_index);
        _visited.add(_index);
      });
    }
  }

  void _showSubmitDialog() async {
    final ok = await ConfirmDialog.show(
      context,
      title: 'Submit Exam?',
      message:
          'You have ${_questions.length - _answeredSet.length} unanswered questions. Once submitted, you cannot change your answers.',
      confirmText: 'Submit',
      cancelText: 'Continue',
    );
    if (ok && mounted) {
      setState(() => _submitted = true);
      context.go('${AppRoutes.examResult}?id=${widget.examId}');
    }
  }

  void _showQuestionPalette() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
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
                  Text(
                    'Question Palette',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const Spacer(),
                  Text(
                    '${_answeredSet.length}/${_questions.length} answered',
                    style: Theme.of(context).textTheme.bodySmall,
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
                  Color bg;
                  Color fg;
                  if (_answeredSet.contains(i)) {
                    bg = AppTheme.success;
                    fg = Colors.white;
                  } else if (_marked.contains(i)) {
                    bg = AppTheme.secondary;
                    fg = Colors.white;
                  } else if (_visited.contains(i)) {
                    bg = AppTheme.error.withOpacity(0.15);
                    fg = AppTheme.error;
                  } else {
                    bg = Theme.of(context).colorScheme.surfaceVariant;
                    fg = Theme.of(context).colorScheme.onSurfaceVariant;
                  }
                  final isCurrent = i == _index;
                  return InkWell(
                    onTap: () {
                      setState(() {
                        _index = i;
                        _picked = null;
                        _answered = _answeredSet.contains(i);
                        _visited.add(i);
                      });
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
                          fontWeight: FontWeight.w700,
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
                children: [
                  _legendDot(AppTheme.success, 'Answered'),
                  const SizedBox(width: 12),
                  _legendDot(AppTheme.secondary, 'Marked'),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  onPressed: _showSubmitDialog,
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

  Widget _legendDot(Color c, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(4)),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final q = _questions[_index];
    final minutes = (_secondsLeft ~/ 60).toString().padLeft(2, '0');
    final seconds = (_secondsLeft % 60).toString().padLeft(2, '0');
    final isLowTime = _secondsLeft < 300;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () async {
            final ok = await ConfirmDialog.show(
              context,
              title: 'Exit Exam?',
              message: 'Your progress will be lost. Are you sure?',
              confirmText: 'Exit',
              isDestructive: true,
            );
            if (ok && mounted) context.pop();
          },
        ),
        title: Text('Q ${_index + 1}/${_questions.length}'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: isLowTime ? AppTheme.error.withOpacity(0.15) : AppTheme.primaryContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
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
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: _showQuestionPalette,
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.grid_view_rounded),
                Positioned(
                  top: -2,
                  right: -2,
                  child: Container(
                    width: 16,
                    height: 16,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      color: AppTheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${_answeredSet.length}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
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
                  value: (_index + 1) / _questions.length,
                  minHeight: 6,
                  backgroundColor: Theme.of(context).colorScheme.outline,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                ),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      q['q'] as String,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            height: 1.4,
                          ),
                    ).animate(key: ValueKey(_index)).fadeIn(duration: 400.ms),
                    const SizedBox(height: 24),
                    ...List.generate(q['options'].length, (i) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildOption(context, q, i),
                      ).animate(delay: (60 * i).ms).fadeIn(duration: 400.ms);
                    }),
                    if (_answered) ...[
                      const SizedBox(height: 12),
                      _buildExplanation(q),
                    ],
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
                        onPressed: _prev,
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
                      child: FilledButton(
                        onPressed: _picked == null ? null : (_answered ? _next : _submit),
                        style: FilledButton.styleFrom(
                          backgroundColor: _answered ? AppTheme.primary : AppTheme.primary,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: Text(
                          _answered
                              ? (_index == _questions.length - 1 ? 'Finish' : 'Next')
                              : 'Submit',
                          style: const TextStyle(fontWeight: FontWeight.w700),
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

  Widget _buildOption(BuildContext context, dynamic q, int i) {
    final isPicked = _picked == i;
    final isCorrect = q['answer'] == i;
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
              width: 32,
              height: 32,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: _answered && isCorrect
                    ? AppTheme.success
                    : _answered && isPicked
                        ? AppTheme.error
                        : isPicked
                            ? AppTheme.primary
                            : Theme.of(context).colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(8),
              ),
              child: _answered && isCorrect
                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                  : _answered && isPicked
                      ? const Icon(Icons.close, size: 16, color: Colors.white)
                      : Text(
                          letter,
                          style: TextStyle(
                            color: isPicked ? Colors.white : Theme.of(context).colorScheme.onSurface,
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

  Widget _buildExplanation(dynamic q) {
    final isCorrect = _picked == q['answer'];
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isCorrect
            ? AppTheme.success.withOpacity(0.06)
            : AppTheme.error.withOpacity(0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isCorrect ? AppTheme.success : AppTheme.error,
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
                size: 18,
              ),
              const SizedBox(width: 6),
              Text(
                isCorrect ? 'Correct!' : 'Incorrect',
                style: TextStyle(
                  color: isCorrect ? AppTheme.success : AppTheme.error,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            q['explain'] as String,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurface,
              fontSize: 13,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
