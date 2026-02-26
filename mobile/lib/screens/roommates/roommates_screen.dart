import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/roommate_card.dart';

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
            // Hero Section
            Container(
              decoration: const BoxDecoration(
                gradient: AppTheme.primaryGradient,
              ),
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 32,
                bottom: 40,
                left: 24,
                right: 24,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  Text(
                    'Find your perfect roommate',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Connect with verified roommates across Sri Lanka',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.white70,
                        ),
                  ),
                  const SizedBox(height: 24),
                  // Search Box
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: Row(
                      children: [
                        const Text('📍', style: TextStyle(fontSize: 20)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            decoration: const InputDecoration(
                              hintText: 'Search by location',
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.search, color: Colors.white),
                            onPressed: () {},
                          ),
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            
            // All Roommates
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Available Roommates',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Showing ${fallbackRoommates.length} roommates',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Roommates Grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2, // 1 for narrow phones might be better, let's keep it responsive if possible, or stick to 2
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.75, // Adjust for RoommateCard height
                ),
                itemCount: fallbackRoommates.length,
                itemBuilder: (context, index) {
                  final roommate = fallbackRoommates[index];
                  return GestureDetector(
                    onTap: () {
                      // Navigator.pushNamed(context, '/roommateView');
                    },
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
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
      ),
    );
  }
}
