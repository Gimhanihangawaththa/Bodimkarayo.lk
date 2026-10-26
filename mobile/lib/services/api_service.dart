import 'package:flutter/foundation.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http_parser/http_parser.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Configurable base URL
  // Android Emulator uses 10.0.2.2
  // Web / Desktop / ADB Reverse uses localhost
  static String? _customBaseUrl;

  static String get baseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }
    if (kIsWeb) {
      return 'http://localhost:4000/api';
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:4000/api';
    }
    return 'http://localhost:4000/api';
  }

  static void setCustomBaseUrl(String url) {
    _customBaseUrl = url;
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('refresh_token');
  }

  Future<void> saveTokens({required String token, String? refreshToken}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    if (refreshToken != null) {
      await prefs.setString('refresh_token', refreshToken);
    }
  }

  Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('refresh_token');
    await prefs.remove('user_data');
  }

  Future<Map<String, String>> _getHeaders({bool isJson = true}) async {
    final token = await getToken();
    final headers = <String, String>{};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  /// Attempts to refresh the access token using the stored refresh token
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await getRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) return false;

      final response = await http.post(
        Uri.parse('$baseUrl/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final newToken = data['token'];
        final newRefreshToken = data['refreshToken'];
        if (newToken != null) {
          await saveTokens(token: newToken, refreshToken: newRefreshToken);
          return true;
        }
      }
    } catch (e) {
      debugPrint('Token refresh failed: $e');
    }
    return false;
  }

  Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    var response = await http.get(Uri.parse('$baseUrl$endpoint'), headers: headers);

    if (response.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders();
        response = await http.get(Uri.parse('$baseUrl$endpoint'), headers: newHeaders);
      }
    }

    return response;
  }

  Future<http.Response> post(String endpoint, dynamic data) async {
    final headers = await _getHeaders();
    var response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: data is String ? data : jsonEncode(data),
    );

    if (response.statusCode == 401 && !endpoint.contains('/auth/')) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders();
        response = await http.post(
          Uri.parse('$baseUrl$endpoint'),
          headers: newHeaders,
          body: data is String ? data : jsonEncode(data),
        );
      }
    }

    return response;
  }

  Future<http.Response> put(String endpoint, dynamic data) async {
    final headers = await _getHeaders();
    var response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: data is String ? data : jsonEncode(data),
    );

    if (response.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders();
        response = await http.put(
          Uri.parse('$baseUrl$endpoint'),
          headers: newHeaders,
          body: data is String ? data : jsonEncode(data),
        );
      }
    }

    return response;
  }

  Future<http.Response> delete(String endpoint) async {
    final headers = await _getHeaders();
    var response = await http.delete(Uri.parse('$baseUrl$endpoint'), headers: headers);

    if (response.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders();
        response = await http.delete(Uri.parse('$baseUrl$endpoint'), headers: newHeaders);
      }
    }

    return response;
  }

  Future<http.Response> uploadFile(String endpoint, String fieldName, XFile file) async {
    final token = await getToken();
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl$endpoint'));
    
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    if (kIsWeb) {
      final bytes = await file.readAsBytes();
      request.files.add(http.MultipartFile.fromBytes(
        fieldName,
        bytes,
        filename: file.name,
        contentType: MediaType('image', 'jpeg'),
      ));
    } else {
      request.files.add(await http.MultipartFile.fromPath(
        fieldName, 
        file.path,
        contentType: MediaType('image', 'jpeg'),
      ));
    }

    final streamedResponse = await request.send();
    return await http.Response.fromStream(streamedResponse);
  }

  Future<http.Response> uploadMultipleFiles(
    String endpoint,
    Map<String, String> fields,
    List<XFile> files,
  ) async {
    final token = await getToken();
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl$endpoint'));

    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    request.fields.addAll(fields);

    for (var file in files) {
      if (kIsWeb) {
        final bytes = await file.readAsBytes();
        request.files.add(http.MultipartFile.fromBytes(
          'images',
          bytes,
          filename: file.name,
          contentType: MediaType('image', 'jpeg'),
        ));
      } else {
        request.files.add(await http.MultipartFile.fromPath(
          'images',
          file.path,
          contentType: MediaType('image', 'jpeg'),
        ));
      }
    }

    final streamedResponse = await request.send();
    return await http.Response.fromStream(streamedResponse);
  }
}
