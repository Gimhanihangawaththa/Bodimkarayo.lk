package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.repository.RoommateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Locale;

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
        RoommatePost savedPost = (RoommatePost) roommateRepository.save(post);
        return savedPost;
    }

    public RoommatePost updatePost(Long id, RoommatePost updatedPost) throws Throwable {
        RoommatePost post = (RoommatePost) roommateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setGender(updatedPost.getGender());
        post.setAge(updatedPost.getAge());
        post.setOccupation(updatedPost.getOccupation());
        post.setLocation(updatedPost.getLocation());
        post.setBio(updatedPost.getBio());
        post.setAbout(updatedPost.getAbout());
        post.setInterests(updatedPost.getInterests());
        post.setPreferences(updatedPost.getPreferences());
        post.setPreferredLocation(updatedPost.getPreferredLocation());
        post.setMoveInDate(updatedPost.getMoveInDate());
        post.setBudget(updatedPost.getBudget());
        post.setPoster(updatedPost.getPoster());

        RoommatePost savedPost = (RoommatePost) roommateRepository.save(post);
        return savedPost;
    }

    public void deletePost(Long id) {
        roommateRepository.deleteById(id);
    }

    public List<RoommatePost> searchRoommates(
            String keyword,
            String location,
            String gender,
            Integer minAge,
            Integer maxAge,
            String occupation,
            String roomTypePreference,
            Boolean smokingPreference,
            Boolean petFriendly,
            String foodPreference,
            Double minBudget,
            Double maxBudget
    ) {
        return roommateRepository.findAll().stream()
                .filter(post -> matchesRoommate(post, keyword, location, gender, minAge, maxAge, occupation, roomTypePreference, smokingPreference, petFriendly, foodPreference, minBudget, maxBudget))
                .toList();
    }

    private boolean matchesRoommate(
            RoommatePost post,
            String keyword,
            String location,
            String gender,
            Integer minAge,
            Integer maxAge,
            String occupation,
            String roomTypePreference,
            Boolean smokingPreference,
            Boolean petFriendly,
            String foodPreference,
            Double minBudget,
            Double maxBudget
    ) {
        String searchableText = joinText(
                post.getGender(),
                post.getOccupation(),
                post.getLocation(),
                post.getBio(),
                post.getAbout(),
                post.getInterests(),
                post.getPreferences(),
                post.getPreferredLocation(),
            post.getMoveInDate()
        );

        return matchesKeyword(searchableText, keyword)
                && matchesText(post.getLocation(), location)
                && matchesGender(post.getGender(), gender)
                && matchesAge(post.getAge(), minAge, maxAge)
                && matchesText(post.getOccupation(), occupation)
                && matchesText(post.getPreferences(), roomTypePreference)
                && matchesBooleanText(post.getPreferences(), smokingPreference)
                && matchesBooleanText(post.getPreferences(), petFriendly)
                && matchesText(post.getPreferences(), foodPreference)
                && matchesPrice(post.getBudget(), minBudget, maxBudget);
    }

    private boolean matchesKeyword(String source, String keyword) {
        return keyword == null || keyword.isBlank() || containsIgnoreCase(source, keyword);
    }

    private boolean matchesText(String source, String expected) {
        return expected == null || expected.isBlank() || containsIgnoreCase(source, expected);
    }

    private boolean matchesGender(String source, String expected) {
        if (expected == null || expected.isBlank()) {
            return true;
        }
        return source != null && source.trim().equalsIgnoreCase(expected.trim());
    }

    private boolean matchesAge(Integer age, Integer minAge, Integer maxAge) {
        if (age == null) {
            return true;
        }
        boolean aboveMin = minAge == null || age >= minAge;
        boolean belowMax = maxAge == null || age <= maxAge;
        return aboveMin && belowMax;
    }

    private boolean matchesPrice(Double actual, Double minBudget, Double maxBudget) {
        if (actual == null) {
            return false;
        }

        boolean aboveMin = minBudget == null || minBudget <= 0 || actual >= minBudget;
        boolean belowMax = maxBudget == null || maxBudget <= 0 || actual <= maxBudget;
        return aboveMin && belowMax;
    }

    private boolean matchesBooleanText(String actual, Boolean expected) {
        if (expected == null) {
            return true;
        }

        return toBoolean(actual) == expected;
    }

    private boolean toBoolean(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return normalized.equals("true")
                || normalized.equals("yes")
                || normalized.equals("1")
                || normalized.equals("smoking")
                || normalized.equals("smoker")
                || normalized.equals("pet friendly")
                || normalized.equals("pets allowed")
                || normalized.equals("yes, pets allowed")
                || normalized.equals("allowed")
                || normalized.equals("allow");
    }

    private String joinText(String... values) {
        StringBuilder builder = new StringBuilder();
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                if (builder.length() > 0) {
                    builder.append(' ');
                }
                builder.append(value.trim());
            }
        }
        return builder.toString();
    }

    private boolean containsIgnoreCase(String source, String needle) {
        return source != null && needle != null && source.toLowerCase(Locale.ROOT).contains(needle.trim().toLowerCase(Locale.ROOT));
    }
}
