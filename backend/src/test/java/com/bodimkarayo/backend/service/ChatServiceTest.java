package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.dto.ChatMessageRequest;
import com.bodimkarayo.backend.dto.ChatRoomResponse;
import com.bodimkarayo.backend.model.ChatMessage;
import com.bodimkarayo.backend.model.ChatRoom;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.ChatMessageRepository;
import com.bodimkarayo.backend.repository.ChatRoomRepository;
import com.bodimkarayo.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatService chatService;

    private User user1;
    private User user2;
    private ChatRoom chatRoom;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
                .id(1L)
                .fullName("Thamindu Bandara")
                .email("thamindu@gmail.com")
                .build();

        user2 = User.builder()
                .id(2L)
                .fullName("Senuja Bodhinayake")
                .email("senuja@gmail.com")
                .build();

        chatRoom = ChatRoom.builder()
                .id(100L)
                .user1(user1)
                .user2(user2)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return existing chat room between two users")
    void getOrCreateRoom_ExistingRoom() {
        when(chatRoomRepository.findByUsers(1L, 2L)).thenReturn(Optional.of(chatRoom));

        ChatRoom result = chatService.getOrCreateRoom(1L, 2L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(chatRoomRepository, never()).save(any(ChatRoom.class));
    }

    @Test
    @DisplayName("Should create new chat room when none exists")
    void getOrCreateRoom_NewRoom() {
        when(chatRoomRepository.findByUsers(1L, 2L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(chatRoom);

        ChatRoom result = chatService.getOrCreateRoom(1L, 2L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(chatRoomRepository, times(1)).save(any(ChatRoom.class));
    }

    @Test
    @DisplayName("Should return chat rooms for user with unread counts")
    void getRoomsForUser_WithUnreadCount() {
        when(chatRoomRepository.findAllByUser(1L)).thenReturn(List.of(chatRoom));
        when(chatMessageRepository.countByChatRoomIdAndSenderIdNotAndIsReadFalse(100L, 1L)).thenReturn(3L);

        List<ChatRoomResponse> responses = chatService.getRoomsForUser(1L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(100L, responses.get(0).getChatRoom().getId());
        assertEquals(3L, responses.get(0).getUnreadCount());
    }

    @Test
    @DisplayName("Should return ordered messages for a room")
    void getMessages_ReturnsOrderedList() {
        ChatMessage message1 = ChatMessage.builder()
                .id(1L)
                .chatRoom(chatRoom)
                .sender(user1)
                .content("Hello Senuja")
                .timestamp(LocalDateTime.now().minusMinutes(5))
                .isRead(true)
                .build();

        ChatMessage message2 = ChatMessage.builder()
                .id(2L)
                .chatRoom(chatRoom)
                .sender(user2)
                .content("Hey Thamindu!")
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();

        when(chatMessageRepository.findByChatRoomIdOrderByTimestampAsc(100L)).thenReturn(List.of(message1, message2));

        List<ChatMessage> messages = chatService.getMessages(100L);

        assertNotNull(messages);
        assertEquals(2, messages.size());
        assertEquals("Hello Senuja", messages.get(0).getContent());
        assertEquals("Hey Thamindu!", messages.get(1).getContent());
    }

    @Test
    @DisplayName("Should save message linked to sender and room with isRead false")
    void saveMessage_Success() {
        ChatMessageRequest request = new ChatMessageRequest();
        request.setRoomId(100L);
        request.setSenderId(1L);
        request.setContent("Is this boarding available?");

        ChatMessage savedMessage = ChatMessage.builder()
                .id(50L)
                .chatRoom(chatRoom)
                .sender(user1)
                .content("Is this boarding available?")
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();

        when(chatRoomRepository.findById(100L)).thenReturn(Optional.of(chatRoom));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(savedMessage);

        ChatMessage result = chatService.saveMessage(request);

        assertNotNull(result);
        assertEquals(50L, result.getId());
        assertEquals("Is this boarding available?", result.getContent());
        assertFalse(result.isRead());
        verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));
    }

    @Test
    @DisplayName("Should call repository to mark messages as read")
    void markAsRead_Success() {
        doNothing().when(chatMessageRepository).markAsRead(100L, 1L);

        chatService.markAsRead(100L, 1L);

        verify(chatMessageRepository, times(1)).markAsRead(100L, 1L);
    }

    @Test
    @DisplayName("Should calculate total unread message count across all user rooms")
    void getUnreadCountForUser_CalculatesTotal() {
        ChatRoom chatRoom2 = ChatRoom.builder().id(101L).user1(user1).user2(user2).build();

        when(chatRoomRepository.findAllByUser(1L)).thenReturn(List.of(chatRoom, chatRoom2));
        when(chatMessageRepository.countByChatRoomIdAndSenderIdNotAndIsReadFalse(100L, 1L)).thenReturn(2L);
        when(chatMessageRepository.countByChatRoomIdAndSenderIdNotAndIsReadFalse(101L, 1L)).thenReturn(3L);

        long totalUnread = chatService.getUnreadCountForUser(1L);

        assertEquals(5L, totalUnread);
    }
}
