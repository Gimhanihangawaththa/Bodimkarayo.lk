import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About Bodimkarayo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF0A2463),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset(
                'assets/logo.png',
                height: 80,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const Icon(Icons.home_work_rounded, size: 60, color: Color(0xFF0A2463)),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Bodimkarayo.lk',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0A2463)),
            ),
            const SizedBox(height: 6),
            Text(
              'Sri Lanka’s #1 Student & Professional Accommodation Platform',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 24),

            _buildCard(
              icon: Icons.lightbulb_outline,
              title: 'Our Mission',
              description:
                  'To simplify student and professional boarding and roommate hunting in Sri Lanka with trusted listings, verified reviews, and intelligent AI matchmaking.',
            ),
            const SizedBox(height: 14),

            _buildCard(
              icon: Icons.auto_awesome,
              title: 'AI-Powered Recommendations',
              description:
                  'We use advanced Gemini AI to match you with places and roommates matching your budget, university proximity, and lifestyle preferences.',
            ),
            const SizedBox(height: 14),

            _buildCard(
              icon: Icons.lock_outline,
              title: 'Secure & Direct Communication',
              description:
                  'Connect directly with owners and prospective roommates through in-app real-time messaging without third-party brokers.',
            ),
            const SizedBox(height: 30),

            Text('Version 1.0.0', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({required IconData icon, required String title, required String description}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFE0F2FE),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF0A2463), size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0A2463))),
                const SizedBox(height: 4),
                Text(description, style: TextStyle(fontSize: 13, color: Colors.grey.shade700, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
