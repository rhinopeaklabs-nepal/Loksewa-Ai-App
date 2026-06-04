import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme.dart';
import '../../shared/services/api_client.dart';
import '../../shared/services/loksewa_repository.dart';
import '../../shared/widgets/loksewa_design.dart';

const _homeRoute = '/home';
const _missionRoute = '/mission';
const _examRoute = '/exam';
const _leaderboardRoute = '/leaderboard';
const _profileRoute = '/profile';
const _loginRoute = '/auth/login';
const _registerRoute = '/auth/register';
const _chatRoute = '/chat';
const _scanRoute = '/scan';
const _subjectsRoute = '/subjects';
const _practiceRoute = '/practice';

typedef JsonMap = Map<String, dynamic>;

String _text(JsonMap map, List<String> keys, [String fallback = 'Untitled']) {
  return labelOf(map, keys, fallback);
}

String _idOf(JsonMap map) => _text(map, const ['id', 'slug', 'public_id'], '');

double _ratio(num value) {
  final normalized = value > 1 ? value / 100 : value.toDouble();
  return normalized.clamp(0.0, 1.0);
}

String _percent(num value) => '${value.round()}%';

String _initials(String value) {
  final parts = value.trim().split(RegExp(r'\s+')).where((part) => part.isNotEmpty).toList();
  if (parts.isEmpty) return 'L';
  if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
  return '${parts.first.substring(0, 1)}${parts.last.substring(0, 1)}'.toUpperCase();
}

Widget _async<T>(
  WidgetRef ref,
  AsyncValue<T> value,
  dynamic provider,
  Widget Function(T data) builder,
) {
  return value.when(
    loading: () => const LoksewaLoading(),
    error: (error, _) => LoksewaErrorState(
      error: error,
      onRetry: () => ref.invalidate(provider),
    ),
    data: builder,
  );
}

class MainShell extends StatelessWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  static const _items = [
    (route: _homeRoute, icon: Icons.dashboard_rounded, label: 'Home'),
    (route: _missionRoute, icon: Icons.flag_rounded, label: 'Mission'),
    (route: _examRoute, icon: Icons.assignment_rounded, label: 'Exams'),
    (route: _leaderboardRoute, icon: Icons.leaderboard_rounded, label: 'Ranks'),
    (route: _profileRoute, icon: Icons.person_rounded, label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    return Scaffold(
      extendBody: true,
      body: child,
      floatingActionButton: FloatingActionButton(
        tooltip: 'Scan question',
        onPressed: () => context.push(_scanRoute),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        child: const Icon(Icons.document_scanner_rounded),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: SafeArea(
        top: false,
        child: Container(
          margin: const EdgeInsets.fromLTRB(14, 0, 14, 12),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(AppTheme.radius24),
            border: Border.all(color: Theme.of(context).colorScheme.outline),
            boxShadow: AppTheme.shadow(color: Colors.black.withOpacity(0.08)),
          ),
          child: Row(
            children: _items.map((item) {
              final active = location == item.route;
              return Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(AppTheme.radius16),
                  onTap: () => context.go(item.route),
                  child: AnimatedContainer(
                    duration: AppTheme.normal,
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    decoration: BoxDecoration(
                      color: active ? Theme.of(context).colorScheme.primaryContainer : Colors.transparent,
                      borderRadius: BorderRadius.circular(AppTheme.radius16),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          item.icon,
                          size: 21,
                          color: active
                              ? Theme.of(context).colorScheme.primary
                              : Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(height: 3),
                        Text(
                          item.label,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: active
                                    ? Theme.of(context).colorScheme.primary
                                    : Theme.of(context).colorScheme.onSurfaceVariant,
                                fontWeight: active ? FontWeight.w800 : FontWeight.w600,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(milliseconds: 700), () async {
      if (!mounted) return;
      final signedIn = await ref.read(loksewaRepositoryProvider).isSignedIn;
      if (!mounted) return;
      context.go(signedIn ? _homeRoute : '/welcome');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  gradient: AppTheme.studyGradient,
                  borderRadius: BorderRadius.circular(28),
                ),
                child: const Icon(Icons.school_rounded, color: AppTheme.paper, size: 42),
              ),
              const SizedBox(height: 18),
              Text('Loksewa AI', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 6),
              Text(
                'Verified prep, adaptive practice, and AI help from your backend.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              GFLoader(type: GFLoaderType.circle),
            ],
          ),
        ),
      ),
    );
  }
}

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  gradient: AppTheme.studyGradient,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Icon(Icons.auto_stories_rounded, color: AppTheme.paper, size: 36),
              ),
              const SizedBox(height: 24),
              Text('Prepare with verified backend data', style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(height: 12),
              Text(
                'Study courses, mock tests, questions, and AI answers directly from the Loksewa backend.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const Spacer(),
              LoksewaButton(
                text: 'Start setup',
                icon: Icons.arrow_forward_rounded,
                onPressed: () => context.go('/language-select'),
              ),
              const SizedBox(height: 10),
              LoksewaButton(
                text: 'I already have an account',
                secondary: true,
                onPressed: () => context.go(_loginRoute),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class LanguageSelectScreen extends StatefulWidget {
  const LanguageSelectScreen({super.key});

  @override
  State<LanguageSelectScreen> createState() => _LanguageSelectScreenState();
}

class _LanguageSelectScreenState extends State<LanguageSelectScreen> {
  String _selected = 'English';

  @override
  Widget build(BuildContext context) {
    return _ChoiceScreen(
      title: 'Choose study language',
      subtitle: 'You can change this later from settings.',
      selected: _selected,
      options: const ['English', 'Nepali', 'Mixed'],
      onSelected: (value) => setState(() => _selected = value),
      onContinue: () => context.go('/onboarding/interests'),
    );
  }
}

class InterestsScreen extends StatefulWidget {
  const InterestsScreen({super.key});

  @override
  State<InterestsScreen> createState() => _InterestsScreenState();
}

class _InterestsScreenState extends State<InterestsScreen> {
  final Set<String> _selected = {'General Knowledge'};

  @override
  Widget build(BuildContext context) {
    return _MultiChoiceScreen(
      title: 'Pick focus areas',
      subtitle: 'This seeds your first dashboard while backend progress grows.',
      selected: _selected,
      options: const [
        'General Knowledge',
        'IQ and Reasoning',
        'Constitution and Law',
        'Public Administration',
      ],
      onContinue: () => context.go('/onboarding/exam-target'),
    );
  }
}

class ExamTargetScreen extends StatefulWidget {
  const ExamTargetScreen({super.key});

  @override
  State<ExamTargetScreen> createState() => _ExamTargetScreenState();
}

class _ExamTargetScreenState extends State<ExamTargetScreen> {
  String _selected = 'Kharidar';

  @override
  Widget build(BuildContext context) {
    return _ChoiceScreen(
      title: 'Set your exam target',
      subtitle: 'Targeting keeps practice density useful.',
      selected: _selected,
      options: const ['Kharidar', 'Nayab Subba', 'Section Officer', 'Teacher Service'],
      onSelected: (value) => setState(() => _selected = value),
      onContinue: () => context.go('/onboarding/baseline'),
    );
  }
}

class BaselineQuizScreen extends ConsumerStatefulWidget {
  const BaselineQuizScreen({super.key});

  @override
  ConsumerState<BaselineQuizScreen> createState() => _BaselineQuizScreenState();
}

class _BaselineQuizScreenState extends ConsumerState<BaselineQuizScreen> {
  int _index = 0;
  final Map<int, String> _answers = {};

  @override
  Widget build(BuildContext context) {
    final questions = ref.watch(questionsProvider);
    return LoksewaPage(
      title: 'Quick baseline',
      subtitle: 'A few real questions from the backend question bank.',
      child: _async(ref, questions, questionsProvider, (items) {
        final sample = items.take(3).toList();
        if (sample.isEmpty) {
          return LoksewaEmptyState(
            icon: Icons.quiz_rounded,
            title: 'No verified questions yet',
            message: 'Add verified MCQs in the backend, then come back to baseline.',
            actionText: 'Continue',
            onAction: () => context.go(_loginRoute),
          );
        }
        final question = sample[_index.clamp(0, sample.length - 1)];
        return _QuestionCard(
          question: question,
          selected: _answers[_index],
          onSelect: (option) => setState(() => _answers[_index] = option),
          footer: LoksewaButton(
            text: _index == sample.length - 1 ? 'Finish setup' : 'Next question',
            onPressed: _answers[_index] == null
                ? null
                : () {
                    if (_index == sample.length - 1) {
                      context.go(_loginRoute);
                    } else {
                      setState(() => _index += 1);
                    }
                  },
          ),
        );
      }),
    );
  }
}

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      await ref.read(loksewaRepositoryProvider).login(
            email: _email.text,
            password: _password.text,
          );
      ref.invalidate(appBootstrapProvider);
      if (mounted) context.go(_homeRoute);
    } catch (error) {
      if (mounted) _showSnack(context, error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _AuthFrame(
      title: 'Welcome back',
      subtitle: 'Sign in to sync attempts, stats, and AI tutor context.',
      children: [
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.mail_rounded)),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _password,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock_rounded)),
        ),
        const SizedBox(height: 16),
        LoksewaButton(text: 'Sign in', loading: _loading, onPressed: _submit),
        TextButton(
          onPressed: () => context.go('/auth/forgot'),
          child: const Text('Forgot password?'),
        ),
        const SizedBox(height: 8),
        LoksewaButton(
          text: 'Create account',
          secondary: true,
          onPressed: () => context.go(_registerRoute),
        ),
      ],
    );
  }
}

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      await ref.read(loksewaRepositoryProvider).register(
            name: _name.text,
            email: _email.text,
            password: _password.text,
          );
      ref.invalidate(appBootstrapProvider);
      if (mounted) context.go(_homeRoute);
    } catch (error) {
      if (mounted) _showSnack(context, error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _AuthFrame(
      title: 'Create your learner profile',
      subtitle: 'Registration writes directly to the active backend user store.',
      children: [
        TextField(
          controller: _name,
          decoration: const InputDecoration(labelText: 'Full name', prefixIcon: Icon(Icons.person_rounded)),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.mail_rounded)),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _password,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock_rounded)),
        ),
        const SizedBox(height: 16),
        LoksewaButton(text: 'Create account', loading: _loading, onPressed: _submit),
        const SizedBox(height: 8),
        LoksewaButton(
          text: 'Back to sign in',
          secondary: true,
          onPressed: () => context.go(_loginRoute),
        ),
      ],
    );
  }
}

