import 'package:flutter/material.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme.dart';

class LoksewaPage extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget child;
  final List<Widget> actions;
  final bool showBack;
  final bool bottomSafeArea;

  const LoksewaPage({
    super.key,
    required this.title,
    this.subtitle,
    required this.child,
    this.actions = const [],
    this.showBack = false,
    this.bottomSafeArea = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: bottomSafeArea,
        child: LayoutBuilder(
          builder: (context, constraints) {
            final horizontal = constraints.maxWidth < 390 ? 20.0 : 24.0;
            return CustomScrollView(
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              slivers: [
                SliverToBoxAdapter(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 560),
                      child: Padding(
                        padding: EdgeInsets.fromLTRB(horizontal, 22, horizontal, 18),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (showBack) ...[
                              _RoundIconButton(
                                icon: Icons.arrow_back_rounded,
                                onTap: () => context.pop(),
                              ),
                              const SizedBox(width: 12),
                            ],
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(title, style: Theme.of(context).textTheme.headlineLarge),
                                  if (subtitle != null) ...[
                                    const SizedBox(height: 6),
                                    Text(
                                      subtitle!,
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                                          ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            ...actions,
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                SliverPadding(
                  padding: EdgeInsets.fromLTRB(horizontal, 0, horizontal, 32),
                  sliver: SliverToBoxAdapter(
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 560),
                        child: child,
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class LoksewaSurface extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;
  final Gradient? gradient;
  final VoidCallback? onTap;

  const LoksewaSurface({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(18),
    this.color,
    this.gradient,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(AppTheme.radius18);
    final content = Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: gradient == null ? (color ?? Theme.of(context).colorScheme.surface) : null,
        gradient: gradient,
        borderRadius: radius,
        border: Border.all(
          color: gradient == null
              ? Theme.of(context).colorScheme.outline
              : Colors.transparent,
        ),
        boxShadow: gradient == null ? null : AppTheme.shadow(color: Colors.black.withOpacity(0.14)),
      ),
      child: child,
    );
    if (onTap == null) return content;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: radius,
        child: content,
      ),
    );
  }
}

class LoksewaButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool secondary;
  final bool loading;
  final Color? color;

  const LoksewaButton({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.secondary = false,
    this.loading = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = color ?? Theme.of(context).colorScheme.primary;
    final onButtonColor = buttonColor == AppTheme.paper
        ? AppTheme.primary
        : Theme.of(context).colorScheme.onPrimary;
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: GFButton(
        onPressed: loading ? null : onPressed,
        text: loading ? 'Please wait' : text,
        icon: loading
            ? SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: secondary ? buttonColor : onButtonColor,
                ),
              )
            : icon == null
                ? null
                : Icon(icon, size: 18, color: secondary ? buttonColor : onButtonColor),
        size: GFSize.LARGE,
        type: secondary ? GFButtonType.outline : GFButtonType.solid,
        shape: GFButtonShape.pills,
        blockButton: true,
        color: buttonColor,
        textColor: secondary ? buttonColor : onButtonColor,
        textStyle: const TextStyle(
          fontWeight: FontWeight.w800,
          fontSize: 14,
          height: 1.1,
          letterSpacing: 0,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 18),
      ),
    );
  }
}

class LoksewaMetric extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final String? caption;

  const LoksewaMetric({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    this.caption,
  });

  @override
  Widget build(BuildContext context) {
    return LoksewaSurface(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GFAvatar(
            radius: 18,
            backgroundColor: color.withOpacity(0.13),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(height: 16),
          Text(value, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 3),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          if (caption != null) ...[
            const SizedBox(height: 6),
            Text(
              caption!,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(color: color),
            ),
          ],
        ],
      ),
    );
  }
}

class LoksewaProgress extends StatelessWidget {
  final double value;
  final Color? color;
  final double height;

  const LoksewaProgress({
    super.key,
    required this.value,
    this.color,
    this.height = 9,
  });

  @override
  Widget build(BuildContext context) {
    final clamped = value.clamp(0.0, 1.0);
    final progressColor = color ?? Theme.of(context).colorScheme.primary;
    return GFProgressBar(
      percentage: clamped,
      lineHeight: height,
      animation: true,
      animationDuration: 600,
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
      progressBarColor: progressColor,
      padding: EdgeInsets.zero,
    );
  }
}

class LoksewaBadge extends StatelessWidget {
  final String text;
  final Color color;

  const LoksewaBadge({
    super.key,
    required this.text,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(AppTheme.radius12),
        border: Border.all(color: color.withOpacity(0.22)),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w800,
            ),
      ),
    );
  }
}

class LoksewaEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? actionText;
  final VoidCallback? onAction;

  const LoksewaEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionText,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return LoksewaSurface(
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          GFAvatar(
            radius: 24,
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            child: Icon(icon, size: 22, color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(height: 16),
          Text(title, style: Theme.of(context).textTheme.titleMedium, textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
            textAlign: TextAlign.center,
          ),
          if (actionText != null && onAction != null) ...[
            const SizedBox(height: 22),
            LoksewaButton(text: actionText!, onPressed: onAction),
          ],
        ],
      ),
    );
  }
}

class LoksewaErrorState extends StatelessWidget {
  final Object error;
  final VoidCallback? onRetry;

  const LoksewaErrorState({
    super.key,
    required this.error,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return LoksewaEmptyState(
      icon: Icons.cloud_off_rounded,
      title: 'Backend is not reachable',
      message: error.toString(),
      actionText: onRetry == null ? null : 'Retry',
      onAction: onRetry,
    );
  }
}

class LoksewaLoading extends StatelessWidget {
  final String? message;

  const LoksewaLoading({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return LoksewaSurface(
      child: Row(
        children: [
          GFLoader(type: GFLoaderType.circle),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              message ?? 'Loading backend data',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  final String title;
  final String? action;
  final VoidCallback? onAction;

  const SectionTitle({
    super.key,
    required this.title,
    this.action,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 24, bottom: 10),
      child: Row(
        children: [
          Expanded(child: Text(title, style: Theme.of(context).textTheme.titleMedium)),
          if (action != null)
            TextButton(
              onPressed: onAction,
              child: Text(action!),
            ),
        ],
      ),
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _RoundIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).colorScheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.radius14),
        side: BorderSide(color: Theme.of(context).colorScheme.outline),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppTheme.radius14),
        child: SizedBox(
          width: 44,
          height: 44,
          child: Icon(icon, size: 21),
        ),
      ),
    );
  }
}

Color colorFromHex(String? value, [Color fallback = AppTheme.primary]) {
  if (value == null || value.isEmpty) return fallback;
  final buffer = value.replaceAll('#', '').trim();
  if (buffer.length != 6) return fallback;
  final parsed = int.tryParse('FF$buffer', radix: 16);
  return parsed == null ? fallback : Color(parsed);
}

String labelOf(Map<String, dynamic> item, List<String> keys, [String fallback = 'Untitled']) {
  for (final key in keys) {
    final value = item[key];
    if (value != null && value.toString().trim().isNotEmpty) return value.toString();
  }
  return fallback;
}
