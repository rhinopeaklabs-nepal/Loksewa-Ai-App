// Loksewa AI — Main App Shell with Floating Bottom Nav
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:getwidget/getwidget.dart';
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
      badgeText: 'New',
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
        height: 72,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface.withOpacity(0.92),
          borderRadius: BorderRadius.circular(24),
          boxShadow: AppTheme.elevatedShadow,
          border: Border.all(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.3),
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Row(
            children: List.generate(_navItems.length, (i) {
              return Expanded(child: _buildNavItem(i));
            }),
          ),
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
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          margin: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            gradient: isActive ? AppTheme.primaryGradient : null,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isActive ? item.activeIcon : item.icon,
                    color: isActive ? Colors.white : Theme.of(context).colorScheme.onSurfaceVariant,
                    size: 24,
                  ).animate(target: isActive ? 1 : 0).scale(begin: const Offset(1, 1), end: const Offset(1.15, 1.15), duration: 200.ms),
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
              if (item.badgeText != null)
                Positioned(
                  top: 4,
                  right: 8,
                  child: GFBadge(
                    text: item.badgeText,
                    shape: GFBadgeShape.pills,
                    color: isActive ? Colors.amber : GFColors.DANGER,
                    textStyle: const TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
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
  final String? badgeText;
  
  const _NavItemData({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.labelNe,
    required this.route,
    this.badgeText,
  });
}