class OtpScreen extends StatelessWidget {
  final String phone;
  final String from;

  const OtpScreen({super.key, required this.phone, required this.from});

  @override
  Widget build(BuildContext context) {
    return LoksewaPage(
      title: 'Verification',
      subtitle: 'OTP verification is not exposed by the active backend yet.',
      showBack: true,
      child: LoksewaEmptyState(
        icon: Icons.verified_user_rounded,
        title: 'No OTP endpoint is live',
        message: 'Current auth uses email and password sessions. Continue to the app after signing in.',
        actionText: 'Go to sign in',
        onAction: () => context.go(_loginRoute),
      ),
    );
  }
}

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _email = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      await ref.read(loksewaRepositoryProvider).forgotPassword(_email.text);
      if (mounted) _showSnack(context, 'Password reset request sent to the backend.');
    } catch (error) {
      if (mounted) _showSnack(context, error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _AuthFrame(
      title: 'Reset password',
      subtitle: 'The backend accepts reset requests and returns a safe generic response.',
      showBack: true,
      children: [
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.mail_rounded)),
        ),
        const SizedBox(height: 16),
        LoksewaButton(text: 'Send reset request', loading: _loading, onPressed: _submit),
      ],
    );
  }
}

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(appBootstrapProvider);
    return RefreshIndicator(
      onRefresh: () async => ref.refresh(appBootstrapProvider.future),
      child: LoksewaPage(
        title: 'Study desk',
        subtitle: 'Live courses, tests, and stats from your backend.',
        bottomSafeArea: false,
        actions: [
          IconButton(
            tooltip: 'AI tutor',
            onPressed: () => context.push(_chatRoute),
            icon: const Icon(Icons.smart_toy_rounded),
          ),
        ],
        child: Padding(
          padding: const EdgeInsets.only(bottom: 96),
          child: _async(ref, data, appBootstrapProvider, (payload) {
            final user = mapOf(payload['user']) ?? {};
            final stats = mapOf(payload['stats']) ?? {};
            final courses = listFrom(payload['courses']);
            final subjects = listFrom(payload['subjects']);
            final mockTests = listFrom(payload['mockTests']);
            final name = _text(user, const ['full_name', 'fullName', 'email'], 'Guest learner');
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _ProfileStrip(name: name, stats: stats),
                const SizedBox(height: 14),
                _StudyHero(stats: stats, courses: courses, mockTests: mockTests),
                const SectionTitle(title: 'Backend metrics'),
                Row(
                  children: [
                    Expanded(
                      child: LoksewaMetric(
                        label: 'Mock tests',
                        value: numberOf(stats, const ['total_mocks_completed']).toInt().toString(),
                        icon: Icons.assignment_turned_in_rounded,
                        color: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: LoksewaMetric(
                        label: 'Accuracy',
                        value: _percent(numberOf(stats, const ['correct_rate'])),
                        icon: Icons.gps_fixed_rounded,
                        color: AppTheme.secondary,
                      ),
                    ),
                  ],
                ),
                const SectionTitle(title: 'Continue learning'),
                if (courses.isEmpty)
                  LoksewaEmptyState(
                    icon: Icons.auto_stories_rounded,
                    title: 'No courses published yet',
                    message: 'Publish courses in the backend admin dashboard to fill this section.',
                    actionText: 'Browse subjects',
                    onAction: () => context.push(_subjectsRoute),
                  )
                else
                  ...courses.take(4).map((course) => _CourseTile(course: course)),
                const SectionTitle(title: 'Official mock tests'),
                if (mockTests.isEmpty)
                  const LoksewaEmptyState(
                    icon: Icons.assignment_rounded,
                    title: 'No mock tests yet',
                    message: 'Published mock tests from `/v1/mock-tests` will appear here.',
                  )
                else
                  ...mockTests.take(3).map((test) => _MockTile(test: test)),
                const SectionTitle(title: 'Subjects'),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: subjects.map((subject) {
                    final color = colorFromHex(subject['color']?.toString());
                    return ActionChip(
                      avatar: Icon(Icons.menu_book_rounded, size: 18, color: color),
                      label: Text(_text(subject, const ['title', 'name', 'slug'])),
                      onPressed: () => context.push('/subjects/detail?id=${_idOf(subject)}'),
                    );
                  }).toList(),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }
}

class MissionScreen extends ConsumerWidget {
  const MissionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courses = ref.watch(coursesProvider);
    return LoksewaPage(
      title: 'Missions',
      subtitle: 'Daily work generated from published backend courses.',
      bottomSafeArea: false,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 96),
        child: _async(ref, courses, coursesProvider, (items) {
          if (items.isEmpty) {
            return const LoksewaEmptyState(
              icon: Icons.flag_rounded,
              title: 'No course missions yet',
              message: 'Publish courses and tasks in the backend to activate missions.',
            );
          }
          final selected = items.first;
          final detail = ref.watch(courseDetailProvider(_idOf(selected)));
          return _async(ref, detail, courseDetailProvider(_idOf(selected)), (payload) {
            final course = mapOf(payload['course']) ?? selected;
            final tasks = listFrom(payload['tasks']);
            final modules = listFrom(payload['modules']);
            final progress = numberOf(course, const ['progress']);
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LoksewaSurface(
                  gradient: AppTheme.studyGradient,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const LoksewaBadge(text: 'TODAY', color: AppTheme.paper),
                      const SizedBox(height: 18),
                      Text(
                        _text(course, const ['title']),
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: AppTheme.paper),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _text(course, const ['plan_line', 'description'], 'Complete one focused study block.'),
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.paper.withOpacity(0.86)),
                      ),
                      const SizedBox(height: 18),
                      LoksewaProgress(value: _ratio(progress), color: AppTheme.paper),
                    ],
                  ),
                ),
                const SectionTitle(title: 'Course tasks'),
                if (tasks.isEmpty)
                  const LoksewaEmptyState(
                    icon: Icons.task_alt_rounded,
                    title: 'No tasks for this course',
                    message: 'Backend course tasks will appear here once published.',
                  )
                else
                  ...tasks.map((task) => _TaskTile(task: task)),
                const SectionTitle(title: 'Modules'),
                ...modules.map((module) => _ModuleTile(module: module)),
              ],
            );
          });
        }),
      ),
    );
  }
}

