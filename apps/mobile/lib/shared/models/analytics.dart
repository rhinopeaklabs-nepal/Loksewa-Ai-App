class DailyStats {
  final DateTime date;
  final int questionsAnswered;
  final int correctAnswers;
  final int timeSpentMinutes;

  const DailyStats({
    required this.date,
    this.questionsAnswered = 0,
    this.correctAnswers = 0,
    this.timeSpentMinutes = 0,
  });

  factory DailyStats.fromJson(Map<String, dynamic> json) {
    return DailyStats(
      date: json['date'] != null
          ? DateTime.parse(json['date'] as String)
          : DateTime.now(),
      questionsAnswered: (json['questionsAnswered'] ?? json['questions_answered'] ?? 0) as int,
      correctAnswers: (json['correctAnswers'] ?? json['correct_answers'] ?? 0) as int,
      timeSpentMinutes: (json['timeSpentMinutes'] ?? json['time_spent_minutes'] ?? 0) as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date.toIso8601String(),
      'questionsAnswered': questionsAnswered,
      'questions_answered': questionsAnswered,
      'correctAnswers': correctAnswers,
      'correct_answers': correctAnswers,
      'timeSpentMinutes': timeSpentMinutes,
      'time_spent_minutes': timeSpentMinutes,
    };
  }
}

class WeaknessArea {
  final String topicId;
  final String topicName;
  final String subjectName;
  final int totalQuestions;
  final int incorrectAnswers;
  final double errorRate; // percentage of incorrect questions

  const WeaknessArea({
    required this.topicId,
    required this.topicName,
    required this.subjectName,
    this.totalQuestions = 0,
    this.incorrectAnswers = 0,
    this.errorRate = 0.0,
  });

  factory WeaknessArea.fromJson(Map<String, dynamic> json) {
    return WeaknessArea(
      topicId: json['topicId'] as String? ?? json['topic_id'] as String? ?? '',
      topicName: json['topicName'] as String? ?? json['topic_name'] as String? ?? '',
      subjectName: json['subjectName'] as String? ?? json['subject_name'] as String? ?? '',
      totalQuestions: (json['totalQuestions'] ?? json['total_questions'] ?? 0) as int,
      incorrectAnswers: (json['incorrectAnswers'] ?? json['incorrect_answers'] ?? 0) as int,
      errorRate: ((json['errorRate'] ?? json['error_rate'] ?? 0.0) as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'topicId': topicId,
      'topic_id': topicId,
      'topicName': topicName,
      'topic_name': topicName,
      'subjectName': subjectName,
      'subject_name': subjectName,
      'totalQuestions': totalQuestions,
      'total_questions': totalQuestions,
      'incorrectAnswers': incorrectAnswers,
      'incorrect_answers': incorrectAnswers,
      'errorRate': errorRate,
      'error_rate': errorRate,
    };
  }
}

class StudyStreak {
  final int currentStreak;
  final int longestStreak;
  final List<DateTime> activeDates;

  const StudyStreak({
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.activeDates = const [],
  });

  factory StudyStreak.fromJson(Map<String, dynamic> json) {
    final rawDates = json['activeDates'] ?? json['active_dates'] ?? [];
    List<DateTime> datesList = [];
    if (rawDates is List) {
      datesList = rawDates
          .map((item) => item != null ? DateTime.tryParse(item.toString()) : null)
          .whereType<DateTime>()
          .toList();
    }

    return StudyStreak(
      currentStreak: (json['currentStreak'] ?? json['current_streak'] ?? 0) as int,
      longestStreak: (json['longestStreak'] ?? json['longest_streak'] ?? 0) as int,
      activeDates: datesList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'currentStreak': currentStreak,
      'current_streak': currentStreak,
      'longestStreak': longestStreak,
      'longest_streak': longestStreak,
      'activeDates': activeDates.map((e) => e.toIso8601String()).toList(),
      'active_dates': activeDates.map((e) => e.toIso8601String()).toList(),
    };
  }
}
