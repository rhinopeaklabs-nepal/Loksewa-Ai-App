class AILesson {
  final String id;
  final String questionId;
  final String simpleExplanation;
  final String detailedExplanation;
  final String examNotes;
  final String? mnemonic;
  final String relatedQuestionsJson;
  final String topicSummary;
  final String difficultyLevel; // beginner, intermediate, advanced
  final DateTime generatedAt;
  final String cacheKey;
  final int version;

  const AILesson({
    required this.id,
    required this.questionId,
    required this.simpleExplanation,
    required this.detailedExplanation,
    required this.examNotes,
    this.mnemonic,
    this.relatedQuestionsJson = '[]',
    required this.topicSummary,
    this.difficultyLevel = 'beginner',
    required this.generatedAt,
    required this.cacheKey,
    this.version = 1,
  });

  factory AILesson.fromJson(Map<String, dynamic> json) {
    return AILesson(
      id: json['id'] as String? ?? '',
      questionId: json['questionId'] as String? ?? json['question_id'] as String? ?? '',
      simpleExplanation: json['simpleExplanation'] as String? ?? json['simple_explanation'] as String? ?? '',
      detailedExplanation: json['detailedExplanation'] as String? ?? json['detailed_explanation'] as String? ?? '',
      examNotes: json['examNotes'] as String? ?? json['exam_notes'] as String? ?? '',
      mnemonic: json['mnemonic'] as String?,
      relatedQuestionsJson: json['relatedQuestionsJson'] as String? ?? json['related_questions_json'] as String? ?? '[]',
      topicSummary: json['topicSummary'] as String? ?? json['topic_summary'] as String? ?? '',
      difficultyLevel: json['difficultyLevel'] as String? ?? json['difficulty_level'] as String? ?? 'beginner',
      generatedAt: json['generatedAt'] != null
          ? DateTime.parse(json['generatedAt'] as String)
          : json['generated_at'] != null
              ? DateTime.parse(json['generated_at'] as String)
              : DateTime.now(),
      cacheKey: json['cacheKey'] as String? ?? json['cache_key'] as String? ?? '',
      version: (json['version'] ?? 1) as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionId': questionId,
      'question_id': questionId,
      'simpleExplanation': simpleExplanation,
      'simple_explanation': simpleExplanation,
      'detailedExplanation': detailedExplanation,
      'detailed_explanation': detailedExplanation,
      'examNotes': examNotes,
      'exam_notes': examNotes,
      'mnemonic': mnemonic,
      'relatedQuestionsJson': relatedQuestionsJson,
      'related_questions_json': relatedQuestionsJson,
      'topicSummary': topicSummary,
      'topic_summary': topicSummary,
      'difficultyLevel': difficultyLevel,
      'difficulty_level': difficultyLevel,
      'generatedAt': generatedAt.toIso8601String(),
      'generated_at': generatedAt.toIso8601String(),
      'cacheKey': cacheKey,
      'cache_key': cacheKey,
      'version': version,
    };
  }
}

class Flashcard {
  final String id;
  final String? questionId;
  final String? lessonId;
  final String front;
  final String back;
  final int reviewCount;
  final DateTime? lastReviewedAt;
  final DateTime? nextReviewAt;
  final double easeFactor;
  final int interval;
  final DateTime createdAt;

  const Flashcard({
    required this.id,
    this.questionId,
    this.lessonId,
    required this.front,
    required this.back,
    this.reviewCount = 0,
    this.lastReviewedAt,
    this.nextReviewAt,
    this.easeFactor = 2.5,
    this.interval = 0,
    required this.createdAt,
  });