class ExamListScreen extends ConsumerWidget {
  const ExamListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tests = ref.watch(mockTestsProvider);
    return LoksewaPage(
      title: 'Mock exams',
      subtitle: 'Published tests from `/v1/mock-tests`.',
      bottomSafeArea: false,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 96),
        child: _async(ref, tests, mockTestsProvider, (items) {
          if (items.isEmpty) {
            return const LoksewaEmptyState(
              icon: Icons.assignment_rounded,
              title: 'No mock tests published',
              message: 'Create a mock test in the backend admin dashboard to start exam practice.',
            );
          }
          return Column(
            children: items.map((test) => _MockTile(test: test, large: true)).toList(),
          );
        }),
      ),
    );
  }
}

class ExamTakeScreen extends ConsumerStatefulWidget {
  final String examId;

  const ExamTakeScreen({super.key, required this.examId});

  @override
  ConsumerState<ExamTakeScreen> createState() => _ExamTakeScreenState();
}

class _ExamTakeScreenState extends ConsumerState<ExamTakeScreen> {
  late Future<_ExamSession> _future;
  int _index = 0;
  final Map<Object, String> _answers = {};
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _future = Future.microtask(_load);
  }

  Future<_ExamSession> _load() async {
    final repo = ref.read(loksewaRepositoryProvider);
    final signedIn = await repo.isSignedIn;
    if (signedIn && widget.examId.isNotEmpty) {
      try {
        final attempt = await repo.startMockTest(widget.examId);
        return _ExamSession.fromAttempt(attempt, canSubmit: true);
      } on ApiException catch (error) {
        if (error.statusCode != 401) rethrow;
      }
    }
    final questions = await repo.questions(limit: 25);
    return _ExamSession(
      title: 'Practice mode',
      attemptId: null,
      questions: questions,
      canSubmit: false,
    );
  }

  Future<void> _submit(_ExamSession session) async {
    if (_answers.isEmpty) return;
    setState(() => _submitting = true);
    try {
      if (session.canSubmit && session.attemptId != null) {
        final repo = ref.read(loksewaRepositoryProvider);
        for (final entry in _answers.entries) {
          await repo.answerAttempt(
            attemptId: session.attemptId!,
            questionId: entry.key,
            selectedOption: entry.value,
          );
        }
        await repo.submitAttempt(session.attemptId!);
        ref.invalidate(statsProvider);
        if (mounted) context.go('/exam/result?id=${session.attemptId}');
      } else {
        final score = _localScore(session.questions, _answers);
        if (mounted) {
          _showSnack(context, 'Practice score: $score of ${session.questions.length}');
        }
      }
    } catch (error) {
      if (mounted) _showSnack(context, error.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<_ExamSession>(
      future: _future,
      builder: (context, snapshot) {
        final session = snapshot.data;
        return LoksewaPage(
          title: session?.title ?? 'Loading exam',
          subtitle: session?.canSubmit == true
              ? 'Answers are saved to your backend attempt.'
              : 'Sign in to submit scored attempts.',
          showBack: true,
          child: Builder(
            builder: (_) {
              if (snapshot.connectionState != ConnectionState.done) {
                return const LoksewaLoading(message: 'Preparing questions');
              }
              if (snapshot.hasError) {
                return LoksewaErrorState(
                  error: snapshot.error!,
                  onRetry: () => setState(() => _future = Future.microtask(_load)),
                );
              }
              if (session == null || session.questions.isEmpty) {
                return const LoksewaEmptyState(
                  icon: Icons.quiz_rounded,
                  title: 'No questions available',
                  message: 'Publish verified questions in the backend to start exams.',
                );
              }
              final question = session.questions[_index];
              final questionId = question['id'] ?? _index;
              return Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: LoksewaProgress(value: (_index + 1) / session.questions.length),
                      ),
                      const SizedBox(width: 12),
                      Text('${_index + 1}/${session.questions.length}', style: Theme.of(context).textTheme.labelLarge),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _QuestionCard(
                    question: question,
                    selected: _answers[questionId],
                    onSelect: (option) => setState(() => _answers[questionId] = option),
                    footer: Row(
                      children: [
                        Expanded(
                          child: LoksewaButton(
                            text: 'Previous',
                            secondary: true,
                            onPressed: _index == 0 ? null : () => setState(() => _index -= 1),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: LoksewaButton(
                            text: _index == session.questions.length - 1 ? 'Submit' : 'Next',
                            loading: _submitting,
                            onPressed: () {
                              if (_index == session.questions.length - 1) {
                                _submit(session);
                              } else {
                                setState(() => _index += 1);
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }
}

class ExamResultScreen extends ConsumerWidget {
  final String examId;

  const ExamResultScreen({super.key, required this.examId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (examId.isEmpty) {
      return const _MissingAttemptPage(title: 'Exam result');
    }
    final attempt = ref.watch(attemptProvider(examId));
    return LoksewaPage(
      title: 'Exam result',
      subtitle: 'Scored attempt from the backend.',
      showBack: true,
      child: _async(ref, attempt, attemptProvider(examId), (data) {
        final score = numberOf(data, const ['score']);
        final total = numberOf(data, const ['total_marks', 'total_questions'], 1);
        final correct = numberOf(data, const ['correct_count']).toInt();
        final wrong = numberOf(data, const ['wrong_count']).toInt();
        final percent = total == 0 ? 0 : (score / total) * 100;
        return Column(
          children: [
            LoksewaSurface(
              gradient: AppTheme.studyGradient,
              child: Column(
                children: [
                  Text(_percent(percent), style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: AppTheme.paper)),
                  const SizedBox(height: 8),
                  Text('Score $score of $total', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.paper)),
                  const SizedBox(height: 16),
                  LoksewaProgress(value: _ratio(percent), color: AppTheme.paper),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: LoksewaMetric(label: 'Correct', value: '$correct', icon: Icons.check_rounded, color: AppTheme.success),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: LoksewaMetric(label: 'Wrong', value: '$wrong', icon: Icons.close_rounded, color: AppTheme.error),
                ),
              ],
            ),
            const SizedBox(height: 16),
            LoksewaButton(
              text: 'Review answers',
              icon: Icons.rate_review_rounded,
              onPressed: () => context.go('/exam/review?id=$examId'),
            ),
          ],
        );
      }),
    );
  }
}

class ExamReviewScreen extends ConsumerWidget {
  final String examId;

  const ExamReviewScreen({super.key, required this.examId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (examId.isEmpty) {
      return const _MissingAttemptPage(title: 'Exam review');
    }
    final attempt = ref.watch(attemptProvider(examId));
    return LoksewaPage(
      title: 'Review',
      subtitle: 'Questions and explanations from your backend attempt.',
      showBack: true,
      child: _async(ref, attempt, attemptProvider(examId), (data) {
        final questions = listFrom(data['questions']);
        if (questions.isEmpty) {
          return const LoksewaEmptyState(
            icon: Icons.rate_review_rounded,
            title: 'No review questions',
            message: 'This attempt does not include reviewable questions.',
          );
        }
        return Column(
          children: questions.map((question) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: LoksewaSurface(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_text(question, const ['question_text', 'content']), style: Theme.of(context).textTheme.titleSmall),
                    const SizedBox(height: 10),
                    LoksewaBadge(
                      text: 'Correct option ${_text(question, const ['correct_option'], '')}',
                      color: AppTheme.success,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _text(question, const ['explanation'], 'No explanation saved yet.'),
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        );
      }),
    );
  }
}

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _controller = TextEditingController();
  final List<_Message> _messages = [];
  bool _loading = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _loading) return;
    setState(() {
      _messages.add(_Message(text, true));
      _controller.clear();
      _loading = true;
    });
    try {
      final response = await ref.read(loksewaRepositoryProvider).askTutor(text);
      final reply = _replyFromTutor(response);
      setState(() => _messages.add(_Message(reply, false)));
    } catch (error) {
      setState(() => _messages.add(_Message(error.toString(), false)));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI tutor'), leading: BackButton(onPressed: () => context.pop())),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: _messages.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(20),
                      child: LoksewaEmptyState(
                        icon: Icons.smart_toy_rounded,
                        title: 'Ask from verified data',
                        message: 'Signed-in users use `/v1/ai-tutor/ask`; guests fall back to backend search.',
                        actionText: 'Try constitution article 4',
                        onAction: () {
                          _controller.text = 'constitution article 4';
                          _send();
                        },
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) => _ChatBubble(message: _messages[index]),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      minLines: 1,
                      maxLines: 4,
                      decoration: const InputDecoration(hintText: 'Ask a Loksewa question'),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 10),
                  IconButton.filled(
                    onPressed: _loading ? null : _send,
                    icon: _loading
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.send_rounded),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class LeaderboardScreen extends ConsumerWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(statsProvider);
    return LoksewaPage(
      title: 'Ranking',
      subtitle: 'Current backend exposes personal stats, not global ranks yet.',
      bottomSafeArea: false,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 96),
        child: _async(ref, stats, statsProvider, (data) {
          return Column(
            children: [
              LoksewaSurface(
                gradient: AppTheme.warmGradient,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Your current scorecard', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppTheme.paper)),
                    const SizedBox(height: 12),
                    Text(
                      '${numberOf(data, const ['total_questions_answered']).toInt()} backend questions answered',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppTheme.paper),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: LoksewaMetric(label: 'Best score', value: _percent(numberOf(data, const ['best_score'])), icon: Icons.workspace_premium_rounded, color: AppTheme.accent),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: LoksewaMetric(label: 'Average', value: _percent(numberOf(data, const ['average_score'])), icon: Icons.trending_up_rounded, color: AppTheme.primary),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const LoksewaEmptyState(
                icon: Icons.leaderboard_rounded,
                title: 'Global leaderboard endpoint pending',
                message: 'When the backend publishes rank rows, this screen will render them without fake learner names.',
              ),
            ],
          );
        }),
      ),
    );
  }
}

class ScanScreen extends ConsumerStatefulWidget {
  const ScanScreen({super.key});

  @override
  ConsumerState<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends ConsumerState<ScanScreen> {
  final _text = TextEditingController();
  Future<JsonMap>? _future;

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  void _search() {
    final query = _text.text.trim();
    if (query.isEmpty) return;
    setState(() => _future = ref.read(loksewaRepositoryProvider).search(query, limit: 5));
  }

  @override
  Widget build(BuildContext context) {
    return LoksewaPage(
      title: 'Scan and solve',
      subtitle: 'Paste OCR text to search the verified backend question bank.',
      showBack: true,
      child: Column(
        children: [
          TextField(
            controller: _text,
            minLines: 4,
            maxLines: 8,
            decoration: const InputDecoration(
              labelText: 'Question text',
              hintText: 'Paste scanned or typed question text',
              prefixIcon: Icon(Icons.document_scanner_rounded),
            ),
          ),
          const SizedBox(height: 12),
          LoksewaButton(text: 'Search backend', icon: Icons.search_rounded, onPressed: _search),
          const SizedBox(height: 16),
          if (_future == null)
            const LoksewaEmptyState(
              icon: Icons.camera_alt_rounded,
              title: 'Camera upload is not wired yet',
              message: 'The active backend scan route expects an image URL. Text search is wired now and uses actual backend data.',
            )
          else
            FutureBuilder<JsonMap>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) return const LoksewaLoading();
                if (snapshot.hasError) return LoksewaErrorState(error: snapshot.error!);
                return _SearchResults(response: snapshot.data ?? {});
              },
            ),
        ],
      ),
    );
  }
}

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(appBootstrapProvider);
    return LoksewaPage(
      title: 'Profile',
      subtitle: 'Account and progress from the backend.',
      bottomSafeArea: false,
      actions: [
        IconButton(
          tooltip: 'Settings',
          onPressed: () => context.push('/profile/settings'),
          icon: const Icon(Icons.settings_rounded),
        ),
      ],
      child: Padding(
        padding: const EdgeInsets.only(bottom: 96),
        child: _async(ref, data, appBootstrapProvider, (payload) {
          final user = mapOf(payload['user']) ?? {};
          final stats = mapOf(payload['stats']) ?? {};
          final name = _text(user, const ['full_name', 'fullName', 'email'], 'Guest learner');
          return Column(
            children: [
              _ProfileStrip(name: name, stats: stats),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: LoksewaMetric(label: 'Completed', value: numberOf(stats, const ['total_mocks_completed']).toInt().toString(), icon: Icons.assignment_turned_in_rounded, color: AppTheme.primary),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: LoksewaMetric(label: 'Best score', value: _percent(numberOf(stats, const ['best_score'])), icon: Icons.emoji_events_rounded, color: AppTheme.accent),
                  ),
                ],
              ),
              const SectionTitle(title: 'Profile actions'),
              _ProfileAction(icon: Icons.insights_rounded, label: 'Analytics', onTap: () => context.push('/analytics')),
              _ProfileAction(icon: Icons.military_tech_rounded, label: 'Achievements', onTap: () => context.push('/profile/achievements')),
              _ProfileAction(icon: Icons.local_fire_department_rounded, label: 'Streak', onTap: () => context.push('/streak')),
              _ProfileAction(icon: Icons.workspace_premium_rounded, label: 'Subscription', onTap: () => context.push('/subscription')),
            ],
          );
        }),
      ),
    );
  }
}

class AchievementsScreen extends ConsumerWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) => _StatsDerivedPage(
        title: 'Achievements',
        subtitle: 'Unlocked from backend attempt stats.',
        icon: Icons.military_tech_rounded,
        builder: (stats) => _achievementList(stats),
      );
}

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _notifications = true;
  bool _offline = true;

  Future<void> _logout() async {
    await ref.read(loksewaRepositoryProvider).logout();
    ref.invalidate(appBootstrapProvider);
    if (mounted) context.go(_loginRoute);
  }

  @override
  Widget build(BuildContext context) {
    return LoksewaPage(
      title: 'Settings',
      subtitle: 'Local preferences plus backend session controls.',
      showBack: true,
      child: Column(
        children: [
          SwitchListTile(
            value: _notifications,
            onChanged: (value) => setState(() => _notifications = value),
            title: const Text('Study reminders'),
            subtitle: const Text('Local setting until notification backend is exposed'),
          ),
          SwitchListTile(
            value: _offline,
            onChanged: (value) => setState(() => _offline = value),
            title: const Text('Offline cache'),
            subtitle: const Text('Keep recent backend data available'),
          ),
          const SizedBox(height: 12),
          LoksewaButton(text: 'Sign out', secondary: true, icon: Icons.logout_rounded, onPressed: _logout),
        ],
      ),
    );
  }
}

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metadata = ref.watch(metadataProvider);
    return LoksewaPage(
      title: 'Notifications',
      subtitle: 'Backend-aware empty state.',
      showBack: true,
      child: _async(ref, metadata, metadataProvider, (data) {
        return LoksewaEmptyState(
          icon: Icons.notifications_active_rounded,
          title: 'No notification feed yet',
          message: 'Connected to ${_text(data, const ['database_kind'], 'backend')}. Notification rows are not exposed by the active backend.',
        );
      }),
    );
  }
}

