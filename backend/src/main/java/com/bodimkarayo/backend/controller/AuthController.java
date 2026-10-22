package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.dto.AuthResponse;
import com.bodimkarayo.backend.dto.TokenRefreshRequest;
import com.bodimkarayo.backend.dto.TokenRefreshResponse;
import com.bodimkarayo.backend.dto.UserProfileResponse;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.service.AuthService;
import com.bodimkarayo.backend.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user, HttpServletResponse response) {
        AuthResponse authResponse = authService.register(user);
        setRefreshTokenCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody User user, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(user.getEmail(), user.getPassword());
        setRefreshTokenCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return ResponseEntity.ok(userService.getUserProfile(user.getId()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshToken(
            @RequestBody(required = false) TokenRefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String token = null;
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            token = request.getRefreshToken();
        } else if (httpRequest.getCookies() != null) {
            for (Cookie cookie : httpRequest.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        TokenRefreshResponse refreshResponse = authService.refreshToken(token);
        setRefreshTokenCookie(httpResponse, refreshResponse.getRefreshToken());
        return ResponseEntity.ok(refreshResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestBody(required = false) TokenRefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String token = null;
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            token = request.getRefreshToken();
        } else if (httpRequest.getCookies() != null) {
            for (Cookie cookie : httpRequest.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        authService.logout(token);
        clearRefreshTokenCookie(httpResponse);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #userId")
    @PutMapping("/upgrade-to-owner/{userId}")
    public User upgradeToOwner(@PathVariable Long userId) {
        return authService.upgradeToOwner(userId);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            Cookie cookie = new Cookie("refreshToken", refreshToken);
            cookie.setHttpOnly(true);
            cookie.setPath("/api/auth");
            cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(cookie);
        }
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
