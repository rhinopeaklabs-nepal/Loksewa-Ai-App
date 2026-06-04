import '../models/mock_test.dart';
import '../services/api_client.dart';

class MockTestRepository {
  final ApiClient _api;

  const MockTestRepository(this._api);

  Future<List<MockTest>> listTests({
    String? subjectId,
    int page = 1,
    int limit = 20,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'limit': limit,
    };
    if (subjectId != null && subjectId.isNotEmpty) {
      queryParams['subjectId'] = subjectId;
    }

    final response = await _api.get('/api/mock-tests', query: queryParams);
    final items = listFrom(response);
    return items.map((item) => MockTest.fromJson(item)).toList();
  }

  Future<TestAttempt> startTest(String id) async {
    final response = await _api.post('/api/mock-tests/$id/start');
    final data = unwrap(response);
    return TestAttempt.fromJson(data);
  }

  Future<TestAttempt> saveAnswers(String attemptId, List<TestAnswer> answers) async {
    final Map<String, dynamic> body = {
      'answers': answers.map((a) => a.toJson()).toList(),
    };
    final response = await _api.post(
      '/api/mock-attempts/$attemptId/answers',
      data: body,
    );
    final data = unwrap(response);
    return TestAttempt.fromJson(data);
  }

  Future<TestAttempt> submitTest(String attemptId) async {
    final response = await _api.post('/api/mock-attempts/$attemptId/submit');
    final data = unwrap(response);
    return TestAttempt.fromJson(data);
  }

  Future<TestResult> getResults(String attemptId) async {
    final response = await _api.get('/api/tests/$attemptId/results');
    final data = unwrap(response);
    return TestResult.fromJson(data);
  }

  Future<TestAttempt> getAttempt(String attemptId) async {
    final response = await _api.get('/api/mock-attempts/$attemptId');
    final data = unwrap(response);
    return TestAttempt.fromJson(data);
  }
}