class StreakScreen extends ConsumerWidget {
  const StreakScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) => _StatsDerivedPage(
        title: 'Streak',
        subtitle: 'Activity based on completed backend attempts.',
        icon: Icons.local_fire_department_rounded,
        builder: (stats) {
          final completed = numberOf(stats, const ['total_mocks_completed']).toInt();
          return [
            LoksewaSurface(
              gradient: AppTheme.warmGradient,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('$completed study days recorded', style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: AppTheme.paper)),
                  const SizedBox(height: 8),
                  Text('Complete real backend attempts to build a durable streak.', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.paper)),
                ],
              ),
            ),
          ];
        },
      );
}

class BadgesScreen extends ConsumerWidget {
  const BadgesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) => _StatsDerivedPage(
        title: 'Badges',
        subtitle: 'Milestones derived from real backend stats.',
        icon: Icons.workspace_premium_rounded,
        builder: _achievementList,
      );
}

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(statsProvider);
    return LoksewaPage(
      title: 'Analytics',
      subtitle: 'Real attempt aggregates from `/v1/stats/me`.',
      showBack: true,
      child: _async(ref, stats, statsProvider, (data) {
        final categories = (data['categories_studied'] as List?)?.map((item) => item.toString()).toList() ?? const <String>[];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: LoksewaMetric(label: 'Questions', value: numberOf(data, const ['total_questions_answered']).toInt().toString(), icon: Icons.quiz_rounded, color: AppTheme.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: LoksewaMetric(label: 'Accuracy', value: _percent(numberOf(data, const ['correct_rate'])), icon: Icons.track_changes_rounded, color: AppTheme.secondary),
                ),
              ],
            ),
            const SectionTitle(title: 'Categories studied'),
            if (categories.isEmpty)
              const LoksewaEmptyState(
                icon: Icons.category_rounded,
                title: 'No studied categories yet',
                message: 'Submit backend mock attempts to populate category analytics.',
              )
            else
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: categories.map((item) => Chip(label: Text(item))).toList(),
              ),
          ],
        );
      }),
    );
  }
}

