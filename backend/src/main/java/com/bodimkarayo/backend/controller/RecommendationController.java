package com.bodimkarayo.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// controller/RecommendationController.java
@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    @GetMapping
    public List<String> recommend(@RequestParam Long userId) {
        // Stub logic — replace with ML model later
        return List.of("Property A", "Property B");
    }
}

