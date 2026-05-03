package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.dto.CreateReviewRequest;
import com.bodimkarayo.backend.dto.PropertyRatingResponse;
import com.bodimkarayo.backend.dto.ReviewResponse;
import com.bodimkarayo.backend.exception.BadRequestException;
import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.Review;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class ReviewService {

    private static final DateTimeFormatter REVIEW_DATE = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    public List<ReviewResponse> listReviewsForProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new BadRequestException("Property not found");
        }
        return reviewRepository.findByProperty_IdOrderByCreatedAtDesc(propertyId).stream()
                .map(this::toResponse)
                .toList();
    }

    public PropertyRatingResponse getRatingSummary(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new BadRequestException("Property not found");
        }
        List<Review> reviews = reviewRepository.findByProperty_IdOrderByCreatedAtDesc(propertyId);
        if (reviews.isEmpty()) {
            return PropertyRatingResponse.builder()
                    .averageRating(0.0)
                    .reviewCount(0)
                    .build();
        }
        double sum = reviews.stream().mapToInt(Review::getRating).sum();
        double avg = sum / reviews.size();
        return PropertyRatingResponse.builder()
                .averageRating(Math.round(avg * 10.0) / 10.0)
                .reviewCount(reviews.size())
                .build();
    }

    @Transactional
    public ReviewResponse createOrUpdateReview(Long propertyId, User reviewer, CreateReviewRequest request) {
        if (reviewer == null || reviewer.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to post a review");
        }

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new BadRequestException("Property not found"));

        if (property.getOwner() != null
                && property.getOwner().getId() != null
                && property.getOwner().getId().equals(reviewer.getId())) {
            throw new BadRequestException("You cannot review your own property");
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        String comment = request.getComment() == null ? "" : request.getComment().trim();
        if (comment.length() < 10) {
            throw new BadRequestException("Review must be at least 10 characters");
        }
        if (comment.length() > 500) {
            throw new BadRequestException("Review must be at most 500 characters");
        }

        Optional<Review> existing = reviewRepository.findByProperty_IdAndReviewer_Id(propertyId, reviewer.getId());
        Review review;
        if (existing.isPresent()) {
            review = existing.get();
            review.setRating(request.getRating());
            review.setComment(comment);
        } else {
            review = Review.builder()
                    .property(property)
                    .reviewer(reviewer)
                    .rating(request.getRating())
                    .comment(comment)
                    .build();
        }

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    @Transactional
    public void deleteReview(Long id, User currentUser) {
        if (currentUser == null || currentUser.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        if (review.getReviewer() == null || !currentUser.getId().equals(review.getReviewer().getId())) {
            if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own review");
            }
        }
        reviewRepository.deleteById(id);
    }

    private ReviewResponse toResponse(Review r) {
        User rev = r.getReviewer();
        String author = "Anonymous";
        String avatarSeed = "user";
        Long reviewerId = null;
        if (rev != null) {
            reviewerId = rev.getId();
            if (rev.getFullName() != null && !rev.getFullName().isBlank()) {
                author = rev.getFullName().trim();
            } else if (rev.getEmail() != null && !rev.getEmail().isBlank()) {
                author = rev.getEmail().trim();
            }
            avatarSeed = author;
        }
        String avatar = (rev != null && rev.getProfilePictureUrl() != null && !rev.getProfilePictureUrl().isBlank())
                ? rev.getProfilePictureUrl()
                : "https://api.dicebear.com/7.x/avataaars/svg?seed="
                + URLEncoder.encode(avatarSeed, StandardCharsets.UTF_8);

        String dateStr = r.getCreatedAt() != null
                ? r.getCreatedAt().format(REVIEW_DATE)
                : "";

        return ReviewResponse.builder()
                .id(r.getId())
                .author(author)
                .avatar(avatar)
                .rating(r.getRating())
                .text(r.getComment())
                .date(dateStr)
                .reviewerId(reviewerId)
                .build();
    }
}
