package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.ChatRoom;
import com.bodimkarayo.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @Query("SELECT cr FROM ChatRoom cr WHERE (cr.user1 = :u1 AND cr.user2 = :u2) OR (cr.user1 = :u2 AND cr.user2 = :u1)")
    Optional<ChatRoom> findByUsers(@Param("u1") User u1, @Param("u2") User u2);

    List<ChatRoom> findByUser1OrUser2(User user1, User user2);
}
