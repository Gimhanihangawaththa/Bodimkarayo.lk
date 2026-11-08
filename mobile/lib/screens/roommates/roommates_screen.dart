import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/roommate_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/recommendation_provider.dart';
import '../../models/roommate_model.dart';
import '../../models/recommendation_model.dart';
import '../../widgets/roommate_card.dart';
import '../../utils/app_notification.dart';
import '../auth/sign_in_screen.dart';
import 'apply_roommate_screen.dart';

class RoommatesScreen extends StatefulWidget {
  final String? initialQuery;
  const RoommatesScreen({super.key, this.initialQuery});

  @override
  State<RoommatesScreen> createState() => _RoommatesScreenState();
}

class _RoommatesScreenState extends State<RoommatesScreen> {
  late TextEditingController _searchController;

  // Filter states matching Web RoommateFilterSidebar.jsx
  String _searchKeyword = '';
  double _maxBudget = 150000;
  RangeValues _ageRange = const RangeValues(18, 65);
  String _genderPreference = 'Any';
  String _occupation = 'Any';
  bool _nonSmokingOnly = false;
  bool _petFriendlyOnly = false;
  String _foodPreference = 'Any';

  // Auto-Match AI states matching Web Roommates.jsx
  bool _isAutoMatching = false;
  List<RecommendationModel> _aiMatches = [];
  String? _autoMatchError;

  @override
  void initState() {
    super.initState();
    _searchKeyword = widget.initialQuery ?? '';
    _searchController = TextEditingController(text: _searchKeyword);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RoommateProvider>().fetchRoommates();
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
    if (_ageRange.start > 18 || _ageRange.end < 65) count++;
    if (_genderPreference != 'Any') count++;
    if (_occupation != 'Any') count++;
    if (_nonSmokingOnly) count++;
    if (_petFriendlyOnly) count++;
    if (_foodPreference != 'Any') count++;
    return count;
  }

  void _resetFilters() {
    setState(() {
      _searchKeyword = '';
      _searchController.clear();
      _maxBudget = 150000;
      _ageRange = const RangeValues(18, 65);
      _genderPreference = 'Any';
      _occupation = 'Any';
      _nonSmokingOnly = false;
      _petFriendlyOnly = false;
      _foodPreference = 'Any';
    });
  }

