package com.bodimkarayo.backend.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private Long roomId;
    private Long senderId;
    private String content;
}
