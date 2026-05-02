package com.bodimkarayo.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String author;
    private String avatar;
    private int rating;
    private String text;
    private String date;
    private Long reviewerId;
}
