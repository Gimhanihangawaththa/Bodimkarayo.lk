import 'package:flutter/material.dart';
import '../../models/property_model.dart';
import '../../widgets/info_pill.dart';

class PropertyViewScreen extends StatefulWidget {
  final PropertyModel property;
  const PropertyViewScreen({super.key, required this.property});

  @override
  State<PropertyViewScreen> createState() => _PropertyViewScreenState();
}

class _PropertyViewScreenState extends State<PropertyViewScreen> {
  bool _isFavorite = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300.0,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    widget.property.images != null && widget.property.images!.isNotEmpty
                        ? widget.property.images![0]
                        : 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200',
                    fit: BoxFit.cover,
                  ),
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.transparent, Colors.black87],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 24,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            InfoPill(label: widget.property.propertyType ?? 'Property', baseColor: Colors.blueAccent),
                            const SizedBox(width: 8),
                            InfoPill(label: 'Avail: ${widget.property.availableFrom ?? 'Now'}', baseColor: Colors.greenAccent),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          widget.property.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          widget.property.address ?? widget.property.location,
                          style: const TextStyle(color: Colors.white70),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border),
                color: _isFavorite ? Colors.redAccent : Colors.white,
                onPressed: () {
                  setState(() {
                    _isFavorite = !_isFavorite;
                  });
                },
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('MONTHLY RENT', style: TextStyle(color: Colors.grey, fontSize: 12, letterSpacing: 1.5)),
                        const SizedBox(height: 8),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Rs ${widget.property.rent}',
                              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                            ),
                            const Text(
                              ' /month',
                              style: TextStyle(color: Colors.grey, fontSize: 16),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 50),
                            backgroundColor: Colors.blue[600],
                          ),
                          child: const Text('Message Owner'),
                        ),
                        const SizedBox(height: 12),
                        OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 50),
                          ),
                          child: const Text('Schedule a Visit'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Overview
                  _buildSectionTitle('Overview'),
                  Text(
                    widget.property.description,
                    style: TextStyle(color: Colors.grey[700], height: 1.5),
                  ),
                  const SizedBox(height: 24),

                  // Specifications
                  _buildSectionTitle('Specifications'),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildSpecItem(Icons.bed, '${widget.property.bedrooms ?? 0} Beds'),
                      _buildSpecItem(Icons.bathtub, '${widget.property.bathrooms ?? 0} Baths'),
                      _buildSpecItem(Icons.kitchen, '${widget.property.kitchens ?? 0} Kitchen'),
                      _buildSpecItem(Icons.square_foot, widget.property.floor ?? 'Ground'),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Amenities
                  if (widget.property.offers != null && widget.property.offers!.isNotEmpty) ...[
                    _buildSectionTitle('Amenities'),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: widget.property.offers!.map((offer) {
                        return Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle, color: Colors.green, size: 20),
                            const SizedBox(width: 8),
                            Text(offer),
                          ],
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 32),
                  ],

                  // Rules
                  if (widget.property.rules != null && widget.property.rules!.isNotEmpty) ...[
                    _buildSectionTitle('House Rules'),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: widget.property.rules!.map((rule) {
                        return Chip(label: Text(rule), backgroundColor: Colors.grey[200]);
                      }).toList(),
                    ),
                  ],
                  const SizedBox(height: 48),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildSpecItem(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.blueAccent, size: 28),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }
}
