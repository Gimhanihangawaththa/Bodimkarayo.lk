package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.dto.UserProfileResponse;
import com.bodimkarayo.backend.dto.UserProfileUpdateRequest;
import com.bodimkarayo.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}/profile")
    public UserProfileResponse getUserProfile(@PathVariable Long id) {
        return userService.getUserProfile(id);
    }

    @PutMapping("/{id}/profile")
    public UserProfileResponse updateUserProfile(@PathVariable Long id, @RequestBody UserProfileUpdateRequest request) {
        return userService.updateUserProfile(id, request);
    }
}
