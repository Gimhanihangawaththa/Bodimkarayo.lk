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
        System.out.println("Received message request: " + request);
        ChatMessage savedMessage = chatService.saveMessage(request);
        ChatRoom room = savedMessage.getChatRoom();
        
        System.out.println("Sending message to users: " + room.getUser1().getId() + " and " + room.getUser2().getId());
        
        // Send to both users in the room using explicit topics
        messagingTemplate.convertAndSend("/topic/messages." + room.getUser1().getId(), savedMessage);
        messagingTemplate.convertAndSend("/topic/messages." + room.getUser2().getId(), savedMessage);
        System.out.println("Message sent successfully to topics /topic/messages." + room.getUser1().getId() + " and /topic/messages." + room.getUser2().getId());
    }
}
