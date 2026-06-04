// AI Chat Screen — Tutoring with streaming responses
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/models/chat.dart';
import '../../../shared/providers/data_providers.dart';

// Chat State Definition
class ChatState {
  final List<TutorMessage> messages;
  final List<TutorConversation> conversations;
  final String? activeConversationId;
  final bool isLoading;
  final bool isTyping;
  final String? error;

  ChatState({
    this.messages = const [],
    this.conversations = const [],
    this.activeConversationId,
    this.isLoading = false,
    this.isTyping = false,
    this.error,
  });

  ChatState copyWith({
    List<TutorMessage>? messages,
    List<TutorConversation>? conversations,
    String? activeConversationId,
    bool? isLoading,
    bool? isTyping,
    String? error,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      conversations: conversations ?? this.conversations,
      activeConversationId: activeConversationId ?? this.activeConversationId,
      isLoading: isLoading ?? this.isLoading,
      isTyping: isTyping ?? this.isTyping,
      error: error ?? this.error,
    );
  }
}

// Chat Notifier for managing state and API interactions
class ChatNotifier extends StateNotifier<ChatState> {
  final Ref _ref;

  ChatNotifier(this._ref) : super(ChatState()) {
    loadConversations();
  }

  Future<void> loadConversations() async {
    state = state.copyWith(isLoading: true);
    try {
      final repo = _ref.read(tutorRepositoryProvider);
      final list = await repo.getConversations();
      if (list.isNotEmpty) {
        final activeId = list.first.id;
        final msgs = await repo.getConversationMessages(activeId);
        state = state.copyWith(
          conversations: list,
          activeConversationId: activeId,
          messages: msgs,
          isLoading: false,
        );
      } else {
        state = state.copyWith(conversations: [], isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> selectConversation(String id) async {
    state = state.copyWith(isLoading: true, activeConversationId: id);
    try {
      final repo = _ref.read(tutorRepositoryProvider);
      final msgs = await repo.getConversationMessages(id);
      state = state.copyWith(messages: msgs, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> startNewChat() async {
    state = state.copyWith(
      activeConversationId: null,
      messages: [],
    );
  }

  Future<void> send(String text) async {
    if (text.trim().isEmpty) return;

    final repo = _ref.read(tutorRepositoryProvider);
    final isNew = state.activeConversationId == null;

    // Create a temporary local message to show in the UI immediately
    final tempUserMsg = TutorMessage(
      id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
      conversationId: state.activeConversationId ?? '',
      role: 'user',
      content: text,
      createdAt: DateTime.now(),
    );

    state = state.copyWith(
      messages: [...state.messages, tempUserMsg],
      isTyping: true,
    );

    try {
      final updatedConv = await repo.sendMessage(
        message: text,
        conversationId: state.activeConversationId,
      );

      // Reload conversations list
      final list = await repo.getConversations();

      // Fetch the updated messages list
      final msgs = await repo.getConversationMessages(updatedConv.id);

      state = state.copyWith(
        activeConversationId: updatedConv.id,
        messages: msgs,
        conversations: list,
        isTyping: false,
      );
    } catch (e) {
      state = state.copyWith(
        isTyping: false,
        error: 'Failed to send message. Please try again.',
      );
    }
  }
}

// Provider definition
final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(ref);
});

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _ctrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  final List<String> _suggestions = [
    'Explain the structure of Nepali Constitution',
    'How to solve profit & loss problems?',
    'Tips for Kharidar exam',
  ];

  @override
  void dispose() {
    _ctrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
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
    final chatState = ref.watch(chatProvider);

    // Listen to changes in message list length to scroll down
    ref.listen<ChatState>(chatProvider, (previous, next) {
      if (previous?.messages.length != next.messages.length ||
          previous?.isTyping != next.isTyping) {
        _scrollToBottom();
      }
    });

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
          PopupMenuButton<String>(
            icon: const Icon(Icons.history),
            onSelected: (val) {
              if (val == 'new') {
                ref.read(chatProvider.notifier).startNewChat();
              } else {
                ref.read(chatProvider.notifier).selectConversation(val);
              }
            },
            itemBuilder: (context) {
              final list = [
                const PopupMenuItem(
                  value: 'new',
                  child: Row(
                    children: [
                      Icon(Icons.add, size: 18),
                      SizedBox(width: 8),
                      Text('New Conversation'),
                    ],
                  ),
                ),
              ];
              for (var conv in chatState.conversations) {
                list.add(
                  PopupMenuItem(
                    value: conv.id,
                    child: Text(
                      conv.title.isNotEmpty ? conv.title : 'Conversation ${conv.id.substring(0, 4)}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                );
              }
              return list;
            },
          ),
        ],
      ),
      body: SafeArea(
        child: chatState.isLoading && chatState.messages.isEmpty
            ? const Center(
                child: GFLoader(
                  type: GFLoaderType.circle,
                ),
              )
            : Column(
                children: [
                  Expanded(
                    child: chatState.messages.isEmpty
                        ? _buildWelcomeAndSuggestions()
                        : ListView.builder(
                            controller: _scrollCtrl,
                            padding: const EdgeInsets.all(16),
                            itemCount: chatState.messages.length,
                            itemBuilder: (context, i) {
                              return _buildMessage(context, chatState.messages[i], i);
                            },
                          ),
                  ),
                  if (chatState.isTyping) _buildTypingIndicator(),
                  _buildInputBar(context, chatState.isTyping),
                ],
              ),
      ),
    );
  }

  Widget _buildWelcomeAndSuggestions() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 40),
          const GFAvatar(
            radius: 36,
            backgroundColor: AppTheme.primary,
            child: Icon(Icons.smart_toy_rounded, color: Colors.white, size: 40),
          ).animate().scale(duration: 400.ms),
          const SizedBox(height: 20),
          Text(
            'Loksewa AI Tutor',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            'Ask me questions about Nepal General Knowledge, Mathematics, English, the Constitution, or syllabus tips.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontSize: 14,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 32),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Suggestions to start:',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
          ),
          const SizedBox(height: 12),
          ..._suggestions.map((s) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Theme.of(context).colorScheme.outline),
                ),
                child: ListTile(
                  title: Text(s, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 12),
                  onTap: () {
                    ref.read(chatProvider.notifier).send(s);
                  },
                ),
              ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1)),
        ],
      ),
    );
  }

  Widget _buildMessage(BuildContext context, TutorMessage m, int index) {
    final isUser = m.role == 'user';
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser)
            const GFAvatar(
              radius: 18,
              backgroundColor: AppTheme.primary,
              child: Icon(Icons.smart_toy_rounded, color: Colors.white, size: 18),
            ),
          if (!isUser) const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                GFCard(
                  color: isUser ? AppTheme.primary : Theme.of(context).colorScheme.surface,
                  margin: EdgeInsets.zero,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(18),
                    topRight: const Radius.circular(18),
                    bottomLeft: Radius.circular(isUser ? 18 : 4),
                    bottomRight: Radius.circular(isUser ? 4 : 18),
                  ),
                  border: isUser
                      ? Border.all(color: Colors.transparent)
                      : Border.all(color: Theme.of(context).colorScheme.outline),
                  content: MarkdownBody(
                    data: m.content,
                    styleSheet: MarkdownStyleSheet(
                      p: TextStyle(
                        color: isUser ? Colors.white : Theme.of(context).colorScheme.onSurface,
                        fontSize: 14,
                        height: 1.4,
                      ),
                      strong: TextStyle(
                        color: isUser ? Colors.white : Theme.of(context).colorScheme.onSurface,
                        fontWeight: FontWeight.w800,
                      ),
                      code: TextStyle(
                        backgroundColor: isUser
                            ? Colors.white.withOpacity(0.2)
                            : AppTheme.surfaceVariant,
                        fontSize: 12,
                        color: isUser ? Colors.white : AppTheme.primaryDark,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4.0),
                  child: Text(
                    _formatTime(m.createdAt),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 10),
                  ),
                ),
              ],
            ),
          ),
          if (isUser) const SizedBox(width: 8),
          if (isUser)
            const GFAvatar(
              radius: 18,
              backgroundColor: AppTheme.secondary,
              child: Text(
                'U',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05);
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          const GFAvatar(
            radius: 18,
            backgroundColor: AppTheme.primary,
            child: Icon(Icons.smart_toy_rounded, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Theme.of(context).colorScheme.outline),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                GFLoader(
                  type: GFLoaderType.circle,
                  size: GFSize.SMALL,
                ),
                SizedBox(width: 8),
                Text(
                  'Typing...',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputBar(BuildContext context, bool isTyping) {
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
            Expanded(
              child: TextField(
                controller: _ctrl,
                enabled: !isTyping,
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
                onSubmitted: (val) {
                  ref.read(chatProvider.notifier).send(val);
                  _ctrl.clear();
                },
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
                onPressed: isTyping
                    ? null
                    : () {
                        ref.read(chatProvider.notifier).send(_ctrl.text);
                        _ctrl.clear();
                      },
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