  Future<void> _handleAutoMatch() async {
    final authProvider = context.read<AuthProvider>();
    final roommateProvider = context.read<RoommateProvider>();
    final recProvider = context.read<RecommendationProvider>();

    if (!authProvider.isAuthenticated || authProvider.user == null) {
      AppNotification.warning(
        context,
        'Please sign in first to use AI Auto-Match.',
        title: 'Sign-In Required',
        actionLabel: 'Sign In',
        onAction: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const SignInScreen()));
        },
      );
      return;
    }

    final user = authProvider.user!;
    RoommateModel? userPost;
    for (final r in roommateProvider.roommates) {
      if ((r.posterId != null && r.posterId == user.id) ||
          (r.posterEmail != null && r.posterEmail!.toLowerCase() == user.email.toLowerCase())) {
        userPost = r;
        break;
      }
    }

    if (userPost == null) {
      setState(() {
        _autoMatchError =
            "You haven't applied as a roommate yet! Tap 'Post Profile' or 'Apply as Roommate' on your Profile so our AI can match you based on your lifestyle and budget.";
      });
      return;
    }

    setState(() {
      _isAutoMatching = true;
      _autoMatchError = null;
      _aiMatches = [];
    });

    final prompt =
        'Find a roommate. I am a ${userPost.age ?? 22} year old ${userPost.gender} (${userPost.occupation}) looking for a roommate in ${userPost.preferredLocation ?? userPost.location}. '
        'My budget is around Rs. ${userPost.budget ?? 25000}. '
        'About me: ${userPost.bio}. ${userPost.about ?? ''} '
        'My interests: ${userPost.interests ?? ''}. '
        'Roommate preferences: ${userPost.preferences ?? ''}.';

    final ok = await recProvider.fetchRecommendations(
      preferences: prompt,
      maxBudget: userPost.budget,
      preferredLocation: userPost.preferredLocation ?? userPost.location,
    );

    if (!mounted) return;

    setState(() {
      _isAutoMatching = false;
      if (ok) {
        // Filter out the user's own post and keep roommate matches (or top matches)
        final matches = recProvider.recommendations.where((rec) {
          if (rec.roommatePost != null && rec.roommatePost!.id == userPost!.id) {
            return false;
          }
          return rec.roommatePost != null;
        }).toList();

        if (matches.isEmpty) {
          _autoMatchError = 'No compatible roommate matches found at the moment.';
        } else {
          _aiMatches = matches;
        }
      } else {
        _autoMatchError = recProvider.errorMessage ?? 'Failed to generate AI matches.';
      }
    });
  }

  List<RoommateModel> _applyClientFilters(List<RoommateModel> allRoommates) {
    return allRoommates.where((r) {
      // 1. Keyword search
      if (_searchKeyword.trim().isNotEmpty) {
        final q = _searchKeyword.trim().toLowerCase();
        final matchesLoc = r.location.toLowerCase().contains(q) ||
            (r.preferredLocation ?? '').toLowerCase().contains(q);
        final matchesName = (r.name ?? '').toLowerCase().contains(q);
        final matchesOcc = r.occupation.toLowerCase().contains(q);
        final matchesBio = r.bio.toLowerCase().contains(q);
        if (!matchesLoc && !matchesName && !matchesOcc && !matchesBio) {
          return false;
        }
      }

      // 2. Max budget
      if (r.budget != null && r.budget! > _maxBudget) return false;

      // 3. Age range
      if (r.age != null) {
        if (r.age! < _ageRange.start || r.age! > _ageRange.end) return false;
      }

      // 4. Gender preference
      if (_genderPreference != 'Any') {
        if (r.gender.toLowerCase() != _genderPreference.toLowerCase()) return false;
      }

      // 5. Occupation
      if (_occupation != 'Any') {
        if (!r.occupation.toLowerCase().contains(_occupation.toLowerCase())) return false;
      }

      // 6. Non-smoking
      if (_nonSmokingOnly) {
        final combined = '${r.preferences ?? ''} ${r.bio} ${r.about ?? ''}'.toLowerCase();
        if (combined.contains('smoker') && !combined.contains('non-smoker') && !combined.contains('no smoking')) {
          return false;
        }
      }

      // 7. Pet friendly
      if (_petFriendlyOnly) {
        final combined = '${r.preferences ?? ''} ${r.bio} ${r.about ?? ''}'.toLowerCase();
        if (combined.contains('no pet')) return false;
      }

      // 8. Food preference
      if (_foodPreference != 'Any') {
        final combined = '${r.preferences ?? ''} ${r.bio} ${r.about ?? ''} ${r.interests ?? ''}'.toLowerCase();
        if (!combined.contains(_foodPreference.toLowerCase())) return false;
      }

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final roommateProvider = context.watch<RoommateProvider>();
    final authUser = context.watch<AuthProvider>().user;
    final filteredRoommates = _applyClientFilters(roommateProvider.roommates);
    final canPop = ModalRoute.of(context)?.canPop ?? false;

    RoommateModel? myRoommateApp;
    if (authUser != null) {
      for (final r in roommateProvider.roommates) {
        if ((r.posterId != null && r.posterId == authUser.id) ||
            (r.posterEmail != null &&
                r.posterEmail!.toLowerCase() == authUser.email.toLowerCase())) {
          myRoommateApp = r;
          break;
        }
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      floatingActionButton: Padding(
        padding: EdgeInsets.only(bottom: canPop ? 8 : 86),
        child: FloatingActionButton.extended(
          elevation: 6,
          backgroundColor: const Color(0xFF0A2463),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ApplyRoommateScreen(existingRoommate: myRoommateApp),
              ),
            );
          },
          icon: Icon(
            myRoommateApp != null ? Icons.edit_note_rounded : Icons.person_add_alt_1_rounded,
            color: Colors.white,
          ),
          label: Text(
            myRoommateApp != null ? 'Edit Profile' : 'Post Profile',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
      ),
      body: CustomScrollView(
        slivers: [
          // Hero Header with Search & "✨ Auto-Match Me" Button
          SliverToBoxAdapter(
            child: Stack(
              children: [
                Container(
                  height: 330,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    image: DecorationImage(
                      image: NetworkImage('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200'),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Container(
                  height: 330,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFF0F172A).withValues(alpha: 0.92),
                        const Color(0xFF0F172A).withValues(alpha: 0.72),
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
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white24),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.circle, color: Color(0xFF34D399), size: 8),
                                SizedBox(width: 6),
                                Text(
                                  'Verified student & professional community',
                                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Find Your Ideal Roommate',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 25,
                              fontWeight: FontWeight.w900,
                              height: 1.15,
                            ),
                          ),
                          const SizedBox(height: 5),
                          const Text(
                            'Connect with compatible flatmates who match your lifestyle, study habits, and budget.',
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                          const SizedBox(height: 12),

                          // Search Bar
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
                                      hintText: 'Search by location, occupation, or name...',
                                      hintStyle: TextStyle(fontSize: 12.5, color: Colors.grey),
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
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                                  ),
                                  child: const Text('Search', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 10),

                          // "✨ Auto-Match Me" Button (Matches Web Roommates.jsx)
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _isAutoMatching ? null : _handleAutoMatch,
                              icon: _isAutoMatching
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                    )
                                  : const Icon(Icons.auto_awesome, size: 18, color: Colors.white),
                              label: Text(
                                _isAutoMatching ? 'AI Matching Your Profile...' : 'Auto-Match Me with Compatible Roommates',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12.5),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF7C3AED),
                                padding: const EdgeInsets.symmetric(vertical: 11),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                                elevation: 4,
                              ),
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

          // Auto-Match Error Alert (if user hasn't applied yet)
          if (_autoMatchError != null)
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1F2),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFFECDD3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: Color(0xFFE11D48)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _autoMatchError!,
                        style: const TextStyle(color: Color(0xFF9F1239), fontSize: 12.5, fontWeight: FontWeight.w600),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 18, color: Color(0xFFE11D48)),
                      onPressed: () => setState(() => _autoMatchError = null),
                    ),
                  ],
                ),
              ),
            ),

          // AI Matches Section (Matches Web Roommates.jsx lines 202-279)
          if (_aiMatches.isNotEmpty)
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.fromLTRB(16, 16, 16, 4),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF5F3FF), Color(0xFFEEF2FF)],
                  ),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: const Color(0xFFDDD6FE)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(
                          child: Row(
                            children: [
                              Text('🤖', style: TextStyle(fontSize: 22)),
                              SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Your Top AI Roommate Matches',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                                    Text(
                                      'Personalized matches based on your roommate application',
                                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        TextButton(
                          onPressed: () => setState(() => _aiMatches = []),
                          child: const Text(
                            'Clear ✕',
                            style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...List.generate(_aiMatches.length, (idx) {
                      final match = _aiMatches[idx];
                      final rm = match.roommatePost!;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Stack(
                              children: [
                                RoommateCard(roommate: rm),
                                Positioned(
                                  top: 12,
                                  left: 12,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(
                                        colors: [Color(0xFF7C3AED), Color(0xFF4F46E5)],
                                      ),
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: const [
                                        BoxShadow(color: Colors.black26, blurRadius: 6),
                                      ],
                                    ),
                                    child: Text(
                                      '✨ AI Match #${idx + 1}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFFDDD6FE)),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('💡', style: TextStyle(fontSize: 16)),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      match.aiExplanation,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFF334155),
                                        height: 1.4,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),

          // Quick Filters & Filter Button Bar (Matching Web RoommateFilterSidebar.jsx)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
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

                    // Quick Chip: Students
                    _buildQuickFilterChip(
                      label: '🎓 Students',
                      isActive: _occupation == 'Student',
                      onTap: () => setState(() => _occupation = _occupation == 'Student' ? 'Any' : 'Student'),
                    ),
                    const SizedBox(width: 8),

                    // Quick Chip: Females
                    _buildQuickFilterChip(
                      label: '👩 Females',
                      isActive: _genderPreference == 'Female',
                      onTap: () => setState(() => _genderPreference = _genderPreference == 'Female' ? 'Any' : 'Female'),
                    ),
                    const SizedBox(width: 8),

                    // Quick Chip: Males
                    _buildQuickFilterChip(
                      label: '👨 Males',
                      isActive: _genderPreference == 'Male',
                      onTap: () => setState(() => _genderPreference = _genderPreference == 'Male' ? 'Any' : 'Male'),
                    ),
                    const SizedBox(width: 8),

                    // Quick Chip: Non-Smoking
                    _buildQuickFilterChip(
                      label: '🚭 Non-Smoking',
                      isActive: _nonSmokingOnly,
                      onTap: () => setState(() => _nonSmokingOnly = !_nonSmokingOnly),
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
                    'Active Roommate Profiles (${filteredRoommates.length})',
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

          // Roommate List
          if (roommateProvider.isLoading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (filteredRoommates.isEmpty)
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
                    const Icon(Icons.person_search_rounded, size: 52, color: Colors.grey),
                    const SizedBox(height: 12),
                    const Text(
                      'No roommates match your filters',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Try expanding your budget range, age range, or resetting your active filters.',
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
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 150),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: RoommateCard(roommate: filteredRoommates[index]),
                    );
                  },
                  childCount: filteredRoommates.length,
                ),
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
                                'Filter Roommates',
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

                    // Body
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Gender Preference
                            const Text('GENDER PREFERENCE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              children: ['Any', 'Male', 'Female'].map((g) {
                                final isSelected = _genderPreference == g;
                                return ChoiceChip(
                                  label: Text(g),
                                  selected: isSelected,
                                  selectedColor: const Color(0xFF3488C3),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                  onSelected: (_) => updateBoth(() => _genderPreference = g),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 20),

                            // Occupation
                            const Text('OCCUPATION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: ['Any', 'Student', 'Software Engineer', 'Working Professional', 'Freelancer'].map((occ) {
                                final isSelected = _occupation == occ;
                                return ChoiceChip(
                                  label: Text(occ),
                                  selected: isSelected,
                                  selectedColor: const Color(0xFF3488C3),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                  onSelected: (_) => updateBoth(() => _occupation = occ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 20),

                            // Max Budget
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
                              min: 5000,
                              max: 150000,
                              divisions: 29,
                              activeColor: const Color(0xFF3488C3),
                              onChanged: (val) => updateBoth(() => _maxBudget = val),
                            ),
                            const SizedBox(height: 16),

                            // Age Range
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('AGE RANGE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                                Text(
                                  '${_ageRange.start.round()} - ${_ageRange.end.round()} yrs',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF3488C3)),
                                ),
                              ],
                            ),
                            RangeSlider(
                              values: _ageRange,
                              min: 18,
                              max: 65,
                              divisions: 47,
                              activeColor: const Color(0xFF3488C3),
                              onChanged: (vals) => updateBoth(() => _ageRange = vals),
                            ),
                            const SizedBox(height: 16),

                            // Food Preference
                            const Text('FOOD PREFERENCE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              children: ['Any', 'Vegetarian', 'Non-Vegetarian', 'Flexible'].map((f) {
                                final isSelected = _foodPreference == f;
                                return ChoiceChip(
                                  label: Text(f),
                                  selected: isSelected,
                                  selectedColor: const Color(0xFF3488C3),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                  onSelected: (_) => updateBoth(() => _foodPreference = f),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 16),

                            // Lifestyle Switches
                            const Text('LIFESTYLE HABITS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF64748B))),
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('🚭 Non-Smoking Only', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                              value: _nonSmokingOnly,
                              activeThumbColor: const Color(0xFF3488C3),
                              onChanged: (val) => updateBoth(() => _nonSmokingOnly = val),
                            ),
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('🐾 Pet Friendly', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                              value: _petFriendlyOnly,
                              activeThumbColor: const Color(0xFF3488C3),
                              onChanged: (val) => updateBoth(() => _petFriendlyOnly = val),
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
                            'Show ${_applyClientFilters(context.read<RoommateProvider>().roommates).length} Roommates',
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
