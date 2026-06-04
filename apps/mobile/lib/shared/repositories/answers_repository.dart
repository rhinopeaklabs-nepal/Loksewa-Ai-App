import '../models/answer.dart';
import '../services/api_client.dart';

class AnswersRepository {
  final ApiClient _api;

  const AnswersRepository(this._api);

  Future<List<Answer>> getAnswer(String questionId) async {
    final response = await _api.get('/api/answers/$questionId');
    final data = unwrap(response);
    
    // In case backend returns a list of answers
    if (data['data'] is List) {
      final items = listFrom(response);
      return items.map((item) => Answer.fromJson(item)).toList();
    }
    
    // In case backend returns a single answer map
    if (data.containsKey('id') || data.containsKey('answer_text') || data.containsKey('answerText')) {
      return [Answer.fromJson(data)];
    }
    
    // Fallback if list is wrapped under an items/data field differently
    final items = listFrom(response);
    if (items.isNotEmpty) {
      return items.map((item) => Answer.fromJson(item)).toList();
    }
    
    return const [];
  }

  Future<VerifiedAnswer> verifyAnswer({
    required String questionId,
    required String answerId,
    required bool isCorrect,
    String? verifiedBy,
  }) async {
    final Map<String, dynamic> body = {
      'answerId': answerId,
      'isCorrect': isCorrect,
    };
    if (verifiedBy != null) body['verifiedBy'] = verifiedBy;

    final response = await _api.post(
      '/api/admin/answers/$questionId/verify',
      data: body,
    );
    final data = unwrap(response);
    return VerifiedAnswer.fromJson(data);
  }
}
