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

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public Optional<Property> getPropertyById(Long id) {
        return propertyRepository.findById(id);
    }

    public Property createProperty(Property property) {
        return propertyRepository.save(property);
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

        return propertyRepository.save(property);
    }

    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
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
            propertyRepository.save(property);
            
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
}
