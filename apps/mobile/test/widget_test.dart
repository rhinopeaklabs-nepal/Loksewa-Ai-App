import 'package:flutter_test/flutter_test.dart';
import 'package:loksewa_ai_app/shared/models/subscription.dart';

void main() {
  group('Plan Model Unit Tests', () {
    test('Plan.fromJson parses fields correctly', () {
      final now = DateTime.now();
      final json = {
        'id': 'plan_premium',
        'name': 'Premium Plan',
        'code': 'premium',
        'price': 1500.0,
        'currency': 'NPR',
        'durationDays': 365,
        'features': ['Ad-free', 'Unlimited AI chat'],
        'isActive': true,
        'createdAt': now.toIso8601String(),
      };

      final plan = Plan.fromJson(json);

      expect(plan.id, 'plan_premium');
      expect(plan.name, 'Premium Plan');
      expect(plan.code, 'premium');
      expect(plan.price, 1500.0);
      expect(plan.currency, 'NPR');
      expect(plan.durationDays, 365);
      expect(plan.interval, 'year');
      expect(plan.features, contains('Unlimited AI chat'));
      expect(plan.isActive, isTrue);
    });

    test('Plan.toJson serializes correctly', () {
      final now = DateTime.now();
      final plan = Plan(
        id: 'plan_basic',
        name: 'Basic Plan',
        code: 'basic',
        price: 500.0,
        durationDays: 30,
        features: ['Ad-supported'],
        createdAt: now,
      );

      final json = plan.toJson();

      expect(json['id'], 'plan_basic');
      expect(json['name'], 'Basic Plan');
      expect(json['code'], 'basic');
      expect(json['price'], 500.0);
      expect(json['durationDays'], 30);
      expect(json['interval'], isNull); // interval is a getter, not serialized
      expect(json['features'], contains('Ad-supported'));
    });

    test('Plan.interval computes correct interval label based on durationDays', () {
      final planMonthly = Plan(
        id: '1',
        name: 'Monthly',
        code: 'monthly',
        durationDays: 30,
        createdAt: DateTime.now(),
      );
      final planYearly = Plan(
        id: '2',
        name: 'Yearly',
        code: 'yearly',
        durationDays: 365,
        createdAt: DateTime.now(),
      );

      expect(planMonthly.interval, 'month');
      expect(planYearly.interval, 'year');
    });
  });
}
