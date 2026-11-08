package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.dto.UserProfileResponse;
import com.bodimkarayo.backend.dto.UserProfileUpdateRequest;
import com.bodimkarayo.backend.dto.ChangePasswordRequest;
import com.bodimkarayo.backend.exception.UnauthorizedException;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}/profile")
    public UserProfileResponse getUserProfile(@PathVariable Long id) {
        return userService.getUserProfile(id);
    }

    @GetMapping
    public List<UserProfileResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/{id}/profile")
    public UserProfileResponse updateUserProfile(@PathVariable Long id, @RequestBody UserProfileUpdateRequest request) {
        return userService.updateUserProfile(id, request);
    }

    @PostMapping(value = "/{id}/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserProfileResponse uploadProfileImage(@PathVariable Long id, @RequestParam("image") MultipartFile image) {
        return userService.uploadProfileImage(id, image);
    }

    @PutMapping("/{id}/upgrade-role")
    public UserProfileResponse upgradeUserRole(@PathVariable Long id) {
        return userService.upgradeUserRole(id);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User currentUser)) {
            throw new UnauthorizedException("Authentication required to delete account");
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        if (!currentUser.getId().equals(id) && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to delete this account");
        }

        userService.deleteUser(id);
        return Map.of("message", "User account deleted successfully");
    }

    @PutMapping("/{id}/change-password")
    public void changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request);
    }
}
