package com.bodimkarayo.backend.search;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.RoommateRepository;
import com.bodimkarayo.backend.search.document.PropertySearchDocument;
import com.bodimkarayo.backend.search.document.RoommateSearchDocument;
import com.bodimkarayo.backend.search.repository.PropertySearchRepository;
import com.bodimkarayo.backend.search.repository.RoommateSearchRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "app.search.elasticsearch-enabled", havingValue = "true", matchIfMissing = true)
public class SearchIndexService {

    private final PropertyRepository propertyRepository;
    private final RoommateRepository roommateRepository;
    private final PropertySearchRepository propertySearchRepository;
    private final RoommateSearchRepository roommateSearchRepository;
    @org.springframework.beans.factory.annotation.Value("${spring.elasticsearch.uris:http://localhost:9200}")
    private String elasticsearchUri;

    public SearchIndexService(
            PropertyRepository propertyRepository,
            RoommateRepository roommateRepository,
            PropertySearchRepository propertySearchRepository,
            RoommateSearchRepository roommateSearchRepository
    ) {
        this.propertyRepository = propertyRepository;
        this.roommateRepository = roommateRepository;
        this.propertySearchRepository = propertySearchRepository;
        this.roommateSearchRepository = roommateSearchRepository;
    }

    private void ensureIndexExists(String indexName) {
        try {
            String uri = elasticsearchUri != null ? elasticsearchUri.trim() : "http://localhost:9200";
            if (uri.contains(",")) {
                uri = uri.split(",")[0].trim();
            }
            if (!uri.startsWith("http://") && !uri.startsWith("https://")) {
                uri = "http://" + uri;
            }
            java.net.URI target = java.net.URI.create(uri + "/" + indexName);
            java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                    .connectTimeout(java.time.Duration.ofSeconds(3))
                    .build();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(target)
                    .PUT(java.net.http.HttpRequest.BodyPublishers.ofString("{}"))
                    .header("Content-Type", "application/json")
                    .build();
            client.send(request, java.net.http.HttpResponse.BodyHandlers.discarding());
        } catch (Exception ex) {
            // Index already exists or network notice - safe to ignore
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void reindexOnStartup() {
        try {
            ensureIndexExists("properties");
            ensureIndexExists("roommates");
            syncAllProperties();
            syncAllRoommates();
        } catch (Exception ex) {
            System.err.println("Search index bootstrap skipped: " + ex.getMessage());
        }
    }

    public void syncProperty(Property property) {
        try {
            PropertySearchDocument document = PropertySearchDocument.fromEntity(property);
            if (document != null) {
                propertySearchRepository.save(document);
            }
        } catch (Exception ex) {
            System.err.println("Failed to sync property to search index: " + ex.getMessage());
        }
    }

    public void removeProperty(Long propertyId) {
        try {
            if (propertyId != null) {
                propertySearchRepository.deleteById(propertyId);
            }
        } catch (Exception ex) {
            System.err.println("Failed to remove property from search index: " + ex.getMessage());
        }
    }

    public void syncAllProperties() {
        try {
            ensureIndexExists("properties");
            List<Property> properties = propertyRepository.findAll();
            try {
                propertySearchRepository.deleteAll();
            } catch (Exception ignored) {
            }
            if (!properties.isEmpty()) {
                propertySearchRepository.saveAll(properties.stream()
                        .map(PropertySearchDocument::fromEntity)
                        .filter(Objects::nonNull)
                        .toList());
            }
            System.out.println("✓ Synced " + properties.size() + " properties to Elasticsearch");
        } catch (Exception ex) {
            System.err.println("Failed to sync all properties to search index: " + ex.getMessage());
        }
    }

    public List<Property> searchProperties(
            String keyword,
            String location,
            String propertyType,
            Double minPrice,
            Double maxPrice,
            Integer bedrooms,
            Integer bathrooms,
            Boolean furnished,
            Boolean parking,
            Boolean petsAllowed,
            String genderPreference,
            String suitableFor
    ) {
        if (!hasAnyCriteria(keyword, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, furnished, parking, petsAllowed, genderPreference, suitableFor)) {
            return propertyRepository.findAll();
        }

        try {
            List<PropertySearchDocument> documents = new ArrayList<>();
            propertySearchRepository.findAll().forEach(documents::add);

            List<Long> matchedIds = documents.stream()
                    .filter(doc -> matchesProperty(doc, keyword, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, furnished, parking, petsAllowed, genderPreference, suitableFor))
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
            System.err.println("Notice: Elasticsearch searchProperties fallback to DB: " + ex.getMessage());
            return propertyRepository.findAll().stream()
                    .filter(prop -> matchesPropertyEntity(prop, keyword, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, furnished, parking, petsAllowed, genderPreference, suitableFor))
                    .toList();
        }
    }

    public List<Property> searchProperties(
            String keyword,
            String location,
            String propertyType,
            Double minPrice,
            Double maxPrice,
            Integer bedrooms,
            Integer bathrooms,
            Boolean furnished,
            Boolean parking,
            Boolean petsAllowed
    ) {
        return searchProperties(keyword, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, furnished, parking, petsAllowed, null, null);
    }

    public Map<String, Object> globalSearch(String keyword) {
        Map<String, Object> results = new HashMap<>();
        if (keyword == null || keyword.isBlank()) {
            results.put("properties", Collections.emptyList());
            results.put("roommates", Collections.emptyList());
            return results;
        }

        try {
            String query = keyword.trim().toLowerCase(Locale.ROOT);
            String[] terms = query.split("\\s+");

            // 1. Query Elasticsearch Property Documents
            List<PropertySearchDocument> propDocs = new ArrayList<>();
            propertySearchRepository.findAll().forEach(propDocs::add);

            if (propDocs.isEmpty()) {
                List<Property> dbProps = propertyRepository.findAll();
                if (!dbProps.isEmpty()) {
                    propDocs = new ArrayList<>(dbProps.stream().map(PropertySearchDocument::fromEntity).filter(Objects::nonNull).toList());
                    try {
                        propertySearchRepository.saveAll(propDocs);
                    } catch (Exception ignored) {}
                }
            }

            List<Long> matchedPropIds = propDocs.stream()
                    .filter(doc -> {
                        String text = joinText(
                                doc.getTitle(),
                                doc.getDescription(),
                                doc.getLocation(),
                                doc.getAddress(),
                                doc.getPropertyType(),
                                doc.getGenderPreference(),
                                doc.getSuitableFor(),
                                doc.getNumberOfPeople(),
                                joinList(doc.getOffers()),
                                joinList(doc.getHighlights()),
                                joinList(doc.getRules()),
                                joinList(doc.getNearby())
                        ).toLowerCase(Locale.ROOT);
                        for (String term : terms) {
                            if (text.contains(term)) {
                                return true;
                            }
                        }
                        return false;
                    })
                    .map(PropertySearchDocument::getId)
                    .filter(Objects::nonNull)
                    .toList();

            Map<Long, Property> propertyMap = propertyRepository.findAllById(matchedPropIds).stream()
                    .collect(Collectors.toMap(Property::getId, Function.identity()));

            List<Property> matchedProperties = matchedPropIds.stream()
                    .map(propertyMap::get)
                    .filter(Objects::nonNull)
                    .toList();

            // 2. Query Elasticsearch Roommate Documents
            List<RoommateSearchDocument> roomDocs = new ArrayList<>();
            roommateSearchRepository.findAll().forEach(roomDocs::add);

            if (roomDocs.isEmpty()) {
                List<RoommatePost> dbRooms = roommateRepository.findAll();
                if (!dbRooms.isEmpty()) {
                    roomDocs = new ArrayList<>(dbRooms.stream().map(RoommateSearchDocument::fromEntity).filter(Objects::nonNull).toList());
                    try {
                        roommateSearchRepository.saveAll(roomDocs);
                    } catch (Exception ignored) {}
                }
            }

            List<Long> matchedRoomIds = roomDocs.stream()
                    .filter(doc -> {
                        String text = joinText(
                                doc.getGender(),
                                doc.getOccupation(),
                                doc.getLocation(),
                                doc.getBio(),
                                doc.getAbout(),
                                doc.getInterests(),
                                doc.getPreferences(),
                                doc.getPreferredLocation(),
                                doc.getMoveInDate(),
                                doc.getPosterName(),
                                doc.getPosterEmail()
                        ).toLowerCase(Locale.ROOT);
                        for (String term : terms) {
                            if (text.contains(term)) {
                                return true;
                            }
                        }
                        return false;
                    })
                    .map(RoommateSearchDocument::getId)
                    .filter(Objects::nonNull)
                    .toList();

            Map<Long, RoommatePost> roommateMap = roommateRepository.findAllById(matchedRoomIds).stream()
                    .collect(Collectors.toMap(RoommatePost::getId, Function.identity()));

            List<RoommatePost> matchedRoommates = matchedRoomIds.stream()
                    .map(roommateMap::get)
                    .filter(Objects::nonNull)
                    .toList();

            results.put("properties", matchedProperties);
            results.put("roommates", matchedRoommates);
            return results;
        } catch (Exception ex) {
            System.err.println("Notice: Elasticsearch globalSearch fallback: " + ex.getMessage());
            results.put("properties", Collections.emptyList());
            results.put("roommates", Collections.emptyList());
            return results;
        }
    }

    public void syncRoommate(RoommatePost post) {
        try {
            RoommateSearchDocument document = RoommateSearchDocument.fromEntity(post);
            if (document != null) {
                roommateSearchRepository.save(document);
            }
        } catch (Exception ex) {
            System.err.println("Failed to sync roommate to search index: " + ex.getMessage());
        }
    }

    public void removeRoommate(Long roommateId) {
        try {
            if (roommateId != null) {
                roommateSearchRepository.deleteById(roommateId);
            }
        } catch (Exception ex) {
            System.err.println("Failed to remove roommate from search index: " + ex.getMessage());
        }
    }

    public void syncAllRoommates() {
        try {
            ensureIndexExists("roommates");
            List<RoommatePost> roommates = roommateRepository.findAll();
            try {
                roommateSearchRepository.deleteAll();
            } catch (Exception ignored) {
            }
            if (!roommates.isEmpty()) {
                roommateSearchRepository.saveAll(roommates.stream()
                        .map(RoommateSearchDocument::fromEntity)
                        .filter(Objects::nonNull)
                        .toList());
            }
            System.out.println("✓ Synced " + roommates.size() + " roommates to Elasticsearch");
        } catch (Exception ex) {
            System.err.println("Failed to sync all roommates to search index: " + ex.getMessage());
        }
    }

    public List<RoommatePost> searchRoommates(
            String keyword,
            String location,
            String preferredLocation,
            String gender,
            String occupation,
            String universityOrWorkplace,
            String roomTypePreference,
            Boolean smokingPreference,
            Boolean petFriendly,
            String foodPreference,
            Double minBudget,
            Double maxBudget
    ) {
        if (!hasAnyCriteria(keyword, location, preferredLocation, gender, occupation, universityOrWorkplace, roomTypePreference, smokingPreference, petFriendly, foodPreference, minBudget, maxBudget)) {
            return roommateRepository.findAll();
        }

        try {
            List<RoommateSearchDocument> documents = new ArrayList<>();
            roommateSearchRepository.findAll().forEach(documents::add);

            if (documents.isEmpty()) {
                List<RoommatePost> dbRooms = roommateRepository.findAll();
                if (!dbRooms.isEmpty()) {
                    documents = new ArrayList<>(dbRooms.stream().map(RoommateSearchDocument::fromEntity).filter(Objects::nonNull).toList());
                    try {
                        roommateSearchRepository.saveAll(documents);
                    } catch (Exception ignored) {}
                }
            }

            List<Long> matchedIds = documents.stream()
                    .filter(doc -> matchesRoommate(doc, keyword, location, preferredLocation, gender, occupation, universityOrWorkplace, roomTypePreference, smokingPreference, petFriendly, foodPreference, minBudget, maxBudget))
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
                RoommatePost roommatePost = roommateMap.get(id);
                if (roommatePost != null) {
                    ordered.add(roommatePost);
                }
            }

            return ordered;
        } catch (Exception ex) {
            System.err.println("Notice: Elasticsearch searchRoommates fallback to DB: " + ex.getMessage());
            return roommateRepository.findAll().stream()
                    .filter(post -> matchesRoommateEntity(post, keyword, location, preferredLocation, gender, occupation, universityOrWorkplace, roomTypePreference, smokingPreference, petFriendly, foodPreference, minBudget, maxBudget))
                    .toList();
        }
    }

    private boolean matchesProperty(
            PropertySearchDocument document,
            String keyword,
            String location,
            String propertyType,
            Double minPrice,
            Double maxPrice,
            Integer bedrooms,
            Integer bathrooms,
            Boolean furnished,
            Boolean parking,
            Boolean petsAllowed,
            String genderPreference,
            String suitableFor
    ) {
        String searchableText = joinText(
                document.getTitle(),
                document.getDescription(),
                document.getLocation(),
                document.getAddress(),
                document.getPropertyType(),
                document.getGenderPreference(),
                document.getSuitableFor(),
                document.getNumberOfPeople(),
                joinList(document.getOffers()),
                joinList(document.getHighlights()),
                joinList(document.getRules()),
                joinList(document.getNearby())
        );

        return matchesKeyword(searchableText, keyword)
                && matchesText(document.getLocation(), location)
                && matchesText(document.getAddress(), location)
                && matchesText(document.getPropertyType(), propertyType)
                && matchesPrice(document.getRent(), minPrice, maxPrice)
                && matchesNumber(document.getBedrooms(), bedrooms)
                && matchesNumber(document.getBathrooms(), bathrooms)
                && matchesBooleanText(document.getFurnished(), furnished)
                && matchesBooleanText(document.getParking(), parking)
                && matchesBooleanText(document.getPetsAllowed(), petsAllowed)
                && matchesGenderPreference(document.getGenderPreference(), genderPreference)
                && matchesSuitableFor(document.getSuitableFor(), suitableFor);
    }

    private boolean matchesGenderPreference(String actual, String expected) {
        if (expected == null || expected.isBlank() || expected.equalsIgnoreCase("Any") || expected.equalsIgnoreCase("All")) {
            return true;
        }
        if (actual == null || actual.isBlank()) {
            return true;
        }
        if (actual.equalsIgnoreCase("Both") || actual.equalsIgnoreCase("Any")) {
            return true;
        }
        return containsIgnoreCase(actual, expected) || containsIgnoreCase(expected, actual);
    }

    private boolean matchesSuitableFor(String actual, String expected) {
        if (expected == null || expected.isBlank() || expected.equalsIgnoreCase("Any") || expected.equalsIgnoreCase("All")) {
            return true;
        }
        if (actual == null || actual.isBlank()) {
            return true;
        }
        if (actual.equalsIgnoreCase("Any") || actual.equalsIgnoreCase("Anyone")) {
            return true;
        }
        return containsIgnoreCase(actual, expected) || containsIgnoreCase(expected, actual);
    }

    private boolean matchesRoommate(
            RoommateSearchDocument document,
            String keyword,
            String location,
            String preferredLocation,
            String gender,
            String occupation,
            String universityOrWorkplace,
            String roomTypePreference,
            Boolean smokingPreference,
            Boolean petFriendly,
            String foodPreference,
            Double minBudget,
            Double maxBudget
    ) {
        String searchableText = joinText(
                document.getGender(),
                document.getOccupation(),
                document.getLocation(),
                document.getBio(),
                document.getAbout(),
                document.getInterests(),
                document.getPreferences(),
                document.getPreferredLocation(),
                document.getMoveInDate(),
                document.getPosterName(),
                document.getPosterEmail()
        );

        return matchesKeyword(searchableText, keyword)
                && matchesText(document.getLocation(), location)
                && matchesText(document.getPreferredLocation(), preferredLocation)
                && matchesText(document.getGender(), gender)
                && matchesText(document.getOccupation(), occupation)
                && matchesText(searchableText, universityOrWorkplace)
                && matchesText(document.getPreferences(), roomTypePreference)
                && matchesBooleanText(document.getPreferences(), smokingPreference)
                && matchesBooleanText(document.getPreferences(), petFriendly)
                && matchesText(document.getPreferences(), foodPreference)
                && matchesPrice(document.getBudget(), minBudget, maxBudget);
    }

    private boolean hasAnyCriteria(Object... values) {
        for (Object value : values) {
            if (value instanceof String stringValue) {
                if (hasText(stringValue)) {
                    return true;
                }
            } else if (value instanceof Boolean booleanValue) {
                if (Boolean.TRUE.equals(booleanValue)) {
                    return true;
                }
            } else if (value instanceof Number number) {
                if (number.doubleValue() > 0) {
                    return true;
                }
            } else if (value != null) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesKeyword(String searchableText, String keyword) {
        return !hasText(keyword) || containsIgnoreCase(searchableText, keyword);
    }

    private boolean matchesText(String actual, String expected) {
        return !hasText(expected) || containsIgnoreCase(actual, expected);
    }

    private boolean matchesNumber(Integer actual, Integer expected) {
        return expected == null || expected <= 0 || (actual != null && actual >= expected);
    }

    private boolean matchesPrice(Double actual, Double minPrice, Double maxPrice) {
        if (actual == null) {
            return false;
        }

        boolean aboveMin = minPrice == null || minPrice <= 0 || actual >= minPrice;
        boolean belowMax = maxPrice == null || maxPrice <= 0 || actual <= maxPrice;
        return aboveMin && belowMax;
    }

    private boolean matchesBooleanText(String actual, Boolean expected) {
        if (expected == null) {
            return true;
        }

        boolean actualValue = toBoolean(actual);
        return actualValue == expected;
    }

    private boolean toBoolean(String value) {
        if (!hasText(value)) {
            return false;
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return normalized.equals("true")
                || normalized.equals("yes")
                || normalized.equals("1")
                || normalized.equals("available")
                || normalized.equals("furnished")
                || normalized.equals("allowed")
                || normalized.equals("allow")
                || normalized.equals("with parking")
                || normalized.equals("pet friendly")
                || normalized.equals("smoking")
                || normalized.equals("smoker");
    }

    private String joinText(String... values) {
        StringBuilder builder = new StringBuilder();
        for (String value : values) {
            if (hasText(value)) {
                if (builder.length() > 0) {
                    builder.append(' ');
                }
                builder.append(value.trim());
            }
        }
        return builder.toString();
    }

    private String joinList(Collection<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }
        return String.join(" ", values.stream().filter(Objects::nonNull).map(String::trim).filter(this::hasText).toList());
    }

    private boolean containsIgnoreCase(String source, String needle) {
        return hasText(source) && hasText(needle)
                && source.toLowerCase(Locale.ROOT).contains(needle.trim().toLowerCase(Locale.ROOT));
    }

    private boolean matchesPropertyEntity(
            Property property,
            String keyword,
            String location,
            String propertyType,
            Double minPrice,
            Double maxPrice,
            Integer bedrooms,
            Integer bathrooms,
            Boolean furnished,
            Boolean parking,
            Boolean petsAllowed,
            String genderPreference,
            String suitableFor
    ) {
        String searchableText = joinText(
                property.getTitle(),
                property.getDescription(),
                property.getLocation(),
                property.getAddress(),
                property.getPropertyType(),
                property.getGenderPreference(),
                property.getSuitableFor(),
                property.getNumberOfPeople(),
                joinList(property.getOffers()),
                joinList(property.getHighlights()),
                joinList(property.getRules()),
                joinList(property.getNearby())
        );

        return matchesKeyword(searchableText, keyword)
                && matchesText(property.getLocation(), location)
                && matchesText(property.getAddress(), location)
                && matchesText(property.getPropertyType(), propertyType)
                && matchesPrice(property.getRent(), minPrice, maxPrice)
                && matchesNumber(property.getBedrooms(), bedrooms)
                && matchesNumber(property.getBathrooms(), bathrooms)
                && matchesBooleanText(property.getFurnished(), furnished)
                && matchesBooleanText(property.getParking(), parking)
                && matchesBooleanText(property.getPetsAllowed(), petsAllowed)
                && matchesGenderPreference(property.getGenderPreference(), genderPreference)
                && matchesSuitableFor(property.getSuitableFor(), suitableFor);
    }

    private boolean matchesRoommateEntity(
            RoommatePost post,
            String keyword,
            String location,
            String preferredLocation,
            String gender,
            String occupation,
            String universityOrWorkplace,
            String roomTypePreference,
            Boolean smokingPreference,
            Boolean petFriendly,
            String foodPreference,
            Double minBudget,
            Double maxBudget
    ) {
        String posterName = post.getPoster() != null ? post.getPoster().getFullName() : "";
        String posterEmail = post.getPoster() != null ? post.getPoster().getEmail() : "";
        String searchableText = joinText(
                post.getGender(),
                post.getOccupation(),
                post.getLocation(),
                post.getBio(),
                post.getAbout(),
                post.getInterests(),
                post.getPreferences(),
                post.getPreferredLocation(),
                post.getMoveInDate(),
                posterName,
                posterEmail
        );

        return matchesKeyword(searchableText, keyword)
                && matchesText(post.getLocation(), location)
                && matchesText(post.getPreferredLocation(), preferredLocation)
                && matchesText(post.getGender(), gender)
                && matchesText(post.getOccupation(), occupation)
                && matchesText(searchableText, universityOrWorkplace)
                && matchesText(post.getPreferences(), roomTypePreference)
                && matchesBooleanText(post.getPreferences(), smokingPreference)
                && matchesBooleanText(post.getPreferences(), petFriendly)
                && matchesText(post.getPreferences(), foodPreference)
                && matchesPrice(post.getBudget(), minBudget, maxBudget);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
