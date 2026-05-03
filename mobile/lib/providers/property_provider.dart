import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/property_model.dart';

class PropertyProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<PropertyModel> _properties = [];
  bool _isLoading = false;

  List<PropertyModel> get properties => _properties;
  bool get isLoading => _isLoading;

  Future<void> fetchProperties() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/properties');
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        _properties = data.map((item) => PropertyModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Fetch properties error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchMyProperties() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/properties/my');
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        // This would filter or fetch specific properties if the endpoint exists
        // For now, we'll fetch all and the UI can filter or we assume the endpoint works
        _properties = data.map((item) => PropertyModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Fetch my properties error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> addProperty(PropertyModel property) async {
    try {
      final response = await _apiService.post('/properties', property.toJson());
      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchProperties();
        return true;
      }
    } catch (e) {
      debugPrint('Add property error: $e');
    }
    return false;
  }

  Future<bool> updateProperty(PropertyModel property) async {
    try {
      final response = await _apiService.put('/properties/${property.id}', property.toJson());
      if (response.statusCode == 200) {
        await fetchProperties();
        return true;
      }
    } catch (e) {
      debugPrint('Update property error: $e');
    }
    return false;
  }

  Future<bool> deleteProperty(int id) async {
    try {
      final response = await _apiService.delete('/properties/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        _properties.removeWhere((p) => p.id == id);
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Delete property error: $e');
    }
    return false;
  }
}
