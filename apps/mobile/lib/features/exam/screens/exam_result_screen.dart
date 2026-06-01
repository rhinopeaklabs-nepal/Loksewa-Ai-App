// Exam Result Screen
import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/primary_button.dart';

class ExamResultScreen extends StatefulWidget {
  final String examId;
  const ExamResultScreen({super.key, required this.examId});

  @override
  State<ExamResultScreen> createState() => _ExamResultScreenState();
}

class _ExamResultScreenState extends State<ExamResultScreen> {
  late final ConfettiController _confetti;
  final int _correct = 4;
  final int _total = 5;
  final int _timeSpent = 32; // minutes
  final int _totalTime = 45;

  @override
  void initState() {
    super.initState();
    _confetti = ConfettiController(duration: const Duration(seconds: 2));
    if (_correct / _total >= 0.6) {
      Future.delayed(const Duration(milliseconds: 500), () => _confetti.play());
    }
  }

  @override
  void dispose() {
    _confetti.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final score = (_correct / _total * 100).round();
    final isPass = score >= 60;
    return Scaffold(
      body: Stack(
        children: [
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confetti,
              blastDirection: 1.5,
              blastDirectionality: BlastDirectionality.explosive,
              shouldLoop: false,
              numberOfParticles: 30,
              maxBlastForce: 25,
              minBlastForce: 10,
              gravity: 0.3,
              colors: const [
                AppTheme.primary,
                AppTheme.secondary,
                Colors.amber,
                Colors.purple,
              ],
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Align(
                    alignment: Alignment.topLeft,
                    child: IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => context.go(AppRoutes.home),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      gradient: isPass ? AppTheme.primaryGradient : null,
                      color: isPass ? null : AppTheme.error,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isPass ? Icons.emoji_events : Icons.refresh,
                      size: 60,
                      color: Colors.white,
                    ),
                  ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
                  const SizedBox(height: 16),
                  Text(
                    isPass ? 'Congratulations!' : 'Keep Practicing!',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isPass ? 'You passed the exam!' : 'You can do better next time!',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildStat(
                        context,
                        'Score',
                        '$score%',
                        AppTheme.primary,
                        CircularPercentIndicator(
                          radius: 36,
                          lineWidth: 6,
                          percent: score / 100,
                          circularStrokeCap: CircularStrokeCap.round,
                          backgroundColor: AppTheme.outline,
                          progressColor: AppTheme.primary,
                          center: Text(
                            '$score%',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.primary,
                            ),
                          ),
                        ),
                      ),
                      _buildStat(
                        context,
                        'Correct',
                        '$_correct/$_total',
                        AppTheme.success,
                        const Icon(
                          Icons.check_circle_rounded,
                          size: 72,
                          color: AppTheme.success,
                        ),
                      ),
                      _buildStat(
                        context,
                        'Time',
                        '$_timeSpent min',
                        AppTheme.tertiary,
                        const Icon(
                          Icons.timer_rounded,
                          size: 72,
                          color: AppTheme.tertiary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // Performance Summary
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: Theme.of(context).colorScheme.outline,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Subject Performance',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                        const SizedBox(height: 16),
                        _buildSubjectBar(context, 'General Knowledge', 0.8, Colors.blue),
                        const SizedBox(height: 12),
                        _buildSubjectBar(context, 'Mathematics', 0.6, Colors.purple),
                        const SizedBox(height: 12),
                        _buildSubjectBar(context, 'English', 1.0, Colors.indigo),
                        const SizedBox(height: 12),
                        _buildSubjectBar(context, 'Constitution', 0.6, Colors.brown),
                      ],
                    ),
                  ).animate(delay: 200.ms).fadeIn(duration: 500.ms).slideY(begin: 0.1),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: AppTheme.secondaryGradient,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.bolt, color: Colors.white, size: 32),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'XP Earned',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                '+85 XP',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).animate(delay: 300.ms).fadeIn(duration: 500.ms).slideY(begin: 0.1),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: PrimaryButton(
                          text: 'Review',
                          icon: Icons.visibility_rounded,
                          outlined: true,
                          onPressed: () => context.push('${AppRoutes.examReview}?id=${widget.examId}'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: PrimaryButton(
                          text: 'Done',
                          icon: Icons.check_rounded,
                          onPressed: () => context.go(AppRoutes.home),
                        ),
                      ),
                    ],
                  ).animate(delay: 400.ms).fadeIn(duration: 500.ms),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStat(BuildContext context, String label, String value, Color color, Widget indicator) {
    return Column(
      children: [
        indicator,
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _buildSubjectBar(BuildContext context, String name, double value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              name,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            Text(
              '${(value * 100).toInt()}%',
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: value,
            minHeight: 8,
            backgroundColor: color.withOpacity(0.12),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}
