import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/property_provider.dart';
import '../../providers/roommate_provider.dart';
import '../../widgets/property_card.dart';
import '../../widgets/roommate_card.dart';
import '../../data/showcase_data.dart';
import '../properties/properties_screen.dart';
import '../roommates/roommates_screen.dart';
import '../search/search_screen.dart';
import '../recommendations/recommendation_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final PageController _heroPageController = PageController();
  int _currentSlide = 0;
  Timer? _slideTimer;
  String _selectedCategory = 'All';

  final List<Map<String, String>> _categories = const [
    {'id': 'All', 'label': 'All Locations'},
    {'id': 'Colombo 07', 'label': 'Colombo 07'},
    {'id': 'Near Moratuwa Uni', 'label': 'Near Moratuwa Uni'},
    {'id': 'Near Kelaniya Uni', 'label': 'Near Kelaniya Uni'},
    {'id': 'Budget Friendly', 'label': 'Budget Friendly'},
  ];

  @override
  void initState() {
    super.initState();
    _startSlideTimer();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PropertyProvider>().fetchProperties();
      context.read<RoommateProvider>().fetchRoommates();
      final authUser = context.read<AuthProvider>().user;
      if (authUser != null && authUser.id != null) {
        context.read<PropertyProvider>().fetchFavorites(authUser.id!);
      }
    });
  }

  void _startSlideTimer() {
    _slideTimer?.cancel();
    _slideTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (_heroPageController.hasClients) {
        final nextPage = (_currentSlide + 1) % heroSlides.length;
        _heroPageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 700),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  @override
  void dispose() {
    _slideTimer?.cancel();
    _heroPageController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _openSearch([String? query]) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SearchScreen(initialQuery: query ?? _searchController.text.trim()),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final propertyProvider = context.watch<PropertyProvider>();
    final roommateProvider = context.watch<RoommateProvider>();
    final user = authProvider.user;

    // Filter properties based on category
    final displayedProperties = propertyProvider.properties.where((prop) {
      if (_selectedCategory == 'All') return true;
      final loc = prop.location.toLowerCase();
      if (_selectedCategory == 'Colombo 07') return loc.contains('colombo') || loc.contains('cinnamon');
      if (_selectedCategory == 'Near Moratuwa Uni') return loc.contains('moratuwa') || loc.contains('katubedda');
      if (_selectedCategory == 'Near Kelaniya Uni') return loc.contains('kelaniya') || loc.contains('dalugama');
      if (_selectedCategory == 'Budget Friendly') return prop.rent <= 30000;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        top: false,
        child: RefreshIndicator(
          color: const Color(0xFF3488C3),
          onRefresh: () async {
            await propertyProvider.fetchProperties();
            await roommateProvider.fetchRoommates();
            if (user != null && user.id != null) {
              await propertyProvider.fetchFavorites(user.id!);
            }
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top App Header
                Container(
                  color: Colors.white,
                  padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 10, 20, 14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Bodimkarayo Logo
                      Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.asset(
                              'assets/logo.png',
                              height: 38,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => const Row(
                                children: [
                                  Icon(Icons.home_work_rounded, color: Color(0xFF3488C3), size: 28),
                                  SizedBox(width: 6),
                                  Text(
                                    'Bodimkarayo.lk',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF0F172A)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      // Right Action: AI Matchmaker + User Avatar
                      Row(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFFEAF4FB),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: IconButton(
                              icon: const Icon(Icons.auto_awesome, color: Color(0xFF3488C3), size: 20),
                              tooltip: 'AI Matchmaker',
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) => const RecommendationScreen()),
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: 10),
                          CircleAvatar(
                            radius: 18,
                            backgroundColor: const Color(0xFF0F172A),
                            backgroundImage: user?.profilePictureUrl != null && user!.profilePictureUrl!.isNotEmpty
                                ? NetworkImage(user.profilePictureUrl!)
                                : null,
                            child: user?.profilePictureUrl == null || user!.profilePictureUrl!.isEmpty
                                ? Text(
                                    user?.fullName?.isNotEmpty == true ? user!.fullName![0].toUpperCase() : 'U',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  )
                                : null,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Hero Image Carousel Section
                Stack(
                  children: [
                    SizedBox(
                      height: 380,
                      child: PageView.builder(
                        controller: _heroPageController,
                        onPageChanged: (idx) => setState(() => _currentSlide = idx),
                        itemCount: heroSlides.length,
                        itemBuilder: (context, index) {
                          final slide = heroSlides[index];
                          return Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.network(
                                slide.image,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(color: const Color(0xFF0F172A)),
                              ),
                              // Dark contrast gradient overlay
                              Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.black.withValues(alpha: 0.5),
                                      Colors.black.withValues(alpha: 0.7),
                                      const Color(0xFF0F172A).withValues(alpha: 0.85),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),

                    // Content overlay inside Hero
                    Positioned(
                      top: 24,
                      left: 20,
                      right: 20,
                      bottom: 20,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Pill Badge
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white30),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF38BDF8),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Text(
                                  'Boarding search made simple',
                                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),
                          // Hero Heading
                          const Text(
                            'Find your perfect\nboarding in Sri Lanka',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                              height: 1.15,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            heroSlides[_currentSlide].subtitle,
                            style: const TextStyle(
                              color: Color(0xFFE2E8F0),
                              fontSize: 13,
                              fontWeight: FontWeight.normal,
                            ),
                          ),
                          const Spacer(),

                          // Modern Floating Search Box
                          Container(
                            padding: const EdgeInsets.all(5),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(30),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.25),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                const Padding(
                                  padding: EdgeInsets.only(left: 14, right: 8),
                                  child: Icon(Icons.location_on_rounded, color: Color(0xFF3488C3), size: 20),
                                ),
                                Expanded(
                                  child: TextField(
                                    controller: _searchController,
                                    onSubmitted: (q) => _openSearch(q),
                                    decoration: const InputDecoration(
                                      hintText: 'where do you want to stay ?',
                                      hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                                      border: InputBorder.none,
                                      isDense: true,
                                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                                    ),
                                  ),
                                ),
                                ElevatedButton(
                                  onPressed: () => _openSearch(),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF3488C3),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                                    elevation: 0,
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.search, size: 16),
                                      SizedBox(width: 4),
                                      Text('Search', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Carousel Dot Indicators
                          Row(
                            children: List.generate(heroSlides.length, (index) {
                              final isActive = index == _currentSlide;
                              return AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                margin: const EdgeInsets.only(right: 6),
                                height: 4,
                                width: isActive ? 24 : 6,
                                decoration: BoxDecoration(
                                  color: isActive ? const Color(0xFF3488C3) : Colors.white54,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              );
                            }),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                // Floating Trust & Stats Bar
                Container(
                  margin: const EdgeInsets.fromLTRB(16, 16, 16, 10),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey.shade200),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 15,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatColumn('150+', 'Verified\nPlaces', const Color(0xFF3488C3)),
                      Container(width: 1, height: 35, color: Colors.grey.shade200),
                      _buildStatColumn('2,500+', 'Happy\nTenants', const Color(0xFF3488C3)),
                      Container(width: 1, height: 35, color: Colors.grey.shade200),
                      _buildStatColumn('4.9 ★', 'Average\nRating', const Color(0xFF10B981)),
                      Container(width: 1, height: 35, color: Colors.grey.shade200),
                      _buildStatColumn('100%', 'Direct\nOwners', const Color(0xFFF59E0B)),
                    ],
                  ),
                ),

                // Featured Boardings Section
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Featured Boardings',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const PropertiesScreen()),
                              );
                            },
                            child: const Row(
                              children: [
                                Text(
                                  'Explore All',
                                  style: TextStyle(color: Color(0xFF3488C3), fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                SizedBox(width: 2),
                                Icon(Icons.arrow_forward_ios_rounded, color: Color(0xFF3488C3), size: 12),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Top-rated boarding places with verified landlords, AC, and fiber Wi-Fi.',
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                      ),
                      const SizedBox(height: 14),

                      // Location Category Filter Chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        child: Row(
                          children: _categories.map((cat) {
                            final isSelected = _selectedCategory == cat['id'];
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                label: Text(cat['label']!),
                                selected: isSelected,
                                onSelected: (_) {
                                  setState(() => _selectedCategory = cat['id']!);
                                },
                                labelStyle: TextStyle(
                                  color: isSelected ? Colors.white : const Color(0xFF334155),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                                selectedColor: const Color(0xFF3488C3),
                                backgroundColor: Colors.white,
                                side: BorderSide(
                                  color: isSelected ? const Color(0xFF3488C3) : Colors.grey.shade300,
                                ),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),

                // Featured Properties Horizontal Carousel
                if (propertyProvider.isLoading)
                  const SizedBox(
                    height: 250,
                    child: Center(child: CircularProgressIndicator(color: Color(0xFF3488C3))),
                  )
                else if (displayedProperties.isEmpty)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                    child: const Center(
                      child: Text('No properties found for this location filter.', style: TextStyle(color: Colors.grey)),
                    ),
                  )
                else
                  SizedBox(
                    height: 385,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      itemCount: displayedProperties.length,
                      itemBuilder: (context, index) {
                        final property = displayedProperties[index];
                        return Container(
                          width: 290,
                          margin: const EdgeInsets.only(right: 16, bottom: 8),
                          child: PropertyCard(property: property),
                        );
                      },
                    ),
                  ),

                // Connect with Verified Roommates Section
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Verified Roommates',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Find compatible flatmates by lifestyle & budget.',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                          ),
                        ],
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const RoommatesScreen()),
                          );
                        },
                        child: const Row(
                          children: [
                            Text(
                              'View All',
                              style: TextStyle(color: Color(0xFF3488C3), fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            SizedBox(width: 2),
                            Icon(Icons.arrow_forward_ios_rounded, color: Color(0xFF3488C3), size: 12),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Roommates List
                if (roommateProvider.isLoading)
                  const SizedBox(
                    height: 200,
                    child: Center(child: CircularProgressIndicator(color: Color(0xFF3488C3))),
                  )
                else
                  SizedBox(
                    height: 385,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      itemCount: roommateProvider.roommates.length,
                      itemBuilder: (context, index) {
                        final rm = roommateProvider.roommates[index];
                        return Container(
                          width: 260,
                          margin: const EdgeInsets.only(right: 16, bottom: 8),
                          child: RoommateCard(roommate: rm),
                        );
                      },
                    ),
                  ),

                // Gemini AI Matchmaker Interactive Card
                Container(
                  margin: const EdgeInsets.all(20),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0F172A), Color(0xFF1E3A8A), Color(0xFF3488C3)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF3488C3).withValues(alpha: 0.25),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(Icons.auto_awesome, color: Color(0xFF38BDF8), size: 24),
                          ),
                          const SizedBox(width: 12),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'AI Matchmaker',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
                              ),
                              Text(
                                'Powered by Gemini AI',
                                style: TextStyle(color: Color(0xFF93C5FD), fontSize: 11),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        'Tell us what you are looking for — e.g. "Single room with AC near Moratuwa University under Rs 25,000" — and our AI will match the best boarding and roommates for you.',
                        style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 13, height: 1.4),
                      ),
                      const SizedBox(height: 18),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const RecommendationScreen()),
                            );
                          },
                          icon: const Icon(Icons.auto_awesome, size: 16),
                          label: const Text(
                            'Find Matches with Gemini',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF0F172A),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatColumn(String count, String label, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          count,
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: color),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade600, height: 1.2),
        ),
      ],
    );
  }
}
