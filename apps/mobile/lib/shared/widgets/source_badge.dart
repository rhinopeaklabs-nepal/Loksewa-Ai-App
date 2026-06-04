import 'package:flutter/material.dart';
import 'package:getwidget/getwidget.dart';

enum TrustRating {
  verified,
  aiAssisted,
  uncertain,
  aiOnly,
}

class SourceBadge extends StatelessWidget {
  final TrustRating rating;

  const SourceBadge({
    super.key,
    required this.rating,
  });

  @override
  Widget build(BuildContext context) {
    String text;
    Color color;
    IconData icon;

    switch (rating) {
      case TrustRating.verified:
        text = 'Verified';
        color = Colors.green;
        icon = Icons.verified_user_rounded;
        break;
      case TrustRating.aiAssisted:
        text = 'AI-Assisted';
        color = Colors.blue;
        icon = Icons.psychology_rounded;
        break;
      case TrustRating.uncertain:
        text = 'Uncertain';
        color = Colors.amber;
        icon = Icons.warning_amber_rounded;
        break;
      case TrustRating.aiOnly:
        text = 'AI-Only';
        color = Colors.purple;
        icon = Icons.auto_awesome_rounded;
        break;
    }

    return GFBadge(
      color: color,
      shape: GFBadgeShape.pills,
      size: GFSize.MEDIUM,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: Colors.white),
            const SizedBox(width: 4),
            Text(
              text,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
