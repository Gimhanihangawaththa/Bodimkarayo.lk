package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.dto.AuthResponse;
import com.bodimkarayo.backend.dto.TokenRefreshResponse;
import com.bodimkarayo.backend.exception.BadRequestException;
import com.bodimkarayo.backend.exception.UnauthorizedException;
import com.bodimkarayo.backend.model.RefreshToken;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.UserRepository;
import com.bodimkarayo.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(User user) {
        // Check if email already exists
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        // Hash password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set default role, verification status and active flag
        user.setRole("USER");
        user.setVerified(false);
        user.setIsActive(true);

        // Save new user
        User savedUser = userRepository.save(user);

        // Generate dual tokens
        String accessToken = jwtUtil.generateAccessToken(savedUser.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        return AuthResponse.builder()
                .user(savedUser)
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Transactional
    public AuthResponse login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty() || !passwordEncoder.matches(password, user.get().getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User foundUser = user.get();
        if (Boolean.FALSE.equals(foundUser.getIsActive())) {
            throw new UnauthorizedException("User account is inactive");
        }

        String accessToken = jwtUtil.generateAccessToken(foundUser.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(foundUser);

        return AuthResponse.builder()
                .user(foundUser)
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Transactional
    public TokenRefreshResponse refreshToken(String requestRefreshToken) {
        if (requestRefreshToken == null || requestRefreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is required");
        }

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newAccessToken = jwtUtil.generateAccessToken(user.getEmail());
                    // Rotate refresh token
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

                    return TokenRefreshResponse.builder()
                            .token(newAccessToken)
                            .refreshToken(newRefreshToken.getToken())
                            .tokenType("Bearer")
                            .build();
                })
                .orElseThrow(() -> new UnauthorizedException("Refresh token is not in database or is invalid"));
    }

    @Transactional
    public void logout(String requestRefreshToken) {
        if (requestRefreshToken != null && !requestRefreshToken.isBlank()) {
            refreshTokenService.revokeToken(requestRefreshToken);
        }
    }

    public User upgradeToOwner(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new BadRequestException("User not found");
        }

        User user = userOpt.get();
        if ("OWNER".equals(user.getRole()) || "ADMIN".equals(user.getRole())) {
            throw new BadRequestException("User is already an owner or admin");
        }

        user.setRole("OWNER");
        return userRepository.save(user);
    }
}
