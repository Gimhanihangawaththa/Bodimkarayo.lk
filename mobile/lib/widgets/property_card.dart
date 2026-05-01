import 'package:flutter/material.dart';

class PropertyCard extends StatefulWidget {
  final String image;
  final String title;
  final String location;
  final double rating;
  final int reviews;
  final double price;
  final String available;
  final List<Map<String, String>> amenities;

  const PropertyCard({
    super.key,
    required this.image,
    required this.title,
    required this.location,
    required this.rating,
    required this.reviews,
    required this.price,
    required this.available,
    required this.amenities,
  });

  @override
  State<PropertyCard> createState() => _PropertyCardState();
}

class _PropertyCardState extends State<PropertyCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        // Future: Navigate to property detail screen passing data
      },
      child: AnimatedScale(
        scale: _isPressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOutBack,
        child: Container(
          width: 270,
          margin: const EdgeInsets.only(right: 20, bottom: 12, top: 4),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: _isPressed
                    ? Colors.black.withOpacity(0.04)
                    : Colors.black.withOpacity(0.12),
                offset: Offset(0, _isPressed ? 4 : 8),
                blurRadius: _isPressed ? 12 : 24,
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image
              Hero(
                tag: 'property_${widget.title}_${widget.image}',
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: Image.network(
                    widget.image,
                    height: 150,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 150,
                      width: double.infinity,
                      color: Colors.grey[200],
                      child: const Icon(Icons.broken_image, color: Colors.grey),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Title and Rating
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Text(
                                  widget.title,
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.amber.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      widget.rating.toString(),
                                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.amber.shade800,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          // Location
                          Row(
                            children: [
                              Icon(Icons.location_on_rounded, size: 14, color: Theme.of(context).colorScheme.primary),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  widget.location,
                                  style: Theme.of(context).textTheme.bodySmall,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          // Amenities
                          Row(
                            children: widget.amenities.map((a) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: Row(
                                  children: [
                                    Text(a['icon'] ?? '', style: const TextStyle(fontSize: 14)),
                                    const SizedBox(width: 4),
                                    Text(a['label'] ?? '', style: Theme.of(context).textTheme.labelSmall),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                      // Divider and Footer
                      Column(
                        children: [
                          const Divider(height: 16),
                          // Price & Available
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              RichText(
                                text: TextSpan(
                                  text: 'Rs ${widget.price.toStringAsFixed(0)}',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Theme.of(context).colorScheme.primary,
                                      ),
                                  children: [
                                    TextSpan(
                                      text: ' /mo',
                                      style: Theme.of(context).textTheme.labelSmall,
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  widget.available,
                                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                        color: Theme.of(context).colorScheme.primary,
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
              ),
            ],
          ),
        ),
      ),
    );
  }
}
