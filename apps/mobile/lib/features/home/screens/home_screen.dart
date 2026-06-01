// Loksewa AI — Home screen with daily mission summary
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/services/api_client.dart';
import '../../../shared/widgets/streak_widget.dart';
import '../../../shared/widgets/xp_widget.dart';
import '../../../shared/widgets/mission_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.watch(apiClientProvider);
    final user = ref.watch(currentUserProvider);
    final mission = ref.watch(todaysMissionProvider);
    final streak = ref.watch(streakProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Loksewa AI'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(todaysMissionProvider);
          ref.invalidate(streakProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Greeting
            Text(
              'नमस्ते ${user.value?.full_name ?? "Student"} 🙏',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'तपाईंको आजको मिसन तयार छ।',
              style: TextStyle(color: Colors.grey.shade600),
            ),
            const SizedBox(height: 24),

            // XP + Streak row
            Row(
              children: [
                Expanded(child: XPWidget(totalXP: 0, level: 1)),
                const SizedBox(width: 12),
                Expanded(child: StreakWidget(streak: streak.value?.currentStreak ?? 0)),
              ],
            ),
            const SizedBox(height: 24),

            // Today's mission card
            mission.when(
              data: (m) => MissionCard(mission: m),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text('Failed to load mission: $e'),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Quick actions
            Text('Quick actions', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: [
                _ActionCard(
                  icon: Icons.camera_alt,
                  label: 'Quick Scan',
                  color: Colors.blue,
                  onTap: () => context.push('/scan'),
                ),
                _ActionCard(
                  icon: Icons.assignment,
                  label: 'Mock Exam',
                  color: Colors.purple,
                  onTap: () => context.go('/exam'),
                ),
                _ActionCard(
                  icon: Icons.chat_bubble,
                  label: 'AI Tutor',
                  color: Colors.orange,
                  onTap: () => context.go('/chat'),
                ),
                _ActionCard(
                  icon: Icons.emoji_events,
                  label: 'Leaderboard',
                  color: Colors.amber,
                  onTap: () => context.go('/leaderboard'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionCard({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}

// Providers
final currentUserProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final res = await api.get('/v1/users/me');
    return res['data']?['user'] as Map<String, dynamic>?;
  } catch (e) {
    return null;
  }
});

final todaysMissionProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final res = await api.get('/v1/missions/today');
    return res['data']?['mission'] as Map<String, dynamic>?;
  } catch (e) {
    return null;
  }
});

final streakProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final res = await api.get('/v1/users/me/streak');
    return res['data']?['streak'] as Map<String, dynamic>?;
  } catch (e) {
    return null;
  }
});
