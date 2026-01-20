package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.AdminLog;
import com.bodimkarayo.backend.repository.AdminLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminLogService {

    @Autowired
    private AdminLogRepository adminLogRepository;

    public List<AdminLog> getAllLogs() {
        return adminLogRepository.findAll();
    }

    public AdminLog createLog(AdminLog log) {
        log.setTimestamp(LocalDateTime.now());
        return adminLogRepository.save(log);
    }
}
