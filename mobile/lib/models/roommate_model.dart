class RoommateModel {
  final int? id;
  final String gender;
  final int? age;
  final String occupation;
  final String location;
  final String bio;
  final String? about;
  final String? interests;
  final String? preferences;
  final String? preferredLocation;
  final String? moveInDate;
  final double? budget;
  final int? posterId;
  final String? name;
  final String? image;
  final int? matchPercentage;
  final bool isVerified;

  RoommateModel({
    this.id,
    required this.gender,
    this.age,
    required this.occupation,
    required this.location,
    required this.bio,
    this.about,
    this.interests,
    this.preferences,
    this.preferredLocation,
    this.moveInDate,
    this.budget,
    this.posterId,
    this.name,
    this.image,
    this.matchPercentage,
    this.isVerified = true,
  });

  factory RoommateModel.fromJson(Map<String, dynamic> json) {
    final posterObj = json['poster'] as Map<String, dynamic>?;
    final fallbackImg = (json['gender']?.toString().toUpperCase() == 'FEMALE')
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500';

    return RoommateModel(
      id: json['id'] is int ? json['id'] : (int.tryParse(json['id']?.toString() ?? '')),
      gender: json['gender'] ?? '',
      age: json['age'] is int ? json['age'] : (int.tryParse(json['age']?.toString() ?? '')),
      occupation: json['occupation'] ?? '',
      location: json['location'] ?? '',
      bio: json['bio'] ?? '',
      about: json['about'],
      interests: json['interests'],
      preferences: json['preferences'],
      preferredLocation: json['preferredLocation'],
      moveInDate: json['moveInDate'],
      budget: (json['budget'] as num?)?.toDouble(),
      posterId: posterObj != null ? posterObj['id'] : json['posterId'],
      name: json['name'] ?? posterObj?['fullName'] ?? 'Roommate',
      image: json['image'] ?? posterObj?['profilePictureUrl'] ?? fallbackImg,
      matchPercentage: json['matchPercentage'] ?? 95,
      isVerified: json['verified'] ?? json['isVerified'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'gender': gender,
      'age': age,
      'occupation': occupation,
      'location': location,
      'bio': bio,
      'about': about,
      'interests': interests,
      'preferences': preferences,
      'preferredLocation': preferredLocation,
      'moveInDate': moveInDate,
      'budget': budget,
      'name': name,
      'image': image,
      'matchPercentage': matchPercentage,
      'isVerified': isVerified,
    };
  }
}
