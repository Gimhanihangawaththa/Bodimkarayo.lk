package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.ChatMessage;
import com.bodimkarayo.backend.model.ChatRoom;
import com.bodimkarayo.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Map<String, Object> payload) {
        Long roomId = Long.valueOf(payload.get("roomId").toString());
        Long senderId = Long.valueOf(payload.get("senderId").toString());
        String content = payload.get("content").toString();

        ChatMessage savedMessage = chatService.saveMessage(roomId, senderId, content);
        
        // Notify both users in the room
        messagingTemplate.convertAndSend("/topic/room." + roomId, savedMessage);
        
        // Also notify the recipient specifically if they are on a general notification listener
        messagingTemplate.convertAndSendToUser(
                savedMessage.getRecipient().getId().toString(),
                "/queue/messages",
                savedMessage
        );
    }

    @GetMapping("/rooms/{userId}")
    public List<ChatRoom> getRooms(@PathVariable Long userId) {
        return chatService.getUserRooms(userId);
    }

    @GetMapping("/rooms/{u1}/{u2}")
    public ChatRoom getOrCreateRoom(@PathVariable Long u1, @PathVariable Long u2) {
        return chatService.getOrCreateRoom(u1, u2);
    }

    @GetMapping("/messages/{roomId}")
    public List<ChatMessage> getMessages(@PathVariable Long roomId) {
        return chatService.getRoomMessages(roomId);
    }
}
