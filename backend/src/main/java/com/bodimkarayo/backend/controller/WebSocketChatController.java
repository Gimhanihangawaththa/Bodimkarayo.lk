package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.dto.ChatMessageRequest;
import com.bodimkarayo.backend.model.ChatMessage;
import com.bodimkarayo.backend.model.ChatRoom;
import com.bodimkarayo.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageRequest request) {
        ChatMessage savedMessage = chatService.saveMessage(request);
        ChatRoom room = savedMessage.getChatRoom();
        
        // Send to both users in the room
        messagingTemplate.convertAndSendToUser(
                room.getUser1().getId().toString(), "/queue/messages", savedMessage);
        
        messagingTemplate.convertAndSendToUser(
                room.getUser2().getId().toString(), "/queue/messages", savedMessage);
    }
}
