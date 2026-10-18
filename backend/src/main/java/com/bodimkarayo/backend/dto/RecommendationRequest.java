package com.bodimkarayo.backend.dto;

import lombok.Data;

@Data
public class RecommendationRequest {
    private String preferences; // E.g., "I need a single room near Colombo 07 under 25000 with WiFi"
    private Double maxBudget;
    private String preferredLocation;
    private String propertyType;
}
