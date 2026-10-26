package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.dto.UserProfileResponse;
import com.bodimkarayo.backend.model.AdminLog;
import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.Report;
import com.bodimkarayo.backend.model.Review;
import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.ReviewRepository;
import com.bodimkarayo.backend.repository.RoommateRepository;
import com.bodimkarayo.backend.repository.UserRepository;
import com.bodimkarayo.backend.service.AdminLogService;
import com.bodimkarayo.backend.service.PropertyService;
import com.bodimkarayo.backend.service.ReportService;
import com.bodimkarayo.backend.service.RoommateService;
import com.bodimkarayo.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminLogService adminLogService;

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoommateRepository roommateRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private RoommateService roommateService;

    // ==================== DASHBOARD STATS ====================

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalOwners = userRepository.countByRole("OWNER");
        long verifiedUsers = userRepository.countByVerified(true);

        long totalProperties = propertyRepository.count();
        long activeProperties = propertyRepository.countByStatus("ACTIVE");
        long pendingProperties = propertyRepository.countByStatus("PENDING");
        long rejectedProperties = propertyRepository.countByStatus("REJECTED");
        long rentedProperties = propertyRepository.countByStatus("RENTED");

        long totalRoommates = roommateRepository.count();
        long totalReviews = reviewRepository.count();
        long pendingReports = reportService.getPendingReportsCount();

        stats.put("totalUsers", totalUsers);
        stats.put("totalOwners", totalOwners);
        stats.put("verifiedUsers", verifiedUsers);
        stats.put("totalProperties", totalProperties);
        stats.put("activeProperties", activeProperties);
        stats.put("pendingProperties", pendingProperties);
        stats.put("rejectedProperties", rejectedProperties);
        stats.put("rentedProperties", rentedProperties);
        stats.put("totalRoommates", totalRoommates);
        stats.put("totalReviews", totalReviews);
        stats.put("pendingReports", pendingReports);

        return stats;
    }

    // ==================== PROPERTY MODERATION ====================

    @GetMapping("/properties")
    public List<Property> getAllProperties(@RequestParam(required = false) String status) {
        return propertyService.getAllPropertiesForAdmin(status);
    }

    @PutMapping("/properties/{id}/approve")
    public Property approveProperty(@PathVariable Long id) {
        return propertyService.approveProperty(id);
    }

    @PutMapping("/properties/{id}/reject")
    public Property rejectProperty(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String reason = (payload != null && payload.get("reason") != null) 
                ? payload.get("reason") 
                : "Does not meet listing standards";
        return propertyService.rejectProperty(id, reason);
    }

    @DeleteMapping("/properties/{id}")
    public Map<String, String> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return Map.of("message", "Property deleted successfully");
    }

    // ==================== USER GOVERNANCE ====================

    @GetMapping("/users")
    public List<UserProfileResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/users/{id}/verify")
    public Map<String, Object> toggleUserVerification(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Boolean> payload
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean newVerifiedStatus = (payload != null && payload.containsKey("verified"))
                ? payload.get("verified")
                : !Boolean.TRUE.equals(user.getVerified());

        user.setVerified(newVerifiedStatus);
        userRepository.save(user);

        return Map.of("id", id, "verified", newVerifiedStatus);
    }

    @PutMapping("/users/{id}/status")
    public Map<String, Object> updateUserActiveStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Boolean isActive = payload.get("isActive");
        if (isActive == null) {
            throw new RuntimeException("isActive field is required");
        }

        user.setIsActive(isActive);
        userRepository.save(user);

        return Map.of("id", id, "isActive", isActive);
    }

    @PutMapping("/users/{id}/role")
    public Map<String, Object> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newRole = payload != null ? payload.get("role") : null;
        if (newRole == null || (!newRole.equalsIgnoreCase("TENANT") && !newRole.equalsIgnoreCase("OWNER") && !newRole.equalsIgnoreCase("ADMIN"))) {
            throw new RuntimeException("Invalid role specified. Must be TENANT, OWNER, or ADMIN.");
        }

        user.setRole(newRole.toUpperCase());
        userRepository.save(user);

        return Map.of("id", id, "role", user.getRole());
    }

    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Map.of("message", "User deleted successfully");
    }

    // ==================== DISPUTES & REPORTS ====================

    @GetMapping("/reports")
    public List<Report> getAllReports(@RequestParam(required = false) String status) {
        return reportService.getAllReports(status);
    }

    @PutMapping("/reports/{id}/resolve")
    public Report resolveReport(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String notes = payload != null ? payload.get("notes") : null;
        return reportService.resolveReport(id, notes);
    }

    @PutMapping("/reports/{id}/dismiss")
    public Report dismissReport(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String notes = payload != null ? payload.get("notes") : null;
        return reportService.dismissReport(id, notes);
    }

    @DeleteMapping("/reports/{id}")
    public Map<String, String> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return Map.of("message", "Report deleted successfully");
    }

    // ==================== REVIEWS MODERATION ====================

    @GetMapping("/reviews")
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @DeleteMapping("/reviews/{id}")
    public Map<String, String> deleteReviewByAdmin(@PathVariable Long id) {
        reviewRepository.deleteById(id);
        return Map.of("message", "Review deleted successfully");
    }

    // ==================== ROOMMATES MODERATION ====================

    @GetMapping("/roommates")
    public List<RoommatePost> getAllRoommatePosts() {
        return roommateService.getAllPosts();
    }

    @DeleteMapping("/roommates/{id}")
    public Map<String, String> deleteRoommatePostByAdmin(@PathVariable Long id) {
        roommateService.deletePost(id);
        return Map.of("message", "Roommate listing deleted successfully");
    }

    // ==================== AUDIT LOGS ====================

    @GetMapping("/logs")
    public List<AdminLog> getAllLogs() {
        return adminLogService.getAllLogs();
    }

    @PostMapping("/logs")
    public AdminLog createLog(@RequestBody AdminLog log) {
        return adminLogService.createLog(log);
    }
}
