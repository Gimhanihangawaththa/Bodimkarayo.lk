package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.Locale;

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired(required = false)
    private com.bodimkarayo.backend.search.SearchIndexService searchIndexService;

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public Optional<Property> getPropertyById(Long id) {
        return propertyRepository.findById(id);
    }

    public Property createProperty(Property property) {
        Property savedProperty = propertyRepository.save(property);
        if (searchIndexService != null) {
            searchIndexService.syncProperty(savedProperty);
        }
        return savedProperty;
    }

    public Property updateProperty(Long id, Property updatedProperty) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        property.setTitle(updatedProperty.getTitle());
        property.setLocation(updatedProperty.getLocation());
        property.setRent(updatedProperty.getRent());
        property.setDescription(updatedProperty.getDescription());
        property.setPropertyType(updatedProperty.getPropertyType());
        property.setAvailableFrom(updatedProperty.getAvailableFrom());
        property.setAddress(updatedProperty.getAddress());
        property.setNumberOfPeople(updatedProperty.getNumberOfPeople());
        property.setGenderPreference(updatedProperty.getGenderPreference());
        property.setSuitableFor(updatedProperty.getSuitableFor());
        property.setBedrooms(updatedProperty.getBedrooms());
        property.setKitchens(updatedProperty.getKitchens());
        property.setBathrooms(updatedProperty.getBathrooms());
        property.setFloor(updatedProperty.getFloor());
        property.setFurnished(updatedProperty.getFurnished());
        property.setParking(updatedProperty.getParking());
        property.setPetsAllowed(updatedProperty.getPetsAllowed());
        property.setMapEmbedUrl(updatedProperty.getMapEmbedUrl());
        property.setOffers(updatedProperty.getOffers());
        property.setHighlights(updatedProperty.getHighlights());
        property.setRules(updatedProperty.getRules());
        property.setNearby(updatedProperty.getNearby());
        // Don't update images here - images are only updated via the separate POST /{id}/images endpoint
        // property.setImages(updatedProperty.getImages());
        property.setOwner(updatedProperty.getOwner());

        Property savedProperty = propertyRepository.save(property);
        if (searchIndexService != null) {
            searchIndexService.syncProperty(savedProperty);
        }
        return savedProperty;
    }

    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
        if (searchIndexService != null) {
            searchIndexService.removeProperty(id);
        }
    }

    public Property removePropertyImage(Long propertyId, String imageUrl) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        List<String> existingImages = property.getImages();
        if (existingImages == null || existingImages.isEmpty()) {
            return property;
        }

        boolean removed = existingImages.removeIf(url -> url != null && url.equals(imageUrl));
        if (removed) {
            property.setImages(existingImages);
            property = propertyRepository.save(property);
            cloudinaryService.deleteImageByUrl(imageUrl);
        }

        return property;
    }

    /**
     * Synchronous method to upload images and update property
     * Returns the updated property with images
     */
    public Property uploadPropertyImages(Long propertyId, List<MultipartFile> imageFiles) {
        try {
            if (imageFiles == null || imageFiles.isEmpty()) {
                return propertyRepository.findById(propertyId)
                        .orElseThrow(() -> new RuntimeException("Property not found"));
            }

            // Upload images in parallel
            List<CompletableFuture<String>> uploadFutures = imageFiles.stream()
                    .filter(file -> file != null && !file.isEmpty())
                    .map(file -> CompletableFuture.supplyAsync(() -> 
                            cloudinaryService.uploadPropertyImage(file, propertyId)))
                    .collect(Collectors.toList());
            
            // Wait for all uploads to complete
            List<String> imageUrls = uploadFutures.stream()
                    .map(CompletableFuture::join)
                    .collect(Collectors.toList());

            // Update property with images
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found"));
            
            // Append new images to existing images (don't replace)
            List<String> existingImages = property.getImages();
            if (existingImages == null) {
                existingImages = new ArrayList<>();
            }
            existingImages.addAll(imageUrls);
            property.setImages(existingImages);
            property = propertyRepository.save(property);
            if (searchIndexService != null) {
                searchIndexService.syncProperty(property);
            }
            
            System.out.println("Property " + propertyId + " images uploaded successfully: " + imageUrls.size() + " new images added");
            return property;
        } catch (Exception e) {
            System.err.println("Error uploading images for property " + propertyId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to upload images", e);
        }
    }

    /**
     * Async method to upload images and update property
     * Runs in background thread pool - doesn't block the response
     */
    @Async
    public void uploadPropertyImagesAsync(Long propertyId, List<MultipartFile> imageFiles) {
        try {
            uploadPropertyImages(propertyId, imageFiles);
        } catch (Exception e) {
            System.err.println("Error in async upload for property " + propertyId + ": " + e.getMessage());
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
        if (searchIndexService != null) {
            try {
                return searchIndexService.searchProperties(keyword, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, furnished, parking, petsAllowed, genderPreference, suitableFor);
            } catch (Exception ex) {
                System.err.println("SearchIndexService search error, falling back to database: " + ex.getMessage());
            }
        }
        return propertyRepository.findAll().stream()
                .filter(property -> matchesProperty(property, keyword, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, furnished, parking, petsAllowed, genderPreference, suitableFor))
                .toList();
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

    private boolean matchesProperty(
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

    private boolean matchesKeyword(String source, String keyword) {
        return keyword == null || keyword.isBlank() || containsIgnoreCase(source, keyword);
    }

    private boolean matchesText(String source, String expected) {
        return expected == null || expected.isBlank() || containsIgnoreCase(source, expected);
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
                || normalized.equals("available")
                || normalized.equals("furnished")
                || normalized.equals("allowed")
                || normalized.equals("allow")
                || normalized.equals("with parking")
                || normalized.equals("pet friendly")
                || normalized.equals("pets allowed")
                || normalized.equals("yes, pets allowed");
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

    private String joinList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }
        return String.join(" ", values.stream().filter(value -> value != null && !value.isBlank()).map(String::trim).toList());
    }

    private boolean containsIgnoreCase(String source, String needle) {
        return source != null && needle != null && source.toLowerCase(Locale.ROOT).contains(needle.trim().toLowerCase(Locale.ROOT));
    }
}
