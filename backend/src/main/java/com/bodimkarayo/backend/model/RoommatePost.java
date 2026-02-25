package com.bodimkarayo.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoommatePost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gender;
    private Integer age;
    private String occupation;
    private String location;
    private String bio;
    private String interests; // Comma-separated
    private String preferences;
    private Double budget;

    @ManyToOne
    private User poster;
}
