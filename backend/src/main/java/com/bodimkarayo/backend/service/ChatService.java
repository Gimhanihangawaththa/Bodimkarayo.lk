package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.ChatMessage;
import com.bodimkarayo.backend.model.ChatRoom;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.ChatMessageRepository;
import com.bodimkarayo.backend.repository.ChatRoomRepository;
import com.bodimkarayo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private ChatRoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatRoom getOrCreateRoom(Long user1Id, Long user2Id) {
        User u1 = userRepository.findById(user1Id).orElseThrow();
        User u2 = userRepository.findById(user2Id).orElseThrow();

        Optional<ChatRoom> room = roomRepository.findByUsers(u1, u2);
        if (room.isPresent()) {
            return room.get();
        }

        ChatRoom newRoom = ChatRoom.builder()
                .user1(u1)
                .user2(u2)
                .build();
        return roomRepository.save(newRoom);
    }

    public ChatMessage saveMessage(Long roomId, Long senderId, String content) {
        ChatRoom room = roomRepository.findById(roomId).orElseThrow();
        User sender = userRepository.findById(senderId).orElseThrow();
        User recipient = room.getUser1().getId().equals(senderId) ? room.getUser2() : room.getUser1();

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .recipient(recipient)
                .content(content)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();
        return messageRepository.save(message);
    }

    public List<ChatRoom> getUserRooms(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return roomRepository.findByUser1OrUser2(user, user);
    }

    public List<ChatMessage> getRoomMessages(Long roomId) {
        return messageRepository.findByChatRoomIdOrderByTimestampAsc(roomId);
    }
}
