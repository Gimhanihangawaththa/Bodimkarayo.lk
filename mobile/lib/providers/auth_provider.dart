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
        final refreshToken = data['refreshToken'];
        final userData = data['user'];

        await _apiService.saveTokens(token: token, refreshToken: refreshToken);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(userData));

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
        'role': 'USER',
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
    await _apiService.clearTokens();
    _user = null;
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final token = await _apiService.getToken();
    if (token == null) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final userDataStr = prefs.getString('user_data');
      if (userDataStr != null) {
        _user = UserModel.fromJson(jsonDecode(userDataStr));
        notifyListeners();
      }

      if (_user != null && _user!.id != null) {
        final response = await _apiService.get('/users/${_user!.id}/profile');
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          _user = UserModel.fromJson(data);
          await prefs.setString('user_data', jsonEncode(data));
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
      final response = await _apiService.put(
        '/users/${updatedUser.id}/profile',
        updatedUser.toJson(),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _user = UserModel.fromJson(data);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(data));
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
    if (_user == null || _user!.id == null) return false;
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.uploadFile('/users/${_user!.id}/profile-image', 'image', file);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _user = UserModel.fromJson(data);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(data));
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

  Future<bool> changePassword(String currentPassword, String newPassword) async {
    if (_user == null || _user!.id == null) return false;
    try {
      final response = await _apiService.put('/users/${_user!.id}/change-password', {
        'oldPassword': currentPassword,
        'newPassword': newPassword,
      });
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Change password error: $e');
      return false;
    }
  }

  Future<bool> deleteAccount() async {
    if (_user == null || _user!.id == null) return false;
    try {
      final response = await _apiService.delete('/users/${_user!.id}');
      if (response.statusCode == 200 || response.statusCode == 204) {
        await logout();
        return true;
      }
    } catch (e) {
      debugPrint('Delete account error: $e');
    }
    return false;
  }
}
