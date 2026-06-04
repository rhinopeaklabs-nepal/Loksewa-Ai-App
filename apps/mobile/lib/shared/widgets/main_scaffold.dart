// Loksewa AI — Reusable Screen Scaffold with GFAppBar and GFDrawer
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../providers/connectivity_provider.dart';

class MainScaffold extends ConsumerWidget {
  final String? title;
  final Widget body;
  final List<Widget>? actions;
  final bool showDrawer;
  final Widget? drawer;
  final bool showBackButton;
  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;
  final FloatingActionButtonLocation? floatingActionButtonLocation;

  const MainScaffold({
    super.key,
    this.title,
    required this.body,
    this.actions,
    this.showDrawer = false,
    this.drawer,
    this.showBackButton = true,
    this.bottomNavigationBar,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canPop = Navigator.of(context).canPop();

    return Scaffold(
      appBar: title != null
          ? GFAppBar(
              title: Text(
                title!,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Colors.white,
                ),
              ),
              backgroundColor: AppTheme.primary,
              leading: showBackButton && canPop
                  ? IconButton(
                      icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                      onPressed: () => context.pop(),
                    )
                  : (showDrawer
                      ? Builder(
                          builder: (context) => IconButton(
                            icon: const Icon(Icons.menu_rounded, color: Colors.white),
                            onPressed: () => Scaffold.of(context).openDrawer(),
                          ),
                        )
                      : null),
              actions: actions,
            )
          : null,
      drawer: showDrawer
          ? (drawer ??
              GFDrawer(
                color: Theme.of(context).colorScheme.surface,
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    GFDrawerHeader(
                      currentAccountPicture: const GFAvatar(
                        backgroundColor: AppTheme.primaryContainer,
                        child: Icon(Icons.person, color: Colors.white),
                      ),
                      decoration: const BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Loksewa AI Learner',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Smart Preparation',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ListTile(
                      leading: const Icon(Icons.dashboard_rounded),
                      title: const Text('Home'),
                      onTap: () {
                        context.go('/home');
                        Navigator.of(context).pop();
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.flag_rounded),
                      title: const Text('Missions'),
                      onTap: () {
                        context.go('/mission');
                        Navigator.of(context).pop();
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.assignment_rounded),
                      title: const Text('Exams'),
                      onTap: () {
                        context.go('/exam');
                        Navigator.of(context).pop();
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.leaderboard_rounded),
                      title: const Text('Leaderboard'),
                      onTap: () {
                        context.go('/leaderboard');
                        Navigator.of(context).pop();
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.person_rounded),
                      title: const Text('Profile'),
                      onTap: () {
                        context.go('/profile');
                        Navigator.of(context).pop();
                      },
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.settings_rounded),
                      title: const Text('Settings'),
                      onTap: () {
                        context.push('/profile/settings');
                        Navigator.of(context).pop();
                      },
                    ),
                  ],
                ),
              ))
          : null,
      body: Stack(
        children: [
          body,
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: _ConnectivityBanner(),
          ),
        ],
      ),
      bottomNavigationBar: bottomNavigationBar,
      floatingActionButton: floatingActionButton,
      floatingActionButtonLocation: floatingActionButtonLocation,
    );
  }
}

class _ConnectivityBanner extends ConsumerWidget {
  const _ConnectivityBanner();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(connectivityStatusProvider);
    final isDisconnected = status == ConnectivityState.disconnected;
    final isRestored = status == ConnectivityState.restored;
    final isVisible = isDisconnected || isRestored;

    return AnimatedSlide(
      offset: isVisible ? Offset.zero : const Offset(0, -1.2),
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeInOut,
      child: IgnorePointer(
        ignoring: !isVisible,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          color: isDisconnected ? AppTheme.getGFDanger(context) : AppTheme.getGFSuccess(context),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isDisconnected ? Icons.wifi_off_rounded : Icons.wifi_rounded,
                color: Colors.white,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                isDisconnected
                    ? 'No internet connection. Operating offline.'
                    : 'Back online!',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

