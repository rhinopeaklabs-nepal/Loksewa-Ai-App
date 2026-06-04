import '../models/scan.dart';
import '../services/api_client.dart';

class ScanRepository {
  final ApiClient _api;

  const ScanRepository(this._api);

  Future<ScanJob> submitScan({
    required String imageUrl,
    String? subjectId,
    String? language, // en, ne
    bool enhance = true,
  }) async {
    final Map<String, dynamic> body = {
      'imageUrl': imageUrl,
    };
    if (subjectId != null) body['subjectId'] = subjectId;
    
    final Map<String, dynamic> options = {
      'enhance': enhance,
    };
    if (language != null) options['language'] = language;
    body['options'] = options;

    final response = await _api.post('/api/scan', data: body);
    final data = unwrap(response);
    return ScanJob.fromJson(data);
  }

  Future<ScanJob> getScanResult(String jobId) async {
    final response = await _api.get('/api/scan/$jobId/result');
    final data = unwrap(response);
    return ScanJob.fromJson(data);
  }

  // Fallback history method if needed by UI
  Future<List<ScanJob>> getScanHistory() async {
    // As there is no explicit history endpoint in routes, return empty list
    return const [];
  }
}
