import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/property_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/property_model.dart';
import '../../widgets/property_card.dart';
import '../../widgets/upgrade_advertisement_card.dart';
import 'add_property_screen.dart';

class PropertiesScreen extends StatefulWidget {
  final String? initialQuery;
  const PropertiesScreen({super.key, this.initialQuery});

  @override
  State<PropertiesScreen> createState() => _PropertiesScreenState();
}

class _PropertiesScreenState extends State<PropertiesScreen> {
  late TextEditingController _searchController;

  // Filter states matching Web FilterSidebar.jsx
  String _searchKeyword = '';
  double _maxBudget = 150000;
  String _propertyType = 'Any';
  String _genderPreference = 'Any';
  String _suitableFor = 'Any';
  String _bedrooms = 'Any';
  String _bathrooms = 'Any';
  bool _furnishedOnly = false;
  bool _parkingOnly = false;
  bool _petsAllowedOnly = false;

  @override
  void initState() {
    super.initState();
    _searchKeyword = widget.initialQuery ?? '';
    _searchController = TextEditingController(text: _searchKeyword);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PropertyProvider>().fetchProperties();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  int get _activeFilterCount {
    int count = 0;
    if (_maxBudget < 150000) count++;
    if (_propertyType != 'Any') count++;
    if (_genderPreference != 'Any') count++;
    if (_suitableFor != 'Any') count++;
    if (_bedrooms != 'Any') count++;
    if (_bathrooms != 'Any') count++;
    if (_furnishedOnly) count++;
    if (_parkingOnly) count++;
    if (_petsAllowedOnly) count++;
    return count;
  }

  void _resetFilters() {
    setState(() {
      _searchKeyword = '';
      _searchController.clear();
      _maxBudget = 150000;
      _propertyType = 'Any';
      _genderPreference = 'Any';
      _suitableFor = 'Any';
      _bedrooms = 'Any';
      _bathrooms = 'Any';
      _furnishedOnly = false;
      _parkingOnly = false;
      _petsAllowedOnly = false;
    });
  }

  List<PropertyModel> _applyClientFilters(List<PropertyModel> allProps) {
    return allProps.where((prop) {
      // 1. Keyword search
      if (_searchKeyword.trim().isNotEmpty) {
        final q = _searchKeyword.trim().toLowerCase();
        final matchesTitle = prop.title.toLowerCase().contains(q);
        final matchesLoc = prop.location.toLowerCase().contains(q);
        final matchesDesc = prop.description.toLowerCase().contains(q);
        final matchesType = (prop.propertyType ?? '').toLowerCase().contains(q);
        if (!matchesTitle && !matchesLoc && !matchesDesc && !matchesType) {
          return false;
        }
      }

      // 2. Max budget
      if (prop.rent > _maxBudget) return false;

      // 3. Property Type
      if (_propertyType != 'Any') {
        final pType = (prop.propertyType ?? prop.badge ?? '').toLowerCase();
        if (!pType.contains(_propertyType.toLowerCase())) return false;
      }

      // 4. Gender Preference
      if (_genderPreference != 'Any') {
        final propGender = (prop.genderPreference ?? 'Both').toLowerCase();
        final filterGender = _genderPreference.toLowerCase();
        if (filterGender == 'male' && propGender != 'male' && propGender != 'both') return false;
        if (filterGender == 'female' && propGender != 'female' && propGender != 'both') return false;
        if (filterGender == 'both' && propGender != 'both') return false;
      }

      // 5. Suitable For
      if (_suitableFor != 'Any') {
        final propSuitable = (prop.suitableFor ?? 'Any').toLowerCase();
        final filterSuitable = _suitableFor.toLowerCase();
        if (propSuitable != 'any' && !propSuitable.contains(filterSuitable)) {
          return false;
        }
      }

      // 6. Bedrooms
      if (_bedrooms != 'Any') {
        final minBeds = int.tryParse(_bedrooms.replaceAll('+', '')) ?? 1;
        if ((prop.bedrooms ?? 1) < minBeds) return false;
      }

      // 7. Bathrooms
      if (_bathrooms != 'Any') {
        final minBaths = int.tryParse(_bathrooms.replaceAll('+', '')) ?? 1;
        if ((prop.bathrooms ?? 1) < minBaths) return false;
      }

      // 8. Furnished
      if (_furnishedOnly) {
        final f = (prop.furnished ?? '').toLowerCase();
        final offersStr = (prop.offers ?? []).join(' ').toLowerCase();
        if ((!f.contains('yes') && !f.contains('furnished')) || f.contains('unfurnished')) {
          if (!offersStr.contains('furnished')) return false;
        }
      }

      // 9. Parking
      if (_parkingOnly) {
        final p = (prop.parking ?? '').toLowerCase();
        final offersStr = (prop.offers ?? []).join(' ').toLowerCase();
        if ((p.isEmpty || p == 'no' || p == 'none') && !offersStr.contains('parking')) {
          return false;
        }
      }

      // 10. Pets Allowed
      if (_petsAllowedOnly) {
        final pets = (prop.petsAllowed ?? '').toLowerCase();
        if (!pets.contains('yes') && !pets.contains('allowed')) return false;
      }

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final propertyProvider = context.watch<PropertyProvider>();
    final authUser = context.watch<AuthProvider>().user;
    final isOwner = (authUser?.role ?? 'USER').toUpperCase() == 'OWNER' ||
        (authUser?.role ?? 'USER').toUpperCase() == 'ADMIN';

    final filteredProperties = _applyClientFilters(propertyProvider.properties);
    final canPop = ModalRoute.of(context)?.canPop ?? false;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      floatingActionButton: isOwner
          ? Padding(
              padding: EdgeInsets.only(bottom: canPop ? 8 : 86),
              child: FloatingActionButton.extended(
                backgroundColor: const Color(0xFF0A2463),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const AddPropertyScreen()),
                  );
                },
                icon: const Icon(Icons.add_home_work_rounded, color: Colors.white),
                label: const Text('Add Property', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            )
          : null,
      body: CustomScrollView(
        slivers: [
          // Hero Section
          SliverToBoxAdapter(
            child: Stack(
              children: [
                Container(
                  height: 290,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    image: DecorationImage(
                      image: NetworkImage('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200'),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Container(
                  height: 290,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFF0F172A).withValues(alpha: 0.9),
                        const Color(0xFF0F172A).withValues(alpha: 0.7),
                        const Color(0xFF0F172A).withValues(alpha: 0.4),
                      ],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                    ),
                  ),
                ),
                Positioned.fill(
                  child: SafeArea(
                    bottom: false,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white24),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.circle, color: Color(0xFF38BDF8), size: 8),
                                SizedBox(width: 6),
                                Text(
                                  'Verified boarding listings across Sri Lanka',
                                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Find Your Ideal Boarding',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 26,
                              fontWeight: FontWeight.w900,
                              height: 1.15,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Browse verified rooms, annexes, and apartments near universities and tech hubs.',
                            style: TextStyle(color: Colors.white70, fontSize: 12.5),
                          ),
                          const SizedBox(height: 14),
                          // Search Input Bar
                          Container(
                            padding: const EdgeInsets.all(5),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(30),
                              boxShadow: const [
                                BoxShadow(color: Colors.black26, blurRadius: 12, offset: Offset(0, 4)),
                              ],
                            ),
                            child: Row(
                              children: [
                                const SizedBox(width: 10),
                                const Icon(Icons.location_on_outlined, color: Color(0xFF3488C3), size: 20),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: TextField(
                                    controller: _searchController,
                                    onChanged: (val) => setState(() => _searchKeyword = val),
                                    onSubmitted: (val) => setState(() => _searchKeyword = val),
                                    decoration: const InputDecoration(
                                      hintText: 'Search city, university, or title...',
                                      hintStyle: TextStyle(fontSize: 13, color: Colors.grey),
                                      border: InputBorder.none,
                                      isDense: true,
                                    ),
                                  ),
                                ),
                                if (_searchKeyword.isNotEmpty)
                                  GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _searchKeyword = '';
                                        _searchController.clear();
                                      });
                                    },
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 6),
                                      child: Icon(Icons.close, size: 18, color: Colors.grey),
                                    ),
                                  ),
                                ElevatedButton(
                                  onPressed: () {
                                    setState(() {
                                      _searchKeyword = _searchController.text;
                                    });
                                    FocusScope.of(context).unfocus();
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF3488C3),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                  ),
                                  child: const Text('Search', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Quick Filters & Advanced Filter Button Bar (Matching Web FilterSidebar.jsx)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    // Filter Modal Button
                    GestureDetector(
                      onTap: () => _showFilterSheet(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                        decoration: BoxDecoration(
                          color: _activeFilterCount > 0 ? const Color(0xFF0A2463) : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: _activeFilterCount > 0 ? const Color(0xFF0A2463) : const Color(0xFFCBD5E1),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.tune_rounded,
                              size: 16,
                              color: _activeFilterCount > 0 ? Colors.white : const Color(0xFF0F172A),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              _activeFilterCount > 0 ? 'Filters ($_activeFilterCount)' : 'Filters',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: _activeFilterCount > 0 ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Quick Chip: Under 25k
                    _buildQuickFilterChip(
                      label: '⚡ Under 25k',
                      isActive: _maxBudget <= 25000,
                      onTap: () => setState(() => _maxBudget = _maxBudget <= 25000 ? 150000 : 25000),
                    ),
                    const SizedBox(width: 8),

                    // Quick Chip: Single Rooms
                    _buildQuickFilterChip(
                      label: '🚪 Single Rooms',
                      isActive: _propertyType == 'Room',
                      onTap: () => setState(() => _propertyType = _propertyType == 'Room' ? 'Any' : 'Room'),
                    ),
                    const SizedBox(width: 8),

                    // Quick Chip: Furnished
                    _buildQuickFilterChip(
                      label: '🛋️ Furnished',
                      isActive: _furnishedOnly,
                      onTap: () => setState(() => _furnishedOnly = !_furnishedOnly),
                    ),
                    const SizedBox(width: 8),

                    // Quick Chip: Male Only
                    _buildQuickFilterChip(
                      label: '👨 Male Only',
                      isActive: _genderPreference == 'Male',
                      onTap: () => setState(() => _genderPreference = _genderPreference == 'Male' ? 'Any' : 'Male'),
                    ),
                    const SizedBox(width: 8),

                    // Quick Chip: Female Only
                    _buildQuickFilterChip(
                      label: '👩 Female Only',
                      isActive: _genderPreference == 'Female',
                      onTap: () => setState(() => _genderPreference = _genderPreference == 'Female' ? 'Any' : 'Female'),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Count & Reset Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Available Boardings (${filteredProperties.length})',
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  if (_activeFilterCount > 0 || _searchKeyword.isNotEmpty)
                    TextButton.icon(
                      onPressed: _resetFilters,
                      icon: const Icon(Icons.refresh, size: 15, color: Color(0xFF3488C3)),
                      label: const Text(
                        'Reset All',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF3488C3)),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Listings
          if (propertyProvider.isLoading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (filteredProperties.isEmpty)
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.search_off_rounded, size: 52, color: Colors.grey),
                    const SizedBox(height: 12),
                    const Text(
                      'No properties match your filters',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Try expanding your budget range or clearing some filter tags.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: Colors.grey),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _resetFilters,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Reset All Filters'),
                    ),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: PropertyCard(property: filteredProperties[index]),
                    );
                  },
                  childCount: filteredProperties.length,
                ),
              ),
            ),

