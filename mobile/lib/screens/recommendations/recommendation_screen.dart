import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/recommendation_provider.dart';
import '../../widgets/property_card.dart';
import '../../widgets/roommate_card.dart';
import '../properties/property_view_screen.dart';
import '../roommates/roommate_view_screen.dart';

class RecommendationScreen extends StatefulWidget {
  const RecommendationScreen({super.key});

  @override
  State<RecommendationScreen> createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  final TextEditingController _promptController = TextEditingController();
  final TextEditingController _budgetController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  String _selectedPropertyType = 'Any';

  final List<String> _propertyTypes = ['Any', 'Single Room', 'Shared Room', 'Annex', 'House', 'Apartment'];

  @override
  void dispose() {
    _promptController.dispose();
    _budgetController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _getRecommendations() {
    if (_promptController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please describe what kind of place or roommate you need.')),
      );
      return;
    }

    final double? budget = double.tryParse(_budgetController.text.trim());
    final String? location = _locationController.text.trim().isNotEmpty ? _locationController.text.trim() : null;
    final String? propType = _selectedPropertyType != 'Any' ? _selectedPropertyType : null;

    context.read<RecommendationProvider>().fetchRecommendations(
          preferences: _promptController.text.trim(),
          maxBudget: budget,
          preferredLocation: location,
          propertyType: propType,
        );
  }

  @override
  Widget build(BuildContext context) {
    final recommendationProvider = context.watch<RecommendationProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.auto_awesome, color: Color(0xFF3E92CC)),
            SizedBox(width: 8),
            Text('AI Matchmaker', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF0A2463),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // AI Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0A2463), Color(0xFF3E92CC)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0A2463).withValues(alpha: 0.2),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.psychology, color: Colors.white, size: 28),
                      SizedBox(width: 8),
                      Text(
                        'Powered by Gemini AI',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Tell us about yourself, your university/office, budget, and desired lifestyle. Our AI will analyze listings to find your ideal match!',
                    style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Prompt Input
            const Text('What are you looking for?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            TextField(
              controller: _promptController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'e.g. I am a 2nd year Moratuwa student looking for a quiet single room with WiFi under 25,000 near Katubedda.',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),

            // Optional Filters
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Max Budget (LKR)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _budgetController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          hintText: 'e.g. 30000',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Location', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _locationController,
                        decoration: InputDecoration(
                          hintText: 'e.g. Colombo',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Property Type Dropdown
            const Text('Property Type', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedPropertyType,
                  isExpanded: true,
                  items: _propertyTypes.map((type) {
                    return DropdownMenuItem(value: type, child: Text(type));
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedPropertyType = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: recommendationProvider.isLoading ? null : _getRecommendations,
                icon: recommendationProvider.isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.auto_awesome, color: Colors.white),
                label: Text(
                  recommendationProvider.isLoading ? 'Finding Best Matches...' : 'Find Matches with AI',
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0A2463),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Results Section
            if (recommendationProvider.errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(10)),
                child: Text(recommendationProvider.errorMessage!, style: TextStyle(color: Colors.red.shade700)),
              ),

            if (recommendationProvider.recommendations.isNotEmpty) ...[
              const Text(
                'AI Recommendations',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0A2463)),
              ),
              const SizedBox(height: 12),
              ...recommendationProvider.recommendations.map((rec) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF3E92CC).withValues(alpha: 0.3)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // AI Explanation Pill
                      if (rec.aiExplanation.isNotEmpty)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE0F2FE),
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.lightbulb_outline, size: 18, color: Color(0xFF0A2463)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  rec.aiExplanation,
                                  style: const TextStyle(fontSize: 13, color: Color(0xFF0A2463), fontWeight: FontWeight.w500),
                                ),
                              ),
                            ],
                          ),
                        ),

                      if (rec.type == 'PROPERTY' && rec.property != null)
                        PropertyCard(
                          property: rec.property!,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => PropertyViewScreen(property: rec.property!)),
                            );
                          },
                        ),

                      if (rec.type == 'ROOMMATE' && rec.roommatePost != null)
                        RoommateCard(
                          roommate: rec.roommatePost!,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => RoommateViewScreen(roommate: rec.roommatePost!)),
                            );
                          },
                        ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}
