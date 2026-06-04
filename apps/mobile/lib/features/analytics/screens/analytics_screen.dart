// Analytics Screen with charts
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/models/analytics.dart';
import '../../../shared/providers/data_providers.dart';
import '../../../shared/widgets/section_header.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  String _selectedPeriod = '30d';

  @override
  Widget build(BuildContext context) {
    final statsAsync = ref.watch(modelDailyStatsProvider(_selectedPeriod));
    final weaknessesAsync = ref.watch(modelWeaknessesProvider);
    final recommendationsAsync = ref.watch(modelRecommendationsProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Analytics'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _periodSelector(context),
              const SizedBox(height: 16),
              statsAsync.when(
                data: (stats) {
                  if (stats.isEmpty) {
                    return _buildEmptyStatsState();
                  }
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _keyMetrics(context, stats).animate().fadeIn(duration: 500.ms),
                      const SizedBox(height: 24),
                      _distributionSection(context, stats),
                      const SizedBox(height: 24),
                      _activityChart(context, stats).animate(delay: 100.ms).fadeIn(duration: 500.ms),
                    ],
                  );
                },
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: GFLoader(type: GFLoaderType.circle),
                  ),
                ),
                error: (err, _) => Center(child: Text('Error loading stats: $err')),
              ),
              const SizedBox(height: 24),
              weaknessesAsync.when(
                data: (weaknesses) {
                  return _subjectPerformance(context, weaknesses).animate(delay: 200.ms).fadeIn(duration: 500.ms);
                },
                loading: () => const SizedBox(),
                error: (_, __) => const SizedBox(),
              ),
              const SizedBox(height: 24),
              recommendationsAsync.when(
                data: (recs) {
                  return _studyTargets(context, recs).animate(delay: 300.ms).fadeIn(duration: 500.ms);
                },
                loading: () => const SizedBox(),
                error: (_, __) => const SizedBox(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyStatsState() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Icon(Icons.analytics_outlined, size: 48, color: AppTheme.textSecondary),
            const SizedBox(height: 16),
            const Text(
              'No Study Data Yet',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            const Text(
              'Start taking mock tests and answering practice questions to see your progress here.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.pop(),
              child: const Text('Go to Home'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _periodSelector(BuildContext context) {
    final periods = [
      {'label': 'Week', 'val': '7d'},
      {'label': 'Month', 'val': '30d'},
      {'label': 'Year', 'val': '365d'},
      {'label': 'All', 'val': 'all'},
    ];

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: periods.map((p) {
          final selected = p['val'] == _selectedPeriod;
          return Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedPeriod = p['val']!;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: selected ? Theme.of(context).colorScheme.surface : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: selected
                      ? [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Center(
                  child: Text(
                    p['label']!,
                    style: TextStyle(
                      color: selected
                          ? AppTheme.primary
                          : Theme.of(context).colorScheme.onSurfaceVariant,
                      fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _keyMetrics(BuildContext context, List<DailyStats> stats) {
    int totalQuestions = 0;
    int totalCorrect = 0;
    int totalMinutes = 0;

    for (var s in stats) {
      totalQuestions += s.questionsAnswered;
      totalCorrect += s.correctAnswers;
      totalMinutes += s.timeSpentMinutes;
    }

    final accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toStringAsFixed(0) : '0';
    final durationStr = totalMinutes >= 60 ? '${(totalMinutes / 60).toStringAsFixed(1)}h' : '${totalMinutes}m';

    return Row(
      children: [
        Expanded(child: _metricCard(context, '$totalQuestions', 'Questions', '+12%', AppTheme.primary, Icons.help)),
        const SizedBox(width: 8),
        Expanded(child: _metricCard(context, '$accuracy%', 'Accuracy', '+4%', AppTheme.success, Icons.gps_fixed)),
        const SizedBox(width: 8),
        Expanded(child: _metricCard(context, durationStr, 'Time Spent', '+15%', AppTheme.tertiary, Icons.timer)),
      ],
    );
  }

  Widget _metricCard(BuildContext context, String value, String label, String trend, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 18),
              Text(
                trend,
                style: const TextStyle(
                  color: AppTheme.success,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 10)),
        ],
      ),
    );
  }

  Widget _distributionSection(BuildContext context, List<DailyStats> stats) {
    int totalQuestions = 0;
    int totalCorrect = 0;

    for (var s in stats) {
      totalQuestions += s.questionsAnswered;
      totalCorrect += s.correctAnswers;
    }

    int totalIncorrect = totalQuestions - totalCorrect;
    if (totalIncorrect < 0) totalIncorrect = 0;

    double correctRatio = totalQuestions > 0 ? totalCorrect / totalQuestions : 0.5;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Answer Distribution',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                flex: (correctRatio * 100).toInt().clamp(5, 95),
                child: Container(
                  height: 12,
                  decoration: const BoxDecoration(
                    color: AppTheme.success,
                    borderRadius: BorderRadius.horizontal(left: Radius.circular(6)),
                  ),
                ),
              ),
              Expanded(
                flex: ((1 - correctRatio) * 100).toInt().clamp(5, 95),
                child: Container(
                  height: 12,
                  decoration: const BoxDecoration(
                    color: AppTheme.error,
                    borderRadius: BorderRadius.horizontal(right: Radius.circular(6)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(width: 12, height: 12, decoration: const BoxDecoration(color: AppTheme.success, shape: BoxShape.circle)),
                  const SizedBox(width: 6),
                  Text('Correct: $totalCorrect', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
              Row(
                children: [
                  Container(width: 12, height: 12, decoration: const BoxDecoration(color: AppTheme.error, shape: BoxShape.circle)),
                  const SizedBox(width: 6),
                  Text('Incorrect: $totalIncorrect', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _activityChart(BuildContext context, List<DailyStats> stats) {
    // Show weekly study duration or daily activity
    final chartStats = stats.take(7).toList().reversed.toList();
    if (chartStats.isEmpty) return const SizedBox();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Study Duration (Minutes)',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          const SizedBox(height: 4),
          Text('Study duration for the last 7 sessions', style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 24),
          SizedBox(
            height: 160,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: 60,
                barTouchData: BarTouchData(enabled: true),
                titlesData: FlTitlesData(
                  show: true,
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (v, m) {
                        final idx = v.toInt();
                        if (idx < 0 || idx >= chartStats.length) return const SizedBox();
                        final days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                        final dayOfWeek = chartStats[idx].date.weekday - 1;
                        final label = days[dayOfWeek.clamp(0, 6)];
                        return Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            label,
                            style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barGroups: chartStats.asMap().entries.map((e) {
                  return _bar(e.key, e.value.timeSpentMinutes.toDouble().clamp(2, 60), AppTheme.primary);
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  BarChartGroupData _bar(int x, double y, Color c) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: c,
          width: 14,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
        ),
      ],
    );
  }

  Widget _subjectPerformance(BuildContext context, List<WeaknessArea> weaknesses) {
    // Generate subjects performance list dynamically from WeaknessArea data.
    // If WeaknessArea errorRate is high, it's a weak subject, otherwise strong.
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Subject Analysis',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          const SizedBox(height: 4),
          const Text('Focus on areas with high error rates', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          const SizedBox(height: 16),
          if (weaknesses.isEmpty)
            const Text('Practice more questions to generate subject-specific analysis.')
          else
            ...weaknesses.map((w) {
              final accuracy = (100 - w.errorRate).clamp(0, 100);
              final isStrong = accuracy >= 70;
              final accentColor = isStrong ? AppTheme.success : AppTheme.error;

              return Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                w.topicName,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                w.subjectName,
                                style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        GFBadge(
                          text: isStrong ? 'Strong' : 'Weak',
                          color: isStrong ? GFColors.SUCCESS : GFColors.DANGER,
                          shape: GFBadgeShape.standard,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${accuracy.toStringAsFixed(0)}%',
                          style: TextStyle(
                            color: accentColor,
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: accuracy / 100.0,
                        minHeight: 6,
                        backgroundColor: accentColor.withOpacity(0.12),
                        valueColor: AlwaysStoppedAnimation<Color>(accentColor),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _studyTargets(BuildContext context, Map<String, dynamic> recs) {
    // Show personalized study targets
    final targets = recs['targets'] as List? ?? [
      'Solve 15 General Knowledge questions today',
      'Take a math quiz on Profit & Loss',
      'Review Constitution Part 3 (Fundamental Rights)',
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.tertiaryContainer.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.tertiary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.track_changes, color: AppTheme.tertiary, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Personalized Study Targets',
                style: TextStyle(
                  color: AppTheme.tertiary,
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...targets.map((t) => Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_box_outlined, size: 18, color: AppTheme.tertiary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        t.toString(),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}
