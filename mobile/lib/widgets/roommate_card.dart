import 'package:flutter/material.dart';
import 'glass_card.dart';

class RoommateCard extends StatefulWidget {
  final String image;
  final String name;
  final int age;
  final String location;
  final String bio;
  final List<String> interests;
  final bool verified;

  const RoommateCard({
    super.key,
    required this.image,
    required this.name,
    required this.age,
    required this.location,
    required this.bio,
    required this.interests,
    required this.verified,
  });

  @override
  State<RoommateCard> createState() => _RoommateCardState();
}

class _RoommateCardState extends State<RoommateCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {},
      child: AnimatedScale(
        scale: _isPressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOutBack,
        child: GlassCard(
          width: 250,
          margin: const EdgeInsets.only(right: 20, bottom: 12, top: 4),
          padding: EdgeInsets.zero,
          isDark: false, // Using light glassmorphism for consistency
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min, // To prevent unbounded height issues
            children: [
              // Image
              Hero(
                tag: 'roommate_${widget.name}_${widget.image}',
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  child: Image.network(
                    widget.image,
                    height: 120, // Reduced from 140
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 120,
                      width: double.infinity,
                      color: Colors.white.withOpacity(0.2),
                      child: const Icon(Icons.broken_image, color: Colors.white),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name and verification
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${widget.name}, ${widget.age}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: Color(0xFF0A2463),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (widget.verified)
                          const Icon(Icons.verified_rounded, color: Color(0xFF3E92CC), size: 20),
                      ],
                    ),
                    const SizedBox(height: 4),
                    // Location
                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF3E92CC)),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            widget.location,
                            style: const TextStyle(fontSize: 12, color: Color(0xFF0A2463)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Bio
                    Text(
                      widget.bio,
                      style: TextStyle(fontSize: 12, color: const Color(0xFF0A2463).withOpacity(0.7)),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 12),
                    // Interests
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: widget.interests.take(3).map((interest) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF3E92CC).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            interest,
                            style: const TextStyle(
                              fontSize: 11,
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