class SubjectsScreen extends ConsumerWidget {
  const SubjectsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subjects = ref.watch(subjectsProvider);
    return LoksewaPage(
      title: 'Subjects',
      subtitle: 'Published subject rows from `/v1/subjects`.',
      showBack: true,
      child: _async(ref, subjects, subjectsProvider, (items) {
        if (items.isEmpty) {
          return const LoksewaEmptyState(
            icon: Icons.menu_book_rounded,
            title: 'No subjects published',
            message: 'Publish subject records in the backend to fill this screen.',
          );
        }
        return Column(
          children: items.map((subject) => _SubjectTile(subject: subject)).toList(),
        );
      }),
    );
  }
}

class SubjectDetailScreen extends ConsumerWidget {
  final String subjectId;

  const SubjectDetailScreen({super.key, required this.subjectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courses = ref.watch(coursesProvider);
    return LoksewaPage(
      title: 'Subject detail',
      subtitle: 'Courses filtered from backend subjects.',
      showBack: true,
      child: _async(ref, courses, coursesProvider, (items) {
        final related = items.where((course) => _text(course, const ['subject_id'], '') == subjectId).toList();
        final visible = related.isEmpty ? items : related;
        if (visible.isEmpty) {
          return const LoksewaEmptyState(
            icon: Icons.auto_stories_rounded,
            title: 'No courses for this subject',
            message: 'Backend course rows will appear here once published.',
          );
        }
        return Column(children: visible.map((course) => _CourseTile(course: course)).toList());
      }),
    );
  }
}

class QuestionPracticeScreen extends ConsumerStatefulWidget {
  const QuestionPracticeScreen({super.key});

