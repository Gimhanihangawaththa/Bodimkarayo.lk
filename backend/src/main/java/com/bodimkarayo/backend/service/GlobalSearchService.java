package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.RoommateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class GlobalSearchService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private RoommateRepository roommateRepository;

    public Map<String, Object> globalSearch(String keyword) {
        Map<String, Object> results = new HashMap<>();

        if (keyword == null || keyword.isBlank()) {
            results.put("properties", Collections.emptyList());
            results.put("roommates", Collections.emptyList());
            return results;
        }

        String normalizedKeyword = normalizeText(keyword);
        List<String> queryTerms = extractTerms(normalizedKeyword);

        if (queryTerms.isEmpty()) {
            results.put("properties", Collections.emptyList());
            results.put("roommates", Collections.emptyList());
            return results;
        }

        // Search properties
        List<Property> properties = searchProperties(normalizedKeyword, queryTerms);
        results.put("properties", properties);

        // Search roommates
        List<RoommatePost> roommates = searchRoommates(normalizedKeyword, queryTerms);
        results.put("roommates", roommates);

        return results;
    }

    private List<Property> searchProperties(String normalizedKeyword, List<String> queryTerms) {
        try {
            return propertyRepository.findAll().stream()
                    .map(property -> new PropertyHit(property, scoreProperty(property, normalizedKeyword, queryTerms)))
                    .filter(hit -> hit.property() != null && hit.score() > 0)
                    .sorted(Comparator.comparingInt(SearchHit::score).reversed())
                    .map(PropertyHit::property)
                    .toList();
        } catch (Exception ex) {
            System.err.println("Error searching properties: " + ex.getMessage());
            return Collections.emptyList();
        }
    }

    private List<RoommatePost> searchRoommates(String normalizedKeyword, List<String> queryTerms) {
        try {
            return roommateRepository.findAll().stream()
                    .map(roommate -> new RoommateHit(roommate, scoreRoommate(roommate, normalizedKeyword, queryTerms)))
                    .filter(hit -> hit.roommate() != null && hit.score() > 0)
                    .sorted(Comparator.comparingInt(SearchHit::score).reversed())
                    .map(RoommateHit::roommate)
                    .toList();
        } catch (Exception ex) {
            System.err.println("Error searching roommates: " + ex.getMessage());
            return Collections.emptyList();
        }
    }

    private int scoreProperty(Property property, String normalizedKeyword, List<String> queryTerms) {
        String searchableText = normalizeText(joinText(
                property.getTitle(),
                property.getDescription(),
                property.getLocation(),
                property.getAddress(),
                property.getPropertyType(),
                joinList(property.getHighlights()),
                joinList(property.getNearby()),
                joinList(property.getOffers())
        ));

        String titleText = normalizeText(property.getTitle());
        String locationText = normalizeText(joinText(property.getLocation(), property.getAddress()));
        return scoreQuery(searchableText, titleText, locationText, normalizedKeyword, queryTerms);
    }

    private int scoreRoommate(RoommatePost roommate, String normalizedKeyword, List<String> queryTerms) {
        String searchableText = normalizeText(joinText(
                roommate.getGender(),
                roommate.getOccupation(),
                roommate.getLocation(),
                roommate.getBio(),
                roommate.getAbout(),
                roommate.getInterests(),
                roommate.getPreferredLocation(),
                roommate.getPoster() != null ? roommate.getPoster().getFullName() : null,
                roommate.getPoster() != null ? roommate.getPoster().getEmail() : null
        ));

        String primaryText = normalizeText(joinText(
                roommate.getPoster() != null ? roommate.getPoster().getFullName() : null,
                roommate.getOccupation()
        ));
        String locationText = normalizeText(joinText(roommate.getLocation(), roommate.getPreferredLocation()));
        return scoreQuery(searchableText, primaryText, locationText, normalizedKeyword, queryTerms);
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

    private int scoreQuery(
            String searchableText,
            String primaryText,
            String locationText,
            String normalizedKeyword,
            List<String> queryTerms
    ) {
        if (searchableText == null || searchableText.isBlank() || queryTerms == null || queryTerms.isEmpty()) {
            return 0;
        }

        int score = 0;

        if (normalizedKeyword != null && !normalizedKeyword.isBlank() && searchableText.contains(normalizedKeyword)) {
            score += 100;
        }

        int matchedTerms = 0;
        for (String term : queryTerms) {
            if (searchableText.contains(term)) {
                matchedTerms++;
                score += 10;
            }
            if (primaryText != null && !primaryText.isBlank() && primaryText.contains(term)) {
                score += 15;
            }
            if (locationText != null && !locationText.isBlank() && locationText.contains(term)) {
                score += 8;
            }
        }

        // Keep results broad: at least one term should match.
        if (matchedTerms == 0) {
            return 0;
        }

        // Reward results that match most of the typed words.
        if (matchedTerms == queryTerms.size()) {
            score += 20;
        }

        return score;
    }

    private String normalizeText(String input) {
        if (input == null) {
            return "";
        }

        return input.toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private List<String> extractTerms(String normalizedText) {
        if (normalizedText == null || normalizedText.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(normalizedText.split(" "))
                .map(String::trim)
                .filter(term -> !term.isBlank())
                .toList();
    }

    private String joinList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }
        return String.join(" ", values.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .toList());
    }

    private interface SearchHit {
        int score();
    }

    private static class PropertyHit implements SearchHit {
        private final Property property;
        private final int score;

        private PropertyHit(Property property, int score) {
            this.property = property;
            this.score = score;
        }

        public Property property() {
            return property;
        }

        @Override
        public int score() {
            return score;
        }
    }

    private static class RoommateHit implements SearchHit {
        private final RoommatePost roommate;
        private final int score;

        private RoommateHit(RoommatePost roommate, int score) {
            this.roommate = roommate;
            this.score = score;
        }

        public RoommatePost roommate() {
            return roommate;
        }

        @Override
        public int score() {
            return score;
        }
    }
}
