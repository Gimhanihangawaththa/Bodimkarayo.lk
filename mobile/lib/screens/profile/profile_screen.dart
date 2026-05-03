import 'package:flutter/material.dart';
import '../../widgets/glass_card.dart';

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
        "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        "bedrooms": 2,
        "bathrooms": 1,
      },
    ],
  };

  void _deleteProperty(int id) {
    setState(() {
      (user['userProperties'] as List).removeWhere((p) => p['id'] == id);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Property deleted successfully')),
    );
  }

  void _showPropertyForm({Map<String, dynamic>? property}) {
    final isEditing = property != null;
    final titleController = TextEditingController(text: property?['title'] ?? '');
    final priceController = TextEditingController(text: property?['price'] ?? '');
    final locationController = TextEditingController(text: property?['location'] ?? '');
    final typeController = TextEditingController(text: property?['type'] ?? 'Apartment');
    final bedsController = TextEditingController(text: property?['bedrooms']?.toString() ?? '1');
    final bathsController = TextEditingController(text: property?['bathrooms']?.toString() ?? '1');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: GlassCard(
          borderRadius: 32,
          margin: const EdgeInsets.all(16),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  isEditing ? 'Edit Property' : 'Add New Property',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0A2463),
                  ),
                ),
                const SizedBox(height: 20),
                _buildTextField(titleController, 'Property Title', Icons.title),
                const SizedBox(height: 12),
                _buildTextField(priceController, 'Price (Rs/month)', Icons.payments_outlined, isNumber: true),
                const SizedBox(height: 12),
                _buildTextField(locationController, 'Location', Icons.location_on_outlined),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildTextField(bedsController, 'Beds', Icons.bed_outlined, isNumber: true)),
                    const SizedBox(width: 12),
                    Expanded(child: _buildTextField(bathsController, 'Baths', Icons.shower_outlined, isNumber: true)),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    final newProperty = {
                      "id": isEditing ? property['id'] : DateTime.now().millisecondsSinceEpoch,
                      "title": titleController.text,
                      "price": priceController.text,
                      "location": locationController.text,
                      "type": typeController.text,
                      "image": property?['image'] ?? "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
                      "bedrooms": int.tryParse(bedsController.text) ?? 1,
                      "bathrooms": int.tryParse(bathsController.text) ?? 1,
                    };

                    setState(() {
                      if (isEditing) {
                        final index = (user['userProperties'] as List).indexWhere((p) => p['id'] == property['id']);
                        user['userProperties'][index] = newProperty;
                      } else {
                        (user['userProperties'] as List).add(newProperty);
                      }
                    });

                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(isEditing ? 'Property updated' : 'Property added')),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0A2463),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(isEditing ? 'Update Property' : 'Add Property'),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {bool isNumber = false}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0A2463).withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: const Color(0xFF0A2463), size: 20),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
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
        child: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Top Row with Title and Logout
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Profile',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0A2463),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.logout, color: Color(0xFF0A2463)),
                        onPressed: () => Navigator.pushReplacementNamed(context, '/signin'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Header Section - Dark Glass Card
                  GlassCard(
                    isDark: true,
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
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
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                user['occupation'],
                                style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.location_on, size: 14, color: Colors.white),
                                  const SizedBox(width: 4),
                                  Text(user['location'], style: const TextStyle(color: Colors.white, fontSize: 14)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(user['email'], style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
                              Text(user['phone'], style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Text('Status: ', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Text('Not Applied', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.white)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {},
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.white,
                                        foregroundColor: const Color(0xFF0A2463),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      ),
                                      child: const Text('Edit Profile'),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {},
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF3E92CC),
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      ),
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
                        Text(user['about'], style: const TextStyle(height: 1.5, color: Color(0xFF0A2463))),
                        const SizedBox(height: 12),
                        Text(user['bio'], style: const TextStyle(height: 1.5, color: Color(0xFF0A2463))),
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
                            color: const Color(0xFF0A2463).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            interest,
                            style: const TextStyle(color: Color(0xFF0A2463), fontWeight: FontWeight.w600),
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
                        onPressed: () => _showPropertyForm(),
                        child: const Text('+ Add Property', style: TextStyle(color: Color(0xFF3E92CC))),
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
                              color: Colors.white.withOpacity(0.5),
                              border: Border.all(color: Colors.white),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
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
                                      child: Row(
                                        children: [
                                          GestureDetector(
                                            onTap: () => _showPropertyForm(property: prop),
                                            child: Container(
                                              padding: const EdgeInsets.all(6),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withOpacity(0.9),
                                                shape: BoxShape.circle,
                                              ),
                                              child: const Icon(Icons.edit, size: 16, color: Color(0xFF0A2463)),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          GestureDetector(
                                            onTap: () => _deleteProperty(prop['id']),
                                            child: Container(
                                              padding: const EdgeInsets.all(6),
                                              decoration: BoxDecoration(
                                                color: Colors.red.withOpacity(0.9),
                                                shape: BoxShape.circle,
                                              ),
                                              child: const Icon(Icons.delete, size: 16, color: Colors.white),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(prop['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0A2463))),
                                      const SizedBox(height: 4),
                                      Text('📍 ${prop['location']}', style: TextStyle(color: const Color(0xFF0A2463).withOpacity(0.6), fontSize: 13)),
                                      const SizedBox(height: 8),
                                      Text('Rs ${prop['price']}/month', style: const TextStyle(color: Color(0xFF3E92CC), fontWeight: FontWeight.bold, fontSize: 16)),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          Text('🛏️ ${prop['bedrooms']} Bed', style: TextStyle(color: const Color(0xFF0A2463).withOpacity(0.6), fontSize: 13)),
                                          const SizedBox(width: 16),
                                          Text('🚿 ${prop['bathrooms']} Bath', style: TextStyle(color: const Color(0xFF0A2463).withOpacity(0.6), fontSize: 13)),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      SizedBox(
                                        width: double.infinity,
                                        child: OutlinedButton(
                                          onPressed: () {},
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: const Color(0xFF0A2463),
                                            side: const BorderSide(color: Color(0xFF0A2463)),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          ),
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
                  const SizedBox(height: 100), // padding for bottom nav
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCardSection({required String title, Widget? trailing, required Widget content}) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0A2463))),
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