          // Upgrade Advertisement Banner at bottom for regular USERs (matches Web Properties.jsx)
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 4, 16, 120),
              child: UpgradeAdvertisementCard(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickFilterChip({
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF3488C3) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isActive ? const Color(0xFF3488C3) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isActive ? Colors.white : const Color(0xFF334155),
          ),
        ),
      ),
    );
  }

  void _showFilterSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            void updateBoth(VoidCallback fn) {
              setModalState(fn);
              setState(() {});
            }

            return Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(ctx).size.height * 0.85,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 12, 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.tune_rounded, color: Color(0xFF3488C3)),
                              SizedBox(width: 8),
                              Text(
                                'Filter Properties',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              TextButton(
                                onPressed: () {
                                  _resetFilters();
                                  setModalState(() {});
                                },
                                child: const Text('Reset All', style: TextStyle(color: Color(0xFF3488C3), fontWeight: FontWeight.bold)),
                              ),
                              IconButton(
                                onPressed: () => Navigator.pop(ctx),
                                icon: const Icon(Icons.close),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),

                    // Filter Body
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Property Type
                            const Text('PROPERTY TYPE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: ['Any', 'Room', 'Annex', 'Apartment', 'House', 'Hostel'].map((type) {
                                final isSelected = _propertyType == type;
                                return ChoiceChip(
                                  label: Text(type),
                                  selected: isSelected,
                                  selectedColor: const Color(0xFF3488C3),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                  onSelected: (_) => updateBoth(() => _propertyType = type),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 20),

                            // Gender Requirement
                            const Text('GENDER REQUIREMENT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                {'val': 'Any', 'label': '🌐 All'},
                                {'val': 'Both', 'label': '🚻 Mixed / Both'},
                                {'val': 'Male', 'label': '👨 Male Only'},
                                {'val': 'Female', 'label': '👩 Female Only'},
                              ].map((g) {
                                final isSelected = _genderPreference == g['val'];
                                return ChoiceChip(
                                  label: Text(g['label']!),
                                  selected: isSelected,
                                  selectedColor: const Color(0xFF3488C3),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                  onSelected: (_) => updateBoth(() => _genderPreference = g['val']!),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 20),

                            // Ideal For / Tenant Type
                            const Text('IDEAL FOR / TENANT TYPE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                {'val': 'Any', 'label': '🌐 Everyone'},
                                {'val': 'University Students', 'label': '🎓 Students'},
                                {'val': 'Working Professionals', 'label': '💼 Professionals'},
                                {'val': 'Couples', 'label': '💑 Couples'},
                                {'val': 'Family', 'label': '👨‍👩‍👧‍👦 Families'},
                              ].map((item) {
                                final isSelected = _suitableFor == item['val'];
                                return ChoiceChip(
                                  label: Text(item['label']!),
                                  selected: isSelected,
                                  selectedColor: const Color(0xFF3488C3),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                  onSelected: (_) => updateBoth(() => _suitableFor = item['val']!),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 20),

                            // Max Budget Slider
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('MAX MONTHLY BUDGET', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                                Text(
                                  'Rs. ${_maxBudget.toStringAsFixed(0)}',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF3488C3)),
                                ),
                              ],
                            ),
                            Slider(
                              value: _maxBudget,
                              min: 10000,
                              max: 300000,
                              divisions: 58,
                              activeColor: const Color(0xFF3488C3),
                              onChanged: (val) => updateBoth(() => _maxBudget = val),
                            ),
                            const SizedBox(height: 16),

                            // Bedrooms & Bathrooms
                            const Text('MINIMUM BEDROOMS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              children: ['Any', '1+', '2+', '3+', '4+'].map((b) {
                                final isSelected = _bedrooms == b;
                                return ChoiceChip(
                                  label: Text(b),
                                  selected: isSelected,
                                  selectedColor: const Color(0xFF3488C3),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                  onSelected: (_) => updateBoth(() => _bedrooms = b),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 16),

                            const Text('MINIMUM BATHROOMS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              children: ['Any', '1+', '2+', '3+'].map((b) {
                                final isSelected = _bathrooms == b;
                                return ChoiceChip(
                                  label: Text(b),
                                  selected: isSelected,
                                  selectedColor: const Color(0xFF3488C3),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                  onSelected: (_) => updateBoth(() => _bathrooms = b),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 16),

                            // Facilities Switches
                            const Text('FACILITIES & PERKS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('🛋️ Furnished Only', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                              value: _furnishedOnly,
                              activeThumbColor: const Color(0xFF3488C3),
                              onChanged: (val) => updateBoth(() => _furnishedOnly = val),
                            ),
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('🚗 Parking Available', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                              value: _parkingOnly,
                              activeThumbColor: const Color(0xFF3488C3),
                              onChanged: (val) => updateBoth(() => _parkingOnly = val),
                            ),
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('🐾 Pets Allowed', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                              value: _petsAllowedOnly,
                              activeThumbColor: const Color(0xFF3488C3),
                              onChanged: (val) => updateBoth(() => _petsAllowedOnly = val),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Apply Button
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(ctx),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0A2463),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 15),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: Text(
                            'Show ${_applyClientFilters(context.read<PropertyProvider>().properties).length} Properties',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