  factory Flashcard.fromJson(Map<String, dynamic> json) {
    return Flashcard(
      id: json['id'] as String? ?? '',
      questionId: json['questionId'] as String? ?? json['question_id'] as String?,
      lessonId: json['lessonId'] as String? ?? json['lesson_id'] as String?,
      front: json['front'] as String? ?? '',
      back: json['back'] as String? ?? '',
      reviewCount: (json['reviewCount'] ?? json['review_count'] ?? 0) as int,
      lastReviewedAt: json['lastReviewedAt'] != null
          ? DateTime.parse(json['lastReviewedAt'] as String)
          : json['last_reviewed_at'] != null
              ? DateTime.parse(json['last_reviewed_at'] as String)
              : null,
      nextReviewAt: json['nextReviewAt'] != null
          ? DateTime.parse(json['nextReviewAt'] as String)
          : json['next_review_at'] != null
              ? DateTime.parse(json['next_review_at'] as String)
              : null,
      easeFactor: ((json['easeFactor'] ?? json['ease_factor'] ?? 2.5) as num).toDouble(),
      interval: (json['interval'] ?? 0) as int,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : json['created_at'] != null
              ? DateTime.parse(json['created_at'] as String)
              : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionId': questionId,
      'question_id': questionId,
      'lessonId': lessonId,
      'lesson_id': lessonId,
      'front': front,
      'back': back,
      'reviewCount': reviewCount,
      'lastReviewedAt': lastReviewedAt?.toIso8601String(),
      'last_reviewed_at': lastReviewedAt?.toIso8601String(),
      'nextReviewAt': nextReviewAt?.toIso8601String(),
      'next_review_at': nextReviewAt?.toIso8601String(),
      'easeFactor': easeFactor,
      'ease_factor': easeFactor,
      'interval': interval,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class StudyProgress {
  final String id;
  final String userId;
  final String topicId;
  final double completionPercentage;
  final int questionsAttempted;
  final int questionsCorrect;
  final int timeSpentMinutes;
  final DateTime? lastStudiedAt;
  final int streakDays;
  final String masteryLevel; // beginner, intermediate, advanced
  final DateTime createdAt;
  final DateTime updatedAt;

  const StudyProgress({
    required this.id,
    required this.userId,
    required this.topicId,
    this.completionPercentage = 0.0,
    this.questionsAttempted = 0,
    this.questionsCorrect = 0,
    this.timeSpentMinutes = 0,
    this.lastStudiedAt,
    this.streakDays = 0,
    this.masteryLevel = 'beginner',
    required this.createdAt,
    required this.updatedAt,
  });

  factory StudyProgress.fromJson(Map<String, dynamic> json) {
    return StudyProgress(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? json['user_id'] as String? ?? '',
      topicId: json['topicId'] as String? ?? json['topic_id'] as String? ?? '',
      completionPercentage: ((json['completionPercentage'] ?? json['completion_percentage'] ?? 0.0) as num).toDouble(),
      questionsAttempted: (json['questionsAttempted'] ?? json['questions_attempted'] ?? 0) as int,
      questionsCorrect: (json['questionsCorrect'] ?? json['questions_correct'] ?? 0) as int,
      timeSpentMinutes: (json['timeSpentMinutes'] ?? json['time_spent_minutes'] ?? 0) as int,
      lastStudiedAt: json['lastStudiedAt'] != null
          ? DateTime.parse(json['lastStudiedAt'] as String)
          : json['last_studied_at'] != null
              ? DateTime.parse(json['last_studied_at'] as String)
              : null,
      streakDays: (json['streakDays'] ?? json['streak_days'] ?? 0) as int,
      masteryLevel: json['masteryLevel'] as String? ?? json['mastery_level'] as String? ?? 'beginner',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : json['created_at'] != null
              ? DateTime.parse(json['created_at'] as String)
              : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : json['updated_at'] != null
              ? DateTime.parse(json['updated_at'] as String)
              : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user_id': userId,
      'topicId': topicId,
      'topic_id': topicId,
      'completionPercentage': completionPercentage,
      'completion_percentage': completionPercentage,
      'questionsAttempted': questionsAttempted,
      'questions_attempted': questionsAttempted,
      'questionsCorrect': questionsCorrect,
      'questions_correct': questionsCorrect,
      'timeSpentMinutes': timeSpentMinutes,
      'time_spent_minutes': timeSpentMinutes,
      'lastStudiedAt': lastStudiedAt?.toIso8601String(),
      'last_studied_at': lastStudiedAt?.toIso8601String(),
      'streakDays': streakDays,
      'streak_days': streakDays,
      'masteryLevel': masteryLevel,
      'mastery_level': masteryLevel,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
