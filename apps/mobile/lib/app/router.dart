// Loksewa AI — App Router
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/onboarding/screens/welcome_screen.dart';
import '../features/onboarding/screens/language_select_screen.dart';
import '../features/onboarding/screens/interests_screen.dart';
import '../features/onboarding/screens/exam_target_screen.dart';
import '../features/onboarding/screens/baseline_quiz_screen.dart';

import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/auth/screens/otp_screen.dart';
import '../features/auth/screens/forgot_password_screen.dart';

import '../features/splash/splash_screen.dart';
import '../features/main/main_shell.dart';

import '../features/home/screens/home_screen.dart';
import '../features/mission/screens/mission_screen.dart';
import '../features/exam/screens/exam_list_screen.dart';
import '../features/exam/screens/exam_take_screen.dart';
import '../features/exam/screens/exam_result_screen.dart';
import '../features/exam/screens/exam_review_screen.dart';
import '../features/chat/screens/chat_screen.dart';
import '../features/leaderboard/screens/leaderboard_screen.dart';
import '../features/scan/screens/scan_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/profile/screens/achievements_screen.dart';
import '../features/profile/screens/settings_screen.dart';
import '../features/notifications/screens/notifications_screen.dart';
import '../features/streak/screens/streak_screen.dart';
import '../features/badges/screens/badges_screen.dart';
import '../features/analytics/screens/analytics_screen.dart';
import '../features/subjects/screens/subjects_screen.dart';
import '../features/subjects/screens/subject_detail_screen.dart';
import '../features/questions/screens/question_practice_screen.dart';
import '../features/payment/screens/subscription_screen.dart';

class AppRoutes {
  static const splash = '/';
  static const welcome = '/welcome';
  static const languageSelect = '/language-select';
  static const interests = '/onboarding/interests';
  static const examTarget = '/onboarding/exam-target';
  static const baselineQuiz = '/onboarding/baseline';

  static const login = '/auth/login';
  static const register = '/auth/register';
  static const otp = '/auth/otp';
  static const forgotPassword = '/auth/forgot';

  static const home = '/home';
  static const mission = '/mission';
  static const examList = '/exam';
  static const examTake = '/exam/take';
  static const examResult = '/exam/result';
  static const examReview = '/exam/review';
  static const chat = '/chat';
  static const leaderboard = '/leaderboard';
  static const scan = '/scan';
  static const profile = '/profile';
  static const achievements = '/profile/achievements';
  static const settings = '/profile/settings';
  static const notifications = '/notifications';
  static const streak = '/streak';
  static const badges = '/badges';
  static const analytics = '/analytics';
  static const subjects = '/subjects';
  static const subjectDetail = '/subjects/detail';
  static const questionPractice = '/practice';
  static const subscription = '/subscription';
}

final GoRouter appRouter = GoRouter(
  initialLocation: AppRoutes.splash,
  debugLogDiagnostics: false,
  routes: [
    // Splash & Onboarding
    GoRoute(
      path: AppRoutes.splash,
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: AppRoutes.welcome,
      builder: (context, state) => const WelcomeScreen(),
    ),
    GoRoute(
      path: AppRoutes.languageSelect,
      builder: (context, state) => const LanguageSelectScreen(),
    ),
    GoRoute(
      path: AppRoutes.interests,
      builder: (context, state) => const InterestsScreen(),
    ),
    GoRoute(
      path: AppRoutes.examTarget,
      builder: (context, state) => const ExamTargetScreen(),
    ),
    GoRoute(
      path: AppRoutes.baselineQuiz,
      builder: (context, state) => const BaselineQuizScreen(),
    ),

    // Auth
    GoRoute(
      path: AppRoutes.login,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: AppRoutes.register,
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: AppRoutes.otp,
      builder: (context, state) => OtpScreen(
        phone: state.uri.queryParameters['phone'] ?? '',
        from: state.uri.queryParameters['from'] ?? 'register',
      ),
    ),
    GoRoute(
      path: AppRoutes.forgotPassword,
      builder: (context, state) => const ForgotPasswordScreen(),
    ),

    // Main Shell with bottom nav
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(
          path: AppRoutes.home,
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: AppRoutes.mission,
          builder: (context, state) => const MissionScreen(),
        ),
        GoRoute(
          path: AppRoutes.examList,
          builder: (context, state) => const ExamListScreen(),
        ),
        GoRoute(
          path: AppRoutes.leaderboard,
          builder: (context, state) => const LeaderboardScreen(),
        ),
        GoRoute(
          path: AppRoutes.profile,
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    ),

    // Standalone screens
    GoRoute(
      path: AppRoutes.examTake,
      builder: (context, state) {
        final id = state.uri.queryParameters['id'] ?? '';
        return ExamTakeScreen(examId: id);
      },
    ),
    GoRoute(
      path: AppRoutes.examResult,
      builder: (context, state) {
        final id = state.uri.queryParameters['id'] ?? '';
        return ExamResultScreen(examId: id);
      },
    ),
    GoRoute(
      path: AppRoutes.examReview,
      builder: (context, state) {
        final id = state.uri.queryParameters['id'] ?? '';
        return ExamReviewScreen(examId: id);
      },
    ),
    GoRoute(
      path: AppRoutes.chat,
      builder: (context, state) => const ChatScreen(),
    ),
    GoRoute(
      path: AppRoutes.scan,
      builder: (context, state) => const ScanScreen(),
    ),
    GoRoute(
      path: AppRoutes.achievements,
      builder: (context, state) => const AchievementsScreen(),
    ),
    GoRoute(
      path: AppRoutes.settings,
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: AppRoutes.notifications,
      builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: AppRoutes.streak,
      builder: (context, state) => const StreakScreen(),
    ),
    GoRoute(
      path: AppRoutes.badges,
      builder: (context, state) => const BadgesScreen(),
    ),
    GoRoute(
      path: AppRoutes.analytics,
      builder: (context, state) => const AnalyticsScreen(),
    ),
    GoRoute(
      path: AppRoutes.subjects,
      builder: (context, state) => const SubjectsScreen(),
    ),
    GoRoute(
      path: AppRoutes.subjectDetail,
      builder: (context, state) {
        final id = state.uri.queryParameters['id'] ?? '';
        return SubjectDetailScreen(subjectId: id);
      },
    ),
    GoRoute(
      path: AppRoutes.questionPractice,
      builder: (context, state) => const QuestionPracticeScreen(),
    ),
    GoRoute(
      path: AppRoutes.subscription,
      builder: (context, state) => const SubscriptionScreen(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          Text('Page not found: ${state.uri}'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => context.go(AppRoutes.home),
            child: const Text('Go Home'),
          ),
        ],
      ),
    ),
  ),
);
