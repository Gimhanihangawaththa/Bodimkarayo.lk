import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/property_card.dart';

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
    {
      'image': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      'title': 'Cinnamon Gardens, Colombo',
      'location': "Queen Anne's Court (Colombo 7)",
      'rating': 4.7,
      'reviews': 98,
      'price': 38000.0,
      'available': 'Dec 1',
      'amenities': [
        {'icon': '📶', 'label': 'WiFi'},
        {'icon': '❄️', 'label': 'AC'},
      ],
    },
    {
      'image': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400',
      'title': 'Cinnamon Gardens, Colombo',
      'location': "Queen Anne's Court (Colombo 7)",
      'rating': 4.9,
      'reviews': 156,
      'price': 52000.0,
      'available': 'Nov 15',
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
                    'Find your perfect boarding',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Browse through all available properties',
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
                              hintText: 'where do you want to stay ?',
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
            
            // All Properties
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'All Properties',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Showing ${properties.length} properties',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Properties Grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2, // Assuming roughly tablet/wide-phone, on standard phone 1 is better. We can adapt this.
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.75, // Adjust for PropertyCard height
                ),
                itemCount: properties.length,
                itemBuilder: (context, index) {
                  final prop = properties[index];
                  // Need to create a touchable wrapper to navigate to PropertyView
                  // Using LayoutBuilder to adapt columns
                  return GestureDetector(
                    onTap: () {
                      // Navigator.pushNamed(context, '/propertyView');
                    },
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
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
      ),
    );
  }
}
