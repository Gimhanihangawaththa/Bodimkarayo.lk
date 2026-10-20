package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomIdOrderByTimestampAsc(Long roomId);
    
    long countByChatRoomIdAndSenderIdNotAndIsReadFalse(Long roomId, Long userId);
    
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.chatRoom.id = :roomId AND m.sender.id != :userId")
    void markAsRead(@Param("roomId") Long roomId, @Param("userId") Long userId);
}
