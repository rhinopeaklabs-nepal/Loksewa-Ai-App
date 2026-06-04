import '../models/question.dart';
import '../services/api_client.dart';

class QuestionsRepository {
  final ApiClient _api;

  const QuestionsRepository(this._api);

  Future<List<Question>> listQuestions({
    int page = 1,
    int limit = 20,
    String? subjectId,
    String? difficulty,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'limit': limit,
    };
    if (subjectId != null) queryParams['subjectId'] = subjectId;
    if (difficulty != null) queryParams['difficulty'] = difficulty;

    final response = await _api.get('/api/questions', query: queryParams);
    final items = listFrom(response);
    return items.map((item) => Question.fromJson(item)).toList();
  }

  Future<List<Question>> searchQuestions(
    String query, {
    String? subjectId,
    int limit = 20,
  }) async {
    final Map<String, dynamic> queryParams = {
      'q': query.trim(),
      'limit': limit,
    };
    if (subjectId != null) queryParams['subjectId'] = subjectId;

    final response = await _api.get('/api/questions/search', query: queryParams);
    final items = listFrom(response);
    return items.map((item) => Question.fromJson(item)).toList();
  }

  Future<Question> getQuestion(String id) async {
    final response = await _api.get('/api/questions/$id');
    final data = unwrap(response);
    return Question.fromJson(data);
  }
}
