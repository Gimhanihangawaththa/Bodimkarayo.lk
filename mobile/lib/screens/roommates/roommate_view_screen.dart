import 'package:flutter/material.dart';
import '../../models/roommate_model.dart';

class RoommateViewScreen extends StatefulWidget {
  final RoommateModel roommate;
  const RoommateViewScreen({super.key, required this.roommate});

  @override
  State<RoommateViewScreen> createState() => _RoommateViewScreenState();
}

class _RoommateViewScreenState extends State<RoommateViewScreen> {

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
                      backgroundImage: NetworkImage(widget.roommate.gender == 'FEMALE' 
                        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400"
                        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Roommate Post',
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.roommate.occupation,
                            style: TextStyle(color: Colors.grey[700], fontSize: 16),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${widget.roommate.location} • ${widget.roommate.age ?? 'N/A'} yrs',
                            style: TextStyle(color: Colors.grey[500], fontSize: 14),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.star, color: Colors.amber, size: 20),
                              const SizedBox(width: 4),
                              Text('4.5 rating', style: TextStyle(color: Colors.grey[700])),
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
                    Text(widget.roommate.about ?? 'No additional info provided.', style: const TextStyle(height: 1.5, color: Colors.black87)),
                    const SizedBox(height: 12),
                    Text(widget.roommate.bio, style: const TextStyle(height: 1.5, color: Colors.black87)),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Interests
              if (widget.roommate.interests != null && widget.roommate.interests!.isNotEmpty)
                _buildCardSection(
                  title: 'Interests',
                  content: Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: widget.roommate.interests!.split(',').map((interest) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          interest.trim(),
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
                    _buildPrefItem('Looking For', widget.roommate.gender),
                    _buildPrefItem('Budget', 'Rs. ${widget.roommate.budget ?? 'N/A'}'),
                    _buildPrefItem('Preferred Location', widget.roommate.preferredLocation ?? widget.roommate.location),
                    _buildPrefItem('Move In Date', widget.roommate.moveInDate ?? 'Flexible'),
                  ],
                ),
              ),
              const SizedBox(height: 20),

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
