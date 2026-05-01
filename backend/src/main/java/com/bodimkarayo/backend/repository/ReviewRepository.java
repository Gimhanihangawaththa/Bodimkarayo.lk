package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.User;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByReviewer(User reviewer);
    List<Review> findByProperty(Property property);
}
