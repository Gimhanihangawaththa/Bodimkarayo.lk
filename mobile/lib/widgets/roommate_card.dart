import 'package:flutter/material.dart';
import '../models/roommate_model.dart';
import '../screens/roommates/roommate_view_screen.dart';
import 'glass_card.dart';

class RoommateCard extends StatefulWidget {
  final RoommateModel roommate;

  const RoommateCard({
    super.key,
    required this.roommate,
  });

  @override
  State<RoommateCard> createState() => _RoommateCardState();
}

class _RoommateCardState extends State<RoommateCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final roommate = widget.roommate;
    // Split interests if they are a comma-separated string
    final interestsList = roommate.interests?.split(',').map((e) => e.trim()).toList() ?? [];
    const placeholderImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => RoommateViewScreen(roommate: roommate),
          ),
        );
      },
      child: AnimatedScale(
        scale: _isPressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOutBack,
        child: GlassCard(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 24),
          padding: EdgeInsets.zero,
          isDark: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Image
              Hero(
                tag: 'roommate_${roommate.id}_${roommate.location}',
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  child: Image.network(
                    placeholderImage, // Using placeholder for now as backend model doesn't have image
                    height: 140,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 140,
                      width: double.infinity,
                      color: Colors.white.withOpacity(0.2),
                      child: const Icon(Icons.broken_image, color: Colors.white),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${roommate.gender}, ${roommate.age ?? 20}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: Color(0xFF0A2463),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Icon(Icons.verified_rounded, color: Color(0xFF3E92CC), size: 22),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      roommate.occupation,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF3E92CC),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, size: 16, color: Color(0xFF3E92CC)),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            roommate.location,
                            style: const TextStyle(fontSize: 14, color: Color(0xFF0A2463)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      roommate.bio,
                      style: TextStyle(fontSize: 14, color: const Color(0xFF0A2463).withOpacity(0.7)),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 16),
                    if (interestsList.isNotEmpty)
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: interestsList.take(4).map((interest) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF3E92CC).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              interest,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF0A2463),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
