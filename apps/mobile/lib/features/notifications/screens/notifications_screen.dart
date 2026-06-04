import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/app_dialogs.dart';

class NotificationItem {
  final String id;
  final IconData icon;
  final Color color;
  final String title;
  final String message;
  final String time;
  final String category; // 'Today', 'Yesterday', 'Earlier'
  final bool unread;
  final String? route;

  NotificationItem({
    required this.id,
    required this.icon,
    required this.color,
    required this.title,
    required this.message,
    required this.time,
    required this.category,
    this.unread = false,
    this.route,
  });

  NotificationItem copyWith({
    bool? unread,
  }) {
    return NotificationItem(
      id: id,
      icon: icon,
      color: color,
      title: title,
      message: message,
      time: time,
      category: category,
      unread: unread ?? this.unread,
      route: route,
    );
  }
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ScrollController _scrollController = ScrollController();
  int _currentPage = 1;
  bool _isLoadingMore = false;
  bool _hasMore = true;

  List<NotificationItem> _notifications = [
    NotificationItem(
      id: '1',
      icon: Icons.local_fire_department_rounded,
      color: AppTheme.secondary,
      title: "Don't break your streak!",
      message: "You're on a 12-day streak. Complete today's mission to keep it going.",
      time: '2h ago',
      category: 'Today',
      unread: true,
      route: AppRoutes.mission,
    ),
    NotificationItem(
      id: '2',
      icon: Icons.bolt_rounded,
      color: AppTheme.primary,
      title: '+25 XP earned!',
      message: 'You completed "GK: World Geography" practice set.',
      time: '4h ago',
      category: 'Today',
      unread: true,
    ),
    NotificationItem(
      id: '3',
      icon: Icons.military_tech_rounded,
      color: Colors.amber,
      title: 'Badge Unlocked: Math Whiz',
      message: 'You solved 50 math problems correctly. Keep it up!',
      time: '5h ago',
      category: 'Today',
      unread: true,
      route: AppRoutes.badges,
    ),
    NotificationItem(
      id: '4',
      icon: Icons.emoji_events_rounded,
      color: Colors.purple,
      title: 'New leaderboard rank!',
      message: 'You climbed to #142 from #158 this week.',
      time: 'Yesterday',
      category: 'Yesterday',
      unread: false,
      route: AppRoutes.leaderboard,
    ),
    NotificationItem(
      id: '5',
      icon: Icons.assignment_rounded,
      color: Colors.blue,
      title: 'Weekly Mock Test Available',
      message: 'New "Kharidar Mock Test" is now available. Take it now!',
      time: 'Yesterday',
      category: 'Yesterday',
      unread: false,
      route: AppRoutes.examList,
    ),
    NotificationItem(
      id: '6',
      icon: Icons.lightbulb_rounded,
      color: Colors.orange,
      title: 'AI Suggestion',
      message: 'Practice 10 Constitution MCQs to improve your weak area.',
      time: '2 days ago',
      category: 'Earlier',
      unread: false,
      route: AppRoutes.questionPractice,
    ),
    NotificationItem(
      id: '7',
      icon: Icons.workspace_premium_rounded,
      color: AppTheme.warning,
      title: 'Special Offer: 50% off Pro',
      message: 'Upgrade to Pro and unlock all features. Limited time!',
      time: '3 days ago',
      category: 'Earlier',
      unread: false,
      route: AppRoutes.subscription,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || !_hasMore) return;
    setState(() {
      _isLoadingMore = true;
    });

    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    final nextIndex = _notifications.length + 1;
    final newItems = [
      NotificationItem(
        id: '$nextIndex',
        icon: Icons.bookmark_rounded,
        color: Colors.blueGrey,
        title: 'Study Tip: Retrieval Practice',
        message: 'Self-testing is 50% more effective than re-reading notes.',
        time: '$nextIndex days ago',
        category: 'Earlier',
        unread: false,
      ),
      NotificationItem(
        id: '${nextIndex + 1}',
        icon: Icons.forum_rounded,
        color: Colors.pink,
        title: 'AI Tutor update',
        message: 'Your discussion on Nepalese History is summarized.',
        time: '${nextIndex + 1} days ago',
        category: 'Earlier',
        unread: false,
      ),
    ];

    setState(() {
      _notifications.addAll(newItems);
      _currentPage++;
      _isLoadingMore = false;
      if (_currentPage >= 3) {
        _hasMore = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_notifications.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => context.pop(),
          ),
          title: const Text('Notifications'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.notifications_off_rounded,
                size: 64,
                color: Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.5),
              ),
              const SizedBox(height: 16),
              const Text(
                'No notifications',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 4),
              Text(
                'We will notify you when something updates!',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      );
    }

    final hasUnread = _notifications.any((n) => n.unread);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Notifications'),
        actions: [
          if (hasUnread)
            TextButton(
              onPressed: () {
                setState(() {
                  _notifications = _notifications.map((n) => n.copyWith(unread: false)).toList();
                });
                GFToast.showToast(
                  'All marked as read',
                  context,
                  toastPosition: GFToastPosition.BOTTOM,
                  backgroundColor: Colors.green,
                );
              },
              child: const Text('Mark all read'),
            ),
          IconButton(
            icon: const Icon(Icons.delete_sweep_rounded),
            tooltip: 'Clear all',
            onPressed: () async {
              final ok = await ConfirmDialog.show(
                context,
                title: 'Clear All?',
                message: 'Are you sure you want to clear all notifications?',
                confirmText: 'Clear',
                isDestructive: true,
              );
              if (ok) {
                setState(() {
                  _notifications.clear();
                });
                if (mounted) {
                  GFToast.showToast(
                    'Notifications cleared',
                    context,
                    toastPosition: GFToastPosition.BOTTOM,
                  );
                }
              }
            },
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            setState(() {
              _currentPage = 1;
              _hasMore = true;
              _notifications = _notifications.sublist(0, 7); // Reset to initial
            });
            await Future.delayed(const Duration(milliseconds: 500));
          },
          child: ListView(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
            children: [
              ..._buildNotificationList(),
              if (_isLoadingMore)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  child: Center(child: CircularProgressIndicator()),
                ),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _buildNotificationList() {
    List<Widget> children = [];
    final categories = ['Today', 'Yesterday', 'Earlier'];

    for (final category in categories) {
      final categoryItems = _notifications.where((n) => n.category == category).toList();
      if (categoryItems.isEmpty) continue;

      children.add(
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
          child: Text(
            category.toUpperCase(),
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
        ),
      );

      for (final item in categoryItems) {
        children.add(
          Dismissible(
            key: Key(item.id),
            direction: DismissDirection.endToStart,
            background: Container(
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.only(right: 20),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.delete_rounded, color: Colors.white),
            ),
            onDismissed: (direction) {
              setState(() {
                _notifications.removeWhere((n) => n.id == item.id);
              });
              GFToast.showToast(
                'Notification dismissed',
                context,
                toastPosition: GFToastPosition.BOTTOM,
              );
            },
            child: _buildNotificationCard(context, item),
          ),
        );
      }
    }

    return children;
  }

  Widget _buildNotificationCard(BuildContext context, NotificationItem item) {
    final color = item.color;
    final unread = item.unread;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (item.unread) {
              setState(() {
                final index = _notifications.indexWhere((n) => n.id == item.id);
                if (index != -1) {
                  _notifications[index] = _notifications[index].copyWith(unread: false);
                }
              });
            }
            if (item.route != null) {
              context.push(item.route!);
            }
          },
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: unread
                  ? color.withOpacity(0.05)
                  : Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: unread ? color.withOpacity(0.3) : Theme.of(context).colorScheme.outline,
                width: unread ? 1.5 : 1,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(item.icon, color: color, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              item.title,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ),
                          if (unread)
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: color,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.message,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(height: 1.4),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        item.time,
                        style: TextStyle(
                          color: color,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.05);
  }
}
