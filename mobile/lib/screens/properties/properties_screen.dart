import 'package:flutter/material.dart';
import '../../widgets/property_card.dart';
import '../../widgets/glass_card.dart';

class PropertiesScreen extends StatefulWidget {
  const PropertiesScreen({super.key});

  @override
  State<PropertiesScreen> createState() => _PropertiesScreenState();
}

class _PropertiesScreenState extends State<PropertiesScreen> {
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> properties = [
    {
      'image': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
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
      'image': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400',
      'title': 'Cinnamon Gardens, Colombo',
      'location': "Queen Anne's Court (Colombo 7)",
      'rating': 4.8,
      'reviews': 124,
      'price': 45000.0,
      'available': 'Nov 1',
      'amenities': [
        {'icon': '📶', 'label': 'WiFi'},
        {'icon': '❄️', 'label': 'AC'},
      ],
    },
    {
      'image': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
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
      'image': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      'title': 'Cinnamon Gardens, Colombo',
      'location': "Queen Anne's Court (Colombo 7)",
      'rating': 4.8,
      'reviews': 124,
      'price': 60000.0,
      'available': 'Nov 1',
      'amenities': [
        {'icon': '📶', 'label': 'WiFi'},
        {'icon': '❄️', 'label': 'AC'},
      ],
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
                        'Find your perfect boarding',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Browse through all available properties',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                      const SizedBox(height: 24),
                      // Search Box matching the image
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
                                    hintText: 'Where do you want to stay?',
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
              
              // All Properties
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'All Properties',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0A2463),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Showing ${properties.length} properties',
                      style: TextStyle(color: const Color(0xFF0A2463).withOpacity(0.6)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // Properties List
              ListView.builder(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(horizontal: 24),
                physics: const NeverScrollableScrollPhysics(),
                itemCount: properties.length,
                itemBuilder: (context, index) {
                  final prop = properties[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 24),
                    child: PropertyCard(
                      image: prop['image'],
                      title: prop['title'],
                      location: prop['location'],
                      rating: prop['rating'],
                      reviews: prop['reviews'],
                      price: prop['price'],
                      available: prop['available'],
                      amenities: (prop['amenities'] as List).cast<Map<String, String>>(),
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
