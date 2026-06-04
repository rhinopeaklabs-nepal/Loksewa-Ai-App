// Leaderboard Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/widgets/section_header.dart';

class LeaderboardScreen extends ConsumerWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: DefaultTabController(
          length: 4,
          child: NestedScrollView(
            headerSliverBuilder: (context, innerBoxIsScrolled) => [
              SliverToBoxAdapter(child: _buildHeader(context)),
              SliverToBoxAdapter(child: _buildPodium(context)),
              SliverToBoxAdapter(child: _buildYourRank(context)),
              SliverPersistentHeader(
                pinned: true,
                delegate: _TabBarDelegate(
                  TabBar(
                    isScrollable: true,
                    tabAlignment: TabAlignment.start,
                    tabs: const [
                      Tab(text: 'National'),
                      Tab(text: 'District'),
                      Tab(text: 'Subject'),
                      Tab(text: 'Friends'),
                    ],
                  ),
                ),
              ),
            ],
            body: TabBarView(
              children: [
                _buildList(context),
                _buildList(context),
                _buildList(context),
                _buildList(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
      child: Row(
        children: [
          IconButton(
            onPressed: () => context.pop(),
            icon: const Icon(Icons.arrow_back_rounded),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Leaderboard',
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.timer, size: 14, color: AppTheme.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      'Resets in 4 days',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.tertiaryContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.calendar_today, size: 12, color: AppTheme.tertiary),
                SizedBox(width: 4),
                Text(
                  'This Week',
                  style: TextStyle(
                    color: AppTheme.tertiary,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPodium(BuildContext context) {
    final p1 = {'name': 'Sita K.', 'xp': '3,420', 'avatar': 'S', 'color': Colors.amber};
    final p2 = {'name': 'Hari P.', 'xp': '3,180', 'avatar': 'H', 'color': Colors.blueGrey};
    final p3 = {'name': 'Anish M.', 'xp': '2,980', 'avatar': 'A', 'color': Colors.brown};

    return Container(
      height: 220,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          // P2 (left)
          Positioned(
            left: 0,
            bottom: 0,
            child: _podiumItem(context, p2, 2, 80, Colors.blueGrey),
          ),
          // P1 (center)
          Positioned(
            child: _podiumItem(context, p1, 1, 120, Colors.amber),
          ),
          // P3 (right)
          Positioned(
            right: 0,
            bottom: 0,
            child: _podiumItem(context, p3, 3, 60, Colors.brown),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.2);
  }

  Widget _podiumItem(BuildContext context, Map<String, dynamic> p, int rank, double height, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GFAvatar(
          size: GFSize.LARGE,
          backgroundColor: color,
          child: Center(
            child: Text(
              p['avatar'] as String,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          p['name'] as String,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
        ),
        Text(
          '${p['xp']} XP',
          style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 12),
        ),
        const SizedBox(height: 8),
        Container(
          width: 80,
          height: height,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [color.withOpacity(0.7), color],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
          ),
          alignment: Alignment.topCenter,
          padding: const EdgeInsets.only(top: 12),
          child: Text(
            '$rank',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildYourRank(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 20, 20, 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppTheme.primaryShadow,
      ),
      child: Row(
        children: [
          const GFAvatar(
            backgroundColor: Colors.white,
            child: Center(
              child: Text('R', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w800, fontSize: 18)),
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Rank',
                  style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                ),
                SizedBox(height: 2),
                Text(
                  '#142 • Ram Bahadur',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
          GFBadge(
            text: '2,950 XP',
            color: GFColors.LIGHT,
            shape: GFBadgeShape.standard,
            textStyle: const TextStyle(
              color: AppTheme.primary,
              fontWeight: FontWeight.w800,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildList(BuildContext context) {
    final ranks = List.generate(20, (i) => i + 4);
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
      itemCount: ranks.length,
      itemBuilder: (context, i) {
        final rank = ranks[i];
        final names = ['Bikash', 'Sushma', 'Ramesh', 'Gita', 'Krishna', 'Maya', 'Shyam', 'Laxmi', 'Hari', 'Sita'];
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Theme.of(context).colorScheme.outline),
            ),
            child: GFListTile(
              margin: EdgeInsets.zero,
              padding: const EdgeInsets.all(8),
              avatar: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 32,
                    child: Text(
                      '#$rank',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),
                  GFAvatar(
                    backgroundColor: _colorFromRank(rank),
                    child: Text(
                      names[i % names.length].substring(0, 1),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
              title: Text(
                names[i % names.length],
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subTitle: Text(
                'Level ${10 - (rank ~/ 4)}',
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
              ),
              icon: GFBadge(
                text: '${3000 - (rank * 30)} XP',
                color: GFColors.SECONDARY,
                shape: GFBadgeShape.standard,
              ),
            ),
          ),
        ).animate(delay: (40 * i).ms).fadeIn(duration: 300.ms).slideX(begin: 0.1);
      },
    );
  }

  Color _colorFromRank(int rank) {
    if (rank <= 10) return Colors.amber;
    if (rank <= 20) return Colors.blue;
    return Colors.teal;
  }
}

class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  _TabBarDelegate(this.tabBar);

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: tabBar,
    );
  }

  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  double get minExtent => tabBar.preferredSize.height;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => false;
}
