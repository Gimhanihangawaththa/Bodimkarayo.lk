package com.bodimkarayo.backend.config;

import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        seedAdmins();
    }

    private void seedAdmins() {
        // Create 4 admins if they don't exist
        createAdminIfNotExists("Admin One", "admin1@bodimkarayo.lk", "admin123");
        createAdminIfNotExists("Admin Two", "admin2@bodimkarayo.lk", "admin123");
        createAdminIfNotExists("Admin Three", "admin3@bodimkarayo.lk", "admin123");
        createAdminIfNotExists("Admin Four", "admin4@bodimkarayo.lk", "admin123");
        
        System.out.println("✓ Admin accounts initialized");
    }

    private void createAdminIfNotExists(String fullName, String email, String password) {
        if (!userRepository.findByEmail(email).isPresent()) {
            User admin = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .password(password)
                    .role("ADMIN")
                    .verified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Created admin: " + email);
        }
    }
}
