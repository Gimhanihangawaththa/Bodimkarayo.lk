import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/property_provider.dart';
import '../../models/property_model.dart';
import '../../widgets/glass_card.dart';
import '../properties/add_property_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // Keeping some mock data for fields not yet in backend
  final Map<String, dynamic> mockExtraData = {
    "age": 28,
    "occupation": "Software Engineer",
    "location": "Colombo 3",
    "bio": "Friendly and professional. Looking for a comfortable living space.",
    "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    "about": "I'm a software engineer with a passion for building great products. I'm organized, clean, and respectful of shared spaces.",
    "phone": "+94 71 234 5678",
    "interests": ["Technology", "Cooking", "Reading", "Fitness", "Travel"],
  };

  void _deleteProperty(BuildContext context, int id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Property'),
        content: const Text('Are you sure you want to delete this property?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await Provider.of<PropertyProvider>(context, listen: false).deleteProperty(id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(success ? 'Deleted successfully' : 'Delete failed')),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final propertyProvider = context.watch<PropertyProvider>();
    final user = authProvider.user;

    if (user == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Please login to view your profile'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pushReplacementNamed(context, '/signin'),
                child: const Text('Login'),
              ),
            ],
          ),
        ),
      );
    }

    // For now, filtering properties by title or just showing all to demonstrate
    // In a real app, we'd filter by user ID or have a /my-properties endpoint
    final myProperties = propertyProvider.properties; 

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Profile', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0A2463))),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Color(0xFF0A2463)),
                          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const EditProfileScreen())),
                        ),
                        IconButton(
                          icon: const Icon(Icons.logout, color: Color(0xFF0A2463)),
                          onPressed: () async {
                            await authProvider.logout();
                            if (mounted) Navigator.pushReplacementNamed(context, '/signin');
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Header
                GlassCard(
                  isDark: true,
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 40,
                        backgroundImage: NetworkImage(user.profilePictureUrl ?? mockExtraData['avatarUrl']),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(user.fullName ?? 'User', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                            Text(user.email, style: TextStyle(color: Colors.white.withOpacity(0.8))),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(12)),
                              child: Text(user.role ?? 'USER', style: const TextStyle(color: Colors.white, fontSize: 12)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // My Properties Section
                _buildCardSection(
                  title: 'My Properties',
                  trailing: IconButton(
                    icon: const Icon(Icons.add_circle, color: Color(0xFF0A2463)),
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const AddPropertyScreen())),
                  ),
                  content: myProperties.isEmpty 
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 20),
                        child: Text('You haven\'t posted any properties yet.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: myProperties.length,
                        itemBuilder: (context, index) {
                          final prop = myProperties[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.network(
                                    prop.images != null && prop.images!.isNotEmpty ? prop.images![0] : 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=200',
                                    width: 60, height: 60, fit: BoxFit.cover,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(prop.title, style: const TextStyle(fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                                      Text('Rs. ${prop.rent}', style: TextStyle(color: Colors.blue[800], fontSize: 13)),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.edit, size: 20, color: Colors.blue),
                                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => AddPropertyScreen(property: prop))),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                                  onPressed: () => _deleteProperty(context, prop.id!),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                ),
                const SizedBox(height: 20),

                // About
                _buildCardSection(
                  title: 'About',
                  content: Text(user.about ?? mockExtraData['about'], style: const TextStyle(height: 1.5)),
                ),
                const SizedBox(height: 100),
              ],
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
