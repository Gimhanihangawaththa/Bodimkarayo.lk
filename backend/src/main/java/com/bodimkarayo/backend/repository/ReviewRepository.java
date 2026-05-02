package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.User;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByReviewer(User reviewer);
    List<Review> findByProperty(Property property);

    List<Review> findByProperty_IdOrderByCreatedAtDesc(Long propertyId);

    Optional<Review> findByProperty_IdAndReviewer_Id(Long propertyId, Long reviewerId);
}
