package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.Report;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping
    public Report submitReport(@RequestBody Report report, Authentication authentication) {
        User currentUser = requireUser(authentication);
        return reportService.createReport(currentUser, report);
    }

    private User requireUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to submit a report");
        }
        return user;
    }
}
