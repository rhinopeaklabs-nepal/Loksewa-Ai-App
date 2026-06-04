String? _asString(dynamic value) {
  if (value == null) return null;
  final text = value.toString().trim();
  return text.isEmpty ? null : text;
}

int? _asInt(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value);
  return null;
}

bool _asBool(dynamic value, {bool fallback = false}) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  if (value is String) {
    final normalized = value.toLowerCase();
    if (normalized == 'true' || normalized == 'verified' || normalized == 'active') return true;
    if (normalized == 'false' || normalized == 'unverified' || normalized == 'inactive') return false;
  }
  return fallback;
}

DateTime? _asDate(dynamic value) {
  final text = _asString(value);
  return text == null ? null : DateTime.tryParse(text);
}

class QuestionOption {
  final String id;
  final String questionId;
  final String optionLabel; // e.g., "A", "B", "C", "D"
  final String optionText;
  final String? optionTextNp;
  final bool isCorrect;
  final int sortOrder;

  const QuestionOption({
    required this.id,
    required this.questionId,
    required this.optionLabel,
    required this.optionText,
    this.optionTextNp,
    this.isCorrect = false,
    this.sortOrder = 0,
  });

  factory QuestionOption.fromJson(Map<String, dynamic> json) {
    return QuestionOption(
      id: _asString(json['id']) ?? '',
      questionId: _asString(json['questionId'] ?? json['question_id']) ?? '',
      optionLabel: _asString(json['optionLabel'] ?? json['option_label'] ?? json['label']) ?? '',
      optionText: _asString(json['optionText'] ?? json['option_text'] ?? json['text'] ?? json['value']) ?? '',
      optionTextNp: _asString(json['optionTextNp'] ?? json['option_text_np']),
      isCorrect: _asBool(json['isCorrect'] ?? json['is_correct']),
      sortOrder: _asInt(json['sortOrder'] ?? json['sort_order']) ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionId': questionId,
      'question_id': questionId,
      'optionLabel': optionLabel,
      'option_label': optionLabel,
      'optionText': optionText,
      'option_text': optionText,
      'optionTextNp': optionTextNp,
      'option_text_np': optionTextNp,
      'isCorrect': isCorrect,
      'is_correct': isCorrect,
      'sortOrder': sortOrder,
      'sort_order': sortOrder,
    };
  }
}

class QuestionTag {
  final String id;
  final String questionId;
  final String tag;

  const QuestionTag({
    required this.id,
    required this.questionId,
    required this.tag,
  });

  factory QuestionTag.fromJson(Map<String, dynamic> json) {
    return QuestionTag(
      id: _asString(json['id']) ?? '',
      questionId: _asString(json['questionId'] ?? json['question_id']) ?? '',
      tag: _asString(json['tag']) ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionId': questionId,
      'question_id': questionId,
      'tag': tag,
    };
  }
}

class Question {
  final String id;
  final String? topicId;
  final String? subtopicId;
  final String questionText;
  final String? questionTextNp;
  final String? questionImageUrl;
  final String difficulty; // easy, medium, hard
  final int? examYear;
  final String? examType;
  final String? source;
  final bool isVerified;
  final String? verifiedBy;
  final DateTime? verifiedAt;
  final int loksewaFrequency;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<QuestionOption> options;
  final List<QuestionTag> tags;
  final String? syllabusCategory;
  final String? correctOption;
  final String? explanation;
  final String? sourceName;
  final String? publicId;
  final String? optionA;
  final String? optionB;
  final String? optionC;
  final String? optionD;

