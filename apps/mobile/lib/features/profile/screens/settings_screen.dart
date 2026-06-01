// Settings Screen
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/app_dialogs.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = false;
  bool _notifications = true;
  bool _soundEffects = true;
  bool _vibration = true;
  bool _biometric = false;
  String _language = 'English';
  String _examTarget = 'Nayab Subba';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Settings'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          children: [
            _buildSection(
              context,
              title: 'Preferences',
              children: [
                _buildSwitchTile(
                  context,
                  icon: Icons.dark_mode,
                  color: AppTheme.tertiary,
                  title: 'Dark Mode',
                  subtitle: 'Use dark theme',
                  value: _darkMode,
                  onChanged: (v) => setState(() => _darkMode = v),
                ),
                _divider(context),
                _buildNavigationTile(
                  context,
                  icon: Icons.language,
                  color: Colors.blue,
                  title: 'Language',
                  trailing: _language,
                  onTap: () => InfoBottomSheet.show(
                    context,
                    title: 'Language',
                    message: 'Choose your preferred language for the app.',
                    actionText: 'OK',
                    onAction: () {},
                  ),
                ),
                _divider(context),
                _buildNavigationTile(
                  context,
                  icon: Icons.school,
                  color: AppTheme.primary,
                  title: 'Exam Target',
                  trailing: _examTarget,
                  onTap: () => InfoBottomSheet.show(
                    context,
                    title: 'Exam Target',
                    message: 'Change which exam you are preparing for.',
                    actionText: 'OK',
                    onAction: () {},
                  ),
                ),
              ],
            ).animate().fadeIn(duration: 400.ms),
            const SizedBox(height: 16),
            _buildSection(
              context,
              title: 'Notifications',
              children: [
                _buildSwitchTile(
                  context,
                  icon: Icons.notifications,
                  color: AppTheme.secondary,
                  title: 'Push Notifications',
                  subtitle: 'Receive daily reminders',
                  value: _notifications,
                  onChanged: (v) => setState(() => _notifications = v),
                ),
                _divider(context),
                _buildSwitchTile(
                  context,
                  icon: Icons.volume_up,
                  color: Colors.purple,
                  title: 'Sound Effects',
                  subtitle: 'Play sounds on actions',
                  value: _soundEffects,
                  onChanged: (v) => setState(() => _soundEffects = v),
                ),
                _divider(context),
                _buildSwitchTile(
                  context,
                  icon: Icons.vibration,
                  color: AppTheme.warning,
                  title: 'Vibration',
                  subtitle: 'Haptic feedback',
                  value: _vibration,
                  onChanged: (v) => setState(() => _vibration = v),
                ),
              ],
            ).animate(delay: 100.ms).fadeIn(duration: 400.ms),
            const SizedBox(height: 16),
            _buildSection(
              context,
              title: 'Security',
              children: [
                _buildSwitchTile(
                  context,
                  icon: Icons.fingerprint,
                  color: Colors.indigo,
                  title: 'Biometric Login',
                  subtitle: 'Use fingerprint / Face ID',
                  value: _biometric,
                  onChanged: (v) => setState(() => _biometric = v),
                ),
                _divider(context),
                _buildNavigationTile(
                  context,
                  icon: Icons.lock_reset,
                  color: Colors.red,
                  title: 'Change Password',
                  onTap: () => context.push(AppRoutes.forgotPassword),
                ),
              ],
            ).animate(delay: 200.ms).fadeIn(duration: 400.ms),
            const SizedBox(height: 16),
            _buildSection(
              context,
              title: 'Account',
              children: [
                _buildNavigationTile(
                  context,
                  icon: Icons.workspace_premium,
                  color: AppTheme.warning,
                  title: 'Subscription',
                  trailing: 'Free',
                  onTap: () => context.push(AppRoutes.subscription),
                ),
                _divider(context),
                _buildNavigationTile(
                  context,
                  icon: Icons.download,
                  color: Colors.teal,
                  title: 'Download Data',
                  onTap: () {
                    SuccessDialog.show(
                      context,
                      title: 'Request received',
                      message: 'Your data export will be emailed within 24 hours.',
                      onContinue: () {},
                    );
                  },
                ),
                _divider(context),
                _buildNavigationTile(
                  context,
                  icon: Icons.delete_forever,
                  color: AppTheme.error,
                  title: 'Delete Account',
                  isDestructive: true,
                  onTap: () async {
                    final ok = await ConfirmDialog.show(
                      context,
                      title: 'Delete Account?',
                      message: 'This action is permanent. All your data will be erased.',
                      confirmText: 'Delete',
                      isDestructive: true,
                    );
                    if (ok && context.mounted) {
                      SuccessDialog.show(
                        context,
                        title: 'Account Deleted',
                        message: 'Your account has been deleted.',
                        onContinue: () => context.go(AppRoutes.welcome),
                      );
                    }
                  },
                ),
              ],
            ).animate(delay: 300.ms).fadeIn(duration: 400.ms),
            const SizedBox(height: 16),
            Center(
              child: Text(
                'Loksewa AI v1.0.0',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ).animate(delay: 400.ms).fadeIn(duration: 400.ms),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context, {required String title, required List<Widget> children}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 0, 4, 8),
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Theme.of(context).colorScheme.outline),
          ),
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildSwitchTile(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                const SizedBox(height: 2),
                Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppTheme.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationTile(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    String? trailing,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    final titleColor = isDestructive ? AppTheme.error : Theme.of(context).colorScheme.onSurface;
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isDestructive ? AppTheme.error.withOpacity(0.1) : color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: isDestructive ? AppTheme.error : color, size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          color: titleColor,
          fontWeight: FontWeight.w700,
          fontSize: 14,
        ),
      ),
      trailing: trailing != null
          ? Text(
              trailing,
              style: Theme.of(context).textTheme.bodySmall,
            )
          : const Icon(Icons.chevron_right, size: 20),
    );
  }

  Widget _divider(BuildContext context) {
    return Divider(
      height: 1,
      indent: 70,
      color: Theme.of(context).colorScheme.outline,
    );
  }
}
