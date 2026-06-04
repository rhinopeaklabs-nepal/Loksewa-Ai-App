import 'package:flutter/material.dart';
import 'package:getwidget/getwidget.dart';
import '../../app/theme.dart';

class ErrorState extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback? onRetry;
  final IconData icon;

  const ErrorState({
    super.key,
    this.title = 'Something went wrong',
    required this.message,
    this.onRetry,
    this.icon = Icons.error_outline_rounded,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: GFCard(
          borderRadius: BorderRadius.circular(20),
          padding: const EdgeInsets.all(24),
          margin: EdgeInsets.zero,
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              GFAvatar(
                radius: 36,
                backgroundColor: Theme.of(context).colorScheme.errorContainer,
                child: Icon(
                  icon,
                  size: 36,
                  color: Theme.of(context).colorScheme.error,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                title,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 10),
              Text(
                message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              if (onRetry != null) ...[
                const SizedBox(height: 24),
                GFButton(
                  onPressed: onRetry,
                  text: 'Retry',
                  icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 16),
                  color: AppTheme.primary,
                  shape: GFButtonShape.pills,
                  size: GFSize.MEDIUM,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
