// Exam List Screen with GetWidget & Riverpod
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/models/mock_test.dart';
import '../../../shared/providers/data_providers.dart';

class ExamListScreen extends ConsumerStatefulWidget {
  const ExamListScreen({super.key});

  @override
  ConsumerState<ExamListScreen> createState() => _ExamListScreenState();
}

class _ExamListScreenState extends ConsumerState<ExamListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late ScrollController _scrollControllerAll;
  late ScrollController _scrollControllerFree;
  late ScrollController _scrollControllerPremium;

  final List<MockTest> _fallbackTests = [
    MockTest(
      id: 'exam_1',
      title: 'Kharidar Model Mock Test 2083',
      description: 'Comprehensive GK and Aptitude full model set.',
      questionCount: 100,
      timeLimitMinutes: 120,
      isPremium: false,
      createdAt: DateTime.now(),
    ),
    MockTest(
      id: 'exam_2',
      title: 'Nayab Subba Past Paper Practice',
      description: 'Exam simulation based on the 2082 official exam paper.',
      questionCount: 75,
      timeLimitMinutes: 90,
      isPremium: true,
      createdAt: DateTime.now(),
    ),
    MockTest(
      id: 'exam_3',
      title: 'Section Officer GK Booster',
      description: 'Advanced general knowledge questions targeting international affairs.',
      questionCount: 50,
      timeLimitMinutes: 45,
      isPremium: false,
      createdAt: DateTime.now(),
    ),
    MockTest(
      id: 'exam_4',
      title: 'Polity & Constitution Premium Test',
      description: 'Intense mock test focusing strictly on polity legislation and articles.',
      questionCount: 50,
      timeLimitMinutes: 50,
      isPremium: true,
      createdAt: DateTime.now(),
    ),
  ];

  // Pagination State
  int _currentPage = 1;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  List<MockTest> _apiTests = [];
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _scrollControllerAll = ScrollController()..addListener(() => _onScroll(_scrollControllerAll));
    _scrollControllerFree = ScrollController()..addListener(() => _onScroll(_scrollControllerFree));
    _scrollControllerPremium = ScrollController()..addListener(() => _onScroll(_scrollControllerPremium));
  }

  void _onScroll(ScrollController controller) {
    if (controller.position.pixels >= controller.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || !_hasMore) return;
    setState(() {
      _isLoadingMore = true;
    });

    try {
      final repository = ref.read(mockTestRepositoryProvider);
      final newTests = await repository.listTests(
        page: _currentPage + 1,
        limit: 20,
      );

      setState(() {
        _currentPage++;
        _apiTests.addAll(newTests);
        if (newTests.length < 20) {
          _hasMore = false;
        }
      });
    } catch (e) {
      // Quietly fail or log
    } finally {
      setState(() {
        _isLoadingMore = false;
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollControllerAll.dispose();
    _scrollControllerFree.dispose();
    _scrollControllerPremium.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mockTestsAsyncValue = ref.watch(modelMockTestsProvider(null));

    // Initialize list when data arrives
    mockTestsAsyncValue.whenData((data) {
      if (!_initialized) {
        _apiTests = List.from(data);
        _initialized = true;
        if (data.length < 20) {
          _hasMore = false;
        }
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mock Exams'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primaryDark,
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Free'),
            Tab(text: 'Premium'),
          ],
        ),
      ),
      body: SafeArea(
        child: mockTestsAsyncValue.when(
          data: (apiTests) {
            final tests = _apiTests.isNotEmpty ? _apiTests : apiTests;
            final finalTests = tests.isNotEmpty ? tests : _fallbackTests;
            return TabBarView(
              controller: _tabController,
              children: [
                _buildTestList(finalTests, _scrollControllerAll),
                _buildTestList(finalTests.where((t) => !t.isPremium).toList(), _scrollControllerFree),
                _buildTestList(finalTests.where((t) => t.isPremium).toList(), _scrollControllerPremium),
              ],
            );
          },
          loading: () => TabBarView(
            controller: _tabController,
            children: [
              _buildShimmerList(),
              _buildShimmerList(),
              _buildShimmerList(),
            ],
          ),
          error: (err, stack) => TabBarView(
            controller: _tabController,
            children: [
              _buildTestList(_fallbackTests, _scrollControllerAll),
              _buildTestList(_fallbackTests.where((t) => !t.isPremium).toList(), _scrollControllerFree),
              _buildTestList(_fallbackTests.where((t) => t.isPremium).toList(), _scrollControllerPremium),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTestList(List<MockTest> tests, ScrollController controller) {
    if (tests.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: Text('No mock tests available in this category.'),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        setState(() {
          _currentPage = 1;
          _hasMore = true;
          _initialized = false;
          _apiTests.clear();
        });
        ref.invalidate(modelMockTestsProvider(null));
        await ref.read(modelMockTestsProvider(null).future);
      },
      child: ListView.builder(
        controller: controller,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: tests.length + (_isLoadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == tests.length) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 16.0),
              child: Center(child: CircularProgressIndicator()),
            );
          }
          final test = tests[index];
          final testColor = test.isPremium ? Colors.purple : AppTheme.primary;

          return GFCard(
            boxFit: BoxFit.cover,
            color: Theme.of(context).colorScheme.surface,
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: test.isPremium
                  ? Colors.purple.withOpacity(0.3)
                  : Theme.of(context).colorScheme.outline.withOpacity(0.5),
              width: test.isPremium ? 1.5 : 1,
            ),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  test.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  test.description ?? 'Test your preparation',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _infoBadge(Icons.timer_outlined, '${test.timeLimitMinutes} Mins'),
                    const SizedBox(width: 16),
                    _infoBadge(Icons.assignment_outlined, '${test.questionCount} Questions'),
                    const Spacer(),
                    GFBadge(
                      text: test.isPremium ? 'PREMIUM' : 'FREE',
                      color: test.isPremium ? GFColors.DARK : GFColors.SUCCESS,
                      shape: GFBadgeShape.pills,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    GFButton(
                      onPressed: () {
                        if (test.isPremium) {
                          context.push('${AppRoutes.examTake}?id=${test.id}');
                        } else {
                          context.push('${AppRoutes.examTake}?id=${test.id}');
                        }
                      },
                      text: test.isPremium ? 'Unlock & Take' : 'Enroll Test',
                      icon: Icon(
                        test.isPremium ? Icons.lock_open : Icons.play_arrow_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                      color: testColor,
                      size: GFSize.MEDIUM,
                      shape: GFButtonShape.standard,
                    ),
                  ],
                ),
              ],
            ),
          ).animate(delay: (100 * (index % 5)).ms).fadeIn(duration: 400.ms).slideY(begin: 0.05);
        },
      ),
    );
  }

  Widget _infoBadge(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Theme.of(context).colorScheme.onSurfaceVariant),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildShimmerList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 4,
      itemBuilder: (context, index) {
        return GFShimmer(
          child: Container(
            height: 140,
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        );
      },
    );
  }
}
