// App Dialogs using GetWidget
import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:getwidget/getwidget.dart';

import '../../app/theme.dart';

// ========== Welcome Result Dialog ==========
class WelcomeResultDialog extends StatefulWidget {
  final String? title;
  final String? message;
  final int score;
  final VoidCallback onContinue;
  const WelcomeResultDialog({
    super.key,
    this.title,
    this.message,
    required this.score,
    required this.onContinue,
  });

  static Future<void> show(
    BuildContext context, {
    String? title,
    String? message,
    required int score,
    required VoidCallback onContinue,
  }) {
    return showGeneralDialog(
      context: context,
      barrierDismissible: false,
      barrierLabel: 'dialog',
      barrierColor: Colors.black.withOpacity(0.5),
      transitionDuration: AppTheme.normal,
      pageBuilder: (_, __, ___) => WelcomeResultDialog(
        title: title,
        message: message,
        score: score,
        onContinue: onContinue,
      ),
      transitionBuilder: (_, anim, __, child) {
        return FadeTransition(
          opacity: anim,
          child: ScaleTransition(
            scale: Tween(begin: 0.8, end: 1.0).animate(
              CurvedAnimation(parent: anim, curve: Curves.easeOutBack),
            ),
            child: child,
          ),
        );
      },
    );
  }

  @override
  State<WelcomeResultDialog> createState() => _WelcomeResultDialogState();
}

class _WelcomeResultDialogState extends State<WelcomeResultDialog> {
  late final ConfettiController _confetti;

  @override
  void initState() {
    super.initState();
    _confetti = ConfettiController(duration: const Duration(seconds: 2));
    if (widget.score >= 60) {
      _confetti.play();
    }
  }

  @override
  void dispose() {
    _confetti.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final passed = widget.score >= 60;
    return Stack(
      children: [
        // Confetti
        Align(
          alignment: Alignment.topCenter,
          child: ConfettiWidget(
            confettiController: _confetti,
            blastDirection: 1.5,
            blastDirectionality: BlastDirectionality.explosive,
            shouldLoop: false,
            numberOfParticles: 20,
            maxBlastForce: 20,
            minBlastForce: 8,
            gravity: 0.3,
            colors: const [
              AppTheme.primary,
              AppTheme.secondary,
              Colors.amber,
              Colors.purple,
              Colors.blue,
            ],
          ),
        ),
        Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Material(
              color: Colors.transparent,
              child: GFAlert(
                type: GFAlertType.rounded,
                alignment: Alignment.center,
                width: MediaQuery.of(context).size.width * 0.9,
                backgroundColor: Theme.of(context).colorScheme.surface,
                title: widget.title ?? (passed ? 'Great start!' : 'Keep going!'),
                titleTextStyle: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ) ?? const TextStyle(),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        gradient: passed ? AppTheme.primaryGradient : null,
                        color: passed ? null : Colors.grey,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        passed ? Icons.celebration_rounded : Icons.school_rounded,
                        size: 56,
                        color: Colors.white,
                      ),
                    ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
                    const SizedBox(height: 20),
                    Text(
                      widget.message ??
                          (passed
                              ? 'You scored ${widget.score}% on the assessment.\nWe\'ll tailor your daily missions.'
                              : 'Don\'t worry! We\'ll start you with easier questions.'),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                            height: 1.5,
                          ),
                    ),
                  ],
                ),
                bottomBar: SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: GFButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      widget.onContinue();
                    },
                    text: 'Let\'s Go',
                    color: AppTheme.primary,
                    shape: GFButtonShape.pills,
                    blockButton: true,
                    textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ========== Success Dialog ==========
class SuccessDialog {
  static Future<void> show(
    BuildContext context, {
    required String title,
    required String message,
    String actionText = 'Continue',
    required VoidCallback onContinue,
  }) {
    return showDialog(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.transparent,
        child: GFAlert(
          type: GFAlertType.rounded,
          title: title,
          titleTextStyle: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ) ?? const TextStyle(),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                  color: AppTheme.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  size: 40,
                  color: AppTheme.primary,
                ),
              ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
              const SizedBox(height: 16),
              Text(
                message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ),
          bottomBar: SizedBox(
            width: double.infinity,
            height: 48,
            child: GFButton(
              onPressed: () {
                Navigator.of(context).pop();
                onContinue();
              },
              text: actionText,
              color: AppTheme.primary,
              shape: GFButtonShape.pills,
              blockButton: true,
            ),
          ),
        ),
      ),
    );
  }
}

