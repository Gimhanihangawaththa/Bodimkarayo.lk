import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/property_provider.dart';
import '../../providers/roommate_provider.dart';
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

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PropertyProvider>().fetchProperties();
      context.read<RoommateProvider>().fetchRoommates();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final propertyProvider = context.watch<PropertyProvider>();
    final roommateProvider = context.watch<RoommateProvider>();
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await propertyProvider.fetchProperties();
            await roommateProvider.fetchRoommates();
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
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
                                image: NetworkImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Good Morning,',
                                style: TextStyle(color: Color(0xFF0A2463), fontSize: 12),
                              ),
                              Text(
                                user?.fullName?.split(' ').first ?? 'User',
                                style: const TextStyle(
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
                      GestureDetector(
                        onTap: () {}, // Navigate to Properties tab
                        child: Text(
                          'See all',
                          style: TextStyle(
                            color: const Color(0xFF0A2463).withOpacity(0.6),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                
                if (propertyProvider.isLoading)
                  const SizedBox(
                    height: 200,
                    child: Center(child: CircularProgressIndicator(color: Color(0xFF3E92CC))),
                  )
                else if (propertyProvider.properties.isEmpty)
                  const SizedBox(
                    height: 100,
                    child: Center(child: Text('No featured boardings found', style: TextStyle(color: Colors.grey))),
                  )
                else
                  SizedBox(
                    height: 360,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      itemCount: propertyProvider.properties.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 16),
                          child: SizedBox(
                            width: 280,
                            child: PropertyCard(
                              property: propertyProvider.properties[index],
                            ),
                          ),
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
                      if (roommateProvider.isLoading)
                        const SizedBox(
                          height: 200,
                          child: Center(child: CircularProgressIndicator(color: Colors.white)),
                        )
                      else if (roommateProvider.roommates.isEmpty)
                        const SizedBox(
                          height: 100,
                          child: Center(child: Text('No roommates found', style: TextStyle(color: Colors.white70))),
                        )
                      else
                        SizedBox(
                          height: 340,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            physics: const BouncingScrollPhysics(),
                            itemCount: roommateProvider.roommates.length,
                            itemBuilder: (context, index) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 16),
                                child: SizedBox(
                                  width: 260,
                                  child: RoommateCard(
                                    roommate: roommateProvider.roommates[index],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
