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
  String? _errorMessage;

  List<ChatRoomModel> get rooms => _rooms;
  List<ChatMessageModel> get activeMessages => _activeMessages;
  int get unreadCount => _unreadCount is int
      ? _unreadCount as int
      : (_unreadCount is num ? (_unreadCount as num).toInt() : 0);
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  void clearActiveMessages() {
    _activeMessages = [];
    notifyListeners();
  }

  Future<void> fetchRooms(int userId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/chat/rooms/$userId');
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded is List) {
          _rooms = decoded.map((item) => ChatRoomModel.fromJson(item)).toList();
        } else if (decoded is Map<String, dynamic>) {
          _rooms = [ChatRoomModel.fromJson(decoded)];
        }
      } else {
        _errorMessage = 'Could not load conversations (${response.statusCode})';
      }
      await fetchUnreadCount(userId);
    } catch (e) {
      debugPrint('Fetch chat rooms error: $e');
      _errorMessage = 'Network error loading conversations';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<ChatRoomModel?> getOrCreateRoom(int currentUserId, int targetUserId) async {
    _errorMessage = null;
    try {
      final response = await _apiService.get('/chat/rooms/$currentUserId/$targetUserId');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final room = ChatRoomModel.fromJson(data);
        final exists = _rooms.any((r) => r.id == room.id);
        if (!exists) {
          _rooms.insert(0, room);
          notifyListeners();
        }
        return room;
      } else {
        _errorMessage = 'Failed to start conversation (Status ${response.statusCode})';
        debugPrint('Get or create room failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      _errorMessage = 'Connection error starting chat';
      debugPrint('Get or create room error: $e');
    }
    return null;
  }

  Future<void> fetchMessages(int roomId, int currentUserId) async {
    try {
      final response = await _apiService.get('/chat/messages/$roomId');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        _activeMessages = data.map((item) => ChatMessageModel.fromJson(item)).toList();
        notifyListeners();
      }
      await markAsRead(roomId, currentUserId);
    } catch (e) {
      debugPrint('Fetch messages error: $e');
    }
  }

  Future<bool> sendMessage(int roomId, int senderId, String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty) return false;

    // Optimistic UI update (matching Web Chat.jsx)
    final tempMsg = ChatMessageModel(
      id: DateTime.now().millisecondsSinceEpoch,
      roomId: roomId,
      senderId: senderId,
      content: trimmed,
      timestamp: DateTime.now().toIso8601String(),
      isRead: false,
    );
    _activeMessages.add(tempMsg);
    notifyListeners();

    try {
      final response = await _apiService.post('/chat/messages', {
        'roomId': roomId,
        'senderId': senderId,
        'content': trimmed,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final savedMsg = ChatMessageModel.fromJson(jsonDecode(response.body));
        final idx = _activeMessages.indexWhere((m) => m.id == tempMsg.id);
        if (idx != -1) {
          _activeMessages[idx] = savedMsg;
        } else {
          _activeMessages.add(savedMsg);
        }
        notifyListeners();
        return true;
      } else {
        debugPrint('Send message error status: ${response.statusCode} ${response.body}');
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
