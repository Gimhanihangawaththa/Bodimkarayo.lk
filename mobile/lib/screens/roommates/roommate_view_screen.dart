import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/roommate_model.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/roommate_provider.dart';
import '../../providers/chat_provider.dart';
import '../chat/chat_conversation_screen.dart';
import 'apply_roommate_screen.dart';

class RoommateViewScreen extends StatefulWidget {
  final RoommateModel roommate;
  const RoommateViewScreen({super.key, required this.roommate});

  @override
  State<RoommateViewScreen> createState() => _RoommateViewScreenState();
}

class _RoommateViewScreenState extends State<RoommateViewScreen> {

  @override
  Widget build(BuildContext context) {
    final currentUser = context.read<AuthProvider>().user;
    
    // Fetch updated roommate from provider so changes reflect immediately
    final roommates = context.watch<RoommateProvider>().roommates;
    final currentRoommate = roommates.firstWhere(
      (r) => r.id == widget.roommate.id,
      orElse: () => widget.roommate,
    );

    final isOwner = currentUser != null && currentRoommate.posterId != null && currentUser.id == currentRoommate.posterId;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        title: const Text('Roommate Profile', style: TextStyle(color: Colors.black)),
        actions: [
          if (isOwner)
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.blue),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ApplyRoommateScreen(existingRoommate: currentRoommate),
                  ),
                );
              },
            ),
          if (isOwner)
            IconButton(
              icon: const Icon(Icons.delete, color: Colors.red),
              onPressed: _showDeleteDialog,
            ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header Section
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                padding: const EdgeInsets.all(20),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundImage: NetworkImage(
                        currentRoommate.image != null && currentRoommate.image!.isNotEmpty
                            ? currentRoommate.image!
                            : (currentRoommate.gender.toUpperCase() == 'FEMALE'
                                ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                                : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  currentRoommate.name ?? 'Roommate Profile',
                                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (currentRoommate.isVerified)
                                const Icon(Icons.verified, color: Color(0xFF2563EB), size: 20),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEAF4FB),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              currentRoommate.occupation,
                              style: const TextStyle(color: Color(0xFF246FA8), fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${currentRoommate.location} • ${currentRoommate.age ?? '24'} yrs',
                            style: TextStyle(color: Colors.grey[600], fontSize: 13),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  '${currentRoommate.matchPercentage ?? 95}% Match',
                                  style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 11),
                                ),
                              ),
                              const SizedBox(width: 8),
                              if (currentRoommate.budget != null)
                                Text(
                                  'Max Rs ${(currentRoommate.budget! / 1000).toStringAsFixed(0)}k/mo',
                                  style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 12),
                                ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: () async {
                              final authUser = context.read<AuthProvider>().user;
                              if (authUser == null || authUser.id == null) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text('Please sign in to message this roommate'),
                                    action: SnackBarAction(label: 'Sign In', onPressed: () => Navigator.pushNamed(context, '/signin')),
                                  ),
                                );
                                return;
                              }
                              final targetId = currentRoommate.posterId ?? 1;
                              if (authUser.id == targetId) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('This is your own post!')));
                                return;
                              }
                              final chatProvider = context.read<ChatProvider>();
                              final navigator = Navigator.of(context);
                              final room = await chatProvider.getOrCreateRoom(authUser.id!, targetId);
                              if (room != null && mounted) {
                                navigator.push(
                                  MaterialPageRoute(
                                    builder: (context) => ChatConversationScreen(
                                      roomId: room.id,
                                      targetUser: UserModel(id: targetId, email: 'roommate@bodimkarayo.lk', fullName: 'Roommate Poster'),
                                    ),
                                  ),
                                );
                              }
                            },
                            icon: const Icon(Icons.chat_bubble_outline, color: Colors.white, size: 18),
                            label: const Text('Message Roommate', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0A2463),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // About Section
              _buildCardSection(
                title: 'About',
                content: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(currentRoommate.about ?? 'No additional info provided.', style: const TextStyle(height: 1.5, color: Colors.black87)),
                    const SizedBox(height: 12),
                    Text(currentRoommate.bio, style: const TextStyle(height: 1.5, color: Colors.black87)),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Interests
              if (currentRoommate.interests != null && currentRoommate.interests!.isNotEmpty)
                _buildCardSection(
                  title: 'Interests',
                  content: Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: currentRoommate.interests!.split(',').map((interest) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          interest.trim(),
                          style: TextStyle(color: Colors.blue[800], fontWeight: FontWeight.w600),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              const SizedBox(height: 20),

              // Preferences
              _buildCardSection(
                title: 'Preferences',
                content: GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 2.5,
                  children: [
                    _buildPrefItem('Looking For', widget.roommate.gender),
                    _buildPrefItem('Budget', 'Rs. ${widget.roommate.budget ?? 'N/A'}'),
                    _buildPrefItem('Preferred Location', widget.roommate.preferredLocation ?? widget.roommate.location),
                    _buildPrefItem('Move In Date', widget.roommate.moveInDate ?? 'Flexible'),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCardSection({required String title, required Widget content}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          content,
        ],
      ),
    );
  }

  Widget _buildPrefItem(String title, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
      ],
    );
  }

  void _showDeleteDialog() {
    final roommateProvider = context.read<RoommateProvider>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete Post'),
        content: const Text('Are you sure you want to delete this roommate post?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogContext); // close dialog
              final success = await roommateProvider.deleteRoommate(widget.roommate.id!);
              if (!mounted) return;
              if (success) {
                navigator.pop(); // close view screen
                messenger.showSnackBar(
                  const SnackBar(content: Text('Post deleted successfully')),
                );
              } else {
                messenger.showSnackBar(
                  const SnackBar(content: Text('Failed to delete post')),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