  const Question({
    required this.id,
    this.topicId,
    this.subtopicId,
    required this.questionText,
    this.questionTextNp,
    this.questionImageUrl,
    this.difficulty = 'medium',
    this.examYear,
    this.examType,
    this.source,
    this.isVerified = false,
    this.verifiedBy,
    this.verifiedAt,
    this.loksewaFrequency = 0,
    required this.createdAt,
    required this.updatedAt,
    this.options = const [],
    this.tags = const [],
    this.syllabusCategory,
    this.correctOption,
    this.explanation,
    this.sourceName,
    this.publicId,
    this.optionA,
    this.optionB,
    this.optionC,
    this.optionD,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    final questionId = _asString(json['id'] ?? json['public_id']) ?? '';
    final correct = _asString(json['correctOption'] ?? json['correct_option']);
    final rawOptions = json['options'] ?? [];
    List<QuestionOption> optionsList = [];
    if (rawOptions is List) {
      optionsList = rawOptions
          .whereType<Map>()
          .map((item) => QuestionOption.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }
    if (optionsList.isEmpty) {
      final optionValues = {
        'A': _asString(json['option_a'] ?? json['optionA']),
        'B': _asString(json['option_b'] ?? json['optionB']),
        'C': _asString(json['option_c'] ?? json['optionC']),
        'D': _asString(json['option_d'] ?? json['optionD']),
      };
      var index = 0;
      for (final entry in optionValues.entries) {
        if (entry.value == null) continue;
        optionsList.add(
          QuestionOption(
            id: '$questionId-${entry.key}',
            questionId: questionId,
            optionLabel: entry.key,
            optionText: entry.value!,
            isCorrect: correct == entry.key,
            sortOrder: index,
          ),
        );
        index += 1;
      }
    }

    final rawTags = json['tags'] ?? [];
    List<QuestionTag> tagsList = [];
    if (rawTags is List) {
      tagsList = rawTags
          .map((item) {
            if (item is Map) {
              return QuestionTag.fromJson(Map<String, dynamic>.from(item));
            } else if (item is String) {
              return QuestionTag(id: '', questionId: '', tag: item);
            }
            return null;
          })
          .whereType<QuestionTag>()
          .toList();
    }

    return Question(
      id: questionId,
      topicId: _asString(json['topicId'] ?? json['topic_id']),
      subtopicId: _asString(json['subtopicId'] ?? json['subtopic_id']),
      questionText: _asString(json['questionText'] ?? json['question_text']) ?? '',
      questionTextNp: _asString(json['questionTextNp'] ?? json['question_text_np']),
      questionImageUrl: _asString(json['questionImageUrl'] ?? json['question_image_url']),
      difficulty: _asString(json['difficulty'] ?? json['exam_level']) ?? 'medium',
      examYear: _asInt(json['examYear'] ?? json['exam_year'] ?? json['source_year']),
      examType: _asString(json['examType'] ?? json['exam_type']),
      source: _asString(json['source'] ?? json['source_name']),
      isVerified: _asBool(json['isVerified'] ?? json['is_verified'] ?? json['verification_status']),
      verifiedBy: _asString(json['verifiedBy'] ?? json['verified_by'] ?? json['verifier']),
      verifiedAt: _asDate(json['verifiedAt'] ?? json['verified_at']),
      loksewaFrequency: _asInt(json['loksewaFrequency'] ?? json['loksewa_frequency']) ?? 0,
      createdAt: _asDate(json['createdAt'] ?? json['created_at']) ?? DateTime.now(),
      updatedAt: _asDate(json['updatedAt'] ?? json['updated_at']) ?? DateTime.now(),
      options: optionsList,
      tags: tagsList,
      syllabusCategory: _asString(json['syllabusCategory'] ?? json['syllabus_category']),
      correctOption: correct,
      explanation: _asString(json['explanation']),
      sourceName: _asString(json['sourceName'] ?? json['source_name']),
      publicId: _asString(json['publicId'] ?? json['public_id']),
      optionA: _asString(json['optionA'] ?? json['option_a']),
      optionB: _asString(json['optionB'] ?? json['option_b']),
      optionC: _asString(json['optionC'] ?? json['option_c']),
      optionD: _asString(json['optionD'] ?? json['option_d']),
    );
  }

  Map<String, dynamic> toJson() {
    final optionMap = {
      for (final option in options)
        if (option.optionLabel.isNotEmpty) option.optionLabel.toUpperCase(): option.optionText,
    };
    final resolvedOptionA = optionA ?? optionMap['A'];
    final resolvedOptionB = optionB ?? optionMap['B'];
    final resolvedOptionC = optionC ?? optionMap['C'];
    final resolvedOptionD = optionD ?? optionMap['D'];
    return {
      'id': id,
      'public_id': publicId,
      'publicId': publicId,
      'topicId': topicId,
      'topic_id': topicId,
      'subtopicId': subtopicId,
      'subtopic_id': subtopicId,
      'questionText': questionText,
      'question_text': questionText,
      'questionTextNp': questionTextNp,
      'question_text_np': questionTextNp,
      'questionImageUrl': questionImageUrl,
      'question_image_url': questionImageUrl,
      'syllabusCategory': syllabusCategory,
      'syllabus_category': syllabusCategory,
      'difficulty': difficulty,
      'examYear': examYear,
      'exam_year': examYear,
      'examType': examType,
      'exam_type': examType,
      'source': source,
      'sourceName': sourceName,
      'source_name': sourceName,
      'isVerified': isVerified,
      'is_verified': isVerified,
      'verifiedBy': verifiedBy,
      'verified_by': verifiedBy,
      'verifiedAt': verifiedAt?.toIso8601String(),
      'verified_at': verifiedAt?.toIso8601String(),
      'loksewaFrequency': loksewaFrequency,
      'loksewa_frequency': loksewaFrequency,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'options': options.map((e) => e.toJson()).toList(),
      'option_a': resolvedOptionA,
      'option_b': resolvedOptionB,
      'option_c': resolvedOptionC,
      'option_d': resolvedOptionD,
      'correctOption': correctOption,
      'correct_option': correctOption,
      'explanation': explanation,
      'tags': tags.map((e) => e.toJson()).toList(),
    };
  }
}
