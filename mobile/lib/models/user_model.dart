class UserModel {
  final int? id;
  final String email;
  final String? fullName;
  final String? role;
  final String? about;
  final String? profilePictureUrl;

  UserModel({
    this.id,
    required this.email,
    this.fullName,
    this.role,
    this.about,
    this.profilePictureUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'] ?? '',
      fullName: json['fullName'],
      role: json['role'],
      about: json['about'],
      profilePictureUrl: json['profilePictureUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'role': role,
      'about': about,
      'profilePictureUrl': profilePictureUrl,
    };
  }
}
