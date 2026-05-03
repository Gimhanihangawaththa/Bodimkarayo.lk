import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/property_model.dart';
import '../providers/property_provider.dart';
import '../screens/properties/property_view_screen.dart';
import '../screens/properties/add_property_screen.dart';
import 'glass_card.dart';

class PropertyCard extends StatefulWidget {
  final PropertyModel property;

  const PropertyCard({
    super.key,
    required this.property,
  });

  @override
  State<PropertyCard> createState() => _PropertyCardState();
}

class _PropertyCardState extends State<PropertyCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final property = widget.property;
    final imageUrl = (property.images != null && property.images!.isNotEmpty)
        ? property.images!.first
        : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400';

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PropertyViewScreen(property: property),
          ),
        );
      },
      child: AnimatedScale(
        scale: _isPressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOutBack,
        child: GlassCard(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 24),
          padding: EdgeInsets.zero,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Image
              Hero(
                tag: 'property_${property.id}_${property.title}',
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  child: Image.network(
                    imageUrl,
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 180,
                      width: double.infinity,
                      color: Colors.white.withOpacity(0.2),
                      child: const Icon(Icons.broken_image, color: Colors.white),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            property.title,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: Color(0xFF0A2463),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.amber.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                              SizedBox(width: 4),
                              Text(
                                '4.5', // Default rating if not in model
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFB45309),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, size: 16, color: Color(0xFF3E92CC)),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            property.location,
                            style: const TextStyle(fontSize: 14, color: Color(0xFF0A2463)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Amenities from Highlights
                    if (property.highlights != null && property.highlights!.isNotEmpty)
                      Wrap(
                        spacing: 12,
                        runSpacing: 8,
                        children: property.highlights!.take(3).map((h) {
                          return Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.check_circle_outline, size: 14, color: Color(0xFF3E92CC)),
                              const SizedBox(width: 4),
                              Text(
                                h,
                                style: const TextStyle(fontSize: 12, color: Color(0xFF0A2463)),
                              ),
                            ],
                          );
                        }).toList(),
                      ),
                    const SizedBox(height: 8),
                    Divider(height: 1, color: const Color(0xFF0A2463).withOpacity(0.1)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        RichText(
                          text: TextSpan(
                            text: 'Rs ${property.rent.toStringAsFixed(0)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 20,
                              color: Color(0xFF0A2463),
                            ),
                            children: const [
                              TextSpan(
                                text: ' /mo',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              constraints: const BoxConstraints(),
                              padding: EdgeInsets.zero,
                              splashRadius: 20,
                              icon: const Icon(Icons.edit, size: 20, color: Colors.blue),
                              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => AddPropertyScreen(property: property))),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              constraints: const BoxConstraints(),
                              padding: EdgeInsets.zero,
                              splashRadius: 20,
                              icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (ctx) => AlertDialog(
                                    title: const Text('Delete Property'),
                                    content: const Text('Are you sure you want to delete this?'),
                                    actions: [
                                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                                      TextButton(
                                        onPressed: () async {
                                          Navigator.pop(ctx);
                                          await Provider.of<PropertyProvider>(context, listen: false).deleteProperty(property.id!);
                                        },
                                        child: const Text('Delete', style: TextStyle(color: Colors.red)),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                            const SizedBox(width: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF3E92CC).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                property.availableFrom ?? 'Now',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF0A2463),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
