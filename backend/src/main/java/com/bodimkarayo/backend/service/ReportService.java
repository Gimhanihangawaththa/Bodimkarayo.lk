package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.exception.BadRequestException;
import com.bodimkarayo.backend.model.Report;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public Report createReport(User reporter, Report report) {
        if (report.getTargetType() == null || report.getTargetType().isBlank()) {
            throw new BadRequestException("Target type is required (PROPERTY or USER)");
        }
        if (report.getTargetId() == null) {
            throw new BadRequestException("Target ID is required");
        }
        if (report.getReason() == null || report.getReason().isBlank()) {
            throw new BadRequestException("Reason is required");
        }

        report.setReporter(reporter);
        report.setStatus("PENDING");
        return reportRepository.save(report);
    }

    public List<Report> getAllReports(String status) {
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            return reportRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        }
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    public Report resolveReport(Long id, String notes) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Report not found with id: " + id));

        report.setStatus("RESOLVED");
        report.setResolvedAt(LocalDateTime.now());
        report.setResolutionNotes(notes != null ? notes : "Resolved by admin");
        return reportRepository.save(report);
    }

    public Report dismissReport(Long id, String notes) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Report not found with id: " + id));

        report.setStatus("DISMISSED");
        report.setResolvedAt(LocalDateTime.now());
        report.setResolutionNotes(notes != null ? notes : "Dismissed by admin");
        return reportRepository.save(report);
    }

    public void deleteReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Report not found with id: " + id));
        reportRepository.delete(report);
    }

    public long getPendingReportsCount() {
        return reportRepository.countByStatus("PENDING");
    }

    public long getReportsCountForTarget(String targetType, Long targetId) {
        return reportRepository.countByTargetTypeAndTargetId(targetType, targetId);
    }
}
