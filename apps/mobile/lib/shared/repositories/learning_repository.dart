import '../models/learning.dart';
import '../services/api_client.dart';

class LearningRepository {
  final ApiClient _api;

  const LearningRepository(this._api);

  Future<AILesson> generateLesson({
    String? subjectId,
    String? topicId,
    String? questionId,
    String? level, // beginner, intermediate, advanced
    String? preferredLanguage, // en, ne
  }) async {
    final Map<String, dynamic> body = {};
    if (subjectId != null) body['subjectId'] = subjectId;
    if (topicId != null) body['topicId'] = topicId;
    if (questionId != null) body['questionId'] = questionId;
    if (level != null) body['level'] = level;
    if (preferredLanguage != null) body['preferredLanguage'] = preferredLanguage;

    // Use specific endpoint depending on whether questionId is specified
    final path = questionId != null
        ? '/api/lessons/generate'
        : '/api/learning/lessons/generate';

    final response = await _api.post(path, data: body);
    final data = unwrap(response);
    return AILesson.fromJson(data);
  }

  Future<List<AILesson>> listLessons({
    String? subjectId,
    String? topicId,
    int page = 1,
    int limit = 20,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'limit': limit,
    };
    if (subjectId != null) queryParams['subjectId'] = subjectId;
    if (topicId != null) queryParams['topicId'] = topicId;

    final response = await _api.get('/api/learning/lessons', query: queryParams);
    final items = listFrom(response);
    return items.map((item) => AILesson.fromJson(item)).toList();
  }

  Future<AILesson> getLessonByQuestionId(String questionId) async {
    final response = await _api.get('/api/lessons/$questionId');
    final data = unwrap(response);
    return AILesson.fromJson(data);
  }

  Future<List<Flashcard>> getFlashcards({
    String? subjectId,
    String? topicId,
    String? status, // new, learning, mastered
  }) async {
    final Map<String, dynamic> queryParams = {};
    if (subjectId != null) queryParams['subjectId'] = subjectId;
    if (topicId != null) queryParams['topicId'] = topicId;
    if (status != null) queryParams['status'] = status;

    final response = await _api.get('/api/learning/flashcards', query: queryParams);
    final items = listFrom(response);
    return items.map((item) => Flashcard.fromJson(item)).toList();
  }

  Future<Flashcard> reviewFlashcard(
    String id, {
    int? quality,
    int? rating,
  }) async {
    final Map<String, dynamic> body = {};
    if (quality != null) body['quality'] = quality;
    if (rating != null) body['rating'] = rating;

    final response = await _api.post('/api/flashcards/$id/review', data: body);
    final data = unwrap(response);
    return Flashcard.fromJson(data);
  }

  Future<List<StudyProgress>> getProgress() async {
    final response = await _api.get('/api/learning/progress');
    final items = listFrom(response);
    return items.map((item) => StudyProgress.fromJson(item)).toList();
  }

  Future<StudyProgress> trackProgress(
    String topicId, {
    double? completionPercentage,
  }) async {
    final Map<String, dynamic> body = {};
    if (completionPercentage != null) {
      body['completionPercentage'] = completionPercentage;
      body['completion_percentage'] = completionPercentage;
    }

    final response = await _api.put('/api/progress/$topicId', data: body);
    final data = unwrap(response);
    return StudyProgress.fromJson(data);
  }
}
