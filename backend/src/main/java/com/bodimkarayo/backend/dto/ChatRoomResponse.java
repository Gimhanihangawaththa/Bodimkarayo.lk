package com.bodimkarayo.backend.dto;

import com.bodimkarayo.backend.model.ChatRoom;
import lombok.Data;

@Data
public class ChatRoomResponse {
    private ChatRoom chatRoom;
    private long unreadCount;
}
