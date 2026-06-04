import 'question.dart';

String? _asString(dynamic value) {
  if (value == null) return null;
  final text = value.toString().trim();
  return text.isEmpty ? null : text;
}

int _asInt(dynamic value, [int fallback = 0]) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? fallback;
  return fallback;
}

double _asDouble(dynamic value, [double fallback = 0]) {
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? fallback;
  return fallback;
}

bool _asBool(dynamic value, {bool fallback = false}) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  if (value is String) {
    final normalized = value.toLowerCase();
    if (normalized == 'true' || normalized == 'active' || normalized == 'published') return true;
    if (normalized == 'false' || normalized == 'inactive' || normalized == 'archived') return false;
  }
  return fallback;
}

DateTime? _asDateOrNull(dynamic value) {
  final text = _asString(value);
  return text == null ? null : DateTime.tryParse(text);
}

DateTime _asDate(dynamic value) => _asDateOrNull(value) ?? DateTime.now();

class MockTest {
  final String id;
  final String title;
  final String? description;
  final String? subjectId;
  final int questionCount;
  final int timeLimitMinutes;
  final Map<String, dynamic> difficultyMix;
  final bool isPremium;
  final bool isActive;
  final DateTime createdAt;
  final List<Question> questions; // Can be populated if fetched eagerly

  const MockTest({
    required this.id,
    required this.title,
    this.description,
    this.subjectId,
    this.questionCount = 0,
    required this.timeLimitMinutes,
    this.difficultyMix = const {},
    this.isPremium = false,
    this.isActive = true,
    required this.createdAt,
    this.questions = const [],
  });

  factory MockTest.fromJson(Map<String, dynamic> json) {
    final rawQuestions = json['questions'] ?? json['testQuestions'] ?? [];
    List<Question> questionsList = [];
    if (rawQuestions is List) {
      questionsList = rawQuestions
          .map((item) {
            if (item is Map) {
              final qMap = item['question'] is Map ? item['question'] as Map : item;
              return Question.fromJson(Map<String, dynamic>.from(qMap));
            }
            return null;
          })
          .whereType<Question>()
          .toList();
    }

    Map<String, dynamic> diffMix = {};
    final mix = json['difficultyMix'] ?? json['difficulty_mix'];
    if (mix is Map) {
      diffMix = Map<String, dynamic>.from(mix);
    } else if (mix is String && mix.isNotEmpty) {
      // It might be JSON string from DB
      try {
        // Simple fallback
      } catch (_) {}
    }

    return MockTest(
      id: _asString(json['id'] ?? json['public_id']) ?? '',
      title: _asString(json['title'] ?? json['name']) ?? '',
      description: _asString(json['description']),
      subjectId: _asString(json['subjectId'] ?? json['subject_id']),
      questionCount: _asInt(json['questionCount'] ?? json['question_count'] ?? json['total_questions']),
      timeLimitMinutes: _asInt(json['timeLimitMinutes'] ?? json['time_limit_minutes'], 30),
      difficultyMix: diffMix,
      isPremium: _asBool(json['isPremium'] ?? json['is_premium']),
      isActive: _asBool(json['isActive'] ?? json['is_active'] ?? json['status'], fallback: true),
      createdAt: _asDate(json['createdAt'] ?? json['created_at']),
      questions: questionsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'subjectId': subjectId,
      'subject_id': subjectId,
      'questionCount': questionCount,
      'question_count': questionCount,
      'timeLimitMinutes': timeLimitMinutes,
      'time_limit_minutes': timeLimitMinutes,
      'difficultyMix': difficultyMix,
      'difficulty_mix': difficultyMix,
      'isPremium': isPremium,
      'is_premium': isPremium,
      'isActive': isActive,
      'is_active': isActive,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'questions': questions.map((e) => e.toJson()).toList(),
    };
  }
}

class TestAnswer {
  final String questionId;
  final int selectedOptionIndex;

  const TestAnswer({
    required this.questionId,
    required this.selectedOptionIndex,
  });

  factory TestAnswer.fromJson(Map<String, dynamic> json) {
    return TestAnswer(
      questionId: _asString(json['questionId'] ?? json['question_id']) ?? '',
      selectedOptionIndex: _asInt(json['selectedOptionIndex'] ?? json['selected_option_index']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'question_id': questionId, // Keep both camelCase and snake_case or whatever backend expects
      'selectedOptionIndex': selectedOptionIndex,
    };
  }
}

class TestResult {
  final double score;
  final int totalQuestions;
  final int correctAnswers;
  final int incorrectAnswers;
  final int unansweredQuestions;
  final Map<String, dynamic> breakdown;

