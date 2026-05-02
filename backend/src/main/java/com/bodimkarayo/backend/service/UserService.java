package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.dto.UserProfileResponse;
import com.bodimkarayo.backend.dto.UserProfileUpdateRequest;
import com.bodimkarayo.backend.exception.BadRequestException;
import com.bodimkarayo.backend.model.Role;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.RoommateRepository;
import com.bodimkarayo.backend.repository.ReviewRepository;
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

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete reviews made by the user
        List<Review> userReviews = reviewRepository.findByReviewer(user);
        reviewRepository.deleteAll(userReviews);

        // Delete user's properties (and their reviews)
        List<Property> userProperties = propertyRepository.findByOwner(user);
        for (Property property : userProperties) {
            List<Review> propertyReviews = reviewRepository.findByProperty(property);
            reviewRepository.deleteAll(propertyReviews);
        }
        propertyRepository.deleteAll(userProperties);

        // Delete user's roommate posts
        List<RoommatePost> userRoommatePosts = roommateRepository.findByPoster(user);
        roommateRepository.deleteAll(userRoommatePosts);

        // Finally, delete the user
        userRepository.delete(user);
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
