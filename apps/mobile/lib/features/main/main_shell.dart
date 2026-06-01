// Loksewa AI — Main App Shell with Floating Bottom Nav
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../app/router.dart';
import '../../app/theme.dart';

class MainShell extends StatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final _navItems = const [
    _NavItemData(
      icon: Icons.home_rounded,
      activeIcon: Icons.home_rounded,
      label: 'Home',
      labelNe: 'गृह',
      route: AppRoutes.home,
    ),
    _NavItemData(
      icon: Icons.flag_rounded,
      activeIcon: Icons.flag_rounded,
      label: 'Mission',
      labelNe: 'मिशन',
      route: AppRoutes.mission,
    ),
    _NavItemData(
      icon: Icons.assignment_rounded,
      activeIcon: Icons.assignment_rounded,
      label: 'Exams',
      labelNe: 'परीक्षा',
      route: AppRoutes.examList,
    ),
    _NavItemData(
      icon: Icons.emoji_events_rounded,
      activeIcon: Icons.emoji_events_rounded,
      label: 'Ranking',
      labelNe: 'वरियता',
      route: AppRoutes.leaderboard,
    ),
    _NavItemData(
      icon: Icons.person_rounded,
      activeIcon: Icons.person_rounded,
      label: 'Profile',
      labelNe: 'प्रोफाइल',
      route: AppRoutes.profile,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final index = _navItems.indexWhere((e) => e.route == location);
    if (index >= 0 && index != _currentIndex) {
      _currentIndex = index;
    }

    return Scaffold(
      body: widget.child,
      extendBody: true,
      bottomNavigationBar: _buildFloatingNav(),
    );
  }

  Widget _buildFloatingNav() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Container(
        height: 68,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(24),
          boxShadow: AppTheme.elevatedShadow,
          border: Border.all(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
          ),
        ),
        child: Row(
          children: List.generate(_navItems.length, (i) {
            return Expanded(child: _buildNavItem(i));
          }),
        ),
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.5, duration: 400.ms);
  }

  Widget _buildNavItem(int index) {
    final isActive = _currentIndex == index;
    final item = _navItems[index];
    return InkWell(
      onTap: () {
        if (!isActive) {
          setState(() => _currentIndex = index);
          context.go(item.route);
        }
      },
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: AppTheme.normal,
        curve: Curves.easeOutCubic,
        margin: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          gradient: isActive ? AppTheme.primaryGradient : null,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isActive ? item.activeIcon : item.icon,
              color: isActive ? Colors.white : Theme.of(context).colorScheme.onSurfaceVariant,
              size: 22,
            ),
            const SizedBox(height: 2),
            Text(
              item.label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive
                    ? Colors.white
                    : Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItemData {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String labelNe;
  final String route;
  const _NavItemData({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.labelNe,
    required this.route,
  });
}
