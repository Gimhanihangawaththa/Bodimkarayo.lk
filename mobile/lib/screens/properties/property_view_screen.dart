import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/property_model.dart';
import '../../models/user_model.dart';
import '../../widgets/info_pill.dart';
import '../../providers/auth_provider.dart';
import '../../providers/property_provider.dart';
import '../../providers/review_provider.dart';
import '../../providers/chat_provider.dart';
import '../chat/chat_conversation_screen.dart';

class PropertyViewScreen extends StatefulWidget {
  final PropertyModel property;
  const PropertyViewScreen({super.key, required this.property});

  @override
  State<PropertyViewScreen> createState() => _PropertyViewScreenState();
}

class _PropertyViewScreenState extends State<PropertyViewScreen> {
  final PageController _imagePageController = PageController();
  int _activeImageIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.property.id != null) {
        context.read<ReviewProvider>().fetchPropertyReviews(widget.property.id!);
      }
    });
  }

  @override
  void dispose() {
    _imagePageController.dispose();
    super.dispose();
  }

  void _toggleFavorite() async {
    final authUser = context.read<AuthProvider>().user;
    if (authUser == null || authUser.id == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please sign in to save favorites'),
          action: SnackBarAction(
            label: 'Sign In',
            onPressed: () => Navigator.pushNamed(context, '/signin'),
          ),
        ),
      );
      return;
    }

    if (widget.property.id != null) {
      await context.read<PropertyProvider>().toggleFavorite(authUser.id!, widget.property.id!);
    }
  }

  void _messageOwner() async {
    final authUser = context.read<AuthProvider>().user;
    if (authUser == null || authUser.id == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please sign in to message the landlord'),
          action: SnackBarAction(
            label: 'Sign In',
            onPressed: () => Navigator.pushNamed(context, '/signin'),
          ),
        ),
      );
      return;
    }

    final ownerId = 1;
    if (authUser.id == ownerId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('This is your own listing!')),
      );
      return;
    }

    final chatProvider = context.read<ChatProvider>();
    final room = await chatProvider.getOrCreateRoom(authUser.id!, ownerId);

    if (room != null && mounted) {
      final otherUser = room.getOtherUser(authUser.id!);
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatConversationScreen(
            roomId: room.id,
            targetUser: otherUser.id != null
                ? otherUser
                : UserModel(id: ownerId, email: 'landlord@bodimkarayo.lk', fullName: 'Landlord'),
          ),
        ),
      );
    }
  }

  void _showAddReviewDialog() {
    final authUser = context.read<AuthProvider>().user;
    if (authUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please sign in to leave a review'),
          action: SnackBarAction(
            label: 'Sign In',
            onPressed: () => Navigator.pushNamed(context, '/signin'),
          ),
        ),
      );
      return;
    }

    int selectedRating = 5;
    final commentController = TextEditingController();
    final reviewProvider = context.read<ReviewProvider>();
    final messenger = ScaffoldMessenger.of(context);

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (sbContext, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Text('Write a Review', style: TextStyle(fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Your Rating', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        final star = index + 1;
                        return IconButton(
                          icon: Icon(
                            star <= selectedRating ? Icons.star_rounded : Icons.star_border_rounded,
                            color: Colors.amber,
                            size: 34,
                          ),
                          onPressed: () {
                            setDialogState(() {
                              selectedRating = star;
                            });
                          },
                        );
                      }),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: commentController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Share your experience staying here...',
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (commentController.text.trim().isEmpty) return;
                    Navigator.pop(dialogContext);
                    final success = await reviewProvider.addReview(
                      propertyId: widget.property.id ?? 101,
                      rating: selectedRating,
                      comment: commentController.text.trim(),
                    );
                    if (!mounted) return;
                    messenger.showSnackBar(
                      SnackBar(
                        content: Text(success ? 'Review posted successfully!' : 'Failed to post review.'),
                        backgroundColor: success ? Colors.green : Colors.red,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3488C3),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Submit Review'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final propertyProvider = context.watch<PropertyProvider>();
    final reviewProvider = context.watch<ReviewProvider>();
    final isFav = widget.property.id != null && propertyProvider.isFavorite(widget.property.id!);
    final ratingSummary = reviewProvider.ratingSummary;

    final imagesList = (widget.property.images != null && widget.property.images!.isNotEmpty)
        ? widget.property.images!
        : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200'];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          // Collapsible App Bar with Multi-Image Slider
          SliverAppBar(
            expandedHeight: 340.0,
            pinned: true,
            backgroundColor: const Color(0xFF0F172A),
            leading: CircleAvatar(
              backgroundColor: Colors.black.withValues(alpha: 0.5),
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            actions: [
              CircleAvatar(
                backgroundColor: Colors.black.withValues(alpha: 0.5),
                child: IconButton(
                  icon: Icon(isFav ? Icons.favorite : Icons.favorite_border),
                  color: isFav ? Colors.redAccent : Colors.white,
                  onPressed: _toggleFavorite,
                ),
              ),
              const SizedBox(width: 12),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Swipable PageView
                  PageView.builder(
                    controller: _imagePageController,
                    onPageChanged: (idx) => setState(() => _activeImageIndex = idx),
                    itemCount: imagesList.length,
                    itemBuilder: (context, index) {
                      return Image.network(
                        imagesList[index],
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(color: const Color(0xFF0F172A)),
                      );
                    },
                  ),
                  // Dark gradient overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.black.withValues(alpha: 0.4),
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.8),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),

                  // Image index counter overlay
                  Positioned(
                    top: 50,
                    right: 60,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        '${_activeImageIndex + 1} / ${imagesList.length}',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),

                  // Title and Location on bottom of image
                  Positioned(
                    bottom: 20,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            if (widget.property.badge != null) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF3488C3),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  widget.property.badge!,
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 8),
                            ],
                            InfoPill(label: widget.property.propertyType ?? 'Apartment', baseColor: Colors.blueAccent),
                            const SizedBox(width: 8),
                            InfoPill(label: 'Avail: ${widget.property.availableFrom ?? 'Immediate'}', baseColor: Colors.greenAccent),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          widget.property.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on, color: Color(0xFF38BDF8), size: 16),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                widget.property.address ?? widget.property.location,
                                style: const TextStyle(color: Colors.white70, fontSize: 13),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
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

          // Main Details Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Thumbnails Strip (if multiple images)
                  if (imagesList.length > 1) ...[
                    SizedBox(
                      height: 60,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: imagesList.length,
                        itemBuilder: (context, index) {
                          final isSelected = index == _activeImageIndex;
                          return GestureDetector(
                            onTap: () {
                              _imagePageController.animateToPage(
                                index,
                                duration: const Duration(milliseconds: 300),
                                curve: Curves.easeInOut,
                              );
                            },
                            child: Container(
                              margin: const EdgeInsets.only(right: 10),
                              width: 60,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSelected ? const Color(0xFF3488C3) : Colors.transparent,
                                  width: 2.5,
                                ),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  imagesList[index],
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 18),
                  ],

                  // Rent and Landlord Action Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.grey.shade200),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('MONTHLY RENT', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                                const SizedBox(height: 4),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      'Rs ${widget.property.rent.toStringAsFixed(0)}',
                                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                    ),
                                    const Text(' /month', style: TextStyle(color: Colors.grey, fontSize: 14)),
                                  ],
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.amber.shade50,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.amber.shade200),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.star_rounded, color: Colors.amber, size: 20),
                                  const SizedBox(width: 4),
                                  Text(
                                    (widget.property.rating ?? 4.8).toStringAsFixed(1),
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _messageOwner,
                            icon: const Icon(Icons.chat_bubble_outline, color: Colors.white, size: 18),
                            label: const Text('Message Landlord', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              backgroundColor: const Color(0xFF3488C3),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 0,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Specifications Grid (Beds, Baths, Kitchens, Floor)
                  _buildSectionHeader('Specifications'),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildSpecTile('🛏️', '${widget.property.bedrooms ?? 1} Bedrooms'),
                        Container(width: 1, height: 35, color: Colors.grey.shade200),
                        _buildSpecTile('🚿', '${widget.property.bathrooms ?? 1} Bathrooms'),
                        Container(width: 1, height: 35, color: Colors.grey.shade200),
                        _buildSpecTile('🍳', '${widget.property.kitchens ?? 1} Kitchen'),
                        Container(width: 1, height: 35, color: Colors.grey.shade200),
                        _buildSpecTile('🏢', widget.property.floor ?? 'Floor 1'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Overview / Description
                  _buildSectionHeader('Overview'),
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Text(
                      widget.property.description,
                      style: TextStyle(color: Colors.grey.shade800, fontSize: 14, height: 1.6),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Amenities / Offers
                  if (widget.property.offers != null && widget.property.offers!.isNotEmpty) ...[
                    _buildSectionHeader('Amenities & Features'),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: widget.property.offers!.map((offer) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 18,
                                height: 18,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF10B981),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.check, color: Colors.white, size: 12),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                offer,
                                style: const TextStyle(color: Color(0xFF065F46), fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Highlights & House Rules
                  if (widget.property.highlights != null && widget.property.highlights!.isNotEmpty) ...[
                    _buildSectionHeader('Highlights'),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Column(
                        children: widget.property.highlights!.map((h) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              children: [
                                const Icon(Icons.star_rounded, color: Color(0xFF3488C3), size: 18),
                                const SizedBox(width: 10),
                                Expanded(child: Text(h, style: const TextStyle(fontSize: 13))),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Reviews & Ratings Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildSectionHeader('Reviews & Ratings'),
                      TextButton.icon(
                        onPressed: _showAddReviewDialog,
                        icon: const Icon(Icons.rate_review_outlined, color: Color(0xFF3488C3), size: 18),
                        label: const Text('Write Review', style: TextStyle(color: Color(0xFF3488C3), fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  if (ratingSummary != null && ratingSummary.totalReviews > 0)
                    Container(
                      padding: const EdgeInsets.all(14),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.amber.shade200),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.star_rounded, color: Colors.amber, size: 30),
                          const SizedBox(width: 8),
                          Text(
                            ratingSummary.averageRating.toStringAsFixed(1),
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Based on ${ratingSummary.totalReviews} verified tenant review${ratingSummary.totalReviews == 1 ? '' : 's'}',
                            style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                          ),
                        ],
                      ),
                    ),

                  if (reviewProvider.isLoading)
                    const Center(child: CircularProgressIndicator(color: Color(0xFF3488C3)))
                  else if (reviewProvider.reviews.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: const Center(
                        child: Text(
                          'No reviews yet for this listing. Be the first to leave feedback!',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                      ),
                    )
                  else
                    ...reviewProvider.reviews.map((rev) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 14,
                                      backgroundColor: const Color(0xFF0F172A),
                                      child: Text(
                                        rev.reviewerName.isNotEmpty ? rev.reviewerName[0].toUpperCase() : 'U',
                                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(rev.reviewerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                  ],
                                ),
                                Row(
                                  children: List.generate(5, (i) {
                                    return Icon(
                                      i < rev.rating ? Icons.star_rounded : Icons.star_border_rounded,
                                      color: Colors.amber,
                                      size: 16,
                                    );
                                  }),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(rev.comment, style: TextStyle(color: Colors.grey.shade800, fontSize: 13, height: 1.4)),
                          ],
                        ),
                      );
                    }),

                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
      ),
    );
  }

  Widget _buildSpecTile(String emoji, String text) {
    return Column(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 20)),
        const SizedBox(height: 4),
        Text(
          text,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: Color(0xFF334155)),
        ),
      ],
    );
  }
}
