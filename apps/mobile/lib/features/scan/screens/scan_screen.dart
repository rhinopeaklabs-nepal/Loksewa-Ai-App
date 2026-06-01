// Scan Screen — capture question from image and get solution
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/widgets/app_dialogs.dart';
import '../../../shared/widgets/primary_button.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  bool _scanning = false;
  bool _found = false;

  void _simulateScan() {
    setState(() {
      _scanning = true;
      _found = false;
    });
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (!mounted) return;
      setState(() {
        _scanning = false;
        _found = true;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Scan & Solve'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Expanded(
                child: _found ? _buildResult() : _buildScanner(),
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                text: _scanning ? 'Scanning...' : (_found ? 'Scan Another' : 'Capture Question'),
                icon: _scanning ? Icons.hourglass_top : Icons.camera_alt_rounded,
                isLoading: _scanning,
                onPressed: _scanning ? null : _simulateScan,
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScanner() {
    return Column(
      children: [
        const SizedBox(height: 20),
        Container(
          width: double.infinity,
          height: 380,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surfaceVariant,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: AppTheme.primary,
              width: 2,
            ),
          ),
          child: Stack(
            children: [
              Center(
                child: Icon(
                  Icons.document_scanner_rounded,
                  size: 80,
                  color: AppTheme.primary.withOpacity(0.3),
                ),
              ),
              // Corner brackets
              Positioned(top: 20, left: 20, child: _corner(rotation: 0)),
              Positioned(top: 20, right: 20, child: _corner(rotation: 1.57)),
              Positioned(bottom: 20, left: 20, child: _corner(rotation: -1.57)),
              Positioned(bottom: 20, right: 20, child: _corner(rotation: 3.14)),
              // Scan line
              if (_scanning)
                Positioned.fill(
                  child: Center(
                    child: Container(
                      height: 2,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.transparent,
                            AppTheme.primary,
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ).animate(onPlay: (c) => c.repeat(reverse: true))
                        .slideY(begin: -1, end: 1, duration: 800.ms),
                  ),
                ),
            ],
          ),
        ).animate().scale(duration: 400.ms),
        const SizedBox(height: 20),
        Text(
          'Position the question within the frame',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Make sure text is clearly visible and well-lit',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _corner({required double rotation}) {
    return Transform.rotate(
      angle: rotation,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: AppTheme.primary, width: 3),
            left: BorderSide(color: AppTheme.primary, width: 3),
          ),
        ),
      ),
    );
  }

  Widget _buildResult() {
    return SingleChildScrollView(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.success.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.success),
            ),
            child: const Row(
              children: [
                Icon(Icons.check_circle, color: AppTheme.success, size: 28),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Question Detected!',
                        style: TextStyle(
                          color: AppTheme.success,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Confidence: 96%',
                        style: TextStyle(
                          color: AppTheme.success,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 400.ms),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Theme.of(context).colorScheme.outline),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.tertiaryContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'GK: Nepali Polity',
                    style: TextStyle(
                      color: AppTheme.tertiary,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Which article of the Constitution of Nepal establishes Nepal as a Federal Democratic Republic?',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        height: 1.4,
                      ),
                ),
                const SizedBox(height: 16),
                ...['Article 1', 'Article 4', 'Article 12', 'Article 56'].asMap().entries.map(
                      (e) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: e.key == 1
                                ? AppTheme.success.withOpacity(0.1)
                                : Theme.of(context).colorScheme.surfaceVariant,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: e.key == 1 ? AppTheme.success : Colors.transparent,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: e.key == 1 ? AppTheme.success : Colors.transparent,
                                  border: Border.all(
                                    color: e.key == 1 ? AppTheme.success : AppTheme.outline,
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                child: e.key == 1
                                    ? const Icon(Icons.check, size: 14, color: Colors.white)
                                    : Text(
                                        String.fromCharCode(65 + e.key),
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                                      ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  e.value,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: e.key == 1 ? FontWeight.w700 : FontWeight.w500,
                                    color: e.key == 1 ? AppTheme.success : null,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.lightbulb, color: AppTheme.primaryDark, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Answer: Article 4 defines Nepal as a federal, democratic, republican state.',
                          style: TextStyle(
                            color: AppTheme.primaryDark,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate(delay: 200.ms).fadeIn(duration: 400.ms).slideY(begin: 0.1),
        ],
      ),
    );
  }
}