  const TestResult({
    required this.score,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.unansweredQuestions,
    this.breakdown = const {},
  });

  factory TestResult.fromJson(Map<String, dynamic> json) {
    return TestResult(
      score: _asDouble(json['score']),
      totalQuestions: _asInt(json['totalQuestions'] ?? json['total_questions']),
      correctAnswers: _asInt(json['correctAnswers'] ?? json['correct_answers']),
      incorrectAnswers: _asInt(json['incorrectAnswers'] ?? json['incorrect_answers']),
      unansweredQuestions: _asInt(json['unansweredQuestions'] ?? json['unanswered_questions']),
      breakdown: json['breakdown'] is Map
          ? Map<String, dynamic>.from(json['breakdown'] as Map)
          : const {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'score': score,
      'totalQuestions': totalQuestions,
      'total_questions': totalQuestions,
      'correctAnswers': correctAnswers,
      'correct_answers': correctAnswers,
      'incorrectAnswers': incorrectAnswers,
      'incorrect_answers': incorrectAnswers,
      'unansweredQuestions': unansweredQuestions,
      'unanswered_questions': unansweredQuestions,
      'breakdown': breakdown,
    };
  }
}

class TestAttempt {
  final String id;
  final String userId;
  final String testId;
  final DateTime startedAt;
  final DateTime? completedAt;
  final double score;
  final int totalQuestions;
  final int correctAnswers;
  final int timeTakenSeconds;
  final String status; // in_progress, submitted, expired
  final MockTest? mockTest;
  final List<TestAnswer> submittedAnswers;
  final TestResult? results;

  const TestAttempt({
    required this.id,
    required this.userId,
    required this.testId,
    required this.startedAt,
    this.completedAt,
    this.score = 0.0,
    this.totalQuestions = 0,
    this.correctAnswers = 0,
    this.timeTakenSeconds = 0,
    this.status = 'in_progress',
    this.mockTest,
    this.submittedAnswers = const [],
    this.results,
  });

  factory TestAttempt.fromJson(Map<String, dynamic> json) {
    final rawAnswers = json['submittedAnswers'] ?? json['answers'] ?? [];
    List<TestAnswer> answersList = [];
    if (rawAnswers is List) {
      answersList = rawAnswers
          .whereType<Map>()
          .map((item) => TestAnswer.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    final mTest = json['mockTest'] is Map
        ? MockTest.fromJson(Map<String, dynamic>.from(json['mockTest'] as Map))
        : null;

    TestResult? resultsDetail;
    final res = json['results'] ?? json['resultsJson'] ?? json['results_json'];
    if (res is Map) {
      resultsDetail = TestResult.fromJson(Map<String, dynamic>.from(res));
    } else if (res is String && res.isNotEmpty) {
      // In case it is serialized JSON string in DB
      try {
        // Simple deserialization if needed, but client would typically parse it
      } catch (_) {}
    }

    return TestAttempt(
      id: _asString(json['id']) ?? '',
      userId: _asString(json['userId'] ?? json['user_id']) ?? '',
      testId: _asString(json['testId'] ?? json['test_id'] ?? json['mock_test_id']) ?? '',
      startedAt: _asDate(json['startedAt'] ?? json['started_at']),
      completedAt: _asDateOrNull(json['completedAt'] ?? json['completed_at'] ?? json['submitted_at']),
      score: _asDouble(json['score']),
      totalQuestions: _asInt(json['totalQuestions'] ?? json['total_questions']),
      correctAnswers: _asInt(json['correctAnswers'] ?? json['correct_answers']),
      timeTakenSeconds: _asInt(json['timeTakenSeconds'] ?? json['time_taken_seconds']),
      status: _asString(json['status']) ?? 'in_progress',
      mockTest: mTest,
      submittedAnswers: answersList,
      results: resultsDetail,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user_id': userId,
      'testId': testId,
      'test_id': testId,
      'startedAt': startedAt.toIso8601String(),
      'started_at': startedAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
      'score': score,
      'totalQuestions': totalQuestions,
      'total_questions': totalQuestions,
      'correctAnswers': correctAnswers,
      'correct_answers': correctAnswers,
      'timeTakenSeconds': timeTakenSeconds,
      'time_taken_seconds': timeTakenSeconds,
      'status': status,
      'mockTest': mockTest?.toJson(),
      'submittedAnswers': submittedAnswers.map((e) => e.toJson()).toList(),
      'results': results?.toJson(),
    };
  }
}
