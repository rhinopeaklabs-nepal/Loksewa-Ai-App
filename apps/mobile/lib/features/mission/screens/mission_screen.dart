// Loksewa AI — Mission screen (daily practice)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/services/api_client.dart';

class MissionScreen extends ConsumerWidget {
  const MissionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final missionAsync = ref.watch(todaysMissionProvider);
    return Scaffold(
      appBar: AppBar(title: const Text("Today's Mission")),
      body: missionAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (mission) {
          if (mission == null) {
            return const Center(child: Text('No mission today. Take a break! 🎉'));
          }
          final questions = mission['questions'] as List? ?? [];
          final completed = mission['completed_questions'] as int? ?? 0;
          final total = mission['total_questions'] as int? ?? 0;
          final progress = total > 0 ? completed / total : 0.0;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Progress card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Progress',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 12,
                          backgroundColor: Colors.grey.shade200,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '$completed / $total questions answered',
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Composition breakdown
              const Text(
                'Mission breakdown',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              _CompositionRow(
                icon: Icons.warning_amber,
                label: 'Weak topic practice',
                count: mission['composition']?['weak_topic_questions'] ?? 0,
                color: Colors.red,
              ),
              _CompositionRow(
                icon: Icons.refresh,
                label: 'Spaced repetition',
                count: mission['composition']?['review_questions'] ?? 0,
                color: Colors.blue,
              ),
              _CompositionRow(
                icon: Icons.explore,
                label: 'New topic exploration',
                count: mission['composition']?['new_topic_questions'] ?? 0,
                color: Colors.green,
              ),
              _CompositionRow(
                icon: Icons.quiz,
                label: 'Mini quiz',
                count: mission['composition']?['mini_quiz'] ?? 0,
                color: Colors.purple,
              ),
              const SizedBox(height: 24),

              // Start/Continue button
              FilledButton.icon(
                onPressed: questions.isEmpty
                    ? null
                    : () => context.push('/mission/question/${questions.first['id']}'),
                icon: const Icon(Icons.play_arrow),
                label: Text(completed == 0 ? 'Start mission' : 'Continue'),
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _CompositionRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final int count;
  final Color color;

  const _CompositionRow({
    required this.icon,
    required this.label,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(label)),
          Text(
            '$count',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ],
      ),
    );
  }
}

final todaysMissionProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final res = await api.get('/v1/missions/today');
    return res['data']?['mission'] as Map<String, dynamic>?;
  } catch (e) {
    return null;
  }
});
