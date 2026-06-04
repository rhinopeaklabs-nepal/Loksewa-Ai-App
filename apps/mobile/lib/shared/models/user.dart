class UserPreferences {
  final String language;
  final bool notifications;
  final bool darkMode;
  final bool audioEffects;

  const UserPreferences({
    this.language = 'ne',
    this.notifications = true,
    this.darkMode = false,
    this.audioEffects = true,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      language: json['language'] as String? ?? 'ne',
      notifications: json['notifications'] as bool? ?? true,
      darkMode: json['darkMode'] as bool? ?? json['dark_mode'] as bool? ?? false,
      audioEffects: json['audioEffects'] as bool? ?? json['audio_effects'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'language': language,
      'notifications': notifications,
      'darkMode': darkMode,
      'audioEffects': audioEffects,
    };
  }

  UserPreferences copyWith({
    String? language,
    bool? notifications,
    bool? darkMode,
    bool? audioEffects,
  }) {
    return UserPreferences(
      language: language ?? this.language,
      notifications: notifications ?? this.notifications,
      darkMode: darkMode ?? this.darkMode,
      audioEffects: audioEffects ?? this.audioEffects,
    );
  }
}

class UserProfile {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String? avatarUrl;
  final String role;
  final String? subscriptionId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final UserPreferences preferences;

  const UserProfile({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    this.avatarUrl,
    required this.role,
    this.subscriptionId,
    required this.createdAt,
    required this.updatedAt,
    this.preferences = const UserPreferences(),
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? json['fullName'] as String? ?? '',
      phone: json['phone'] as String?,
      avatarUrl: json['avatarUrl'] as String? ?? json['avatar_url'] as String?,
      role: json['role'] as String? ?? 'student',
      subscriptionId: json['subscriptionId'] as String? ?? json['subscription_id'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : json['created_at'] != null
              ? DateTime.parse(json['created_at'] as String)
              : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : json['updated_at'] != null
              ? DateTime.parse(json['updated_at'] as String)
              : DateTime.now(),
      preferences: json['preferences'] is Map
          ? UserPreferences.fromJson(Map<String, dynamic>.from(json['preferences'] as Map))
          : const UserPreferences(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'fullName': name,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'avatar_url': avatarUrl,
      'role': role,
      'subscriptionId': subscriptionId,
      'subscription_id': subscriptionId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'preferences': preferences.toJson(),
    };
  }

  UserProfile copyWith({
    String? id,
    String? email,
    String? name,
    String? phone,
    String? avatarUrl,
    String? role,
    String? subscriptionId,
    DateTime? createdAt,
    DateTime? updatedAt,
    UserPreferences? preferences,
  }) {
    return UserProfile(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      subscriptionId: subscriptionId ?? this.subscriptionId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      preferences: preferences ?? this.preferences,
    );
  }
}

class User {
  final UserProfile profile;
  final String? accessToken;
  final String? refreshToken;

  const User({
    required this.profile,
    this.accessToken,
    this.refreshToken,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final userMap = json['user'] is Map
        ? Map<String, dynamic>.from(json['user'] as Map)
        : json;
    
    // Check nested tokens if available
    String? access;
    String? refresh;
    if (json['tokens'] is Map) {
      final tokens = json['tokens'] as Map;
      access = tokens['accessToken'] as String? ?? tokens['access_token'] as String?;
      refresh = tokens['refreshToken'] as String? ?? tokens['refresh_token'] as String?;
    } else {
      access = json['accessToken'] as String? ?? json['access_token'] as String?;
      refresh = json['refreshToken'] as String? ?? json['refresh_token'] as String?;
    }

    return User(
      profile: UserProfile.fromJson(userMap),
      accessToken: access,
      refreshToken: refresh,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': profile.toJson(),
      'accessToken': accessToken,
      'refreshToken': refreshToken,
    };
  }
}
