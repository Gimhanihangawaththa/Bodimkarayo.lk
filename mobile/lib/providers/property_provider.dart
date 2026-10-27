import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../models/property_model.dart';

import '../data/showcase_data.dart';

class PropertyProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<PropertyModel> _properties = List.from(showcaseProperties);
  List<PropertyModel> _favoriteProperties = [];
  final Set<int> _favoriteIds = {};
  bool _isLoading = false;
  String? _errorMessage;

  List<PropertyModel> get properties => _properties;
  List<PropertyModel> get favoriteProperties => _favoriteProperties;
  Set<int> get favoriteIds => _favoriteIds;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  bool isFavorite(int propertyId) => _favoriteIds.contains(propertyId);

  Future<void> fetchProperties() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/properties');
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        final liveProps = data.map((item) => PropertyModel.fromJson(item)).toList();
        if (liveProps.isNotEmpty) {
          _properties = liveProps;
        } else {
          _properties = List.from(showcaseProperties);
        }
      } else {
        if (_properties.isEmpty) _properties = List.from(showcaseProperties);
      }
    } catch (e) {
      debugPrint('Fetch properties error: $e');
      if (_properties.isEmpty) _properties = List.from(showcaseProperties);
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> searchProperties({
    String? keyword,
    String? location,
    String? propertyType,
    double? minPrice,
    double? maxPrice,
    String? genderPreference,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final queryParams = <String, String>{};
      if (keyword != null && keyword.isNotEmpty) queryParams['keyword'] = keyword;
      if (location != null && location.isNotEmpty) queryParams['location'] = location;
      if (propertyType != null && propertyType.isNotEmpty) queryParams['propertyType'] = propertyType;
      if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
      if (genderPreference != null && genderPreference.isNotEmpty) queryParams['genderPreference'] = genderPreference;

      final queryString = Uri(queryParameters: queryParams).query;
      final endpoint = queryString.isNotEmpty ? '/properties/search?$queryString' : '/properties';

      final response = await _apiService.get(endpoint);
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        _properties = data.map((item) => PropertyModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Search properties error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchFavorites(int userId) async {
    try {
      final response = await _apiService.get('/users/$userId/favorites/properties');
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        _favoriteProperties = data.map((item) => PropertyModel.fromJson(item)).toList();
        _favoriteIds.clear();
        for (var p in _favoriteProperties) {
          if (p.id != null) _favoriteIds.add(p.id!);
        }
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Fetch favorites error: $e');
    }
  }

  Future<bool> toggleFavorite(int userId, int propertyId) async {
    final currentlyFavorite = _favoriteIds.contains(propertyId);
    try {
      if (currentlyFavorite) {
        final response = await _apiService.delete('/users/$userId/favorites/properties/$propertyId');
        if (response.statusCode == 200 || response.statusCode == 204) {
          _favoriteIds.remove(propertyId);
          _favoriteProperties.removeWhere((p) => p.id == propertyId);
          notifyListeners();
          return true;
        }
      } else {
        final response = await _apiService.post('/users/$userId/favorites/properties/$propertyId', {});
        if (response.statusCode == 200 || response.statusCode == 201) {
          _favoriteIds.add(propertyId);
          // Refresh list
          await fetchFavorites(userId);
          notifyListeners();
          return true;
        }
      }
    } catch (e) {
      debugPrint('Toggle favorite error: $e');
    }
    return false;
  }

  Future<bool> addProperty(PropertyModel property) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/properties', property.toJson());
      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchProperties();
        _isLoading = false;
        notifyListeners();
        return true;
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        _errorMessage = 'Session expired or unauthenticated. Please sign in.';
      } else {
        _errorMessage = 'Failed to create property (Error ${response.statusCode})';
      }
    } catch (e) {
      debugPrint('Add property error: $e');
      _errorMessage = 'Network connection error. Please try again.';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> addPropertyMultipart(PropertyModel property, List<XFile> imageFiles) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Step 1: Create property via JSON endpoint first
      final response = await _apiService.post('/properties', property.toJson());
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final newId = data['id'];

        // Step 2: Upload images if any
        if (newId != null && imageFiles.isNotEmpty) {
          try {
            await _apiService.uploadMultipleFiles('/properties/$newId/images', {}, imageFiles);
          } catch (imgErr) {
            debugPrint('Image upload warning: $imgErr');
          }
        }

        await fetchProperties();
        _isLoading = false;
        notifyListeners();
        return true;
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        _errorMessage = 'Session expired or unauthenticated. Please sign in.';
      } else {
        // Fallback: try multipart /properties endpoint directly
        final fields = <String, String>{
          'title': property.title,
          'description': property.description,
          'location': property.location,
          'price': property.rent.toString(),
          if (property.propertyType != null) 'propertyType': property.propertyType!,
          if (property.availableFrom != null) 'availableFrom': property.availableFrom!,
          if (property.address != null) 'address': property.address!,
          if (property.numberOfPeople != null) 'numberOfPeople': property.numberOfPeople!,
          if (property.bedrooms != null) 'bedrooms': property.bedrooms.toString(),
          if (property.kitchens != null) 'kitchens': property.kitchens.toString(),
          if (property.bathrooms != null) 'bathrooms': property.bathrooms.toString(),
          if (property.floor != null) 'floor': property.floor!,
          if (property.furnished != null) 'furnished': property.furnished!,
          if (property.parking != null) 'parking': property.parking!,
          if (property.petsAllowed != null) 'petsAllowed': property.petsAllowed!,
          if (property.offers != null && property.offers!.isNotEmpty)
            'offers': property.offers!.join(','),
          if (property.highlights != null && property.highlights!.isNotEmpty)
            'highlights': property.highlights!.join(','),
          if (property.rules != null && property.rules!.isNotEmpty)
            'rules': property.rules!.join(','),
          if (property.nearby != null && property.nearby!.isNotEmpty)
            'nearby': property.nearby!.join(','),
        };

        final mpResponse = await _apiService.uploadMultipleFiles('/properties', fields, imageFiles);
        if (mpResponse.statusCode == 200 || mpResponse.statusCode == 201) {
          await fetchProperties();
          _isLoading = false;
          notifyListeners();
          return true;
        } else if (mpResponse.statusCode == 401 || mpResponse.statusCode == 403) {
          _errorMessage = 'Session expired or unauthenticated. Please sign in.';
        } else {
          _errorMessage = 'Server error (${mpResponse.statusCode}). Please try again.';
        }
      }
    } catch (e) {
      debugPrint('Add property multipart error: $e');
      _errorMessage = 'Failed to submit property. Check your connection.';
    }

    _isLoading = false;
    notifyListeners();
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
        _favoriteIds.remove(id);
        _favoriteProperties.removeWhere((p) => p.id == id);
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Delete property error: $e');
    }
    return false;
  }
}
