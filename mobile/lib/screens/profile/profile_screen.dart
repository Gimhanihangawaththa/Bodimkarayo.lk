import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final Map<String, dynamic> user = {
    "name": "John Doe",
    "age": 28,
    "occupation": "Software Engineer",
    "location": "Colombo 3",
    "bio": "Friendly and professional. Looking for a comfortable living space.",
    "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    "about": "I'm a software engineer with a passion for building great products. I'm organized, clean, and respectful of shared spaces.",
    "email": "john.doe@example.com",
    "phone": "+94 71 234 5678",
    "interests": ["Technology", "Cooking", "Reading", "Fitness", "Travel"],
    "roommateApplicationStatus": "notApplied",
    "isPropertyOwner": true,
    "userProperties": [
      {
        "id": 1,
        "title": "Cozy Apartment Near University",
        "price": "35,000",
        "location": "Colombo 5",
        "type": "Apartment",
        "image": "https://images.unsplash.com/photo-1453227427063-bf47ddb8af6f?w=400&h=300&fit=crop",
        "bedrooms": 2,
        "bathrooms": 1,
      },
    ],
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Profile'),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: AppTheme.primaryGradient,
          ),
        ),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Navigator.pushReplacementNamed(context, '/signin'),
          ),
        ],
      ),
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
                    Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Theme.of(context).colorScheme.primary, width: 2),
                      ),
                      child: CircleAvatar(
                        radius: 40,
                        backgroundImage: NetworkImage(user['avatarUrl']),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user['name'],
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            user['occupation'],
                            style: TextStyle(color: Colors.grey[700], fontSize: 16),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 14, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text(user['location'], style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(user['email'], style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                          Text(user['phone'], style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              const Text('Status: ', style: TextStyle(color: Colors.grey, fontSize: 12)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.grey[200],
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text('Not Applied', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () {},
                                  child: const Text('Edit Profile'),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () {},
                                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green[600]),
                                  child: const Text('Apply Roommate'),
                                ),
                              ),
                            ],
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
                    Text(user['about'], style: const TextStyle(height: 1.5, color: Colors.black87)),
                    const SizedBox(height: 12),
                    Text(user['bio'], style: const TextStyle(height: 1.5, color: Colors.black87)),
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
                  children: (user['interests'] as List).map((interest) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        interest,
                        style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w600),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 20),

              // Properties Section
              if (user['isPropertyOwner'])
                _buildCardSection(
                  title: 'My Properties',
                  trailing: TextButton(
                    onPressed: () {},
                    child: const Text('+ Add Property'),
                  ),
                  content: ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: (user['userProperties'] as List).length,
                    itemBuilder: (context, index) {
                      final prop = user['userProperties'][index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[200]!),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                                  child: Image.network(
                                    prop['image'],
                                    height: 120,
                                    width: double.infinity,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Positioned(
                                  top: 8,
                                  right: 8,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).colorScheme.primary,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      prop['type'],
                                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(prop['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  const SizedBox(height: 4),
                                  Text('📍 ${prop['location']}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                                  const SizedBox(height: 8),
                                  Text('Rs ${prop['price']}/month', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold, fontSize: 16)),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Text('🛏️ ${prop['bedrooms']} Bed', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                                      const SizedBox(width: 16),
                                      Text('🚿 ${prop['bathrooms']} Bath', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  SizedBox(
                                    width: double.infinity,
                                    child: OutlinedButton(
                                      onPressed: () {},
                                      child: const Text('View Details'),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
      ),
    );
  }

  Widget _buildCardSection({required String title, Widget? trailing, required Widget content}) {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              if (trailing != null) trailing,
            ],
          ),
          const SizedBox(height: 16),
          content,
        ],
      ),
    );
  }
}
