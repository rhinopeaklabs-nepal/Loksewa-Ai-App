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

DateTime _asDate(dynamic value) {
  final text = _asString(value);
  return text == null ? DateTime.now() : DateTime.tryParse(text) ?? DateTime.now();
}

class SubTopic {
  final String id;
  final String topicId;
  final String name;
  final String? nameNp;
  final int sortOrder;
  final DateTime createdAt;

  const SubTopic({
    required this.id,
    required this.topicId,
    required this.name,
    this.nameNp,
    this.sortOrder = 0,
    required this.createdAt,
  });

  factory SubTopic.fromJson(Map<String, dynamic> json) {
    return SubTopic(
      id: _asString(json['id']) ?? '',
      topicId: _asString(json['topicId'] ?? json['topic_id']) ?? '',
      name: _asString(json['name'] ?? json['title']) ?? '',
      nameNp: _asString(json['nameNp'] ?? json['name_np']),
      sortOrder: _asInt(json['sortOrder'] ?? json['sort_order']),
      createdAt: _asDate(json['createdAt'] ?? json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'topicId': topicId,
      'topic_id': topicId,
      'name': name,
      'nameNp': nameNp,
      'name_np': nameNp,
      'sortOrder': sortOrder,
      'sort_order': sortOrder,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class Topic {
  final String id;
  final String subjectId;
  final String name;
  final String? nameNp;
  final String? description;
  final int sortOrder;
  final double loksewaWeight;
  final DateTime createdAt;
  final List<SubTopic> subTopics;

  const Topic({
    required this.id,
    required this.subjectId,
    required this.name,
    this.nameNp,
    this.description,
    this.sortOrder = 0,
    this.loksewaWeight = 0.0,
    required this.createdAt,
    this.subTopics = const [],
  });

  factory Topic.fromJson(Map<String, dynamic> json) {
    final rawSubTopics = json['subTopics'] ?? json['sub_topics'] ?? json['subTopicsList'] ?? [];
    List<SubTopic> subTopicsList = [];
    if (rawSubTopics is List) {
      subTopicsList = rawSubTopics
          .whereType<Map>()
          .map((item) => SubTopic.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    return Topic(
      id: _asString(json['id'] ?? json['slug']) ?? '',
      subjectId: _asString(json['subjectId'] ?? json['subject_id']) ?? '',
      name: _asString(json['name'] ?? json['title']) ?? '',
      nameNp: _asString(json['nameNp'] ?? json['name_np']),
      description: _asString(json['description'] ?? json['summary']),
      sortOrder: _asInt(json['sortOrder'] ?? json['sort_order']),
      loksewaWeight: _asDouble(json['loksewaWeight'] ?? json['loksewa_weight']),
      createdAt: _asDate(json['createdAt'] ?? json['created_at']),
      subTopics: subTopicsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'subjectId': subjectId,
      'subject_id': subjectId,
      'name': name,
      'nameNp': nameNp,
      'name_np': nameNp,
      'description': description,
      'sortOrder': sortOrder,
      'sort_order': sortOrder,
      'loksewaWeight': loksewaWeight,
      'loksewa_weight': loksewaWeight,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'subTopics': subTopics.map((e) => e.toJson()).toList(),
    };
  }
}

class Subject {
  final String id;
  final String name;
  final String? nameNp;
  final String? icon;
  final String? color;
  final int sortOrder;
  final bool isActive;
  final DateTime createdAt;
  final List<Topic> topics;

  const Subject({
    required this.id,
    required this.name,
    this.nameNp,
    this.icon,
    this.color,
    this.sortOrder = 0,
    this.isActive = true,
    required this.createdAt,
    this.topics = const [],
  });

  factory Subject.fromJson(Map<String, dynamic> json) {
    final rawTopics = json['topics'] ?? json['topicsList'] ?? [];
    List<Topic> topicsList = [];
    if (rawTopics is List) {
      topicsList = rawTopics
          .whereType<Map>()
          .map((item) => Topic.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    return Subject(
      id: _asString(json['id'] ?? json['slug']) ?? '',
      name: _asString(json['name'] ?? json['title']) ?? '',
      nameNp: _asString(json['nameNp'] ?? json['name_np']),
      icon: _asString(json['icon']),
      color: _asString(json['color']),
      sortOrder: _asInt(json['sortOrder'] ?? json['sort_order']),
      isActive: _asBool(json['isActive'] ?? json['is_active'] ?? json['status'], fallback: true),
      createdAt: _asDate(json['createdAt'] ?? json['created_at']),
      topics: topicsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'nameNp': nameNp,
      'name_np': nameNp,
      'icon': icon,
      'color': color,
      'sortOrder': sortOrder,
      'sort_order': sortOrder,
      'isActive': isActive,
      'is_active': isActive,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'topics': topics.map((e) => e.toJson()).toList(),
    };
  }
}
