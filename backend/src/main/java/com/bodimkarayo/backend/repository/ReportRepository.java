package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.Report;
import com.bodimkarayo.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByCreatedAtDesc();
    List<Report> findByStatusOrderByCreatedAtDesc(String status);
    List<Report> findByTargetTypeAndTargetId(String targetType, Long targetId);
    long countByStatus(String status);
    long countByTargetTypeAndTargetId(String targetType, Long targetId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Report r WHERE r.reporter = :reporter")
    void deleteByReporter(@Param("reporter") User reporter);
}
