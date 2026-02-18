package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.repository.RoommateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoommateService {

    @Autowired
    private RoommateRepository roommateRepository;

    public List<RoommatePost> getAllPosts() {
        return roommateRepository.findAll();
    }

    public Optional<RoommatePost> getPostById(Long id) {
        return roommateRepository.findById(id);
    }

    public RoommatePost createPost(RoommatePost post) {
        return (RoommatePost) roommateRepository.save(post);
    }

    public RoommatePost updatePost(Long id, RoommatePost updatedPost) throws Throwable {
        RoommatePost post = (RoommatePost) roommateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setLocation(updatedPost.getLocation());
        post.setPreferences(updatedPost.getPreferences());
        post.setBudget(updatedPost.getBudget());
        post.setPoster(updatedPost.getPoster());

        return (RoommatePost) roommateRepository.save(post);
    }

    public void deletePost(Long id) {
        roommateRepository.deleteById(id);
    }
}
