class Plan {
  final String id;
  final String name;
  final String code; // free, basic, premium
  final double price;
  final String currency;
  final int durationDays;
  final List<String> features;
  final bool isActive;
  final DateTime createdAt;

  const Plan({
    required this.id,
    required this.name,
    required this.code,
    this.price = 0.0,
    this.currency = 'NPR',
    this.durationDays = 30,
    this.features = const [],
    this.isActive = true,
    required this.createdAt,
  });

  String get interval => durationDays >= 365 ? 'year' : 'month';

  factory Plan.fromJson(Map<String, dynamic> json) {
    List<String> featuresList = [];
    final rawFeatures = json['features'] ?? json['featuresJson'] ?? json['features_json'];
    if (rawFeatures is List) {
      featuresList = rawFeatures.map((item) => item.toString()).toList();
    } else if (rawFeatures is String && rawFeatures.isNotEmpty) {
      // It might be a serialized JSON array string
      try {
        // Fallback or parse if needed
      } catch (_) {}
    }

    return Plan(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      code: json['code'] as String? ?? 'free',
      price: ((json['price'] ?? 0.0) as num).toDouble(),
      currency: json['currency'] as String? ?? 'NPR',
      durationDays: (json['durationDays'] ?? json['duration_days'] ?? 30) as int,
      features: featuresList,
      isActive: (json['isActive'] ?? json['is_active'] ?? true) as bool,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : json['created_at'] != null
              ? DateTime.parse(json['created_at'] as String)
              : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'price': price,
      'currency': currency,
      'durationDays': durationDays,
      'duration_days': durationDays,
      'features': features,
      'isActive': isActive,
      'is_active': isActive,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class Subscription {
  final String id;
  final String userId;
  final String planId;
  final String status; // active, trialing, past_due, cancelled, expired
  final DateTime startedAt;
  final DateTime? expiresAt;
  final bool autoRenew;
  final String? paymentId;
  final Plan? plan;

  const Subscription({
    required this.id,
    required this.userId,
    required this.planId,
    this.status = 'active',
    required this.startedAt,
    this.expiresAt,
    this.autoRenew = false,
    this.paymentId,
    this.plan,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    final subPlan = json['plan'] is Map
        ? Plan.fromJson(Map<String, dynamic>.from(json['plan'] as Map))
        : null;

    return Subscription(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? json['user_id'] as String? ?? '',
      planId: json['planId'] as String? ?? json['plan_id'] as String? ?? '',
      status: json['status'] as String? ?? 'active',
      startedAt: json['startedAt'] != null
          ? DateTime.parse(json['startedAt'] as String)
          : json['started_at'] != null
              ? DateTime.parse(json['started_at'] as String)
              : DateTime.now(),
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : json['expires_at'] != null
              ? DateTime.parse(json['expires_at'] as String)
              : null,
      autoRenew: (json['autoRenew'] ?? json['auto_renew'] ?? false) as bool,
      paymentId: json['paymentId'] as String? ?? json['payment_id'] as String?,
      plan: subPlan,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user_id': userId,
      'planId': planId,
      'plan_id': planId,
      'status': status,
      'startedAt': startedAt.toIso8601String(),
      'started_at': startedAt.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
      'expires_at': expiresAt?.toIso8601String(),
      'autoRenew': autoRenew,
      'auto_renew': autoRenew,
      'paymentId': paymentId,
      'payment_id': paymentId,
      'plan': plan?.toJson(),
    };
  }
}

class Payment {
  final String id;
  final String userId;
  final String subscriptionId;
  final double amount;
  final String currency;
  final String provider;
  final String status;
  final DateTime createdAt;

  const Payment({
    required this.id,
    required this.userId,
    required this.subscriptionId,
    required this.amount,
    this.currency = 'NPR',
    required this.provider,
    required this.status,
    required this.createdAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? json['user_id'] as String? ?? '',
      subscriptionId: json['subscriptionId'] as String? ?? json['subscription_id'] as String? ?? '',
      amount: ((json['amount'] ?? 0.0) as num).toDouble(),
      currency: json['currency'] as String? ?? 'NPR',
      provider: json['provider'] as String? ?? '',
      status: json['status'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : json['created_at'] != null
              ? DateTime.parse(json['created_at'] as String)
              : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user_id': userId,
      'subscriptionId': subscriptionId,
      'subscription_id': subscriptionId,
      'amount': amount,
      'currency': currency,
      'provider': provider,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}
