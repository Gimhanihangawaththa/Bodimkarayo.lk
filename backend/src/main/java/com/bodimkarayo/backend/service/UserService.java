package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.dto.UserProfileResponse;
import com.bodimkarayo.backend.dto.UserProfileUpdateRequest;
import com.bodimkarayo.backend.dto.ChangePasswordRequest;
import com.bodimkarayo.backend.exception.BadRequestException;
import com.bodimkarayo.backend.model.Role;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.RoommateRepository;
import com.bodimkarayo.backend.repository.ReviewRepository;
import com.bodimkarayo.backend.repository.RefreshTokenRepository;
import com.bodimkarayo.backend.repository.UserFavoritePropertyRepository;
import com.bodimkarayo.backend.repository.ChatRoomRepository;
import com.bodimkarayo.backend.repository.ChatMessageRepository;
import com.bodimkarayo.backend.repository.ReportRepository;
import com.bodimkarayo.backend.repository.AdminLogRepository;
import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.model.Review;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private RoommateRepository roommateRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserFavoritePropertyRepository userFavoritePropertyRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private AdminLogRepository adminLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toProfileResponse(user);
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toProfileResponse)
                .collect(Collectors.toList());
    }

    public UserProfileResponse updateUserProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String requestedEmail = request.getEmail() == null ? null : request.getEmail().trim();
        if (requestedEmail != null && !requestedEmail.equalsIgnoreCase(user.getEmail())) {
            Optional<User> existing = userRepository.findByEmail(requestedEmail);
            if (existing.isPresent() && !existing.get().getId().equals(userId)) {
                throw new BadRequestException("Email already registered");
            }
            user.setEmail(requestedEmail);
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl().trim());
        }

        User updatedUser = userRepository.save(user);
        return toProfileResponse(updatedUser);
    }

    public UserProfileResponse uploadProfileImage(Long userId, MultipartFile image) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String imageUrl = cloudinaryService.uploadUserProfileImage(image, userId);
        user.setProfilePictureUrl(imageUrl);

        User updatedUser = userRepository.save(user);
        return toProfileResponse(updatedUser);
    }

    public UserProfileResponse upgradeUserRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(Role.OWNER.name());

        User updatedUser = userRepository.save(user);
        return toProfileResponse(updatedUser);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Delete reviews made by the user
        reviewRepository.deleteByReviewer(user);

        // 2. Delete user's properties (along with their reviews & favorites)
        List<Property> userProperties = propertyRepository.findByOwner(user);
        if (userProperties != null && !userProperties.isEmpty()) {
            for (Property property : userProperties) {
                reviewRepository.deleteByProperty(property);
                userFavoritePropertyRepository.deleteByProperty(property);
            }
            propertyRepository.deleteAll(userProperties);
        }

        // 3. Delete user's favorite properties
        userFavoritePropertyRepository.deleteByUser(user);

        // 4. Delete user's roommate posts
        List<RoommatePost> userRoommatePosts = roommateRepository.findByPoster(user);
        if (userRoommatePosts != null && !userRoommatePosts.isEmpty()) {
            roommateRepository.deleteAll(userRoommatePosts);
        }

        // 5. Delete user's chat messages and chat rooms
        chatMessageRepository.deleteByUser(user);
        chatRoomRepository.deleteByUser(user);

        // 6. Delete user's submitted reports
        reportRepository.deleteByReporter(user);

        // 7. Delete user's refresh tokens
        refreshTokenRepository.deleteByUser(user);

        // 8. Delete user's admin logs (if any)
        adminLogRepository.deleteByAdmin(user);

        // 9. Finally, delete the user
        userRepository.delete(user);
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Validate new password against policy
        AuthService.validatePassword(request.getNewPassword());

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole())
                .verified(user.getVerified())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
