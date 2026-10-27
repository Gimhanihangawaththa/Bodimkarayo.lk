import 'property_model.dart';
import 'roommate_model.dart';

class RecommendationModel {
  final String type; // "PROPERTY" or "ROOMMATE"
  final PropertyModel? property;
  final RoommateModel? roommatePost;
  final String aiExplanation;

  RecommendationModel({
    required this.type,
    this.property,
    this.roommatePost,
    required this.aiExplanation,
  });

  factory RecommendationModel.fromJson(Map<String, dynamic> json) {
    return RecommendationModel(
      type: json['type'] ?? 'PROPERTY',
      property: json['property'] != null ? PropertyModel.fromJson(json['property']) : null,
      roommatePost: json['roommatePost'] != null ? RoommateModel.fromJson(json['roommatePost']) : null,
      aiExplanation: json['aiExplanation'] ?? '',
    );
  }
}
