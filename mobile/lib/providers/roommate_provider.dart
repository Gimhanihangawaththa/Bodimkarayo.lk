import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/roommate_model.dart';

class RoommateProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<RoommateModel> _roommates = [];
  bool _isLoading = false;

  List<RoommateModel> get roommates => _roommates;
  bool get isLoading => _isLoading;

  Future<void> fetchRoommates() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/roommates');
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        _roommates = data.map((item) => RoommateModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Fetch roommates error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }
}
