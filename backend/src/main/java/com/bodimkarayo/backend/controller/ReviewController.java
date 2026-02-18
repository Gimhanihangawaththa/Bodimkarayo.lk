package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.Review;
import com.bodimkarayo.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public Review create(@RequestBody Review review) {
        return reviewService.createReview(review);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }
}
