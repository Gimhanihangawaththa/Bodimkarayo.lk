import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../models/user_model.dart';
import 'package:image_picker/image_picker.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  UserModel? _user;
  bool _isLoading = false;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.post('/auth/login', {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['token'];
        final userData = data['user'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);

        _user = UserModel.fromJson(userData);
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register(String fullName, String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.post('/auth/register', {
        'fullName': fullName,
        'email': email,
        'password': password,
        'role': 'USER', // Default role
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Register error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    _user = null;
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final token = await _apiService.getToken();
    if (token == null) return;

    try {
      // In a real app, you'd get the ID from the token or use a /me endpoint
      // For now, let's assume we can fetch it if we had stored the ID or just logout if fail
      if (_user != null) {
        final response = await _apiService.get('/users/${_user!.id}/profile');
        if (response.statusCode == 200) {
          _user = UserModel.fromJson(jsonDecode(response.body));
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Auto login error: $e');
    }
  }

  Future<bool> updateProfile(UserModel updatedUser) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.put('/users/${updatedUser.id}/profile', updatedUser.toJson());
      if (response.statusCode == 200) {
        _user = UserModel.fromJson(jsonDecode(response.body));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Update profile error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> uploadProfileImage(XFile file) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.uploadFile('/users/${_user!.id}/profile-image', 'image', file);
      if (response.statusCode == 200) {
        _user = UserModel.fromJson(jsonDecode(response.body));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Upload profile image error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
