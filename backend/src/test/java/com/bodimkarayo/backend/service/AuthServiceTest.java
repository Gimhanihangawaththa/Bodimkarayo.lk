package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.dto.AuthResponse;
import com.bodimkarayo.backend.dto.TokenRefreshResponse;
import com.bodimkarayo.backend.exception.BadRequestException;
import com.bodimkarayo.backend.exception.UnauthorizedException;
import com.bodimkarayo.backend.model.RefreshToken;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.UserRepository;
import com.bodimkarayo.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RefreshToken testRefreshToken;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .fullName("Test User")
                .email("test@example.com")
                .password("encodedPassword123")
                .role("USER")
                .verified(false)
                .isActive(true)
                .build();

        testRefreshToken = RefreshToken.builder()
                .id(100L)
                .token("mock-refresh-token-uuid")
                .user(testUser)
                .expiryDate(Instant.now().plusSeconds(604800))
                .revoked(false)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new user with hashed password and dual tokens")
    void register_Success() {
        User inputUser = User.builder()
                .fullName("Test User")
                .email("test@example.com")
                .password("RawPass@123")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("RawPass@123")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateAccessToken("test@example.com")).thenReturn("mock-access-token");
        when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn(testRefreshToken);

        AuthResponse response = authService.register(inputUser);

        assertNotNull(response);
        assertEquals("mock-access-token", response.getToken());
        assertEquals("mock-refresh-token-uuid", response.getRefreshToken());
        assertEquals("test@example.com", response.getUser().getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when registering with duplicate email")
    void register_DuplicateEmail_ThrowsException() {
        User inputUser = User.builder()
                .fullName("Test User")
                .email("test@example.com")
                .password("RawPass@123")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(BadRequestException.class, () -> authService.register(inputUser));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when registering with password shorter than 8 characters")
    void register_ShortPassword_ThrowsException() {
        User inputUser = User.builder()
                .fullName("Test User")
                .email("test@example.com")
                .password("short")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(inputUser));
        assertTrue(ex.getMessage().contains("at least 8 characters"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when registering with null password")
    void register_NullPassword_ThrowsException() {
        User inputUser = User.builder()
                .fullName("Test User")
                .email("test@example.com")
                .password(null)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(inputUser));
        assertTrue(ex.getMessage().contains("at least 8 characters"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when password lacks uppercase letter")
    void register_MissingUppercase_ThrowsException() {
        User inputUser = User.builder()
                .fullName("Test User")
                .email("test@example.com")
                .password("rawpass@123")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(inputUser));
        assertTrue(ex.getMessage().contains("uppercase"));
    }

    @Test
    @DisplayName("Should throw BadRequestException when password lacks number")
    void register_MissingNumber_ThrowsException() {
        User inputUser = User.builder()
                .fullName("Test User")
                .email("test@example.com")
                .password("RawPass@word")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(inputUser));
        assertTrue(ex.getMessage().contains("number"));
    }

    @Test
    @DisplayName("Should throw BadRequestException when password lacks special character")
    void register_MissingSpecialChar_ThrowsException() {
        User inputUser = User.builder()
                .fullName("Test User")
                .email("test@example.com")
                .password("RawPass1234")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(inputUser));
        assertTrue(ex.getMessage().contains("special character"));
    }

    @Test
    @DisplayName("Should successfully authenticate valid user and issue dual tokens")
    void login_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("rawPassword123", "encodedPassword123")).thenReturn(true);
        when(jwtUtil.generateAccessToken("test@example.com")).thenReturn("mock-access-token");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(testRefreshToken);

        AuthResponse response = authService.login("test@example.com", "rawPassword123");

        assertNotNull(response);
        assertEquals("mock-access-token", response.getToken());
        assertEquals("mock-refresh-token-uuid", response.getRefreshToken());
        assertEquals("test@example.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when password does not match")
    void login_InvalidPassword_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword123")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login("test@example.com", "wrongPassword"));
        verify(jwtUtil, never()).generateAccessToken(anyString());
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when account is inactive")
    void login_InactiveUser_ThrowsException() {
        testUser.setIsActive(false);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("rawPassword123", "encodedPassword123")).thenReturn(true);

        assertThrows(UnauthorizedException.class, () -> authService.login("test@example.com", "rawPassword123"));
    }

    @Test
    @DisplayName("Should rotate refresh token and issue new access token on refresh")
    void refreshToken_Success() {
        RefreshToken newRefreshToken = RefreshToken.builder()
                .id(101L)
                .token("new-rotated-refresh-token")
                .user(testUser)
                .expiryDate(Instant.now().plusSeconds(604800))
                .revoked(false)
                .build();

        when(refreshTokenService.findByToken("mock-refresh-token-uuid")).thenReturn(Optional.of(testRefreshToken));
        when(refreshTokenService.verifyExpiration(testRefreshToken)).thenReturn(testRefreshToken);
        when(jwtUtil.generateAccessToken("test@example.com")).thenReturn("new-access-token");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(newRefreshToken);

        TokenRefreshResponse response = authService.refreshToken("mock-refresh-token-uuid");

        assertNotNull(response);
        assertEquals("new-access-token", response.getToken());
        assertEquals("new-rotated-refresh-token", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when refresh token is blank or invalid")
    void refreshToken_Invalid_ThrowsException() {
        assertThrows(UnauthorizedException.class, () -> authService.refreshToken(""));
        assertThrows(UnauthorizedException.class, () -> authService.refreshToken(null));

        when(refreshTokenService.findByToken("unknown-token")).thenReturn(Optional.empty());
        assertThrows(UnauthorizedException.class, () -> authService.refreshToken("unknown-token"));
    }
}
