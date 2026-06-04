class Answer {
  final String id;
  final String questionId;
  final String answerText;
  final String? explanation;
  final String? source;
  final String? sourceUrl;
  final bool isVerified;
  final String? verifiedBy;
  final DateTime? verifiedAt;

  const Answer({
    required this.id,
    required this.questionId,
    required this.answerText,
    this.explanation,
    this.source,
    this.sourceUrl,
    this.isVerified = false,
    this.verifiedBy,
    this.verifiedAt,
  });

  factory Answer.fromJson(Map<String, dynamic> json) {
    return Answer(
      id: json['id'] as String? ?? '',
      questionId: json['questionId'] as String? ?? json['question_id'] as String? ?? '',
      answerText: json['answerText'] as String? ?? json['answer_text'] as String? ?? '',
      explanation: json['explanation'] as String?,
      source: json['source'] as String?,
      sourceUrl: json['sourceUrl'] as String? ?? json['source_url'] as String?,
      isVerified: (json['isVerified'] ?? json['is_verified'] ?? false) as bool,
      verifiedBy: json['verifiedBy'] as String? ?? json['verified_by'] as String?,
      verifiedAt: json['verifiedAt'] != null
          ? DateTime.parse(json['verifiedAt'] as String)
          : json['verified_at'] != null
              ? DateTime.parse(json['verified_at'] as String)
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionId': questionId,
      'question_id': questionId,
      'answerText': answerText,
      'answer_text': answerText,
      'explanation': explanation,
      'source': source,
      'sourceUrl': sourceUrl,
      'source_url': sourceUrl,
      'isVerified': isVerified,
      'is_verified': isVerified,
      'verifiedBy': verifiedBy,
      'verified_by': verifiedBy,
      'verifiedAt': verifiedAt?.toIso8601String(),
      'verified_at': verifiedAt?.toIso8601String(),
    };
  }
}

class VerifiedAnswer {
  final String answerId;
  final String questionId;
  final bool isCorrect;
  final String? verifiedBy;
  final DateTime verifiedAt;

  const VerifiedAnswer({
    required this.answerId,
    required this.questionId,
    required this.isCorrect,
    this.verifiedBy,
    required this.verifiedAt,
  });

  factory VerifiedAnswer.fromJson(Map<String, dynamic> json) {
    return VerifiedAnswer(
      answerId: json['answerId'] as String? ?? json['answer_id'] as String? ?? '',
      questionId: json['questionId'] as String? ?? json['question_id'] as String? ?? '',
      isCorrect: (json['isCorrect'] ?? json['is_correct'] ?? false) as bool,
      verifiedBy: json['verifiedBy'] as String? ?? json['verified_by'] as String?,
      verifiedAt: json['verifiedAt'] != null
          ? DateTime.parse(json['verifiedAt'] as String)
          : json['verified_at'] != null
              ? DateTime.parse(json['verified_at'] as String)
              : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'answerId': answerId,
      'answer_id': answerId,
      'questionId': questionId,
      'question_id': questionId,
      'isCorrect': isCorrect,
      'is_correct': isCorrect,
      'verifiedBy': verifiedBy,
      'verified_by': verifiedBy,
      'verifiedAt': verifiedAt.toIso8601String(),
      'verified_at': verifiedAt.toIso8601String(),
    };
  }
}
