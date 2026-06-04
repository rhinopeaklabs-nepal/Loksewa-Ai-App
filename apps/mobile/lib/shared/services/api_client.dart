import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiConfig {
  static const baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );
}

final secureStorageProvider = Provider<FlutterSecureStorage>((_) {
  return const FlutterSecureStorage();
});

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  const ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class ApiClient {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  ApiClient(this._storage)
      : _dio = Dio(
          BaseOptions(
            baseUrl: ApiConfig.baseUrl,
            connectTimeout: const Duration(seconds: 12),
            receiveTimeout: const Duration(seconds: 25),
            headers: const {'Content-Type': 'application/json'},
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await accessToken;
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          // Simple logging for requests
          debugPrint('--> API REQUEST: ${options.method} ${options.baseUrl}${options.path}');
          if (options.data != null) {
            debugPrint('Body: ${options.data}');
          }
          handler.next(options);
        },
        onResponse: (response, handler) {
          debugPrint('<-- API RESPONSE: ${response.statusCode} ${response.requestOptions.path}');
          handler.next(response);
        },
        onError: (err, handler) async {
          debugPrint('xxx API ERROR: ${err.response?.statusCode} ${err.requestOptions.path}');
          debugPrint('Error message: ${err.message}');
          if (err.response?.data != null) {
            debugPrint('Error details: ${err.response?.data}');
          }

          final status = err.response?.statusCode;
          if (status == 401 &&
              err.requestOptions.extra['skipAuthRefresh'] != true &&
              await _refreshToken()) {
            final opts = err.requestOptions;
            final token = await accessToken;
            opts.headers['Authorization'] = 'Bearer $token';
            try {
              final response = await _dio.fetch(opts);
              return handler.resolve(response);
            } catch (_) {
              return handler.next(err);
            }
          }
          handler.next(err);
        },
      ),
    );
  }

  Future<String?> get accessToken => _storage.read(key: 'access_token');

  Future<bool> get isSignedIn async {
    final token = await accessToken;
    return token != null && token.isNotEmpty;
  }

  Future<void> clearSession() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
    await _storage.delete(key: 'user_email');
    await _storage.delete(key: 'user_name');
  }

  Future<void> saveSession(Map<String, dynamic> payload) async {
    final data = unwrap(payload);
    final access = stringOf(data, const [
          'accessToken',
          'access_token',
          'token',
        ]) ??
        stringOf(data['tokens'], const ['accessToken', 'access_token', 'token']);
    final refresh = stringOf(data, const [
          'refreshToken',
          'refresh_token',
          'token',
        ]) ??
        stringOf(data['tokens'], const ['refreshToken', 'refresh_token', 'token']);
    final user = mapOf(data['user']);

    if (access != null) {
      await _storage.write(key: 'access_token', value: access);
    }
    if (refresh != null) {
      await _storage.write(key: 'refresh_token', value: refresh);
    }
    if (user != null) {
      await _storage.write(
        key: 'user_email',
        value: stringOf(user, const ['email']),
      );
      await _storage.write(
        key: 'user_name',
        value: stringOf(user, const ['fullName', 'full_name', 'name']),
      );
    }
  }

  Future<Map<String, dynamic>> cachedUser() async {
    return {
      'email': await _storage.read(key: 'user_email'),
      'full_name': await _storage.read(key: 'user_name'),
    };
  }

  Future<bool> _refreshToken() async {
    final refresh = await _storage.read(key: 'refresh_token');
    if (refresh == null || refresh.isEmpty) return false;

    try {
      final response = await _dio.post(
        '/api/auth/refresh',
        data: {'refreshToken': refresh},
        options: Options(extra: {'skipAuthRefresh': true}),
      );
      final payload = response.data is Map
          ? Map<String, dynamic>.from(response.data as Map)
          : <String, dynamic>{};
      await saveSession(payload);
      return true;
    } catch (_) {
      await clearSession();
      return false;
    }
  }

  Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? query}) async {
    return _request(() => _dio.get(path, queryParameters: query));
  }

  Future<Map<String, dynamic>> post(String path, {dynamic data}) async {
    return _request(() => _dio.post(path, data: data));
  }

  Future<Map<String, dynamic>> put(String path, {dynamic data}) async {
    return _request(() => _dio.put(path, data: data));
  }

  Future<Map<String, dynamic>> patch(String path, {dynamic data}) async {
    return _request(() => _dio.patch(path, data: data));
  }

  Future<Map<String, dynamic>> delete(String path) async {
    return _request(() => _dio.delete(path));
  }

  Future<Map<String, dynamic>> _request(Future<Response<dynamic>> Function() run) async {
    try {
      final response = await run();
      final data = response.data;
      if (data == null) return <String, dynamic>{};
      if (data is Map<String, dynamic>) return data;
      if (data is Map) return Map<String, dynamic>.from(data);
      if (data is List) return {'data': data};
      return {'data': data};
    } on DioException catch (error) {
      final response = error.response;
      final data = response?.data;
      var message = error.message ?? 'Backend request failed';
      if (data is Map) {
        message = stringOf(data, const ['detail', 'message']) ??
            stringOf(mapOf(data['error']), const ['message']) ??
            message;
      }
      throw ApiException(message, statusCode: response?.statusCode);
    }
  }
}

Map<String, dynamic> unwrap(Map<String, dynamic> payload) {
  final data = payload['data'];
  if (payload['success'] == true && data is Map) {
    return Map<String, dynamic>.from(data);
  }
  return payload;
}

List<Map<String, dynamic>> listFrom(dynamic value) {
  final data = value is Map<String, dynamic> ? unwrap(value) : value;
  if (data is List) {
    return data.whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
  }
  if (data is Map) {
    final nested = data['items'] ?? data['results'] ?? data['data'] ?? data['questions'];
    if (nested is List) {
      return nested.whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
    }
  }
  return const [];
}

Map<String, dynamic>? mapOf(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return null;
}

String? stringOf(dynamic source, List<String> keys) {
  final map = mapOf(source);
  if (map == null) return null;
  for (final key in keys) {
    final value = map[key];
    if (value != null && value.toString().trim().isNotEmpty) {
      return value.toString();
    }
  }
  return null;
}

num numberOf(dynamic source, List<String> keys, [num fallback = 0]) {
  final map = mapOf(source);
  if (map == null) return fallback;
  for (final key in keys) {
    final value = map[key];
    if (value is num) return value;
    if (value is String) {
      final parsed = num.tryParse(value);
      if (parsed != null) return parsed;
    }
  }
  return fallback;
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(secureStorageProvider));
});
