package com.bodimkarayo.backend.dto;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.RoommatePost;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private String type; // "PROPERTY" or "ROOMMATE"
    private Property property;
    private RoommatePost roommatePost;
    private String aiExplanation;
}
