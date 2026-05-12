package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.ChatMessage;
import com.bodimkarayo.backend.model.ChatRoom;
import com.bodimkarayo.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/rooms/{userId}")
    public List<com.bodimkarayo.backend.dto.ChatRoomResponse> getRooms(@PathVariable Long userId) {
        return chatService.getRoomsForUser(userId);
    }

    @GetMapping("/rooms/{userId1}/{userId2}")
    public ChatRoom getOrCreateRoom(@PathVariable Long userId1, @PathVariable Long userId2) {
        return chatService.getOrCreateRoom(userId1, userId2);
    }

    @GetMapping("/messages/{roomId}")
    public List<ChatMessage> getMessages(@PathVariable Long roomId) {
        return chatService.getMessages(roomId);
    }

    @GetMapping("/unread-count/{userId}")
    public long getUnreadCount(@PathVariable Long userId) {
        return chatService.getUnreadCountForUser(userId);
    }

    @PostMapping("/mark-read/{roomId}/{userId}")
    public void markAsRead(@PathVariable Long roomId, @PathVariable Long userId) {
        chatService.markAsRead(roomId, userId);
    }
}
