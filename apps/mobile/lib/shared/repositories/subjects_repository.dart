import '../models/subject.dart';
import '../services/api_client.dart';

class SubjectsRepository {
  final ApiClient _api;

  const SubjectsRepository(this._api);

  Future<List<Subject>> listSubjects() async {
    final response = await _api.get('/api/subjects');
    final items = listFrom(response);
    return items.map((item) => Subject.fromJson(item)).toList();
  }

  Future<Subject> getSubject(String id) async {
    final response = await _api.get('/api/subjects/$id');
    final data = unwrap(response);
    return Subject.fromJson(data);
  }

  Future<List<Topic>> getTopicTree(String subjectId) async {
    final response = await _api.get('/api/subjects/$subjectId/topics');
    final items = listFrom(response);
    return items.map((item) => Topic.fromJson(item)).toList();
  }

  Future<Topic> getTopicById(String id) async {
    final response = await _api.get('/api/topics/$id');
    final data = unwrap(response);
    return Topic.fromJson(data);
  }
}
