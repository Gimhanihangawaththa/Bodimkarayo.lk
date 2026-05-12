package com.bodimkarayo.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class CreateReviewRequest {
    private Integer rating;

    @JsonAlias("text")
    private String comment;
}
