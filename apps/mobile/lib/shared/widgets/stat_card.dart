// Stat Card Widget using GFCard
import 'package:flutter/material.dart';
import 'package:getwidget/getwidget.dart';

class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Gradient? gradient;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final VoidCallback? onTap;
  final String? trend;
  final bool trendUp;
  final double? progress; // Optional progress (0.0 to 1.0)

  const StatCard({
    super.key,
    required this.title,
    required this.value,
    this.subtitle,
    this.icon,
    this.gradient,
    this.backgroundColor,
    this.foregroundColor,
    this.onTap,
    this.trend,
    this.trendUp = true,
    this.progress,
  });

  @override
  Widget build(BuildContext context) {
    final fg = foregroundColor ?? Colors.white;
    final cardColor = gradient == null 
        ? (backgroundColor ?? Theme.of(context).colorScheme.surface) 
        : null;

    final card = GFCard(
      color: cardColor,
      gradient: gradient is LinearGradient ? gradient as LinearGradient : null,
      borderRadius: BorderRadius.circular(20),
      margin: EdgeInsets.zero,
      padding: const EdgeInsets.all(16),
      border: Border.all(
        color: Theme.of(context).colorScheme.outline.withOpacity(0.12),
        width: 1,
      ),
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (icon != null)
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: fg.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: fg, size: 20),
                )
              else
                const SizedBox(height: 36), // Maintain alignment height
              if (trend != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: fg.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        trendUp ? Icons.trending_up : Icons.trending_down,
                        size: 12,
                        color: fg,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        trend!,
                        style: TextStyle(
                          color: fg,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            value,
            style: TextStyle(
              color: fg,
              fontSize: 26,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              color: fg.withOpacity(0.9),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (progress != null) ...[
            const SizedBox(height: 12),
            GFProgressBar(
              percentage: progress!.clamp(0.0, 1.0),
              lineHeight: 6,
              progressBarColor: fg,
              backgroundColor: fg.withOpacity(0.24),
              padding: EdgeInsets.zero,
              animation: true,
              animationDuration: 500,
            ),
          ],
          if (subtitle != null) ...[
            const SizedBox(height: 8),
            Text(
              subtitle!,
              style: TextStyle(
                color: fg.withOpacity(0.7),
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: card,
        ),
      );
    }
    return card;
  }
}
