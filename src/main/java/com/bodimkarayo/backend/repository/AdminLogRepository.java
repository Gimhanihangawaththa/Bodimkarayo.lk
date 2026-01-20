package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
}
