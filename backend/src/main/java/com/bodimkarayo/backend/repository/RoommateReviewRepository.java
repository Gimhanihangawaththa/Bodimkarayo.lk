package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.RoommateReview;
import com.bodimkarayo.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface RoommateReviewRepository extends JpaRepository<RoommateReview, Long> {

    List<RoommateReview> findByRoommatePost_IdOrderByCreatedAtDesc(Long roommatePostId);

    Optional<RoommateReview> findByRoommatePost_IdAndReviewer_Id(Long roommatePostId, Long reviewerId);

    @Transactional
    @Modifying
    @Query("DELETE FROM RoommateReview r WHERE r.reviewer = :reviewer")
    void deleteByReviewer(@Param("reviewer") User reviewer);

    @Transactional
    @Modifying
    @Query("DELETE FROM RoommateReview r WHERE r.roommatePost.id = :postId")
    void deleteByRoommatePostId(@Param("postId") Long postId);
}
