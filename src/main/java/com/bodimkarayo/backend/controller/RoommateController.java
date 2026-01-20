package com.bodimkarayo.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.bodimkarayo.backend.repository.RoommateRepository;

import java.util.List;

// controller/RoommateController.java
@RestController
@RequestMapping("/api/roommates")
public class RoommateController {
    @Autowired
    private RoommateRepository repo;

    @PostMapping
    public <RoommatePost> RoommatePost add(@RequestBody RoommatePost post) {
        return (RoommatePost) repo.save(post);
    }

    @GetMapping
    public <RoommatePost> List<RoommatePost> list() {
        return repo.findAll();
    }
}
