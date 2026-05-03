import 'package:flutter/material.dart';
import '../../widgets/property_card.dart';
import '../../widgets/roommate_card.dart';
import '../../widgets/glass_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> fallbackProperties = [
    {
      'image': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80',
      'title': 'Cinnamon Gardens, Colombo',
      'location': "Queen Anne's Court (Colombo 7)",
      'rating': 4.8,
      'reviews': 124,
      'price': 40000.0,
      'available': 'Nov 1',
      'amenities': [
        {'icon': '📶', 'label': 'WiFi'},
        {'icon': '❄️', 'label': 'AC'},
      ],
    },
    {
      'image': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
      'title': 'Luxury Studio, Colombo',
      'location': 'Havelock City (Colombo 6)',
      'rating': 4.9,
      'reviews': 89,
      'price': 45000.0,
      'available': 'Ready',
      'amenities': [
        {'icon': '📶', 'label': 'WiFi'},
        {'icon': '❄️', 'label': 'AC'},
      ],
    },
    {
      'image': 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=80',
      'title': 'Cozy Room, Mount Lavinia',
      'location': 'Near Beach (Mount Lavinia)',
      'rating': 4.6,
      'reviews': 54,
      'price': 35000.0,
      'available': 'Dec 1',
      'amenities': [
        {'icon': '🌊', 'label': 'Beach'},
        {'icon': '📶', 'label': 'WiFi'},
      ],
    },
  ];

  final List<Map<String, dynamic>> fallbackRoommates = [
    {
      'image': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      'name': 'Kasun',
      'age': 23,
      'location': 'Colombo 7',
      'bio': 'Engineering student looking for a friendly roommate',
      'interests': ['Tech', 'Sports', 'Music'],
      'verified': true,
    },
    {
      'image': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'name': 'Amelia',
      'age': 24,
      'location': 'Colombo 5',
      'bio': 'Marketing professional seeking a roommate',
      'interests': ['Books', 'Yoga', 'Cooking'],
      'verified': true,
    },
    {
      'image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      'name': 'Dineth',
      'age': 25,
      'location': 'Nugegoda',
      'bio': 'Quiet and tidy software engineer',
      'interests': ['Gaming', 'Movies', 'Code'],
      'verified': false,
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
      backgroundColor: Colors.transparent, // Let gradient from MainScreen show through
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                            image: const DecorationImage(
                              image: NetworkImage('https://i.pravatar.cc/150?img=11'),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Good Morning,',
                              style: TextStyle(color: Color(0xFF0A2463), fontSize: 12),
                            ),
                            Text(
                              'Rahul',
                              style: TextStyle(
                                color: Color(0xFF0A2463),
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.notifications_outlined, color: Color(0xFF0A2463)),
                      onPressed: () {},
                    ),
                  ],
                ),
              ),

              // Search Box
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: GlassCard(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.search_rounded, color: Color(0xFF0A2463), size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(color: Color(0xFF0A2463)),
                          decoration: InputDecoration(
                            hintText: 'Where do you want to stay?',
                            hintStyle: TextStyle(color: const Color(0xFF0A2463).withOpacity(0.5)),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0A2463),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.tune_rounded, color: Colors.white, size: 18),
                      )
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Featured Boardings
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Featured Boardings',
                      style: TextStyle(
                        color: Color(0xFF0A2463),
                        fontWeight: FontWeight.bold,
                        fontSize: 20,
                      ),
                    ),
                    Text(
                      'See all',
                      style: TextStyle(
                        color: const Color(0xFF0A2463).withOpacity(0.6),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 330,
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  itemCount: fallbackProperties.length,
                  itemBuilder: (context, index) {
                    final prop = fallbackProperties[index];
                    return PropertyCard(
                      image: prop['image'],
                      title: prop['title'],
                      location: prop['location'],
                      rating: prop['rating'],
                      reviews: prop['reviews'],
                      price: prop['price'],
                      available: prop['available'],
                      amenities: (prop['amenities'] as List).cast<Map<String, String>>(),
                    );
                  },
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Roommates Section
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 24),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(30),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3E92CC), Color(0xFF0A2463)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0A2463).withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Find Roommates',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text(
                            'AI Match',
                            style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 320,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        itemCount: fallbackRoommates.length,
                        itemBuilder: (context, index) {
                          final roommate = fallbackRoommates[index];
                          return RoommateCard(
                            image: roommate['image'],
                            name: roommate['name'],
                            age: roommate['age'],
                            location: roommate['location'],
                            bio: roommate['bio'],
                            interests: (roommate['interests'] as List).cast<String>(),
                            verified: roommate['verified'],
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 100), // padding for bottom nav
            ],
          ),
        ),
      ),
    );
  }
}
