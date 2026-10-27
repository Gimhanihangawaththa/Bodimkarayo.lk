import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/property_model.dart';
import '../models/roommate_model.dart';

class SearchProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<PropertyModel> _matchedProperties = [];
  List<RoommateModel> _matchedRoommates = [];
  bool _isLoading = false;
  String _currentQuery = '';

  List<PropertyModel> get matchedProperties => _matchedProperties;
  List<RoommateModel> get matchedRoommates => _matchedRoommates;
  bool get isLoading => _isLoading;
  String get currentQuery => _currentQuery;

  Future<void> searchGlobal(String keyword) async {
    _currentQuery = keyword;
    if (keyword.trim().isEmpty) {
      _matchedProperties = [];
      _matchedRoommates = [];
      notifyListeners();
      return;
    }

    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/search/global?keyword=${Uri.encodeComponent(keyword.trim())}');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final propList = data['properties'] as List? ?? [];
        final roomList = data['roommates'] as List? ?? [];

        _matchedProperties = propList.map((item) => PropertyModel.fromJson(item)).toList();
        _matchedRoommates = roomList.map((item) => RoommateModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Search global error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  void clearSearch() {
    _currentQuery = '';
    _matchedProperties = [];
    _matchedRoommates = [];
    notifyListeners();
  }
}