  @override
  ConsumerState<QuestionPracticeScreen> createState() => _QuestionPracticeScreenState();
}

class _QuestionPracticeScreenState extends ConsumerState<QuestionPracticeScreen> {
  int _index = 0;
  String? _selected;

  @override
  Widget build(BuildContext context) {
    final questions = ref.watch(questionsProvider);
    return LoksewaPage(
      title: 'Practice',
      subtitle: 'Verified MCQs from `/v1/questions`.',
      showBack: true,
      child: _async(ref, questions, questionsProvider, (items) {
        if (items.isEmpty) {
          return const LoksewaEmptyState(
            icon: Icons.quiz_rounded,
            title: 'No questions available',
            message: 'Add verified questions in the backend to practice.',
          );
        }
        final question = items[_index.clamp(0, items.length - 1)];
        return _QuestionCard(
          question: question,
          selected: _selected,
          revealAnswer: _selected != null,
          onSelect: (option) => setState(() => _selected = option),
          footer: LoksewaButton(
            text: _index == items.length - 1 ? 'Finish' : 'Next',
            onPressed: _selected == null
                ? null
                : () {
                    if (_index == items.length - 1) {
                      context.pop();
                    } else {
                      setState(() {
                        _index += 1;
                        _selected = null;
                      });
                    }
                  },
          ),
        );
      }),
    );
  }
}

class SubscriptionScreen extends ConsumerWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metadata = ref.watch(metadataProvider);
    return LoksewaPage(
      title: 'Subscription',
      subtitle: 'Payment plans are not exposed by the active `/v1` backend.',
      showBack: true,
      child: _async(ref, metadata, metadataProvider, (data) {
        return LoksewaEmptyState(
          icon: Icons.workspace_premium_rounded,
          title: 'Plans endpoint pending',
          message: 'Connected to backend schema ${_text(data, const ['schema_version'], 'unknown')}. Add a `/v1/subscription/plans` endpoint to render real plan rows here.',
        );
      }),
    );
  }
}

class PaymentScreen extends SubscriptionScreen {
  const PaymentScreen({super.key});
}

