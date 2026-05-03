import 'package:flutter/material.dart';
import '../../widgets/roommate_card.dart';
import '../../widgets/glass_card.dart';

class RoommatesScreen extends StatefulWidget {
  const RoommatesScreen({super.key});

  @override
  State<RoommatesScreen> createState() => _RoommatesScreenState();
}

class _RoommatesScreenState extends State<RoommatesScreen> {
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> fallbackRoommates = [
    {
      'image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'name': 'Kasun',
      'age': 23,
      'location': 'Colombo 7',
      'bio': 'Engineering student looking for a friendly roommate',
      'interests': ['Tech', 'Sports', 'Music'],
      'verified': true,
    },
    {
      'image': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'name': 'Amelia',
      'age': 24,
      'location': 'Colombo 5',
      'bio': 'Marketing professional seeking a roommate',
      'interests': ['Books', 'Yoga', 'Cooking'],
      'verified': true,
    },
    {
      'image': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'name': 'Ravi',
      'age': 22,
      'location': 'Colombo 6',
      'bio': 'Medical student, quiet and focused',
      'interests': ['Reading', 'Gaming', 'Photography'],
      'verified': true,
    },
    {
      'image': 'https://images.unsplash.com/photo-1517841905240-74ab9f1122d0?w=400',
      'name': 'Shenal',
      'age': 25,
      'location': 'Colombo 4',
      'bio': 'Software developer open to sharing apartment',
      'interests': ['Coding', 'Movies', 'Travel'],
      'verified': true,
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent, // Show main screen gradient
      body: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0.0, end: 1.0),
        duration: const Duration(milliseconds: 1200),
        curve: Curves.easeOutCubic,
        builder: (context, value, child) {
          return Transform.translate(
            offset: Offset(0, 50 * (1 - value)),
            child: Opacity(
              opacity: value,
              child: child,
            ),
          );
        },
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Section - Dark Glass Card
              Container(
                margin: EdgeInsets.only(
                  top: MediaQuery.of(context).padding.top + 16,
                  left: 24,
                  right: 24,
                ),
                child: GlassCard(
                  isDark: true,
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Find your perfect roommate',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Connect with verified roommates across Sri Lanka',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2), // Outer glass effect
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: Colors.white.withOpacity(0.4), width: 1),
                        ),
                        child: Row(
                          children: [
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 8),
                              child: Icon(Icons.location_on, color: Colors.white, size: 24),
                            ),
                            Expanded(
                              child: Container(
                                height: 40,
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                decoration: BoxDecoration(
                                  color: Colors.white, // Inner solid white box
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: TextField(
                                  controller: _searchController,
                                  style: const TextStyle(color: Color(0xFF0A2463)),
                                  decoration: const InputDecoration(
                                    hintText: 'Search by location',
                                    hintStyle: TextStyle(color: Colors.grey, fontSize: 14),
                                    border: InputBorder.none,
                                    contentPadding: EdgeInsets.only(bottom: 12),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              height: 40,
                              width: 40,
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                              child: IconButton(
                                padding: EdgeInsets.zero,
                                icon: const Icon(Icons.search, color: Color(0xFF0A2463), size: 22),
                                onPressed: () {},
                              ),
                            )
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              // All Roommates
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Available Roommates',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0A2463),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Showing ${fallbackRoommates.length} roommates',
                      style: TextStyle(color: const Color(0xFF0A2463).withOpacity(0.6)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // Roommates List
              ListView.builder(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(horizontal: 24),
                physics: const NeverScrollableScrollPhysics(),
                itemCount: fallbackRoommates.length,
                itemBuilder: (context, index) {
                  final roommate = fallbackRoommates[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 24),
                    child: RoommateCard(
                      image: roommate['image'],
                      name: roommate['name'],
                      age: roommate['age'],
                      location: roommate['location'],
                      bio: roommate['bio'],
                      interests: (roommate['interests'] as List).cast<String>(),
                      verified: roommate['verified'],
                    ),
                  );
                },
              ),
              const SizedBox(height: 100), // padding for bottom nav
            ],
          ),
        ),
      ),
    );
  }
}
