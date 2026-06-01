// AI Chat Screen — Tutoring with streaming responses
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _ctrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _messages = <_Message>[
    _Message(
      text: 'Hi! I\'m your AI tutor. Ask me anything about GK, Math, English, or Constitution!',
      isUser: false,
      time: DateTime.now().subtract(const Duration(minutes: 2)),
      suggestions: [
        'Explain the structure of Nepali Constitution',
        'How to solve profit & loss problems?',
        'Tips for Kharidar exam',
      ],
    ),
  ];
  bool _isTyping = false;

  @override
  void dispose() {
    _ctrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _send(String text) async {
    if (text.trim().isEmpty) return;
    final userMsg = _Message(
      text: text.trim(),
      isUser: true,
      time: DateTime.now(),
    );
    setState(() {
      _messages.add(userMsg);
      _ctrl.clear();
      _isTyping = true;
    });
    _scrollToBottom();

    // Simulate AI response
    await Future.delayed(const Duration(milliseconds: 1500));
    if (!mounted) return;
    final aiMsg = _Message(
      text: _generateResponse(text),
      isUser: false,
      time: DateTime.now(),
    );
    setState(() {
      _messages.add(aiMsg);
      _isTyping = false;
    });
    _scrollToBottom();
  }

  String _generateResponse(String q) {
    if (q.toLowerCase().contains('constitution')) {
      return '''The Constitution of Nepal 2015 is divided into **35 parts**, **308 articles**, and **9 schedules**.

**Key Features:**
- Federal Democratic Republic
- 7 federal provinces
- Three tiers of government: Federal, Provincial, Local
- Fundamental rights in Part 3
- Directive principles in Part 4

Would you like me to explain a specific article?''';
    }
    if (q.toLowerCase().contains('profit') || q.toLowerCase().contains('math')) {
      return '''**Profit & Loss Formulas:**

- **Profit %** = (Profit / Cost Price) × 100
- **Loss %** = (Loss / Cost Price) × 100
- **SP** = CP × (1 + Profit%/100)
- **CP** = SP × (1 - Loss%/100)

**Example:** If CP = Rs. 500 and SP = Rs. 600:
Profit = 600 - 500 = Rs. 100
Profit % = (100/500) × 100 = **20%**

Try a practice problem now!''';
    }
    if (q.toLowerCase().contains('kharidar') || q.toLowerCase().contains('tips')) {
      return '''**Top Tips for Kharidar Exam:**

1. 📚 **GK is King** - 40% of the paper. Focus on Nepali history, geography, polity.
2. 🧮 **Math Practice** - Daily 30 minutes on arithmetic.
3. 📖 **English Grammar** - Master tenses, voice, narration.
4. 📰 **Current Affairs** - Last 6 months of national news.
5. ⏰ **Time Management** - Don't spend more than 1 min per MCQ.

Want a study plan? I can build a personalized one for you!''';
    }
    return '''Great question! Let me help you understand that.

**${q.substring(0, q.length.clamp(0, 50))}...** is an important topic for Loksewa exams.

I recommend:
1. Reading the official syllabus
2. Practicing 10-15 MCQs on this topic
3. Reviewing explanations for any wrong answers

Would you like me to generate practice questions on this topic?''';
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
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
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: AppTheme.purpleGradient,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 22),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Loksewa AI Tutor', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                  Row(
                    children: [
                      Icon(Icons.circle, color: AppTheme.success, size: 8),
                      SizedBox(width: 4),
                      Text('Online', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {},
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollCtrl,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (context, i) {
                  return _buildMessage(context, _messages[i], i);
                },
              ),
            ),
            if (_isTyping) _buildTypingIndicator(),
            _buildInputBar(context),
          ],
        ),
      ),
    );
  }

  Widget _buildMessage(BuildContext context, _Message m, int index) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: m.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!m.isUser) _buildAvatar(),
          if (!m.isUser) const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: m.isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.75,
                  ),
                  decoration: BoxDecoration(
                    color: m.isUser
                        ? AppTheme.primary
                        : Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft: Radius.circular(m.isUser ? 18 : 4),
                      bottomRight: Radius.circular(m.isUser ? 4 : 18),
                    ),
                    border: m.isUser
                        ? null
                        : Border.all(color: Theme.of(context).colorScheme.outline),
                  ),
                  child: MarkdownBody(
                    data: m.text,
                    styleSheet: MarkdownStyleSheet(
                      p: TextStyle(
                        color: m.isUser ? Colors.white : Theme.of(context).colorScheme.onSurface,
                        fontSize: 14,
                        height: 1.4,
                      ),
                      strong: TextStyle(
                        color: m.isUser ? Colors.white : Theme.of(context).colorScheme.onSurface,
                        fontWeight: FontWeight.w800,
                      ),
                      code: TextStyle(
                        backgroundColor: m.isUser
                            ? Colors.white.withOpacity(0.2)
                            : AppTheme.surfaceVariant,
                        fontSize: 12,
                        color: m.isUser ? Colors.white : AppTheme.primaryDark,
                      ),
                    ),
                  ),
                ),
                if (!m.isUser && m.suggestions != null) ...[
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: m.suggestions!.map((s) {
                      return InkWell(
                        onTap: () => _send(s),
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppTheme.tertiaryContainer,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            s,
                            style: const TextStyle(
                              color: AppTheme.tertiary,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  _formatTime(m.time),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 10),
                ),
              ],
            ),
          ),
          if (m.isUser) const SizedBox(width: 8),
          if (m.isUser) _buildUserAvatar(),
        ],
      ),
    ).animate(delay: (50 * index).ms).fadeIn(duration: 300.ms).slideY(begin: 0.1);
  }

  Widget _buildAvatar() {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        gradient: AppTheme.purpleGradient,
        shape: BoxShape.circle,
      ),
      child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 18),
    );
  }

  Widget _buildUserAvatar() {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        shape: BoxShape.circle,
      ),
      child: const Center(
        child: Text('R', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          _buildAvatar(),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Theme.of(context).colorScheme.outline),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (i) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppTheme.textSecondary,
                    shape: BoxShape.circle,
                  ),
                ).animate(onPlay: (c) => c.repeat(reverse: true))
                    .fadeIn(duration: 600.ms, delay: (200 * i).ms);
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(top: BorderSide(color: Theme.of(context).colorScheme.outline)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.attach_file_rounded),
            ),
            Expanded(
              child: TextField(
                controller: _ctrl,
                decoration: InputDecoration(
                  hintText: 'Ask anything...',
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide(color: Theme.of(context).colorScheme.outline),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide(color: Theme.of(context).colorScheme.outline),
                  ),
                ),
                onSubmitted: _send,
                textInputAction: TextInputAction.send,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: const BoxDecoration(
                gradient: AppTheme.primaryGradient,
                shape: BoxShape.circle,
              ),
              child: IconButton(
                onPressed: () => _send(_ctrl.text),
                icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime t) {
    final h = t.hour.toString().padLeft(2, '0');
    final m = t.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

class _Message {
  final String text;
  final bool isUser;
  final DateTime time;
  final List<String>? suggestions;
  _Message({
    required this.text,
    required this.isUser,
    required this.time,
    this.suggestions,
  });
}