class _ChoiceScreen extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<String> options;
  final String selected;
  final ValueChanged<String> onSelected;
  final VoidCallback onContinue;

  const _ChoiceScreen({
    required this.title,
    required this.subtitle,
    required this.options,
    required this.selected,
    required this.onSelected,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    return LoksewaPage(
      title: title,
      subtitle: subtitle,
      child: Column(
        children: [
          ...options.map((option) {
            final active = selected == option;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: LoksewaSurface(
                onTap: () => onSelected(option),
                color: active ? Theme.of(context).colorScheme.primaryContainer : null,
                child: Row(
                  children: [
                    Icon(active ? Icons.radio_button_checked : Icons.radio_button_unchecked, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 12),
                    Expanded(child: Text(option, style: Theme.of(context).textTheme.titleSmall)),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 12),
          LoksewaButton(text: 'Continue', onPressed: onContinue),
        ],
      ),
    );
  }
}

class _MultiChoiceScreen extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<String> options;
  final Set<String> selected;
  final VoidCallback onContinue;

  const _MultiChoiceScreen({
    required this.title,
    required this.subtitle,
    required this.options,
    required this.selected,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    return LoksewaPage(
      title: title,
      subtitle: subtitle,
      child: StatefulBuilder(
        builder: (context, setState) {
          return Column(
            children: [
              ...options.map((option) {
                final active = selected.contains(option);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: LoksewaSurface(
                    onTap: () => setState(() => active ? selected.remove(option) : selected.add(option)),
                    color: active ? Theme.of(context).colorScheme.primaryContainer : null,
                    child: Row(
                      children: [
                        Icon(active ? Icons.check_circle_rounded : Icons.circle_outlined, color: Theme.of(context).colorScheme.primary),
                        const SizedBox(width: 12),
                        Expanded(child: Text(option, style: Theme.of(context).textTheme.titleSmall)),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),
              LoksewaButton(text: 'Continue', onPressed: selected.isEmpty ? null : onContinue),
            ],
          );
        },
      ),
    );
  }
}

class _AuthFrame extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<Widget> children;
  final bool showBack;

  const _AuthFrame({
    required this.title,
    required this.subtitle,
    required this.children,
    this.showBack = false,
  });

  @override
  Widget build(BuildContext context) {
    return LoksewaPage(
      title: title,
      subtitle: subtitle,
      showBack: showBack,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          LoksewaSurface(
            padding: const EdgeInsets.all(18),
            child: Column(children: children),
          ),
        ],
      ),
    );
  }
}

class _ProfileStrip extends StatelessWidget {
  final String name;
  final JsonMap stats;

  const _ProfileStrip({required this.name, required this.stats});

  @override
  Widget build(BuildContext context) {
    return LoksewaSurface(
      child: Row(
        children: [
          GFAvatar(
            radius: 25,
            backgroundColor: Theme.of(context).colorScheme.primary,
            child: Text(_initials(name), style: const TextStyle(color: AppTheme.paper, fontWeight: FontWeight.w900)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 3),
                Text(
                  '${numberOf(stats, const ['total_mocks_taken']).toInt()} attempts synced',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StudyHero extends StatelessWidget {
  final JsonMap stats;
  final List<JsonMap> courses;
  final List<JsonMap> mockTests;

  const _StudyHero({required this.stats, required this.courses, required this.mockTests});

  @override
  Widget build(BuildContext context) {
    final completed = numberOf(stats, const ['total_mocks_completed']).toInt();
    return LoksewaSurface(
      gradient: AppTheme.studyGradient,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const LoksewaBadge(text: 'LIVE BACKEND', color: AppTheme.paper),
          const SizedBox(height: 18),
          Text(
            courses.isEmpty ? 'Publish your first course' : 'Continue ${_text(courses.first, const ['short_name', 'title'])}',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: AppTheme.paper),
          ),
          const SizedBox(height: 8),
          Text(
            '$completed submitted mock tests. ${mockTests.length} published tests available.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.paper.withOpacity(0.88)),
          ),
          const SizedBox(height: 18),
          LoksewaButton(
            text: mockTests.isEmpty ? 'Practice questions' : 'Start mock test',
            icon: Icons.arrow_forward_rounded,
            color: AppTheme.paper,
            onPressed: () => context.push(mockTests.isEmpty ? _practiceRoute : _examRoute),
          ),
        ],
      ),
    );
  }
}

class _CourseTile extends StatelessWidget {
  final JsonMap course;

  const _CourseTile({required this.course});

  @override
  Widget build(BuildContext context) {
    final color = colorFromHex(course['color']?.toString(), AppTheme.primary);
    final progress = numberOf(course, const ['progress']);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: LoksewaSurface(
        onTap: () => context.push('/subjects/detail?id=${course['subject_id'] ?? _idOf(course)}'),
        child: Row(
          children: [
            GFAvatar(
              radius: 24,
              backgroundColor: color.withOpacity(0.13),
              child: Icon(Icons.auto_stories_rounded, color: color),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_text(course, const ['title']), style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Text(_text(course, const ['coach_line', 'description'], ''), maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 8),
                  LoksewaProgress(value: _ratio(progress), color: color),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Text(_percent(progress), style: Theme.of(context).textTheme.labelLarge?.copyWith(color: color)),
          ],
        ),
      ),
    );
  }
}

class _MockTile extends StatelessWidget {
  final JsonMap test;
  final bool large;

  const _MockTile({required this.test, this.large = false});

  @override
  Widget build(BuildContext context) {
    final id = _idOf(test);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: LoksewaSurface(
        onTap: () => context.push('/exam/take?id=$id'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const GFAvatar(
                  radius: 24,
                  backgroundColor: AppTheme.primarySoft,
                  child: Icon(Icons.assignment_rounded, color: AppTheme.primary),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_text(test, const ['title']), style: Theme.of(context).textTheme.titleSmall),
                      const SizedBox(height: 3),
                      Text(_text(test, const ['description', 'exam_type'], ''), maxLines: large ? 3 : 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded),
              ],
            ),
            if (large) ...[
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  LoksewaBadge(text: '${numberOf(test, const ['total_questions']).toInt()} questions', color: AppTheme.primary),
                  LoksewaBadge(text: '${numberOf(test, const ['duration_minutes']).toInt()} min', color: AppTheme.secondary),
                  LoksewaBadge(text: _text(test, const ['exam_level'], 'General'), color: AppTheme.accent),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _TaskTile extends StatelessWidget {
  final JsonMap task;

  const _TaskTile({required this.task});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: LoksewaSurface(
        onTap: () => context.push(_practiceRoute),
        child: Row(
          children: [
            const GFAvatar(
              radius: 22,
              backgroundColor: AppTheme.accentSoft,
              child: Icon(Icons.bolt_rounded, color: AppTheme.accent),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_text(task, const ['title']), style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 3),
                  Text(_text(task, const ['subtitle'], ''), style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            LoksewaBadge(text: '+${numberOf(task, const ['score_boost']).toInt()} XP', color: AppTheme.accent),
          ],
        ),
      ),
    );
  }
}

class _ModuleTile extends StatelessWidget {
  final JsonMap module;

  const _ModuleTile({required this.module});

  @override
  Widget build(BuildContext context) {
    final progress = numberOf(module, const ['progress']);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: LoksewaSurface(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_text(module, const ['title']), style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 6),
            Text('${numberOf(module, const ['lessons']).toInt()} lessons - ${_text(module, const ['duration'], '')}', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 10),
            LoksewaProgress(value: _ratio(progress)),
          ],
        ),
      ),
    );
  }
}

class _SubjectTile extends StatelessWidget {
  final JsonMap subject;

  const _SubjectTile({required this.subject});

  @override
  Widget build(BuildContext context) {
    final color = colorFromHex(subject['color']?.toString(), AppTheme.primary);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: LoksewaSurface(
        onTap: () => context.push('/subjects/detail?id=${_idOf(subject)}'),
        child: Row(
          children: [
            GFAvatar(
              radius: 24,
              backgroundColor: color.withOpacity(0.13),
              child: Icon(Icons.menu_book_rounded, color: color),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_text(subject, const ['title', 'name']), style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 3),
                  Text(_text(subject, const ['description'], ''), maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded),
          ],
        ),
      ),
    );
  }
}

class _QuestionCard extends StatelessWidget {
  final JsonMap question;
  final String? selected;
  final ValueChanged<String> onSelect;
  final Widget footer;
  final bool revealAnswer;

  const _QuestionCard({
    required this.question,
    required this.selected,
    required this.onSelect,
    required this.footer,
    this.revealAnswer = false,
  });

  @override
  Widget build(BuildContext context) {
    final options = _options(question);
    final correct = _text(question, const ['correct_option'], '');
    return LoksewaSurface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          LoksewaBadge(text: _text(question, const ['syllabus_category', 'difficulty'], 'Question'), color: AppTheme.primary),
          const SizedBox(height: 14),
          Text(_text(question, const ['question_text', 'content', 'prompt']), style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 14),
          ...options.entries.map((entry) {
            final active = selected == entry.key;
            final correctOption = revealAnswer && entry.key == correct;
            final wrong = revealAnswer && active && entry.key != correct;
            final color = correctOption ? AppTheme.success : wrong ? AppTheme.error : Theme.of(context).colorScheme.primary;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: LoksewaSurface(
                onTap: () => onSelect(entry.key),
                color: active || correctOption ? color.withOpacity(0.12) : Theme.of(context).colorScheme.surface,
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    GFAvatar(
                      radius: 15,
                      backgroundColor: color.withOpacity(0.14),
                      child: Text(entry.key, style: TextStyle(color: color, fontWeight: FontWeight.w800)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Text(entry.value, style: Theme.of(context).textTheme.bodyMedium)),
                  ],
                ),
              ),
            );
          }),
          if (revealAnswer && selected != null) ...[
            const SizedBox(height: 8),
            Text(_text(question, const ['explanation'], 'No explanation saved yet.'), style: Theme.of(context).textTheme.bodySmall),
          ],
          const SizedBox(height: 12),
          footer,
        ],
      ),
    );
  }
}

class _StatsDerivedPage extends ConsumerWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final List<Widget> Function(JsonMap stats) builder;

  const _StatsDerivedPage({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.builder,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(statsProvider);
    return LoksewaPage(
      title: title,
      subtitle: subtitle,
      showBack: true,
      child: _async(ref, stats, statsProvider, (data) {
        final children = builder(data);
        if (children.isEmpty) {
          return LoksewaEmptyState(
            icon: icon,
            title: 'No progress recorded yet',
            message: 'Submit real backend attempts to unlock this screen.',
          );
        }
        return Column(children: children);
      }),
    );
  }
}

class _ProfileAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ProfileAction({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: LoksewaSurface(
        onTap: onTap,
        child: Row(
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: Theme.of(context).textTheme.titleSmall)),
            const Icon(Icons.chevron_right_rounded),
          ],
        ),
      ),
    );
  }
}

