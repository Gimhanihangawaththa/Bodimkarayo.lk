class ReviewModel {
  final int? id;
  final int? propertyId;
  final int? reviewerId;
  final String reviewerName;
  final String? reviewerProfilePicture;
  final int rating;
  final String comment;
  final String? createdAt;

  ReviewModel({
    this.id,
    this.propertyId,
    this.reviewerId,
    required this.reviewerName,
    this.reviewerProfilePicture,
    required this.rating,
    required this.comment,
    this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'],
      propertyId: json['propertyId'],
      reviewerId: json['reviewerId'] ?? (json['user'] != null ? json['user']['id'] : null),
      reviewerName: json['reviewerName'] ?? (json['user'] != null ? json['user']['fullName'] : 'Anonymous') ?? 'Anonymous',
      reviewerProfilePicture: json['reviewerProfilePicture'] ?? (json['user'] != null ? json['user']['profilePictureUrl'] : null),
      rating: json['rating'] ?? 5,
      comment: json['comment'] ?? '',
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      if (propertyId != null) 'propertyId': propertyId,
      'rating': rating,
      'comment': comment,
    };
  }
}

class PropertyRatingSummary {
  final double averageRating;
  final int totalReviews;

  PropertyRatingSummary({required this.averageRating, required this.totalReviews});

  factory PropertyRatingSummary.fromJson(Map<String, dynamic> json) {
    return PropertyRatingSummary(
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: json['totalReviews'] ?? 0,
    );
  }
}
