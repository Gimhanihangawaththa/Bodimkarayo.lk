package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.dto.CreateReviewRequest;
import com.bodimkarayo.backend.dto.PropertyRatingResponse;
import com.bodimkarayo.backend.dto.ReviewResponse;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.service.RoommateReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/roommates/{roommatePostId}")
public class RoommateReviewController {

    @Autowired
    private RoommateReviewService roommateReviewService;

    /** GET /api/roommates/{roommatePostId}/reviews */
    @GetMapping("/reviews")
    public List<ReviewResponse> listReviews(@PathVariable Long roommatePostId) {
        return roommateReviewService.listReviewsForPost(roommatePostId);
    }

    /** GET /api/roommates/{roommatePostId}/rating */
    @GetMapping("/rating")
    public PropertyRatingResponse getRating(@PathVariable Long roommatePostId) {
        return roommateReviewService.getRatingSummary(roommatePostId);
    }

    /** POST /api/roommates/{roommatePostId}/reviews  (auth required) */
    @PostMapping("/reviews")
    public ReviewResponse createReview(
            @PathVariable Long roommatePostId,
            @RequestBody CreateReviewRequest request,
            Authentication authentication
    ) {
        User reviewer = requireUser(authentication);
        return roommateReviewService.createOrUpdateReview(roommatePostId, reviewer, request);
    }

    /** DELETE /api/roommates/{roommatePostId}/reviews/{reviewId}  (auth required) */
    @DeleteMapping("/reviews/{reviewId}")
    public void deleteReview(
            @PathVariable Long roommatePostId,
            @PathVariable Long reviewId,
            Authentication authentication
    ) {
        User currentUser = requireUser(authentication);
        roommateReviewService.deleteReview(reviewId, currentUser);
    }

    private User requireUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to post a review");
        }
        return user;
    }
}
