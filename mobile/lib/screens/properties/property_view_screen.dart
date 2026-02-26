import 'package:flutter/material.dart';
import '../../widgets/info_pill.dart';

class PropertyViewScreen extends StatefulWidget {
  const PropertyViewScreen({super.key});

  @override
  State<PropertyViewScreen> createState() => _PropertyViewScreenState();
}

class _PropertyViewScreenState extends State<PropertyViewScreen> {
  final Map<String, dynamic> property = {
    "title": "Modern Apartment in Downtown",
    "price": "45,000",
    "priceRange": "month",
    "availableFrom": "Nov 20",
    "location": "Downtown Area, Colombo 3",
    "address": "32 Galle Road, Colombo 03, Sri Lanka",
    "type": "Apartment",
    "numberOfPeople": "4",
    "rating": 4.8,
    "images": [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop",
    ],
    "bedrooms": 2,
    "kitchens": 1,
    "bathrooms": 2,
    "sizeSqft": "1,150 sq ft",
    "floor": "6th floor",
    "furnished": "Fully furnished",
    "parking": "1 reserved slot",
    "security": "24/7 security",
    "petsAllowed": "No pets",
    "yearBuilt": "2019",
    "description":
        "Beautiful modern apartment with stunning city views. Newly renovated with high-end fixtures and appliances. Perfect for professionals or small families.",
    "highlights": [
      "Sunset balcony with city skyline views",
      "Quiet building with concierge service",
    ],
    "offers": [
      "High-Speed WiFi",
      "Parking Available",
      "Air Conditioning",
    ],
    "rules": ["No smoking", "No loud parties"],
    "nearby": ["Galle Face Green - 10 min", "Odel Mall - 8 min"],
    "owner": {
      "name": "Sunil Perera",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunil",
      "rating": 4.9,
    },
  };

  bool _isFavorite = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300.0,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    property['images'][0],
                    fit: BoxFit.cover,
                  ),
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.transparent, Colors.black87],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 24,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            InfoPill(label: property['type'], baseColor: Colors.blueAccent),
                            const SizedBox(width: 8),
                            InfoPill(label: 'Avail: ${property['availableFrom']}', baseColor: Colors.greenAccent),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          property['title'],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          property['address'],
                          style: const TextStyle(color: Colors.white70),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border),
                color: _isFavorite ? Colors.redAccent : Colors.white,
                onPressed: () {
                  setState(() {
                    _isFavorite = !_isFavorite;
                  });
                },
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('MONTHLY RENT', style: TextStyle(color: Colors.grey, fontSize: 12, letterSpacing: 1.5)),
                        const SizedBox(height: 8),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Rs ${property['price']}',
                              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              ' /${property['priceRange']}',
                              style: const TextStyle(color: Colors.grey, fontSize: 16),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 50),
                            backgroundColor: Colors.blue[600],
                          ),
                          child: const Text('Message Owner'),
                        ),
                        const SizedBox(height: 12),
                        OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 50),
                          ),
                          child: const Text('Schedule a Visit'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Overview
                  _buildSectionTitle('Overview'),
                  Text(
                    property['description'],
                    style: TextStyle(color: Colors.grey[700], height: 1.5),
                  ),
                  const SizedBox(height: 24),

                  // Specifications
                  _buildSectionTitle('Specifications'),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildSpecItem(Icons.bed, '${property['bedrooms']} Beds'),
                      _buildSpecItem(Icons.bathtub, '${property['bathrooms']} Baths'),
                      _buildSpecItem(Icons.kitchen, '${property['kitchens']} Kitchen'),
                      _buildSpecItem(Icons.square_foot, property['sizeSqft']),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Amenities
                  _buildSectionTitle('Amenities'),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: (property['offers'] as List).map((offer) {
                      return Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.check_circle, color: Colors.green, size: 20),
                          const SizedBox(width: 8),
                          Text(offer.toString()),
                        ],
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 32),

                  // Rules
                  _buildSectionTitle('House Rules'),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: (property['rules'] as List).map((rule) {
                      return Chip(label: Text(rule.toString()), backgroundColor: Colors.grey[200]);
                    }).toList(),
                  ),
                  const SizedBox(height: 48),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildSpecItem(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.blueAccent, size: 28),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }
}
