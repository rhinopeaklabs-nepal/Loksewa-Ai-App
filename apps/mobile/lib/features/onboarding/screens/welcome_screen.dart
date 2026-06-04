// Welcome Screen using GetWidget Carousel and Buttons
import 'package:flutter/material.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../app/theme.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  int _currentIndex = 0;

  final List<Map<String, dynamic>> _slides = [
    {
      'icon': Icons.auto_awesome,
      'title': 'AI-Powered Tutoring',
      'desc': 'Ask questions and get instant verified explanations based on the official Loksewa syllabus.',
    },
    {
      'icon': Icons.psychology,
      'title': 'Adaptive Practice',
      'desc': 'Practice questions tailored to your performance to target and improve your weak areas.',
    },
    {
      'icon': Icons.assignment_turned_in,
      'title': 'Official Mock Exams',
      'desc': 'Take simulated mock tests and analyze detailed scorecards to benchmark your preparation.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.heroGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              children: [
                const Spacer(flex: 1),
                
                // GetWidget GFCarousel
                GFCarousel(
                  height: 380,
                  viewportFraction: 1.0,
                  autoPlay: true,
                  autoPlayInterval: const Duration(seconds: 4),
                  hasPagination: true,
                  enableInfiniteScroll: true,
                  onPageChanged: (index) {
                    setState(() {
                      _currentIndex = index;
                    });
                  },
                  activeIndicator: Colors.white,
                  passiveIndicator: Colors.white.withOpacity(0.4),
                  items: _slides.map((slide) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Graphic Icon
                          Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.18),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Icon(
                                slide['icon'] as IconData,
                                size: 80,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(height: 40),
                          Text(
                            slide['title'] as String,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.5,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            slide['desc'] as String,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 15,
                              color: Colors.white.withOpacity(0.85),
                              height: 1.5,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),

                const Spacer(flex: 2),

                // CTA Buttons using GFButton
                GFButton(
                  text: 'Start Setup',
                  icon: const Icon(
                    Icons.arrow_forward_rounded,
                    color: AppTheme.primary,
                    size: 18,
                  ),
                  position: GFPosition.end,
                  onPressed: () => context.go(AppRoutes.languageSelect),
                  shape: GFButtonShape.pills,
                  size: GFSize.LARGE,
                  color: Colors.white,
                  textColor: AppTheme.primary,
                  blockButton: true,
                ),
                const SizedBox(height: 12),
                GFButton(
                  text: 'I already have an account',
                  onPressed: () => context.go(AppRoutes.login),
                  shape: GFButtonShape.pills,
                  size: GFSize.LARGE,
                  type: GFButtonType.outline,
                  color: Colors.white,
                  textColor: Colors.white,
                  blockButton: true,
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
