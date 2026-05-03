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
  });

  factory RoommateModel.fromJson(Map<String, dynamic> json) {
    return RoommateModel(
      id: json['id'],
      gender: json['gender'] ?? '',
      age: json['age'],
      occupation: json['occupation'] ?? '',
      location: json['location'] ?? '',
      bio: json['bio'] ?? '',
      about: json['about'],
      interests: json['interests'],
      preferences: json['preferences'],
      preferredLocation: json['preferredLocation'],
      moveInDate: json['moveInDate'],
      budget: (json['budget'] as num?)?.toDouble(),
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
    };
  }
}
