package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.dto.ChatMessageRequest;
import com.bodimkarayo.backend.dto.ChatRoomResponse;
import com.bodimkarayo.backend.model.ChatMessage;
import com.bodimkarayo.backend.model.ChatRoom;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.ChatMessageRepository;
import com.bodimkarayo.backend.repository.ChatRoomRepository;
import com.bodimkarayo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ChatRoomResponse> getRoomsForUser(Long userId) {
        List<ChatRoom> rooms = chatRoomRepository.findAllByUser(userId);
        return rooms.stream().map(room -> {
            ChatRoomResponse response = new ChatRoomResponse();
            response.setChatRoom(room);
            response.setUnreadCount(chatMessageRepository.countByChatRoomIdAndSenderIdNotAndIsReadFalse(room.getId(), userId));
            return response;
        }).collect(Collectors.toList());
    }

    public ChatRoom getOrCreateRoom(Long userId1, Long userId2) {
        return chatRoomRepository.findByUsers(userId1, userId2)
                .orElseGet(() -> {
                    User u1 = userRepository.findById(userId1).orElseThrow();
                    User u2 = userRepository.findById(userId2).orElseThrow();
                    ChatRoom room = ChatRoom.builder()
                            .user1(u1)
                            .user2(u2)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return chatRoomRepository.save(room);
                });
    }

    public List<ChatMessage> getMessages(Long roomId) {
        return chatMessageRepository.findByChatRoomIdOrderByTimestampAsc(roomId);
    }

    @Transactional
    public void markAsRead(Long roomId, Long userId) {
        chatMessageRepository.markAsRead(roomId, userId);
    }

    public long getUnreadCountForUser(Long userId) {
        List<ChatRoom> rooms = chatRoomRepository.findAllByUser(userId);
        return rooms.stream()
                .mapToLong(room -> chatMessageRepository.countByChatRoomIdAndSenderIdNotAndIsReadFalse(room.getId(), userId))
                .sum();
    }

    @Transactional
    public ChatMessage saveMessage(ChatMessageRequest request) {
        ChatRoom room = chatRoomRepository.findById(request.getRoomId()).orElseThrow();
        User sender = userRepository.findById(request.getSenderId()).orElseThrow();

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .content(request.getContent())
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();

        return chatMessageRepository.save(message);
    }
}
