package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.dto.UserProfileResponse;
import com.bodimkarayo.backend.dto.UserProfileUpdateRequest;
import com.bodimkarayo.backend.exception.BadRequestException;
import com.bodimkarayo.backend.model.Role;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private RoommateRepository roommateRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserFavoritePropertyRepository userFavoritePropertyRepository;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private AdminLogRepository adminLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .password("encoded_secret_password")
                .role(Role.USER.name())
                .profilePictureUrl("https://cloudinary.com/avatar.jpg")
                .verified(true)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getUserProfile should return mapped UserProfileResponse when user exists")
    void getUserProfile_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.getUserProfile(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John Doe", response.getFullName());
        assertEquals("john@example.com", response.getEmail());
        assertEquals(Role.USER.name(), response.getRole());
        assertTrue(response.getVerified());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("getUserProfile should throw RuntimeException when user not found")
    void getUserProfile_NotFound_ThrowsException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.getUserProfile(999L));
        assertEquals("User not found", exception.getMessage());
        verify(userRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("getAllUsers should return list of mapped profiles")
    void getAllUsers_ReturnsList() {
        User secondUser = User.builder()
                .id(2L)
                .fullName("Jane Doe")
                .email("jane@example.com")
                .role(Role.OWNER.name())
                .build();

        when(userRepository.findAll()).thenReturn(List.of(testUser, secondUser));

        List<UserProfileResponse> profiles = userService.getAllUsers();

        assertNotNull(profiles);
        assertEquals(2, profiles.size());
        assertEquals("John Doe", profiles.get(0).getFullName());
        assertEquals("Jane Doe", profiles.get(1).getFullName());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("updateUserProfile should update fullName and email successfully")
    void updateUserProfile_Success() {
        UserProfileUpdateRequest request = new UserProfileUpdateRequest(
                "John Updated",
                "john.new@example.com",
                "https://cloudinary.com/new-avatar.jpg"
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail("john.new@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileResponse response = userService.updateUserProfile(1L, request);

        assertNotNull(response);
        assertEquals("John Updated", response.getFullName());
        assertEquals("john.new@example.com", response.getEmail());
        assertEquals("https://cloudinary.com/new-avatar.jpg", response.getProfilePictureUrl());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    @DisplayName("updateUserProfile should throw BadRequestException when email already registered by another user")
    void updateUserProfile_EmailAlreadyRegistered_ThrowsException() {
        UserProfileUpdateRequest request = new UserProfileUpdateRequest(
                "John",
                "already.taken@example.com",
                null
        );

        User anotherUser = User.builder()
                .id(2L)
                .email("already.taken@example.com")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail("already.taken@example.com")).thenReturn(Optional.of(anotherUser));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> userService.updateUserProfile(1L, request));

        assertEquals("Email already registered", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("upgradeUserRole should set user role to OWNER")
    void upgradeUserRole_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileResponse response = userService.upgradeUserRole(1L);

        assertNotNull(response);
        assertEquals(Role.OWNER.name(), response.getRole());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    @DisplayName("uploadProfileImage should upload to Cloudinary and update profilePictureUrl")
    void uploadProfileImage_Success() {
        MultipartFile mockFile = mock(MultipartFile.class);
        String uploadedUrl = "https://res.cloudinary.com/demo/image/upload/v1234/profile.jpg";

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(cloudinaryService.uploadUserProfileImage(mockFile, 1L)).thenReturn(uploadedUrl);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileResponse response = userService.uploadProfileImage(1L, mockFile);

        assertNotNull(response);
        assertEquals(uploadedUrl, response.getProfilePictureUrl());
        verify(cloudinaryService, times(1)).uploadUserProfileImage(mockFile, 1L);
        verify(userRepository, times(1)).save(testUser);
    }
}
