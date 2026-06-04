// Gradient Background Widget with Animation support
import 'package:flutter/material.dart';

class GradientBackground extends StatefulWidget {
  final Widget child;
  final Gradient gradient;
  final EdgeInsetsGeometry? padding;
  final bool animate;

  const GradientBackground({
    super.key,
    required this.child,
    required this.gradient,
    this.padding,
    this.animate = true,
  });

  @override
  State<GradientBackground> createState() => _GradientBackgroundState();
}

class _GradientBackgroundState extends State<GradientBackground> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    );
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(_controller);

    if (widget.animate) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(GradientBackground oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animate != oldWidget.animate) {
      if (widget.animate) {
        _controller.repeat(reverse: true);
      } else {
        _controller.stop();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.animate || widget.gradient is! LinearGradient) {
      return Container(
        decoration: BoxDecoration(gradient: widget.gradient),
        padding: widget.padding,
        child: widget.child,
      );
    }

    final linearGradient = widget.gradient as LinearGradient;

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        // Shift alignment dynamically to provide breathing effect
        final t = _animation.value;
        final begin = AlignmentGeometry.lerp(linearGradient.begin, Alignment.topRight, t) ?? linearGradient.begin;
        final end = AlignmentGeometry.lerp(linearGradient.end, Alignment.bottomLeft, t) ?? linearGradient.end;

        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: linearGradient.colors,
              stops: linearGradient.stops,
              begin: begin,
              end: end,
              tileMode: linearGradient.tileMode,
            ),
          ),
          padding: widget.padding,
          child: child,
        );
      },
      child: widget.child,
    );
  }
}
