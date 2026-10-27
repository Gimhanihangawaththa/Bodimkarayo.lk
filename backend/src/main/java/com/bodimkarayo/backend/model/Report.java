package com.bodimkarayo.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TARGET TYPE: "PROPERTY", "USER", "ROOMMATE"
    @Column(nullable = false)
    private String targetType;

    @Column(nullable = false)
    private Long targetId;

    private String targetTitle;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Builder.Default
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, RESOLVED, DISMISSED

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    private String resolutionNotes;

    @PrePersist
    public void prePersist() {
        if (this.status == null || this.status.isBlank()) {
            this.status = "PENDING";
        }
    }
}
