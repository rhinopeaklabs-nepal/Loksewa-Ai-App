// Gradient Background Widget
import 'package:flutter/material.dart';

class GradientBackground extends StatelessWidget {
  final Widget child;
  final Gradient gradient;
  final EdgeInsetsGeometry? padding;
  const GradientBackground({
    super.key,
    required this.child,
    required this.gradient,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(gradient: gradient),
      child: padding == null ? child : Padding(padding: padding!, child: child),
    );
  }
}
