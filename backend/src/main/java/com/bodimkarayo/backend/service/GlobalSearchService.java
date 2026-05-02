package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.search.document.PropertySearchDocument;
import com.bodimkarayo.backend.search.document.RoommateSearchDocument;
import com.bodimkarayo.backend.search.repository.PropertySearchRepository;
import com.bodimkarayo.backend.search.repository.RoommateSearchRepository;
import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.RoommateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GlobalSearchService {

    @Autowired
    private PropertySearchRepository propertySearchRepository;

    @Autowired
    private RoommateSearchRepository roommateSearchRepository;

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
            List<PropertySearchDocument> documents = new ArrayList<>();
            propertySearchRepository.findAll().forEach(documents::add);

            List<Long> matchedIds = documents.stream()
                    .filter(doc -> matchesPropertyKeyword(doc, normalizedKeyword, queryTerms))
                    .map(PropertySearchDocument::getId)
                    .filter(Objects::nonNull)
                    .toList();

            if (matchedIds.isEmpty()) {
                return Collections.emptyList();
            }

            Map<Long, Property> propertyMap = propertyRepository.findAllById(matchedIds).stream()
                    .collect(Collectors.toMap(Property::getId, Function.identity()));

            List<Property> ordered = new ArrayList<>();
            for (Long id : matchedIds) {
                Property property = propertyMap.get(id);
                if (property != null) {
                    ordered.add(property);
                }
            }

            return ordered;
        } catch (Exception ex) {
            System.err.println("Error searching properties: " + ex.getMessage());
            return Collections.emptyList();
        }
    }

    private List<RoommatePost> searchRoommates(String normalizedKeyword, List<String> queryTerms) {
        try {
            List<RoommateSearchDocument> documents = new ArrayList<>();
            roommateSearchRepository.findAll().forEach(documents::add);

            List<Long> matchedIds = documents.stream()
                    .filter(doc -> matchesRoommateKeyword(doc, normalizedKeyword, queryTerms))
                    .map(RoommateSearchDocument::getId)
                    .filter(Objects::nonNull)
                    .toList();

            if (matchedIds.isEmpty()) {
                return Collections.emptyList();
            }

            Map<Long, RoommatePost> roommateMap = roommateRepository.findAllById(matchedIds).stream()
                    .collect(Collectors.toMap(RoommatePost::getId, Function.identity()));

            List<RoommatePost> ordered = new ArrayList<>();
            for (Long id : matchedIds) {
                RoommatePost roommate = roommateMap.get(id);
                if (roommate != null) {
                    ordered.add(roommate);
                }
            }

            return ordered;
        } catch (Exception ex) {
            System.err.println("Error searching roommates: " + ex.getMessage());
            return Collections.emptyList();
        }
    }

    private boolean matchesPropertyKeyword(PropertySearchDocument doc, String normalizedKeyword, List<String> queryTerms) {
        String searchableText = normalizeText(joinText(
                doc.getTitle(),
                doc.getDescription(),
                doc.getLocation(),
                doc.getAddress(),
                doc.getPropertyType()
        ));

        return matchesQuery(searchableText, normalizedKeyword, queryTerms);
    }

    private boolean matchesRoommateKeyword(RoommateSearchDocument doc, String normalizedKeyword, List<String> queryTerms) {
        String searchableText = normalizeText(joinText(
                doc.getGender(),
                doc.getOccupation(),
                doc.getLocation(),
                doc.getBio(),
                doc.getAbout(),
                doc.getInterests(),
                doc.getPreferredLocation(),
                doc.getPosterName(),
                doc.getPosterEmail()
        ));

        return matchesQuery(searchableText, normalizedKeyword, queryTerms);
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

    private boolean matchesQuery(String searchableText, String normalizedKeyword, List<String> queryTerms) {
        if (searchableText == null || searchableText.isBlank() || queryTerms == null || queryTerms.isEmpty()) {
            return false;
        }

        if (normalizedKeyword != null && !normalizedKeyword.isBlank() && searchableText.contains(normalizedKeyword)) {
            return true;
        }

        return queryTerms.stream().allMatch(searchableText::contains);
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
}
