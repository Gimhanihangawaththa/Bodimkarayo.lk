package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomIdOrderByTimestampAsc(Long roomId);
    
    long countByChatRoomIdAndSenderIdNotAndIsReadFalse(Long roomId, Long userId);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.chatRoom.id = :roomId AND m.sender.id != :userId")
    void markAsRead(@org.springframework.data.repository.query.Param("roomId") Long roomId, @org.springframework.data.repository.query.Param("userId") Long userId);
}
