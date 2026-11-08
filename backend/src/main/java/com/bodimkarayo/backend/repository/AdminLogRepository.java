package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.AdminLog;
import com.bodimkarayo.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {

    @Transactional
    @Modifying
    @Query("DELETE FROM AdminLog a WHERE a.admin = :admin")
    void deleteByAdmin(@Param("admin") User admin);
}
