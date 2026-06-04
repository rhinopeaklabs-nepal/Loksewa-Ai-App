class TutorMessage {
  final String id;
  final String conversationId;
  final String role; // user, assistant, system
  final String content;
  final List<dynamic> attachments;
  final DateTime createdAt;

  const TutorMessage({
    required this.id,
    required this.conversationId,
    required this.role,
    required this.content,
    this.attachments = const [],
    required this.createdAt,
  });

  factory TutorMessage.fromJson(Map<String, dynamic> json) {
    List<dynamic> attachmentList = [];
    final rawAttachments = json['attachments'] ?? json['attachmentsJson'] ?? json['attachments_json'];
    if (rawAttachments is List) {
      attachmentList = rawAttachments;
    } else if (rawAttachments is String && rawAttachments.isNotEmpty) {
      // It might be a serialized JSON string
      try {
        // Fallback or parse if needed
      } catch (_) {}
    }

    return TutorMessage(
      id: json['id'] as String? ?? '',
      conversationId: json['conversationId'] as String? ?? json['conversation_id'] as String? ?? '',
      role: json['role'] as String? ?? 'user',
      content: json['content'] as String? ?? '',
      attachments: attachmentList,
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
      'conversationId': conversationId,
      'conversation_id': conversationId,
      'role': role,
      'content': content,
      'attachments': attachments,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class TutorConversation {
  final String id;
  final String userId;
  final String? subjectId;
  final String? topicId;
  final String title;
  final Map<String, dynamic> context;
  final int messageCount;
  final DateTime? lastMessageAt;
  final DateTime createdAt;
  final List<TutorMessage> messages;

  const TutorConversation({
    required this.id,
    required this.userId,
    this.subjectId,
    this.topicId,
    required this.title,
    this.context = const {},
    this.messageCount = 0,
    this.lastMessageAt,
    required this.createdAt,
    this.messages = const [],
  });

  factory TutorConversation.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic> ctxMap = {};
    final ctx = json['context'] ?? json['contextJson'] ?? json['context_json'];
    if (ctx is Map) {
      ctxMap = Map<String, dynamic>.from(ctx);
    } else if (ctx is String && ctx.isNotEmpty) {
      // It might be a serialized JSON string
      try {
        // Parse if needed
      } catch (_) {}
    }

    final rawMsgs = json['messages'] ?? [];
    List<TutorMessage> messageList = [];
    if (rawMsgs is List) {
      messageList = rawMsgs
          .whereType<Map>()
          .map((item) => TutorMessage.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    return TutorConversation(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? json['user_id'] as String? ?? '',
      subjectId: json['subjectId'] as String? ?? json['subject_id'] as String?,
      topicId: json['topicId'] as String? ?? json['topic_id'] as String?,
      title: json['title'] as String? ?? '',
      context: ctxMap,
      messageCount: (json['messageCount'] ?? json['message_count'] ?? 0) as int,
      lastMessageAt: json['lastMessageAt'] != null
          ? DateTime.parse(json['lastMessageAt'] as String)
          : json['last_message_at'] != null
              ? DateTime.parse(json['last_message_at'] as String)
              : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : json['created_at'] != null
              ? DateTime.parse(json['created_at'] as String)
              : DateTime.now(),
      messages: messageList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user_id': userId,
      'subjectId': subjectId,
      'subject_id': subjectId,
      'topicId': topicId,
      'topic_id': topicId,
      'title': title,
      'context': context,
      'messageCount': messageCount,
      'lastMessageAt': lastMessageAt?.toIso8601String(),
      'last_message_at': lastMessageAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'messages': messages.map((e) => e.toJson()).toList(),
    };
  }
}
