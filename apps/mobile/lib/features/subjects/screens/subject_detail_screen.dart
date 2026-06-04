// Subject Detail Screen with GetWidget & Riverpod
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';
import 'package:percent_indicator/percent_indicator.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/models/subject.dart';
import '../../../shared/models/learning.dart';
import '../../../shared/providers/data_providers.dart';
import '../../../shared/widgets/section_header.dart';

class SubjectDetailScreen extends ConsumerStatefulWidget {
  final String subjectId;
  const SubjectDetailScreen({super.key, required this.subjectId});

  @override
  ConsumerState<SubjectDetailScreen> createState() => _SubjectDetailScreenState();
}

class _SubjectDetailScreenState extends ConsumerState<SubjectDetailScreen> {
  @override
  Widget build(BuildContext context) {
    final subjectsAsyncValue = ref.watch(modelSubjectsProvider);
    final topicTreeAsyncValue = ref.watch(modelTopicTreeProvider(widget.subjectId));
    final progressAsyncValue = ref.watch(modelStudyProgressProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Subject Details'),
      ),
      body: SafeArea(
        bottom: false,
        child: subjectsAsyncValue.when(
          data: (subjects) {
            // Find current subject
            final subject = subjects.firstWhere(
              (s) => s.id == widget.subjectId,
              orElse: () => Subject(
                id: widget.subjectId,
                name: 'Subject Details',
                createdAt: DateTime.now(),
                topics: [],
              ),
            );

            final colorValue = int.tryParse(subject.color ?? '') ?? Colors.teal.value;
            final subjectColor = Color(colorValue);

            return topicTreeAsyncValue.when(
              data: (topics) {
                // Map topicId to completion progress
                final Map<String, double> topicProgress = {};
                progressAsyncValue.maybeWhen(
                  data: (progressList) {
                    for (var p in progressList) {
                      if (p.topicId.isNotEmpty) {
                        topicProgress[p.topicId] = p.completionPercentage;
                      }
                    }
                  },
                  orElse: () {
                    // Mock progress if not fetched
                    for (var t in topics) {
                      topicProgress[t.id] = 45.0;
                    }
                  },
                );

                // Calculate average subject completion
                double totalCompletion = 0;
                if (topics.isNotEmpty) {
                  for (var t in topics) {
                    totalCompletion += topicProgress[t.id] ?? 0.0;
                  }
                  totalCompletion = (totalCompletion / topics.length).clamp(0.0, 100.0);
                }

                // Total questions count mock or calculated
                int totalQuestions = topics.length * 40; 

                return CustomScrollView(
                  slivers: [
                    SliverToBoxAdapter(
                      child: Container(
                        margin: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [subjectColor, subjectColor.withOpacity(0.75)],
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: subjectColor.withOpacity(0.3),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Icon(
                              _getIconForSubject(subject.name),
                              color: Colors.white,
                              size: 48,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              subject.nameNp ?? subject.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Loksewa Weighted Study Track',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                _stat('${topics.length}', 'Topics'),
                                _stat('$totalQuestions+', 'Questions'),
                                _stat('${totalCompletion.toStringAsFixed(0)}%', 'Done'),
                              ],
                            ),
                          ],
                        ),
                      ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                      sliver: SliverList(
                        delegate: SliverChildListDelegate([
                          SectionHeader(
                            title: 'Chapters & Topics',
                            subtitle: 'Interactive syllabus with live study status',
                          ),
                          const SizedBox(height: 12),
                          if (topics.isEmpty)
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.all(32.0),
                                child: Text('No topics found for this subject.'),
                              ),
                            )
                          else
                            ...List.generate(topics.length, (i) {
                              final topic = topics[i];
                              final progress = (topicProgress[topic.id] ?? 0.0) / 100.0;
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _buildTopicAccordion(context, topic, i + 1, progress, subjectColor),
                              );
                            }),
                        ]),
                      ),
                    ),
                  ],
                );
              },
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(40.0),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (e, s) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Text('Error loading topics: $e'),
                ),
              ),
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(),
          ),
          error: (e, s) => Center(
            child: Text('Error loading subject details: $e'),
          ),
        ),
      ),
    );
  }

  Widget _stat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.85),
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildTopicAccordion(BuildContext context, Topic topic, int number, double progress, Color themeColor) {
    return GFAccordion(
      titleChild: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: themeColor.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Text(
              '$number',
              style: TextStyle(
                color: themeColor,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  topic.nameNp ?? topic.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                LinearPercentIndicator(
                  lineHeight: 6,
                  percent: progress,
                  backgroundColor: Colors.grey[200],
                  progressColor: themeColor,
                  barRadius: const Radius.circular(3),
                  padding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '${(progress * 100).toStringAsFixed(0)}%',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: themeColor,
            ),
          ),
        ],
      ),
      contentChild: Column(
        children: [
          if (topic.description != null && topic.description!.isNotEmpty) ...[
            Text(
              topic.description!,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const Divider(height: 16),
          ],
          if (topic.subTopics.isEmpty)
            const Text(
              'No subtopics. Tap to practice general questions.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            )
          else
            ...topic.subTopics.map((sub) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6.0),
                  child: Row(
                    children: [
                      const Icon(Icons.circle, size: 6, color: Colors.grey),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          sub.nameNp ?? sub.name,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      GFButton(
                        onPressed: () {
                          context.push(
                              '${AppRoutes.questionPractice}?subjectId=${widget.subjectId}&topicId=${topic.id}&subTopicId=${sub.id}');
                        },
                        text: 'Practice',
                        textStyle: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                        color: themeColor,
                        shape: GFButtonShape.pills,
                        size: GFSize.SMALL,
                      ),
                    ],
                  ),
                )),
          const SizedBox(height: 8),
          const Divider(),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GFButton(
                onPressed: () {
                  context.push(
                      '${AppRoutes.questionPractice}?subjectId=${widget.subjectId}&topicId=${topic.id}');
                },
                text: 'Topic Practice Test',
                icon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 16),
                color: themeColor,
                size: GFSize.MEDIUM,
                shape: GFButtonShape.standard,
              ),
            ],
          ),
        ],
      ),
      collapsedIcon: const Icon(Icons.keyboard_arrow_down_rounded),
      expandedIcon: const Icon(Icons.keyboard_arrow_up_rounded),
      titleBorderRadius: BorderRadius.circular(16),
      contentBorderRadius: BorderRadius.circular(16),
      titlePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      contentPadding: const EdgeInsets.all(16),
      collapsedTitleBackgroundColor: Theme.of(context).colorScheme.surface,
      expandedTitleBackgroundColor: Theme.of(context).colorScheme.surface,
      titleBorder: Border.all(
        color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
      ),
      contentBorder: Border.all(
        color: Theme.of(context).colorScheme.outline.withOpacity(0.3),
      ),
    );
  }

  IconData _getIconForSubject(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('general') || lower.contains('gk')) return Icons.public;
    if (lower.contains('math')) return Icons.calculate;
    if (lower.contains('english')) return Icons.translate;
    if (lower.contains('nepali')) return Icons.menu_book;
    if (lower.contains('science')) return Icons.science;
    if (lower.contains('reasoning')) return Icons.psychology;
    if (lower.contains('constitution')) return Icons.gavel;
    if (lower.contains('history')) return Icons.history_edu;
    return Icons.assignment;
  }
}
