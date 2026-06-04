// Subjects Screen with GetWidget & Riverpod
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

class SubjectsScreen extends ConsumerStatefulWidget {
  const SubjectsScreen({super.key});

  @override
  ConsumerState<SubjectsScreen> createState() => _SubjectsScreenState();
}

class _SubjectsScreenState extends ConsumerState<SubjectsScreen> {
  String _searchQuery = '';
  List<Subject> _filteredSubjects = [];
  bool _isInitialized = false;

  @override
  Widget build(BuildContext context) {
    final subjectsAsyncValue = ref.watch(modelSubjectsProvider);
    final progressAsyncValue = ref.watch(modelStudyProgressProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Subjects'),
      ),
      body: SafeArea(
        child: subjectsAsyncValue.when(
          data: (subjects) {
            // Get all topic completions to match subjects and calculate progress
            final Map<String, double> subjectProgress = {};
            progressAsyncValue.maybeWhen(
              data: (progressList) {
                // Map topicId to completion
                final topicCompletion = {
                  for (var p in progressList) p.topicId: p.completionPercentage
                };

                for (var s in subjects) {
                  double totalCompletion = 0;
                  int topicCount = s.topics.length;
                  if (topicCount > 0) {
                    for (var t in s.topics) {
                      totalCompletion += topicCompletion[t.id] ?? 0.0;
                    }
                    subjectProgress[s.id] = (totalCompletion / topicCount).clamp(0.0, 100.0) / 100.0;
                  } else {
                    subjectProgress[s.id] = 0.0;
                  }
                }
              },
              orElse: () {
                // Mock progress if no data is found
                for (var s in subjects) {
                  subjectProgress[s.id] = 0.35;
                }
              },
            );

            if (!_isInitialized || _searchQuery.isEmpty) {
              _filteredSubjects = subjects;
              _isInitialized = true;
            }

            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: GFSearchBar(
                    searchList: subjects,
                    searchQueryBuilder: (query, list) {
                      return list
                          .where((item) =>
                              item.name.toLowerCase().contains(query.toLowerCase()) ||
                              (item.nameNp != null &&
                                  item.nameNp!.contains(query)))
                          .toList();
                    },
                    overlaySearchListItemBuilder: (item) {
                      return Container(
                        padding: const EdgeInsets.all(8),
                        child: Text(
                          item.nameNp ?? item.name,
                          style: const TextStyle(fontSize: 14),
                        ),
                      );
                    },
                    onItemSelected: (item) {
                      context.push('${AppRoutes.subjectDetail}?id=${item.id}');
                    },
                    searchBoxInputDecoration: InputDecoration(
                      hintText: 'Search subjects...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: Theme.of(context).colorScheme.outline,
                        ),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                    ),
                  ),
                ),
                Expanded(
                  child: _filteredSubjects.isEmpty
                      ? const Center(child: Text('No subjects found.'))
                      : GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 16,
                            crossAxisSpacing: 16,
                            childAspectRatio: 0.85,
                          ),
                          itemCount: _filteredSubjects.length,
                          itemBuilder: (context, i) {
                            final s = _filteredSubjects[i];
                            final progress = subjectProgress[s.id] ?? 0.0;
                            final colorValue = int.tryParse(s.color ?? '') ?? Colors.teal.value;
                            final cardColor = Color(colorValue);

                            return InkWell(
                              onTap: () =>
                                  context.push('${AppRoutes.subjectDetail}?id=${s.id}'),
                              borderRadius: BorderRadius.circular(20),
                              child: GFCard(
                                boxFit: BoxFit.cover,
                                color: Theme.of(context).colorScheme.surface,
                                margin: EdgeInsets.zero,
                                padding: const EdgeInsets.all(14),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
                                ),
                                content: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      s.nameNp ?? s.name,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${s.topics.length} topics',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: Colors.grey,
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    Center(
                                      child: CircularPercentIndicator(
                                        radius: 40.0,
                                        lineWidth: 7.0,
                                        percent: progress,
                                        center: Text(
                                          '${(progress * 100).toStringAsFixed(0)}%',
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: cardColor,
                                          ),
                                        ),
                                        progressColor: cardColor,
                                        backgroundColor: cardColor.withOpacity(0.12),
                                        circularStrokeCap: CircularStrokeCap.round,
                                        animation: true,
                                        animationDuration: 1000,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ).animate(delay: (40 * i).ms).fadeIn(duration: 400.ms).scale(begin: const Offset(0.95, 0.95));
                          },
                        ),
                ),
              ],
            );
          },
          loading: () => GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.85,
            ),
            itemCount: 6,
            itemBuilder: (context, i) {
              return GFShimmer(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              );
            },
          ),
          error: (e, s) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text('Error loading subjects: $e'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.refresh(modelSubjectsProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
