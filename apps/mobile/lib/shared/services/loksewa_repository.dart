import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_client.dart';
import '../repositories/auth_repository.dart';
import '../repositories/user_repository.dart';
import '../repositories/subjects_repository.dart';
import '../repositories/questions_repository.dart';
import '../repositories/answers_repository.dart';
import '../repositories/mock_test_repository.dart';
import '../repositories/learning_repository.dart';
import '../repositories/tutor_repository.dart';

import '../models/mock_test.dart';

class LoksewaRepository {
  final ApiClient _api;

  const LoksewaRepository(this._api);

  Future<bool> get isSignedIn => _api.isSignedIn;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final auth = AuthRepository(_api);
    final user = await auth.login(email: email, password: password);
    return user.toJson();
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final auth = AuthRepository(_api);
    final user = await auth.register(email: email, password: password, fullName: name);
    return user.toJson();
  }

  Future<void> logout() async {
    final auth = AuthRepository(_api);
    await auth.logout();
  }

  Future<Map<String, dynamic>> forgotPassword(String email) {
    return _api.post('/api/auth/forgot-password', data: {'email': email.trim()});
  }

  Future<Map<String, dynamic>?> me() async {
    if (!await _api.isSignedIn) return _api.cachedUser();
    try {
      final auth = AuthRepository(_api);
      final profile = await auth.getMe();
      return profile.toJson();
    } on ApiException catch (error) {
      if (error.statusCode == 401) return _api.cachedUser();
      rethrow;
    }
  }

  Future<Map<String, dynamic>> metadata() => _api.get('/api/metadata');

  Future<Map<String, dynamic>> stats() async {
    if (!await _api.isSignedIn) {
      return {
        'total_mocks_taken': 0,
        'total_mocks_completed': 0,
        'average_score': 0,
        'correct_rate': 0,
        'total_questions_answered': 0,
        'best_score': 0,
        'categories_studied': const [],
      };
    }
    try {
      final user = UserRepository(_api);
      return await user.getStats();
    } on ApiException catch (error) {
      if (error.statusCode == 401) return stats();
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> subjects() async {
    final repo = SubjectsRepository(_api);
    final list = await repo.listSubjects();
    return list.map((e) => e.toJson()).toList();
  }

  Future<List<Map<String, dynamic>>> courses({String? subjectId}) async {
    final repo = SubjectsRepository(_api);
    if (subjectId == null || subjectId.isEmpty) {
      final subjectsList = await repo.listSubjects();
      final allTopics = <Map<String, dynamic>>[];
      for (final s in subjectsList) {
        final topics = await repo.getTopicTree(s.id);
        allTopics.addAll(topics.map((t) => t.toJson()));
      }
      return allTopics;
    } else {
      final list = await repo.getTopicTree(subjectId);
      return list.map((e) => e.toJson()).toList();
    }
  }

  Future<Map<String, dynamic>> courseDetail(String identifier) async {
    final repo = SubjectsRepository(_api);
    final topic = await repo.getTopicById(identifier);
    return {
      'course': topic.toJson(),
      'tasks': const [],
      'modules': const [],
    };
  }

  Future<List<Map<String, dynamic>>> questions({int limit = 20}) async {
    final repo = QuestionsRepository(_api);
    final list = await repo.listQuestions(limit: limit);
    return list.map((e) => e.toJson()).toList();
  }

  Future<Map<String, dynamic>> questionLesson(String questionId) async {
    final repo = LearningRepository(_api);
    final lesson = await repo.getLessonByQuestionId(questionId);
    return lesson.toJson();
  }

  Future<List<String>> categories() async {
    final repo = SubjectsRepository(_api);
    final list = await repo.listSubjects();
    return list.map((e) => e.name).toList();
  }

  Future<Map<String, dynamic>> search(String query, {int limit = 5}) async {
    final repo = QuestionsRepository(_api);
    final list = await repo.searchQuestions(query, limit: limit);
    return {
      'data': list.map((e) => e.toJson()).toList(),
    };
  }

  Future<List<Map<String, dynamic>>> mockTests() async {
    final repo = MockTestRepository(_api);
    final list = await repo.listTests();
    return list.map((e) => e.toJson()).toList();
  }

  Future<Map<String, dynamic>> mockTest(String id) async {
    final repo = MockTestRepository(_api);
    final list = await repo.listTests();
    final match = list.firstWhere(
      (e) => e.id == id,
      orElse: () => MockTest(
        id: id,
        title: 'Mock Test',
        timeLimitMinutes: 30,
        createdAt: DateTime.now(),
      ),
    );
    return match.toJson();
  }

  Future<Map<String, dynamic>> startMockTest(String id) async {
    final repo = MockTestRepository(_api);
    final attempt = await repo.startTest(id);
    return attempt.toJson();
  }

  Future<Map<String, dynamic>> attempt(String id) async {
    final repo = MockTestRepository(_api);
    final attempt = await repo.getAttempt(id);
    return attempt.toJson();
  }

  Future<Map<String, dynamic>> answerAttempt({
    required String attemptId,
    required Object questionId,
    required String selectedOption,
  }) async {
    final letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    final index = letters.indexOf(selectedOption.toUpperCase());
    final selectedIndex = index >= 0 ? index : 0;

    final repo = MockTestRepository(_api);
    final attempt = await repo.saveAnswers(
      attemptId,
      [TestAnswer(questionId: questionId.toString(), selectedOptionIndex: selectedIndex)],
    );
    return attempt.toJson();
  }

  Future<Map<String, dynamic>> submitAttempt(String id) async {
    final repo = MockTestRepository(_api);
    final attempt = await repo.submitTest(id);
    return attempt.toJson();
  }

  Future<Map<String, dynamic>> askTutor(String message) async {
    final repo = TutorRepository(_api);
    final conversation = await repo.sendMessage(message: message);
    return conversation.toJson();
  }

  Future<Map<String, dynamic>> reportIssue({
    required String message,
    String? scannedText,
    Object? questionId,
  }) {
    return _api.post(
      '/api/reports',
      data: {
        'message': message,
        'scanned_text': scannedText,
        'question_id': questionId,
        'report_type': 'other',
      },
    );
  }
}

final loksewaRepositoryProvider = Provider<LoksewaRepository>((ref) {
  return LoksewaRepository(ref.watch(apiClientProvider));
});

final appBootstrapProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repo = ref.watch(loksewaRepositoryProvider);
  final results = await Future.wait([
    repo.me().then((value) => value ?? <String, dynamic>{}),
    repo.stats(),
    repo.subjects(),
    repo.courses(),
    repo.mockTests(),
    repo.metadata().catchError((_) => <String, dynamic>{}),
  ]);
  return {
    'user': results[0],
    'stats': results[1],
    'subjects': results[2],
    'courses': results[3],
    'mockTests': results[4],
    'metadata': results[5],
  };
});

final subjectsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) {
  return ref.watch(loksewaRepositoryProvider).subjects();
});

final coursesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) {
  return ref.watch(loksewaRepositoryProvider).courses();
});

final mockTestsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) {
  return ref.watch(loksewaRepositoryProvider).mockTests();
});

final questionsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) {
  return ref.watch(loksewaRepositoryProvider).questions(limit: 50);
});

final statsProvider = FutureProvider<Map<String, dynamic>>((ref) {
  return ref.watch(loksewaRepositoryProvider).stats();
});

final metadataProvider = FutureProvider<Map<String, dynamic>>((ref) {
  return ref.watch(loksewaRepositoryProvider).metadata();
});

final courseDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) {
  return ref.watch(loksewaRepositoryProvider).courseDetail(id);
});

final attemptProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) {
  return ref.watch(loksewaRepositoryProvider).attempt(id);
});