class _SearchResults extends StatelessWidget {
  final JsonMap response;

  const _SearchResults({required this.response});

  @override
  Widget build(BuildContext context) {
    final matches = listFrom(response['matches']);
    if (matches.isEmpty) {
      return const LoksewaEmptyState(
        icon: Icons.search_off_rounded,
        title: 'No verified match',
        message: 'The backend did not find a verified question for this text.',
      );
    }
    return Column(
      children: matches.map((match) {
        final question = mapOf(match['question']) ?? match;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: LoksewaSurface(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LoksewaBadge(text: _text(question, const ['syllabus_category'], 'Verified DB'), color: AppTheme.secondary),
                const SizedBox(height: 10),
                Text(_text(question, const ['question_text', 'content']), style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: 8),
                Text(_text(question, const ['explanation'], 'No explanation saved.'), style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final _Message message;

  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.78),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUser ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(AppTheme.radius18),
          border: isUser ? null : Border.all(color: Theme.of(context).colorScheme.outline),
        ),
        child: Text(
          message.text,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: isUser ? Theme.of(context).colorScheme.onPrimary : null,
              ),
        ),
      ),
    );
  }
}

class _Message {
  final String text;
  final bool isUser;

  const _Message(this.text, this.isUser);
}

class _MissingAttemptPage extends StatelessWidget {
  final String title;

  const _MissingAttemptPage({required this.title});

  @override
  Widget build(BuildContext context) {
    return LoksewaPage(
      title: title,
      showBack: true,
      child: const LoksewaEmptyState(
        icon: Icons.assignment_late_rounded,
        title: 'Attempt id missing',
        message: 'Start a backend mock test first, then open this screen.',
      ),
    );
  }
}

class _ExamSession {
  final String title;
  final String? attemptId;
  final List<JsonMap> questions;
  final bool canSubmit;

  const _ExamSession({
    required this.title,
    required this.attemptId,
    required this.questions,
    required this.canSubmit,
  });

  factory _ExamSession.fromAttempt(JsonMap attempt, {required bool canSubmit}) {
    final mock = mapOf(attempt['mock_test']) ?? mapOf(attempt['mockTest']) ?? {};
    return _ExamSession(
      title: _text(mock, const ['title'], 'Mock attempt'),
      attemptId: _text(attempt, const ['id'], ''),
      questions: listFrom(attempt['questions']),
      canSubmit: canSubmit,
    );
  }
}

Map<String, String> _options(JsonMap question) {
  final rawOptions = question['options'];
  if (rawOptions is List) {
    final letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    final mapped = <String, String>{};
    for (var i = 0; i < rawOptions.length && i < letters.length; i++) {
      final item = rawOptions[i];
      if (item is Map) {
        final option = Map<String, dynamic>.from(item);
        final label = _text(option, const ['optionLabel', 'option_label', 'label'], letters[i]).toUpperCase();
        mapped[label] = _text(option, const ['optionText', 'option_text', 'text', 'value'], 'Option $label');
      } else {
        mapped[letters[i]] = item.toString();
      }
    }
    if (mapped.isNotEmpty) return mapped;
  }
  return {
    'A': _text(question, const ['option_a'], 'Option A'),
    'B': _text(question, const ['option_b'], 'Option B'),
    'C': _text(question, const ['option_c'], 'Option C'),
    'D': _text(question, const ['option_d'], 'Option D'),
  };
}

int _localScore(List<JsonMap> questions, Map<Object, String> answers) {
  var score = 0;
  for (final question in questions) {
    final id = question['id'];
    if (id != null && answers[id] == question['correct_option']) score += 1;
  }
  return score;
}

List<Widget> _achievementList(JsonMap stats) {
  final completed = numberOf(stats, const ['total_mocks_completed']).toInt();
  final best = numberOf(stats, const ['best_score']);
  final questions = numberOf(stats, const ['total_questions_answered']).toInt();
  final unlocked = <Widget>[];

  void add(String title, String message, IconData icon, Color color) {
    unlocked.add(
      Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Builder(
          builder: (context) => LoksewaSurface(
            child: Row(
              children: [
                GFAvatar(radius: 22, backgroundColor: color.withOpacity(0.13), child: Icon(icon, color: color)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: Theme.of(context).textTheme.titleSmall),
                      const SizedBox(height: 3),
                      Text(message, style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  if (completed > 0) add('First mock submitted', '$completed backend attempts recorded', Icons.assignment_turned_in_rounded, AppTheme.primary);
  if (questions >= 10) add('Question momentum', '$questions questions answered', Icons.bolt_rounded, AppTheme.accent);
  if (best >= 80) add('High scorer', 'Best backend score is ${_percent(best)}', Icons.workspace_premium_rounded, AppTheme.secondary);
  return unlocked;
}

String _replyFromTutor(JsonMap response) {
  final answer = stringOf(response, const ['answer', 'lesson_simple', 'detail']);
  if (answer != null) return answer;
  final matches = listFrom(response['matches']);
  if (matches.isEmpty) return 'The backend returned no verified match yet.';
  final first = mapOf(matches.first['question']) ?? matches.first;
  return _text(first, const ['explanation', 'question_text'], 'Verified match found.');
}

void _showSnack(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
}
