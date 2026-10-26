import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/roommate_model.dart';

import '../data/showcase_data.dart';

class RoommateProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<RoommateModel> _roommates = List.from(showcaseRoommates);
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
        final liveRoommates = data.map((item) => RoommateModel.fromJson(item)).toList();
        if (liveRoommates.isNotEmpty) {
          _roommates = liveRoommates;
        } else {
          _roommates = List.from(showcaseRoommates);
        }
      } else {
        if (_roommates.isEmpty) _roommates = List.from(showcaseRoommates);
      }
    } catch (e) {
      debugPrint('Fetch roommates error: $e');
      if (_roommates.isEmpty) _roommates = List.from(showcaseRoommates);
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createRoommate(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.post('/roommates', data);
      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchRoommates(); // Refresh the list
        return true;
      }
    } catch (e) {
      debugPrint('Create roommate error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> updateRoommate(int id, Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.put('/roommates/$id', data);
      if (response.statusCode == 200) {
        await fetchRoommates(); // Refresh the list
        return true;
      }
    } catch (e) {
      debugPrint('Update roommate error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> deleteRoommate(int id) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.delete('/roommates/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        await fetchRoommates(); // Refresh the list
        return true;
      }
    } catch (e) {
      debugPrint('Delete roommate error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
