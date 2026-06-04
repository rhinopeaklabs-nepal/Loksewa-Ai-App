import '../models/subscription.dart';
import '../services/api_client.dart';

class SubscriptionRepository {
  final ApiClient _api;

  const SubscriptionRepository(this._api);

  Future<List<Plan>> getPlans() async {
    final response = await _api.get('/api/subscription/plans');
    final items = listFrom(response);
    return items.map((item) => Plan.fromJson(item)).toList();
  }

  Future<Map<String, dynamic>> subscribe({
    required String planId,
    String? successUrl,
    String? cancelUrl,
  }) async {
    final Map<String, dynamic> body = {
      'planId': planId,
    };
    if (successUrl != null) body['successUrl'] = successUrl;
    if (cancelUrl != null) body['cancelUrl'] = cancelUrl;

    final response = await _api.post('/api/subscription/checkout', data: body);
    return unwrap(response);
  }

  Future<Subscription> getStatus() async {
    final response = await _api.get('/api/subscription/current');
    final data = unwrap(response);
    return Subscription.fromJson(data);
  }
}
