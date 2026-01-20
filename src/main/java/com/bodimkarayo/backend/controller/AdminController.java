package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.AdminLog;
import com.bodimkarayo.backend.service.AdminLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/logs")
public class AdminController {

    @Autowired
    private AdminLogService adminLogService;

    @GetMapping
    public List<AdminLog> getAllLogs() {
        return adminLogService.getAllLogs();
    }

    @PostMapping
    public AdminLog createLog(@RequestBody AdminLog log) {
        return adminLogService.createLog(log);
    }
}
