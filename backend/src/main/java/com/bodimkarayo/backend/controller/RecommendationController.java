package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.dto.RecommendationRequest;
import com.bodimkarayo.backend.dto.RecommendationResponse;
import com.bodimkarayo.backend.service.GeminiRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private GeminiRecommendationService recommendationService;

    @PostMapping
    public List<RecommendationResponse> recommend(@RequestBody RecommendationRequest request) {
        return recommendationService.getRecommendations(request);
    }
}

