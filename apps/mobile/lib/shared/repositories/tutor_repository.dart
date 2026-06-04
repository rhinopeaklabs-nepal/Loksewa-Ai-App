import '../models/chat.dart';
import '../services/api_client.dart';

class TutorRepository {
  final ApiClient _api;

  const TutorRepository(this._api);

  Future<TutorConversation> sendMessage({
    required String message,
    String? conversationId,
    String? subjectId,
    String? topicId,
  }) async {
    final Map<String, dynamic> body = {
      'message': message,
    };
    if (conversationId != null) body['conversationId'] = conversationId;
    
    if (subjectId != null || topicId != null) {
      final Map<String, dynamic> context = {};
      if (subjectId != null) context['subjectId'] = subjectId;
      if (topicId != null) context['topicId'] = topicId;
      body['context'] = context;
    }

    final response = await _api.post('/api/tutor/chat', data: body);
    final data = unwrap(response);
    return TutorConversation.fromJson(data);
  }

  Future<List<TutorConversation>> getConversations({
    int page = 1,
    int limit = 20,
  }) async {
    final Map<String, dynamic> queryParams = {
      'page': page,
      'limit': limit,
    };
    final response = await _api.get('/api/tutor/conversations', query: queryParams);
    final items = listFrom(response);
    return items.map((item) => TutorConversation.fromJson(item)).toList();
  }

  Future<TutorConversation> getConversationDetail(String id) async {
    final response = await _api.get('/api/tutor/conversations/$id');
    final data = unwrap(response);
    return TutorConversation.fromJson(data);
  }

  Future<List<TutorMessage>> getConversationMessages(String id) async {
    final response = await _api.get('/api/tutor/conversations/$id/messages');
    final items = listFrom(response);
    return items.map((item) => TutorMessage.fromJson(item)).toList();
  }
}
