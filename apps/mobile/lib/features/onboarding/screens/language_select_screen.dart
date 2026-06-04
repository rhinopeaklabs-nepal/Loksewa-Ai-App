// Language Select Screen using GetWidget components
import 'package:flutter/material.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';

class LanguageSelectScreen extends StatefulWidget {
  const LanguageSelectScreen({super.key});

  @override
  State<LanguageSelectScreen> createState() => _LanguageSelectScreenState();
}

class _LanguageSelectScreenState extends State<LanguageSelectScreen> {
  String _selected = 'en';

  final List<Map<String, dynamic>> _languages = [
    {
      'code': 'en',
      'name': 'English',
      'native': 'English',
      'flag': '🇬🇧',
    },
    {
      'code': 'ne',
      'name': 'Nepali',
      'native': 'नेपाली',
      'flag': '🇳🇵',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Setup Preferences'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Choose your language',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Select the primary language for study materials and practice tests.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 32),
              ..._languages.map((lang) {
                final isSelected = _selected == lang['code'];
                return GFCard(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(4),
                  borderRadius: BorderRadius.circular(16),
                  color: isSelected
                      ? AppTheme.primaryContainer
                      : Theme.of(context).cardColor,
                  border: Border.all(
                    color: isSelected
                        ? AppTheme.primary
                        : Theme.of(context).colorScheme.outline.withOpacity(0.5),
                    width: isSelected ? 2.0 : 1.0,
                  ),
                  content: GFRadioListTile<String>(
                    value: lang['code'] as String,
                    groupValue: _selected,
                    onChanged: (value) {
                      setState(() {
                        _selected = value ?? 'en';
                      });
                    },
                    title: Text(
                      lang['name'] as String,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    subTitle: Text(
                      lang['native'] as String,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    avatar: Text(
                      lang['flag'] as String,
                      style: const TextStyle(fontSize: 28),
                    ),
                    type: GFRadioType.basic,
                    size: GFSize.SMALL,
                    activeBorderColor: AppTheme.primary,
                  ),
                );
              }),
              const Spacer(),
              GFButton(
                text: 'Continue',
                icon: const Icon(
                  Icons.arrow_forward_rounded,
                  color: Colors.white,
                  size: 18,
                ),
                position: GFPosition.end,
                onPressed: () => context.push(AppRoutes.interests),
                shape: GFButtonShape.pills,
                size: GFSize.LARGE,
                color: AppTheme.primary,
                blockButton: true,
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
