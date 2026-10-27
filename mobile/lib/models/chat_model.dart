import 'user_model.dart';

class ChatRoomModel {
  final int id;
  final UserModel user1;
  final UserModel user2;
  final String? createdAt;
  final int unreadCount;
  final String? lastMessage;

  ChatRoomModel({
    required this.id,
    required this.user1,
    required this.user2,
    this.createdAt,
    this.unreadCount = 0,
    this.lastMessage,
  });

  factory ChatRoomModel.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic> roomJson = json['chatRoom'] ?? json;
    return ChatRoomModel(
      id: roomJson['id'] ?? 0,
      user1: UserModel.fromJson(roomJson['user1'] ?? {}),
      user2: UserModel.fromJson(roomJson['user2'] ?? {}),
      createdAt: roomJson['createdAt'],
      unreadCount: json['unreadCount'] ?? 0,
    );
  }

  UserModel getOtherUser(int currentUserId) {
    return user1.id == currentUserId ? user2 : user1;
  }
}

class ChatMessageModel {
  final int? id;
  final int roomId;
  final int senderId;
  final String content;
  final String? timestamp;
  final bool isRead;

  ChatMessageModel({
    this.id,
    required this.roomId,
    required this.senderId,
    required this.content,
    this.timestamp,
    this.isRead = false,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'],
      roomId: json['chatRoom'] != null ? json['chatRoom']['id'] : (json['roomId'] ?? 0),
      senderId: json['sender'] != null ? json['sender']['id'] : (json['senderId'] ?? 0),
      content: json['content'] ?? '',
      timestamp: json['timestamp'],
      isRead: json['isRead'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'roomId': roomId,
      'senderId': senderId,
      'content': content,
    };
  }
}
