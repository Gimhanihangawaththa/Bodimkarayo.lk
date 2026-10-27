import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import 'chat_conversation_screen.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authUser = context.read<AuthProvider>().user;
      if (authUser != null && authUser.id != null) {
        context.read<ChatProvider>().fetchRooms(authUser.id!);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authUser = context.watch<AuthProvider>().user;
    final chatProvider = context.watch<ChatProvider>();

    if (authUser == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Messages', style: TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: Colors.transparent,
          elevation: 0,
          foregroundColor: const Color(0xFF0A2463),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey.shade400),
              const SizedBox(height: 16),
              const Text('Please sign in to view your messages', style: TextStyle(fontSize: 16)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/signin'),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0A2463)),
                child: const Text('Sign In', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }

    final currentUserId = authUser.id ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF0A2463),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => chatProvider.fetchRooms(currentUserId),
          ),
        ],
      ),
      body: chatProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : chatProvider.rooms.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.chat_outlined, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 16),
                      Text(
                        'No conversations yet',
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Reach out to property owners or roommates to chat!',
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => chatProvider.fetchRooms(currentUserId),
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: chatProvider.rooms.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final room = chatProvider.rooms[index];
                      final otherUser = room.getOtherUser(currentUserId);

                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        leading: Stack(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: const Color(0xFF0A2463),
                              backgroundImage: otherUser.profilePictureUrl != null &&
                                      otherUser.profilePictureUrl!.isNotEmpty
                                  ? NetworkImage(otherUser.profilePictureUrl!)
                                  : null,
                              child: otherUser.profilePictureUrl == null ||
                                      otherUser.profilePictureUrl!.isEmpty
                                  ? Text(
                                      otherUser.fullName?.isNotEmpty == true
                                          ? otherUser.fullName![0].toUpperCase()
                                          : 'U',
                                      style: const TextStyle(color: Colors.white, fontSize: 16),
                                    )
                                  : null,
                            ),
                            if (room.unreadCount > 0)
                              Positioned(
                                right: 0,
                                top: 0,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: Colors.red,
                                    shape: BoxShape.circle,
                                  ),
                                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                                  child: Text(
                                    '${room.unreadCount}',
                                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        title: Text(
                          otherUser.fullName ?? 'User',
                          style: TextStyle(
                            fontWeight: room.unreadCount > 0 ? FontWeight.bold : FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                        subtitle: Text(
                          otherUser.email,
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ChatConversationScreen(
                                roomId: room.id,
                                targetUser: otherUser,
                              ),
                            ),
                          ).then((_) {
                            chatProvider.fetchRooms(currentUserId);
                          });
                        },
                      );
                    },
                  ),
                ),
    );
  }
}
