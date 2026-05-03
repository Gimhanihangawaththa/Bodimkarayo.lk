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
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "app.search.elasticsearch-enabled", havingValue = "true")
public class SearchIndexService {

    private final PropertyRepository propertyRepository;
    private final RoommateRepository roommateRepository;
    private final PropertySearchRepository propertySearchRepository;
    private final RoommateSearchRepository roommateSearchRepository;

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

    @EventListener(ApplicationReadyEvent.class)
    public void reindexOnStartup() {
        try {
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
            List<Property> properties = propertyRepository.findAll();
            propertySearchRepository.deleteAll();
            if (!properties.isEmpty()) {
                propertySearchRepository.saveAll(properties.stream()
                        .map(PropertySearchDocument::fromEntity)
                        .filter(Objects::nonNull)
                        .toList());
            }
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
            Boolean petsAllowed
    ) {
        if (!hasAnyCriteria(keyword, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, furnished, parking, petsAllowed)) {
            return propertyRepository.findAll();
        }

        List<PropertySearchDocument> documents = new ArrayList<>();
        propertySearchRepository.findAll().forEach(documents::add);

        List<Long> matchedIds = documents.stream()
                .filter(doc -> matchesProperty(doc, keyword, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, furnished, parking, petsAllowed))
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
            List<RoommatePost> roommates = roommateRepository.findAll();
            roommateSearchRepository.deleteAll();
            if (!roommates.isEmpty()) {
                roommateSearchRepository.saveAll(roommates.stream()
                        .map(RoommateSearchDocument::fromEntity)
                        .filter(Objects::nonNull)
                        .toList());
            }
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

        List<RoommateSearchDocument> documents = new ArrayList<>();
        roommateSearchRepository.findAll().forEach(documents::add);

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
            Boolean petsAllowed
    ) {
        String searchableText = joinText(
                document.getTitle(),
                document.getDescription(),
                document.getLocation(),
                document.getAddress(),
                document.getPropertyType(),
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
                && matchesBooleanText(document.getPetsAllowed(), petsAllowed);
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

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
