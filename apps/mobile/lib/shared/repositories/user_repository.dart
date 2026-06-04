import '../models/user.dart';
import '../services/api_client.dart';

class UserRepository {
  final ApiClient _api;

  const UserRepository(this._api);

  Future<UserProfile> getProfile() async {
    final response = await _api.get('/api/users/me');
    final data = unwrap(response);
    return UserProfile.fromJson(data);
  }

  Future<UserProfile> updateProfile({
    String? fullName,
    String? avatarUrl,
    UserPreferences? preferences,
  }) async {
    final Map<String, dynamic> body = {};
    if (fullName != null) body['fullName'] = fullName;
    if (avatarUrl != null) body['avatarUrl'] = avatarUrl;
    if (preferences != null) body['preferences'] = preferences.toJson();

    final response = await _api.patch('/api/users/me', data: body);
    final data = unwrap(response);
    return UserProfile.fromJson(data);
  }

  Future<Map<String, dynamic>> getStats() async {
    try {
      final response = await _api.get('/api/users/me/stats');
      return unwrap(response);
    } catch (_) {
      // Return default empty stats if error occurs (e.g. offline/unauthorized)
      return {
        'total_mocks_taken': 0,
        'total_mocks_completed': 0,
        'average_score': 0,
        'correct_rate': 0,
        'total_questions_answered': 0,
        'best_score': 0,
        'categories_studied': const [],
      };
    }
  }
}