// ========== Confirm Dialog ==========
class ConfirmDialog {
  static Future<bool> show(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
    Color? confirmColor,
    bool isDestructive = false,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.transparent,
        child: GFAlert(
          type: GFAlertType.rounded,
          title: title,
          titleTextStyle: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ) ?? const TextStyle(),
          content: Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          bottomBar: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GFButton(
                onPressed: () => Navigator.of(context).pop(false),
                text: cancelText,
                type: GFButtonType.transparent,
                textColor: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(width: 8),
              GFButton(
                onPressed: () => Navigator.of(context).pop(true),
                text: confirmText,
                color: isDestructive ? AppTheme.error : (confirmColor ?? AppTheme.primary),
                shape: GFButtonShape.pills,
              ),
            ],
          ),
        ),
      ),
    );
    return result ?? false;
  }
}

// ========== Streak Reminder Dialog ==========
class StreakReminderDialog {
  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.transparent,
        child: GFAlert(
          type: GFAlertType.rounded,
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  gradient: AppTheme.secondaryGradient,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.local_fire_department_rounded,
                  size: 50,
                  color: Colors.white,
                ),
              ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
              const SizedBox(height: 20),
              Text(
                'Don\'t break the streak!',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'You\'re on a 5-day streak! Complete today\'s mission to keep it going.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ),
          bottomBar: SizedBox(
            width: double.infinity,
            height: 52,
            child: GFButton(
              onPressed: () => Navigator.of(context).pop(),
              text: 'Start Mission',
              color: AppTheme.secondary,
              shape: GFButtonShape.pills,
              blockButton: true,
              textStyle: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ),
    );
  }
}

// ========== Badge Earned Dialog ==========
class BadgeEarnedDialog {
  static Future<void> show(
    BuildContext context, {
    required String badgeName,
    required String description,
    required IconData icon,
    required Color color,
  }) {
    return showDialog(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.transparent,
        child: GFAlert(
          type: GFAlertType.rounded,
          title: '🎉 Badge Unlocked!',
          titleTextStyle: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppTheme.secondary,
                fontWeight: FontWeight.w700,
              ) ?? const TextStyle(),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 16),
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: color, width: 3),
                ),
                child: Icon(icon, size: 56, color: color),
              ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
              const SizedBox(height: 20),
              Text(
                badgeName,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                description,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ),
          bottomBar: SizedBox(
            width: double.infinity,
            height: 52,
            child: GFButton(
              onPressed: () => Navigator.of(context).pop(),
              text: 'Awesome!',
              color: color,
              shape: GFButtonShape.pills,
              blockButton: true,
              textStyle: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ),
    );
  }
}

// ========== Level Up Dialog ==========
class LevelUpDialog {
  static Future<void> show(
    BuildContext context, {
    required int newLevel,
    required String title,
  }) {
    return showDialog(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.transparent,
        child: GFAlert(
          type: GFAlertType.rounded,
          title: '⭐ Level Up!',
          titleTextStyle: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppTheme.secondary,
                fontWeight: FontWeight.w700,
              ) ?? const TextStyle(),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 16),
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      gradient: AppTheme.secondaryGradient,
                      shape: BoxShape.circle,
                    ),
                  )
                      .animate(onPlay: (c) => c.repeat(reverse: true))
                      .scale(
                        duration: 1000.ms,
                        begin: const Offset(1, 1),
                        end: const Offset(1.05, 1.05),
                      ),
                  Text(
                    '$newLevel',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 56,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                title,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'You\'ve unlocked new perks and badges!',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ),
          bottomBar: SizedBox(
            width: double.infinity,
            height: 52,
            child: GFButton(
              onPressed: () => Navigator.of(context).pop(),
              text: 'Keep Going',
              color: AppTheme.secondary,
              shape: GFButtonShape.pills,
              blockButton: true,
              textStyle: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ),
    );
  }
}

// ========== Info Bottom Sheet ==========
class InfoBottomSheet {
  static Future<void> show(
    BuildContext context, {
    required String title,
    required String message,
    String? actionText,
    VoidCallback? onAction,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.outline,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    height: 1.5,
                  ),
            ),
            if (actionText != null && onAction != null) ...[
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: GFButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    onAction();
                  },
                  text: actionText,
                  color: AppTheme.primary,
                  shape: GFButtonShape.pills,
                  blockButton: true,
                  textStyle: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ],
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
