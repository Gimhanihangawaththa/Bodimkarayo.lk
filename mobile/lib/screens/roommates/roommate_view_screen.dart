import 'package:flutter/material.dart';

class RoommateViewScreen extends StatefulWidget {
  const RoommateViewScreen({super.key});

  @override
  State<RoommateViewScreen> createState() => _RoommateViewScreenState();
}

class _RoommateViewScreenState extends State<RoommateViewScreen> {
  final Map<String, dynamic> roommate = {
    "name": "Priya Perera",
    "age": 24,
    "occupation": "Software Engineer",
    "location": "Colombo 7",
    "rating": 4.8,
    "tags": ["Cooking", "Reading", "Yoga", "Writing"],
    "bio": "Friendly and tidy. Loves quiet evenings, good food, and weekend hikes. Looking for a respectful roommate.",
    "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    "about": "I'm a software engineer working at a tech company. I value cleanliness and respect for shared spaces. I enjoy cooking and often prepare meals for myself.",
    "interests": ["Cooking", "Reading", "Yoga", "Writing", "Hiking", "Photography"],
    "preferences": {
      "lookingFor": "1-2 roommates",
      "budget": "Rs. 15,000 - 20,000",
      "preferredLocation": "Colombo 3-7",
      "moveInDate": "Flexible",
    },
    "reviews": [
      {
        "author": "Samith Kumar",
        "rating": 5,
        "text": "Great roommate! Very respectful and clean. Highly recommended!",
      },
      {
        "author": "Jessica Wong",
        "rating": 4,
        "text": "Nice person, good to live with.",
      },
    ],
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        title: const Text('Roommate Profile', style: TextStyle(color: Colors.black)),
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
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                padding: const EdgeInsets.all(20),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundImage: NetworkImage(roommate['avatarUrl']),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            roommate['name'],
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            roommate['occupation'],
                            style: TextStyle(color: Colors.grey[700], fontSize: 16),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            roommate['location'],
                            style: TextStyle(color: Colors.grey[500], fontSize: 14),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.star, color: Colors.amber, size: 20),
                              const SizedBox(width: 4),
                              Text('${roommate['rating']} rating', style: TextStyle(color: Colors.grey[700])),
                            ],
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue[600],
                            ),
                            child: const Text('Send Connection Request'),
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
                    Text(roommate['about'], style: const TextStyle(height: 1.5, color: Colors.black87)),
                    const SizedBox(height: 12),
                    Text(roommate['bio'], style: const TextStyle(height: 1.5, color: Colors.black87)),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Interests
              _buildCardSection(
                title: 'Interests',
                content: Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: (roommate['interests'] as List).map((interest) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        interest,
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
                    _buildPrefItem('Looking For', roommate['preferences']['lookingFor']),
                    _buildPrefItem('Budget', roommate['preferences']['budget']),
                    _buildPrefItem('Preferred Location', roommate['preferences']['preferredLocation']),
                    _buildPrefItem('Move In Date', roommate['preferences']['moveInDate']),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Reviews
              _buildCardSection(
                title: 'Reviews',
                content: Column(
                  children: (roommate['reviews'] as List).map((review) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(review['author'], style: const TextStyle(fontWeight: FontWeight.bold)),
                              Row(
                                children: List.generate(
                                  5,
                                  (index) => Icon(
                                    Icons.star,
                                    size: 16,
                                    color: index < review['rating'] ? Colors.amber : Colors.grey[300],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(review['text'], style: TextStyle(color: Colors.grey[700])),
                          const Divider(),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
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
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
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
}
