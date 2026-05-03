package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.dto.CreateReviewRequest;
import com.bodimkarayo.backend.dto.PropertyRatingResponse;
import com.bodimkarayo.backend.dto.ReviewResponse;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/properties/{propertyId}")
public class PropertyReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/reviews")
    public List<ReviewResponse> listReviews(@PathVariable Long propertyId) {
        return reviewService.listReviewsForProperty(propertyId);
    }

    @GetMapping("/rating")
    public PropertyRatingResponse getRating(@PathVariable Long propertyId) {
        return reviewService.getRatingSummary(propertyId);
    }

    @PostMapping("/reviews")
    public ReviewResponse createReview(
            @PathVariable Long propertyId,
            @RequestBody CreateReviewRequest request,
            Authentication authentication
    ) {
        User reviewer = requireUser(authentication);
        return reviewService.createOrUpdateReview(propertyId, reviewer, request);
    }

    private User requireUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to post a review");
        }
        return user;
    }
}
