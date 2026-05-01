package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.dto.AuthResponse;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody User user) {
        return authService.login(user.getEmail(), user.getPassword());
    }

    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #userId")
    @PutMapping("/upgrade-to-owner/{userId}")
    public User upgradeToOwner(@PathVariable Long userId) {
        return authService.upgradeToOwner(userId);
    }
}
