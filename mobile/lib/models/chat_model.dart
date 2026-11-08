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
      id: roomJson['id'] is int ? roomJson['id'] : (int.tryParse(roomJson['id']?.toString() ?? '') ?? 0),
      user1: UserModel.fromJson(roomJson['user1'] ?? {}),
      user2: UserModel.fromJson(roomJson['user2'] ?? {}),
      createdAt: roomJson['createdAt']?.toString(),
      unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
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
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? ''),
      roomId: json['chatRoom'] != null
          ? (json['chatRoom']['id'] ?? 0)
          : (json['roomId'] ?? 0),
      senderId: json['sender'] != null
          ? (json['sender']['id'] ?? 0)
          : (json['senderId'] ?? 0),
      content: json['content'] ?? '',
      timestamp: json['timestamp']?.toString(),
      isRead: json['isRead'] ?? json['read'] ?? false,
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
