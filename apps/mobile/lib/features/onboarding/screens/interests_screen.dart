// Interests Screen — select topics of interest using GetWidget and Riverpod
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../shared/services/loksewa_repository.dart';
import '../../../shared/widgets/loksewa_design.dart';

class InterestsScreen extends ConsumerStatefulWidget {
  const InterestsScreen({super.key});

  @override
  ConsumerState<InterestsScreen> createState() => _InterestsScreenState();
}

class _InterestsScreenState extends ConsumerState<InterestsScreen> {
  final Set<String> _selected = {};

  @override
  Widget build(BuildContext context) {
    final subjectsAsync = ref.watch(subjectsProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Your Interests'),
        centerTitle: true,
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
                'Select topics of interest to seed your study dashboard with relevant materials.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: subjectsAsync.when(
                  loading: () => const Center(
                    child: GFLoader(type: GFLoaderType.circle),
                  ),
                  error: (error, stack) => Center(
                    child: Text(
                      'Failed to load topics: $error',
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                  data: (subjects) {
                    if (subjects.isEmpty) {
                      return const Center(
                        child: Text(
                          'No topics available from the backend.',
                          style: TextStyle(fontWeight: FontWeight.w500),
                        ),
                      );
                    }
                    return GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 1.35,
                      ),
                      itemCount: subjects.length,
                      itemBuilder: (context, i) {
                        final subject = subjects[i];
                        final id = labelOf(subject, const ['id', 'slug', 'public_id'], '');
                        final name = labelOf(subject, const ['title', 'name', 'slug'], 'Untitled');
                        final colorHex = subject['color']?.toString();
                        final color = colorFromHex(colorHex);
                        final isSelected = _selected.contains(id);

                        return InkWell(
                          onTap: () {
                            setState(() {
                              if (isSelected) {
                                _selected.remove(id);
                              } else {
                                _selected.add(id);
                              }
                            });
                          },
                          borderRadius: BorderRadius.circular(20),
                          child: GFCard(
                            margin: EdgeInsets.zero,
                            padding: const EdgeInsets.all(16),
                            borderRadius: BorderRadius.circular(20),
                            color: isSelected
                                ? color.withOpacity(0.12)
                                : Theme.of(context).cardColor,
                            border: Border.all(
                              color: isSelected ? color : Theme.of(context).colorScheme.outline.withOpacity(0.5),
                              width: isSelected ? 2 : 1,
                            ),
                            content: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Icon(
                                        Icons.school_rounded,
                                        color: color,
                                        size: 28,
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        name,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14,
                                          color: isSelected
                                              ? color
                                              : Theme.of(context).colorScheme.onSurface,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                GFCheckbox(
                                  size: GFSize.SMALL,
                                  activeBgColor: color,
                                  type: GFCheckboxType.circle,
                                  value: isSelected,
                                  onChanged: (val) {
                                    setState(() {
                                      if (val == true) {
                                        _selected.add(id);
                                      } else {
                                        _selected.remove(id);
                                      }
                                    });
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              GFButton(
                text: _selected.isEmpty
                    ? 'Select at least 1 topic'
                    : 'Continue (${_selected.length} selected)',
                onPressed: _selected.isEmpty
                    ? null
                    : () {
                        // Preferences could be saved in state or shared prefs here
                        context.push(AppRoutes.examTarget);
                      },
                shape: GFButtonShape.pills,
                size: GFSize.LARGE,
                color: AppTheme.primary,
                blockButton: true,
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
