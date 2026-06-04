import '../models/analytics.dart';
import '../services/api_client.dart';

class AnalyticsRepository {
  final ApiClient _api;

  const AnalyticsRepository(this._api);

  Future<List<DailyStats>> getDailyStats({String period = '30d'}) async {
    final Map<String, dynamic> queryParams = {
      'period': period,
    };
    final response = await _api.get('/api/analytics/stats', query: queryParams);
    final items = listFrom(response);
    return items.map((item) => DailyStats.fromJson(item)).toList();
  }

  Future<List<WeaknessArea>> getWeaknesses() async {
    final response = await _api.get('/api/analytics/weaknesses');
    final items = listFrom(response);
    return items.map((item) => WeaknessArea.fromJson(item)).toList();
  }

  Future<Map<String, dynamic>> getRecommendations() async {
    final response = await _api.get('/api/analytics/recommendations');
    return unwrap(response);
  }
}
