import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_client.dart';
import '../repositories/auth_repository.dart';
import '../repositories/user_repository.dart';
import '../repositories/subjects_repository.dart';
import '../repositories/questions_repository.dart';
import '../repositories/answers_repository.dart';
import '../repositories/mock_test_repository.dart';
import '../repositories/scan_repository.dart';
import '../repositories/learning_repository.dart';
import '../repositories/tutor_repository.dart';
import '../repositories/analytics_repository.dart';
import '../repositories/subscription_repository.dart';

import '../models/user.dart';
import '../models/subject.dart';
import '../models/question.dart';
import '../models/answer.dart';
import '../models/mock_test.dart';
import '../models/scan.dart';
import '../models/learning.dart';
import '../models/analytics.dart';
import '../models/subscription.dart';
import '../models/chat.dart';

// Repository Providers
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(apiClientProvider));
});

final userRepositoryProvider = Provider<UserRepository>((ref) {
  return UserRepository(ref.watch(apiClientProvider));
});

final subjectsRepositoryProvider = Provider<SubjectsRepository>((ref) {
  return SubjectsRepository(ref.watch(apiClientProvider));
});

final questionsRepositoryProvider = Provider<QuestionsRepository>((ref) {
  return QuestionsRepository(ref.watch(apiClientProvider));
});

final answersRepositoryProvider = Provider<AnswersRepository>((ref) {
  return AnswersRepository(ref.watch(apiClientProvider));
});

final mockTestRepositoryProvider = Provider<MockTestRepository>((ref) {
  return MockTestRepository(ref.watch(apiClientProvider));
});

final scanRepositoryProvider = Provider<ScanRepository>((ref) {
  return ScanRepository(ref.watch(apiClientProvider));
});

final learningRepositoryProvider = Provider<LearningRepository>((ref) {
  return LearningRepository(ref.watch(apiClientProvider));
});

final tutorRepositoryProvider = Provider<TutorRepository>((ref) {
  return TutorRepository(ref.watch(apiClientProvider));
});

final analyticsRepositoryProvider = Provider<AnalyticsRepository>((ref) {
  return AnalyticsRepository(ref.watch(apiClientProvider));
});

final subscriptionRepositoryProvider = Provider<SubscriptionRepository>((ref) {
  return SubscriptionRepository(ref.watch(apiClientProvider));
});

// Future Providers for Domain Models (Phase 2 & 3 Support)
final modelSubjectsProvider = FutureProvider<List<Subject>>((ref) async {
  return ref.watch(subjectsRepositoryProvider).listSubjects();
});

final modelTopicTreeProvider = FutureProvider.family<List<Topic>, String>((ref, subjectId) async {
  return ref.watch(subjectsRepositoryProvider).getTopicTree(subjectId);
});

final modelQuestionsProvider = FutureProvider.family<List<Question>, Map<String, dynamic>>((ref, params) async {
  final page = params['page'] as int? ?? 1;
  final limit = params['limit'] as int? ?? 20;
  final subjectId = params['subjectId'] as String?;
  final difficulty = params['difficulty'] as String?;
  return ref.watch(questionsRepositoryProvider).listQuestions(
        page: page,
        limit: limit,
        subjectId: subjectId,
        difficulty: difficulty,
      );
});

final modelQuestionDetailProvider = FutureProvider.family<Question, String>((ref, id) async {
  return ref.watch(questionsRepositoryProvider).getQuestion(id);
});

final modelAnswerProvider = FutureProvider.family<List<Answer>, String>((ref, questionId) async {
  return ref.watch(answersRepositoryProvider).getAnswer(questionId);
});

final modelMockTestsProvider = FutureProvider.family<List<MockTest>, String?>((ref, subjectId) async {
  return ref.watch(mockTestRepositoryProvider).listTests(subjectId: subjectId);
});

final modelTestAttemptProvider = FutureProvider.family<TestAttempt, String>((ref, attemptId) async {
  return ref.watch(mockTestRepositoryProvider).getAttempt(attemptId);
});

final modelTestResultsProvider = FutureProvider.family<TestResult, String>((ref, attemptId) async {
  return ref.watch(mockTestRepositoryProvider).getResults(attemptId);
});

final modelLessonsProvider = FutureProvider.family<List<AILesson>, Map<String, dynamic>>((ref, params) async {
  final subjectId = params['subjectId'] as String?;
  final topicId = params['topicId'] as String?;
  final page = params['page'] as int? ?? 1;
  final limit = params['limit'] as int? ?? 20;
  return ref.watch(learningRepositoryProvider).listLessons(
        subjectId: subjectId,
        topicId: topicId,
        page: page,
        limit: limit,
      );
});

final modelFlashcardsProvider = FutureProvider.family<List<Flashcard>, Map<String, dynamic>>((ref, params) async {
  final subjectId = params['subjectId'] as String?;
  final topicId = params['topicId'] as String?;
  final status = params['status'] as String?;
  return ref.watch(learningRepositoryProvider).getFlashcards(
        subjectId: subjectId,
        topicId: topicId,
        status: status,
      );
});

final modelStudyProgressProvider = FutureProvider<List<StudyProgress>>((ref) async {
  return ref.watch(learningRepositoryProvider).getProgress();
});

final modelConversationsProvider = FutureProvider<List<TutorConversation>>((ref) async {
  return ref.watch(tutorRepositoryProvider).getConversations();
});

final modelConversationMessagesProvider = FutureProvider.family<List<TutorMessage>, String>((ref, conversationId) async {
  return ref.watch(tutorRepositoryProvider).getConversationMessages(conversationId);
});

final modelDailyStatsProvider = FutureProvider.family<List<DailyStats>, String>((ref, period) async {
  return ref.watch(analyticsRepositoryProvider).getDailyStats(period: period);
});

final modelWeaknessesProvider = FutureProvider<List<WeaknessArea>>((ref) async {
  return ref.watch(analyticsRepositoryProvider).getWeaknesses();
});

final modelRecommendationsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.watch(analyticsRepositoryProvider).getRecommendations();
});

final modelSubscriptionPlansProvider = FutureProvider<List<Plan>>((ref) async {
  return ref.watch(subscriptionRepositoryProvider).getPlans();
});

final modelCurrentSubscriptionProvider = FutureProvider<Subscription>((ref) async {
  return ref.watch(subscriptionRepositoryProvider).getStatus();
});
