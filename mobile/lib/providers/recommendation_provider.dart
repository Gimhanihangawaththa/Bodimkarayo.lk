import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/recommendation_model.dart';

class RecommendationProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<RecommendationModel> _recommendations = [];
  bool _isLoading = false;
  bool _hasSearched = false;
  String? _errorMessage;

  List<RecommendationModel> get recommendations => _recommendations;
  bool get isLoading => _isLoading;
  bool get hasSearched => _hasSearched;
  String? get errorMessage => _errorMessage;

  Future<bool> fetchRecommendations({
    required String preferences,
    double? maxBudget,
    String? preferredLocation,
    String? propertyType,
  }) async {
    _isLoading = true;
    _hasSearched = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/recommendations', {
        'preferences': preferences,
        if (maxBudget != null) 'maxBudget': maxBudget,
        if (preferredLocation != null && preferredLocation.isNotEmpty)
          'preferredLocation': preferredLocation,
        if (propertyType != null && propertyType.isNotEmpty)
          'propertyType': propertyType,
      });

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        _recommendations = data.map((item) => RecommendationModel.fromJson(item)).toList();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = 'Failed to generate recommendations. Please try again.';
      }
    } catch (e) {
      debugPrint('Fetch recommendations error: $e');
      _errorMessage = 'Error connecting to AI service: $e';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
