// Loksewa AI — Go Router
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/mission/screens/mission_screen.dart';
import '../features/mission/screens/question_screen.dart';
import '../features/exam/screens/exam_list_screen.dart';
import '../features/exam/screens/exam_take_screen.dart';
import '../features/exam/screens/exam_result_screen.dart';
import '../features/chat/screens/chat_screen.dart';
import '../features/leaderboard/screens/leaderboard_screen.dart';
import '../features/scan/screens/scan_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/onboarding/screens/onboarding_screen.dart';
import '../shared/widgets/main_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      // Auth
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),

      // Authenticated shell
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/mission', builder: (_, __) => const MissionScreen()),
          GoRoute(path: '/exam', builder: (_, __) => const ExamListScreen()),
          GoRoute(path: '/chat', builder: (_, __) => const ChatScreen()),
          GoRoute(path: '/leaderboard', builder: (_, __) => const LeaderboardScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),

      // Modal screens
      GoRoute(path: '/scan', builder: (_, __) => const ScanScreen()),
      GoRoute(
        path: '/mission/question/:id',
        builder: (_, state) => QuestionScreen(
          questionId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/exam/take/:id',
        builder: (_, state) => ExamTakeScreen(
          examId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/exam/result/:id',
        builder: (_, state) => ExamResultScreen(
          attemptId: state.pathParameters['id']!,
        ),
      ),
    ],
  );
});
