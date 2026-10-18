package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.model.Review;
import com.bodimkarayo.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public List<Review> getAll() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/{id}")
    public Review getById(@PathVariable Long id) {
        return reviewService.getReviewById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication authentication) {
        User user = requireUser(authentication);
        reviewService.deleteReview(id, user);
    }

    private User requireUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return user;
    }
}
