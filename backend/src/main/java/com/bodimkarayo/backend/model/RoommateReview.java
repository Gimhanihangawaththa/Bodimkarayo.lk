package com.bodimkarayo.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "roommate_reviews")
public class RoommateReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String comment;
    private int rating;

    @ManyToOne
    private User reviewer;

    @ManyToOne
    private RoommatePost roommatePost;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
