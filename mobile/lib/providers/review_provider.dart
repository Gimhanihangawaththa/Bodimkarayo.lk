import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/review_model.dart';

class ReviewProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<ReviewModel> _reviews = [];
  PropertyRatingSummary? _ratingSummary;
  bool _isLoading = false;

  List<ReviewModel> get reviews => _reviews;
  PropertyRatingSummary? get ratingSummary => _ratingSummary;
  bool get isLoading => _isLoading;

  Future<void> fetchPropertyReviews(int propertyId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final reviewsFuture = _apiService.get('/properties/$propertyId/reviews');
      final ratingFuture = _apiService.get('/properties/$propertyId/rating');

      final results = await Future.wait([reviewsFuture, ratingFuture]);
      final reviewsRes = results[0];
      final ratingRes = results[1];

      if (reviewsRes.statusCode == 200) {
        List<dynamic> data = jsonDecode(reviewsRes.body);
        _reviews = data.map((item) => ReviewModel.fromJson(item)).toList();
      }

      if (ratingRes.statusCode == 200) {
        _ratingSummary = PropertyRatingSummary.fromJson(jsonDecode(ratingRes.body));
      }
    } catch (e) {
      debugPrint('Fetch reviews error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> addReview({
    required int propertyId,
    required int rating,
    required String comment,
  }) async {
    try {
      final response = await _apiService.post('/properties/$propertyId/reviews', {
        'rating': rating,
        'comment': comment,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchPropertyReviews(propertyId);
        return true;
      }
    } catch (e) {
      debugPrint('Add review error: $e');
    }
    return false;
  }
}
