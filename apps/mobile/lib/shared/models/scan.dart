class ScanResult {
  final String? extractedText;
  final String? matchedQuestionId;
  final Map<String, dynamic> rawResult;

  const ScanResult({
    this.extractedText,
    this.matchedQuestionId,
    this.rawResult = const {},
  });

  factory ScanResult.fromJson(Map<String, dynamic> json) {
    return ScanResult(
      extractedText: json['extractedText'] as String? ?? json['extracted_text'] as String?,
      matchedQuestionId: json['matchedQuestionId'] as String? ?? json['matched_question_id'] as String?,
      rawResult: json,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'extractedText': extractedText,
      'extracted_text': extractedText,
      'matchedQuestionId': matchedQuestionId,
      'matched_question_id': matchedQuestionId,
      ...rawResult,
    };
  }
}

class ScanJob {
  final String id;
  final String userId;
  final String? imageUrl;
  final String status; // queued, processing, completed, failed
  final String? extractedText;
  final String? matchedQuestion; // JSON string or text info about matching question
  final DateTime createdAt;
  final DateTime updatedAt;
  final ScanResult? result;

  const ScanJob({
    required this.id,
    required this.userId,
    this.imageUrl,
    required this.status,
    this.extractedText,
    this.matchedQuestion,
    required this.createdAt,
    required this.updatedAt,
    this.result,
  });

  factory ScanJob.fromJson(Map<String, dynamic> json) {
    ScanResult? res;
    if (json['result'] is Map) {
      res = ScanResult.fromJson(Map<String, dynamic>.from(json['result'] as Map));
    } else if (json['extracted_text'] != null || json['extractedText'] != null) {
      res = ScanResult.fromJson(json);
    }

    return ScanJob(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? json['user_id'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? json['image_url'] as String?,
      status: json['status'] as String? ?? 'queued',
      extractedText: json['extractedText'] as String? ?? json['extracted_text'] as String?,
      matchedQuestion: json['matchedQuestion'] as String? ?? json['matched_question'] as String?,
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
      result: res,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user_id': userId,
      'imageUrl': imageUrl,
      'image_url': imageUrl,
      'status': status,
      'extractedText': extractedText,
      'extracted_text': extractedText,
      'matchedQuestion': matchedQuestion,
      'matched_question': matchedQuestion,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'result': result?.toJson(),
    };
  }
}
