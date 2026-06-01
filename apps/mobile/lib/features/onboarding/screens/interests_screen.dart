// Interests Screen — select topics of interest
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';

class InterestsScreen extends StatefulWidget {
  const InterestsScreen({super.key});

  @override
  State<InterestsScreen> createState() => _InterestsScreenState();
}

class _InterestsScreenState extends State<InterestsScreen> {
  final Set<String> _selected = {};

  final _interests = [
    {'id': 'gk', 'name': 'General Knowledge', 'icon': Icons.public, 'color': Colors.blue},
    {'id': 'math', 'name': 'Mathematics', 'icon': Icons.calculate, 'color': Colors.purple},
    {'id': 'english', 'name': 'English', 'icon': Icons.translate, 'color': Colors.indigo},
    {'id': 'nepali', 'name': 'Nepali', 'icon': Icons.menu_book, 'color': Colors.red},
    {'id': 'science', 'name': 'Science', 'icon': Icons.science, 'color': Colors.teal},
    {'id': 'reasoning', 'name': 'Reasoning', 'icon': Icons.psychology, 'color': Colors.orange},
    {'id': 'current', 'name': 'Current Affairs', 'icon': Icons.newspaper, 'color': Colors.amber},
    {'id': 'constitution', 'name': 'Constitution', 'icon': Icons.gavel, 'color': Colors.brown},
    {'id': 'management', 'name': 'Management', 'icon': Icons.business_center, 'color': Colors.cyan},
    {'id': 'economics', 'name': 'Economics', 'icon': Icons.trending_up, 'color': Colors.green},
    {'id': 'computer', 'name': 'Computer', 'icon': Icons.computer, 'color': Colors.deepPurple},
    {'id': 'history', 'name': 'History', 'icon': Icons.history_edu, 'color': Colors.deepOrange},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Your Interests'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              Text(
                'What do you want to learn?',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Pick at least 3 topics. We will personalize your daily missions.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.5,
                  ),
                  itemCount: _interests.length,
                  itemBuilder: (context, i) {
                    final interest = _interests[i];
                    final isSelected = _selected.contains(interest['id']);
                    return InkWell(
                      onTap: () {
                        setState(() {
                          if (isSelected) {
                            _selected.remove(interest['id']);
                          } else {
                            _selected.add(interest['id'] as String);
                          }
                        });
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: AnimatedContainer(
                        duration: AppTheme.normal,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (interest['color'] as Color).withOpacity(0.1)
                              : Theme.of(context).colorScheme.surface,
                          border: Border.all(
                            color: isSelected
                                ? interest['color'] as Color
                                : Theme.of(context).colorScheme.outline,
                            width: isSelected ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Icon(
                              interest['icon'] as IconData,
                              color: interest['color'] as Color,
                              size: 32,
                            ),
                            Text(
                              interest['name'] as String,
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                                color: isSelected
                                    ? interest['color'] as Color
                                    : Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate(delay: (50 * i).ms).fadeIn(duration: 400.ms).scale(begin: const Offset(0.9, 0.9));
                  },
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: FilledButton(
                  onPressed: _selected.length < 3
                      ? null
                      : () => context.push(AppRoutes.examTarget),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    _selected.length < 3
                        ? 'Select at least 3 (${_selected.length}/3)'
                        : 'Continue (${_selected.length} selected)',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
