// Modern Home Screen redesigned with GetWidget & Riverpod
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/models/subject.dart';
import '../../../shared/models/learning.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/providers/data_providers.dart';
import '../../../shared/widgets/section_header.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final subjectsAsyncValue = ref.watch(modelSubjectsProvider);
    final progressAsyncValue = ref.watch(modelStudyProgressProvider);
    final recommendationsAsyncValue = ref.watch(modelRecommendationsProvider);

    final userName = authState.user?.name ?? 'Learner';
    final userAvatar = authState.user?.avatarUrl;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          color: AppTheme.primary,
          onRefresh: () async {
            ref.invalidate(modelSubjectsProvider);
            ref.invalidate(modelStudyProgressProvider);
            ref.invalidate(modelRecommendationsProvider);
            await ref.read(authStateProvider.notifier).checkAuth();
          },
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: _buildGreetingPanel(context, userName, userAvatar),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    _buildDailyMissionCard(context, progressAsyncValue)
                        .animate()
                        .fadeIn(duration: 500.ms)
                        .slideY(begin: 0.1),
                    const SizedBox(height: 24),
                    _buildStatsGrid(context, progressAsyncValue)
                        .animate(delay: 100.ms)
                        .fadeIn(duration: 500.ms),
                    const SizedBox(height: 28),
                    SectionHeader(
                      title: 'Quick Actions',
                      subtitle: 'Jump back into learning',
                      actionText: 'See all',
                      onAction: () => context.push(AppRoutes.subjects),
                    ),
                    const SizedBox(height: 12),
                    _buildQuickActions(context)
                        .animate(delay: 200.ms)
                        .fadeIn(duration: 500.ms),
                    const SizedBox(height: 28),
                    SectionHeader(
                      title: 'Explore Subjects',
                      subtitle: 'Learn and test topic by topic',
                      actionText: 'View All',
                      onAction: () => context.push(AppRoutes.subjects),
                    ),
                    const SizedBox(height: 12),
                    _buildSubjectsCarousel(context, subjectsAsyncValue)
                        .animate(delay: 300.ms)
                        .fadeIn(duration: 500.ms),
                    const SizedBox(height: 28),
                    SectionHeader(
                      title: 'AI Suggestion',
                      subtitle: 'Smart recommendations for you',
                    ),
                    const SizedBox(height: 12),
                    _buildRecommendation(context, recommendationsAsyncValue)
                        .animate(delay: 400.ms)
                        .fadeIn(duration: 500.ms),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGreetingPanel(
      BuildContext context, String userName, String? avatarUrl) {
    // Get streak days from progress (if available, else fallback to mock)
    final progressAsyncValue = ref.watch(modelStudyProgressProvider);
    final streakDays = progressAsyncValue.maybeWhen(
      data: (list) => list.isNotEmpty ? list.first.streakDays : 5,
      orElse: () => 5,
    );

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      child: Row(
        children: [
          GFAvatar(
            backgroundImage: avatarUrl != null ? CachedNetworkImageProvider(avatarUrl) : null,
            child: avatarUrl == null && userName.isNotEmpty
                ? Text(userName[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))
                : null,
            backgroundColor: AppTheme.primary,
            shape: GFAvatarShape.standard,
            size: GFSize.MEDIUM,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Namaste, $userName 👋',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.local_fire_department_rounded,
                        color: Colors.orange, size: 18),
                    const SizedBox(width: 4),
                    Text(
                      '$streakDays Day Streak',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: Colors.orange[800],
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Stack(
            children: [
              IconButton(
                onPressed: () => context.push(AppRoutes.notifications),
                icon: const Icon(Icons.notifications_outlined),
                style: IconButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.surface,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(
                      color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: GFBadge(
                  shape: GFBadgeShape.circle,
                  size: GFSize.SMALL,
                  color: GFColors.DANGER,
                  child: const Text('2', style: TextStyle(fontSize: 8)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDailyMissionCard(
      BuildContext context, AsyncValue<List<StudyProgress>> progressAsync) {
    final completed = progressAsync.maybeWhen(
      data: (list) => list.isNotEmpty ? list.first.questionsAttempted : 6,
      orElse: () => 6,
    );
    const target = 10;
    final percent = (completed / target).clamp(0.0, 1.0);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.heroGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: AppTheme.primaryShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.bolt, color: Colors.amber, size: 14),
                    SizedBox(width: 4),
                    Text(
                      'Daily Mission',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              const Icon(Icons.timer_outlined, color: Colors.white70, size: 14),
              const SizedBox(width: 4),
              const Text(
                'Resets in 8h 24m',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            percent >= 1.0
                ? 'Daily goal achieved!\nKeep it up!'
                : 'You\'re ${target - completed} questions away\nfrom your daily goal',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 16),
          LinearPercentIndicator(
            lineHeight: 10,
            percent: percent,
            backgroundColor: Colors.white.withOpacity(0.2),
            progressColor: Colors.white,
            barRadius: const Radius.circular(8),
            padding: EdgeInsets.zero,
            animation: true,
            animationDuration: 1200,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$completed of $target questions',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '+50 XP',
                  style: TextStyle(
                    color: AppTheme.primary,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton(
              onPressed: () => context.push(AppRoutes.mission),
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppTheme.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Continue Mission', style: TextStyle(fontWeight: FontWeight.w700)),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward_rounded, size: 18),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(
      BuildContext context, AsyncValue<List<StudyProgress>> progressAsync) {
    int totalQuestions = 0;
    int correctQuestions = 0;
    int timeSpent = 0;

    progressAsync.maybeWhen(
      data: (list) {
        for (var p in list) {
          totalQuestions += p.questionsAttempted;
          correctQuestions += p.questionsCorrect;
          timeSpent += p.timeSpentMinutes;
        }
      },
      orElse: () {
        totalQuestions = 45;
        correctQuestions = 35;
        timeSpent = 120;
      },
    );

    final double accuracy = totalQuestions > 0
        ? (correctQuestions / totalQuestions) * 100
        : 75.0;

    return Row(
      children: [
        Expanded(
          child: GFCard(
            boxFit: BoxFit.cover,
            titlePosition: GFPosition.start,
            padding: const EdgeInsets.all(12),
            margin: EdgeInsets.zero,
            color: Theme.of(context).colorScheme.surface,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Study Time',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    Icon(Icons.timer, color: Colors.blue),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '$timeSpent min',
                  style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue),
                ),
                const SizedBox(height: 4),
                const Text('Spent learning',
                    style: TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GFCard(
            boxFit: BoxFit.cover,
            titlePosition: GFPosition.start,
            padding: const EdgeInsets.all(12),
            margin: EdgeInsets.zero,
            color: Theme.of(context).colorScheme.surface,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Accuracy',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    Icon(Icons.check_circle_outline, color: Colors.green),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${accuracy.toStringAsFixed(0)}%',
                  style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.green),
                ),
                const SizedBox(height: 4),
                const Text('Correct answers',
                    style: TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      {
        'title': 'Study Subjects',
        'subtitle': 'Topics & notes',
        'icon': Icons.menu_book_rounded,
        'color': AppTheme.primary,
        'route': AppRoutes.subjects,
      },
      {
        'title': 'Take Exam',
        'subtitle': 'Mock tests',
        'icon': Icons.assignment_rounded,
        'color': Colors.amber[700],
        'route': AppRoutes.examList,
      },
      {
        'title': 'AI Tutor',
        'subtitle': 'Chat & ask',
        'icon': Icons.smart_toy_rounded,
        'color': Colors.purple,
        'route': AppRoutes.chat,
      },
      {
        'title': 'Scan & Solve',
        'subtitle': 'OCR questions',
        'icon': Icons.document_scanner_rounded,
        'color': Colors.blue,
        'route': AppRoutes.scan,
      },
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: List.generate(actions.length, (i) {
        final action = actions[i];
        return InkWell(
          onTap: () => context.push(action['route'] as String),
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: (action['color'] as Color).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    action['icon'] as IconData,
                    color: action['color'] as Color,
                    size: 20,
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      action['title'] as String,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      action['subtitle'] as String,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildSubjectsCarousel(
      BuildContext context, AsyncValue<List<Subject>> subjectsAsync) {
    return subjectsAsync.when(
      data: (subjects) {
        if (subjects.isEmpty) {
          return const Center(child: Text('No subjects available.'));
        }
        
        final List<Widget> carouselItems = subjects.map((subj) {
          final colorCode = int.tryParse(subj.color ?? '') ?? Colors.teal.value;
          final subjColor = Color(colorCode).withOpacity(0.85);

          return Builder(
            builder: (BuildContext context) {
              return InkWell(
                onTap: () {
                  context.push('${AppRoutes.subjects}/${subj.id}');
                },
                child: GFCard(
                  boxFit: BoxFit.cover,
                  color: subjColor,
                  margin: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 8.0),
                  padding: const EdgeInsets.all(16),
                  borderRadius: BorderRadius.circular(20),
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        subj.nameNp ?? subj.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${subj.topics.length} topics',
                        style: const TextStyle(color: Colors.white70),
                      ),
                      const Spacer(),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Tap to view topics',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Icon(Icons.arrow_forward_rounded,
                              color: Colors.white, size: 18),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        }).toList();

        return GFCarousel(
          items: carouselItems,
          height: 160,
          viewportFraction: 0.85,
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 4),
          aspectRatio: 16 / 9,
        );
      },
      loading: () => GFShimmer(
        child: Container(
          height: 160,
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
      error: (e, s) => Container(
        height: 160,
        alignment: Alignment.center,
        child: Text('Error loading subjects: $e'),
      ),
    );
  }

  Widget _buildRecommendation(
      BuildContext context, AsyncValue<Map<String, dynamic>> recommendationAsync) {
    return recommendationAsync.when(
      data: (rec) {
        final title = rec['title'] ?? 'Constitution & Polity';
        final suggestion = rec['suggestion'] ?? 'Practice 10 Constitution MCQs';
        final reason = rec['reason'] ?? 'Based on your weak area in Polity';

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.tertiaryContainer,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  gradient: AppTheme.purpleGradient,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.psychology_rounded,
                    color: Colors.white, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI SUGGESTION',
                      style: TextStyle(
                        color: AppTheme.tertiary,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      suggestion,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      reason,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontSize: 11,
                          ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => context.push(AppRoutes.questionPractice),
                icon: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white,
                  shape: const CircleBorder(),
                  padding: const EdgeInsets.all(8),
                ),
              ),
            ],
          ),
        );
      },
      loading: () => GFShimmer(
        child: Container(
          height: 80,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
      error: (e, s) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.red[50],
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.red),
            const SizedBox(width: 12),
            Expanded(child: Text('Failed to load recommendation: $e')),
          ],
        ),
      ),
    );
  }
}
