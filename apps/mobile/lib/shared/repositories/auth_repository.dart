import '../models/user.dart';
import '../services/api_client.dart';

class AuthRepository {
  final ApiClient _api;

  const AuthRepository(this._api);

  Future<bool> get isSignedIn => _api.isSignedIn;

  Future<User> register({
    required String email,
    required String password,
    required String fullName,
  }) async {
    final response = await _api.post(
      '/api/auth/register',
      data: {
        'email': email.trim(),
        'password': password,
        'fullName': fullName.trim(),
      },
    );
    await _api.saveSession(response);
    final data = unwrap(response);
    return User.fromJson(data);
  }

  Future<User> login({
    required String email,
    required String password,
  }) async {
    final response = await _api.post(
      '/api/auth/login',
      data: {
        'email': email.trim(),
        'password': password,
      },
    );
    await _api.saveSession(response);
    final data = unwrap(response);
    return User.fromJson(data);
  }

  Future<bool> refresh(String refreshToken) async {
    try {
      final response = await _api.post(
        '/api/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      await _api.saveSession(response);
      return true;
    } catch (_) {
      await _api.clearSession();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _api.post('/api/auth/logout');
    } catch (_) {
      // Clear session even if network call fails
    }
    await _api.clearSession();
  }

  Future<UserProfile> getMe() async {
    final response = await _api.get('/api/users/me');
    final data = unwrap(response);
    return UserProfile.fromJson(data);
  }
}
