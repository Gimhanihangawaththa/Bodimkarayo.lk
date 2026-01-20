package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.service.RoommateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roommates")
public class RoommateController {

    @Autowired
    private RoommateService roommateService;

    @GetMapping
    public List<RoommatePost> getAll() {
        return roommateService.getAllPosts();
    }

    @GetMapping("/{id}")
    public RoommatePost getById(@PathVariable Long id) {
        return roommateService.getPostById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    @PostMapping
    public RoommatePost create(@RequestBody RoommatePost post) {
        return roommateService.createPost(post);
    }

    @PutMapping("/{id}")
    public RoommatePost update(@PathVariable Long id, @RequestBody RoommatePost post) throws Throwable {
        return roommateService.updatePost(id, post);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        roommateService.deletePost(id);
    }
}
