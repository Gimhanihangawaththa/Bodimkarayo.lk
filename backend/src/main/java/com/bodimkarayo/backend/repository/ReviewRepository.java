package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.User;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByReviewer(User reviewer);
    List<Review> findByProperty(Property property);

    List<Review> findByProperty_IdOrderByCreatedAtDesc(Long propertyId);

    Optional<Review> findByProperty_IdAndReviewer_Id(Long propertyId, Long reviewerId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Review r WHERE r.reviewer = :reviewer")
    void deleteByReviewer(@Param("reviewer") User reviewer);

    @Transactional
    @Modifying
    @Query("DELETE FROM Review r WHERE r.property = :property")
    void deleteByProperty(@Param("property") Property property);
}
