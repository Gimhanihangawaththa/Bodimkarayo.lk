import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/roommate_model.dart';
import '../models/user_model.dart';
import '../providers/auth_provider.dart';
import '../providers/chat_provider.dart';
import '../screens/roommates/roommate_view_screen.dart';
import '../screens/chat/chat_conversation_screen.dart';

class RoommateCard extends StatefulWidget {
  final RoommateModel roommate;
  final VoidCallback? onTap;

  const RoommateCard({
    super.key,
    required this.roommate,
    this.onTap,
  });

  @override
  State<RoommateCard> createState() => _RoommateCardState();
}

class _RoommateCardState extends State<RoommateCard> {
  bool _isHovered = false;

  void _connectAndMessage(BuildContext context) async {
    final authUser = context.read<AuthProvider>().user;
    if (authUser == null || authUser.id == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please sign in to message this roommate'),
          action: SnackBarAction(
            label: 'Sign In',
            onPressed: () => Navigator.pushNamed(context, '/signin'),
          ),
        ),
      );
      return;
    }

    final targetId = widget.roommate.posterId ?? 1;
    if (authUser.id == targetId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('This is your own roommate post!')),
      );
      return;
    }

    final chatProvider = context.read<ChatProvider>();
    final room = await chatProvider.getOrCreateRoom(authUser.id!, targetId);

    if (room != null && context.mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatConversationScreen(
            roomId: room.id,
            targetUser: UserModel(
              id: targetId,
              email: 'roommate@bodimkarayo.lk',
              fullName: widget.roommate.name ?? 'Roommate Poster',
            ),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final roommate = widget.roommate;
    final interestsList = roommate.interests != null && roommate.interests!.isNotEmpty
        ? roommate.interests!.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList()
        : <String>[];

    final imageUrl = (roommate.image != null && roommate.image!.isNotEmpty)
        ? roommate.image!
        : (roommate.gender.toUpperCase() == 'FEMALE'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500');

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: widget.onTap ?? () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => RoommateViewScreen(roommate: roommate),
            ),
          );
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: _isHovered ? const Color(0xFF3488C3).withValues(alpha: 0.6) : Colors.grey.shade200,
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: _isHovered
                    ? const Color(0xFF3488C3).withValues(alpha: 0.18)
                    : Colors.black.withValues(alpha: 0.05),
                blurRadius: _isHovered ? 20 : 10,
                offset: Offset(0, _isHovered ? 8 : 4),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Photo with Hero Badges
                Stack(
                  children: [
                    Image.network(
                      imageUrl,
                      height: 145,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        height: 145,
                        width: double.infinity,
                        color: Colors.grey.shade200,
                        child: const Icon(Icons.person, color: Colors.grey, size: 40),
                      ),
                    ),
                    // Gradient overlay
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.3),
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.75),
                            ],
                            stops: const [0.0, 0.45, 1.0],
                          ),
                        ),
                      ),
                    ),
                    // Top Left Match Percentage Badge
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: const [
                            BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              '${roommate.matchPercentage ?? 95}% Match',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // Top Right Verified Badge
                    if (roommate.isVerified)
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          width: 26,
                          height: 26,
                          decoration: const BoxDecoration(
                            color: Color(0xFF2563EB),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
                            ],
                          ),
                          child: const Icon(Icons.check, color: Colors.white, size: 16),
                        ),
                      ),
                    // Bottom Overlays on Photo
                    Positioned(
                      bottom: 10,
                      left: 12,
                      right: 12,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.white24),
                            ),
                            child: Text(
                              roommate.budget != null
                                  ? '💰 Max Rs ${(roommate.budget! / 1000).toStringAsFixed(0)}k/mo'
                                  : '💰 Flex Rent',
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.white24),
                              ),
                              child: Text(
                                '📍 ${roommate.location}',
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                // Content
                Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name & Occupation
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${roommate.name ?? 'Flatmate'}${roommate.age != null ? ', ${roommate.age}' : ''}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: Color(0xFF0F172A),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEAF4FB),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFFD2E7F6)),
                            ),
                            child: Text(
                              roommate.occupation,
                              style: const TextStyle(
                                color: Color(0xFF246FA8),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),

                      // Bio
                      Text(
                        roommate.bio,
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 12,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 10),

                      // Interests
                      if (interestsList.isNotEmpty)
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: interestsList.take(3).map((interest) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey.shade300),
                              ),
                              child: Text(
                                interest,
                                style: TextStyle(
                                  color: Colors.grey.shade800,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                      const SizedBox(height: 12),

                      // Action Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _connectAndMessage(context),
                          icon: const Icon(Icons.chat_bubble_outline_rounded, size: 14),
                          label: const Text(
                            'Connect & Message',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF3488C3),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
