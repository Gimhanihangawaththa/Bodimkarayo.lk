package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        // Check if email already exists
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Set default role and verification status
        user.setRole("USER");
        user.setVerified(false);

        // Save new user
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty() || !user.get().getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }

        return user.get();
    }

    public User upgradeToOwner(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        if ("OWNER".equals(user.getRole()) || "ADMIN".equals(user.getRole())) {
            throw new RuntimeException("User is already an owner or admin");
        }

        user.setRole("OWNER");
        return userRepository.save(user);
    }
}
