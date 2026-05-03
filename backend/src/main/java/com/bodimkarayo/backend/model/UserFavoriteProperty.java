package com.bodimkarayo.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_favorite_properties",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "property_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFavoriteProperty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Property property;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
