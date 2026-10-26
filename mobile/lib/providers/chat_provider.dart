import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/chat_model.dart';

class ChatProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<ChatRoomModel> _rooms = [];
  List<ChatMessageModel> _activeMessages = [];
  dynamic _unreadCount = 0;
  bool _isLoading = false;

  List<ChatRoomModel> get rooms => _rooms;
  List<ChatMessageModel> get activeMessages => _activeMessages;
  int get unreadCount => _unreadCount is int ? _unreadCount as int : (_unreadCount as num).toInt();
  bool get isLoading => _isLoading;

  Future<void> fetchRooms(int userId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/chat/rooms/$userId');
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        _rooms = data.map((item) => ChatRoomModel.fromJson(item)).toList();
      }
      await fetchUnreadCount(userId);
    } catch (e) {
      debugPrint('Fetch chat rooms error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<ChatRoomModel?> getOrCreateRoom(int currentUserId, int targetUserId) async {
    try {
      final response = await _apiService.get('/chat/rooms/$currentUserId/$targetUserId');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final room = ChatRoomModel.fromJson(data);
        return room;
      }
    } catch (e) {
      debugPrint('Get or create room error: $e');
    }
    return null;
  }

  Future<void> fetchMessages(int roomId, int currentUserId) async {
    try {
      final response = await _apiService.get('/chat/messages/$roomId');
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        _activeMessages = data.map((item) => ChatMessageModel.fromJson(item)).toList();
        notifyListeners();
      }
      await markAsRead(roomId, currentUserId);
    } catch (e) {
      debugPrint('Fetch messages error: $e');
    }
  }

  Future<bool> sendMessage(int roomId, int senderId, String content) async {
    if (content.trim().isEmpty) return false;
    try {
      final response = await _apiService.post('/chat/messages', {
        'roomId': roomId,
        'senderId': senderId,
        'content': content.trim(),
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final newMsg = ChatMessageModel.fromJson(jsonDecode(response.body));
        _activeMessages.add(newMsg);
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Send message error: $e');
    }
    return false;
  }

  Future<void> markAsRead(int roomId, int userId) async {
    try {
      await _apiService.post('/chat/mark-read/$roomId/$userId', {});
      await fetchUnreadCount(userId);
    } catch (e) {
      debugPrint('Mark as read error: $e');
    }
  }

  Future<void> fetchUnreadCount(int userId) async {
    try {
      final response = await _apiService.get('/chat/unread-count/$userId');
      if (response.statusCode == 200) {
        _unreadCount = jsonDecode(response.body);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Fetch unread count error: $e');
    }
  }
}
