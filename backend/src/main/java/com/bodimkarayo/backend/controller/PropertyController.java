package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    @GetMapping
    public List<Property> getAll() {
        return propertyService.getAllProperties();
    }

    @GetMapping("/{id}")
    public Property getById(@PathVariable Long id) {
        return propertyService.getPropertyById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public Property create(@RequestBody Property property) {
        return propertyService.createProperty(property);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Property createMultipart(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String price,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) String availableFrom,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String numberOfPeople,
            @RequestParam(required = false) String bedrooms,
            @RequestParam(required = false) String kitchens,
            @RequestParam(required = false) String bathrooms,
            @RequestParam(required = false) String sizeSqft,
            @RequestParam(required = false) String floor,
            @RequestParam(required = false) String furnished,
            @RequestParam(required = false) String parking,
            @RequestParam(required = false) String security,
            @RequestParam(required = false) String petsAllowed,
            @RequestParam(required = false) String yearBuilt,
            @RequestParam(required = false) String mapEmbedUrl,
            @RequestParam(required = false) String offers,
            @RequestParam(required = false) String highlights,
            @RequestParam(required = false) String rules,
            @RequestParam(required = false) String nearby,
            @RequestParam(value = "images", required = false) List<MultipartFile> imageFiles
    ) {
        List<String> imageDataUrls = convertImagesToDataUrls(imageFiles);

        Property property = Property.builder()
                .title(title)
                .description(description)
                .location(location)
                .rent(parseDouble(price))
                .propertyType(propertyType)
                .availableFrom(availableFrom)
                .address(address)
                .numberOfPeople(numberOfPeople)
                .bedrooms(parseInteger(bedrooms))
                .kitchens(parseInteger(kitchens))
                .bathrooms(parseInteger(bathrooms))
                .sizeSqft(sizeSqft)
                .floor(floor)
                .furnished(furnished)
                .parking(parking)
                .security(security)
                .petsAllowed(petsAllowed)
                .yearBuilt(yearBuilt)
                .mapEmbedUrl(mapEmbedUrl)
                .offers(parseStringList(offers))
                .highlights(parseStringList(highlights))
                .rules(parseStringList(rules))
                .nearby(parseStringList(nearby))
                .images(imageDataUrls)
                .imageUrl(imageDataUrls.isEmpty() ? null : imageDataUrls.get(0))
                .build();

        return propertyService.createProperty(property);
    }

    @PutMapping("/{id}")
    public Property update(@PathVariable Long id, @RequestBody Property property) {
        return propertyService.updateProperty(id, property);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        propertyService.deleteProperty(id);
    }

    private List<String> parseStringList(String value) {
        if (value == null || value.isBlank()) {
            return new ArrayList<>();
        }

        String normalized = value.trim();
        if (normalized.startsWith("[") && normalized.endsWith("]")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }

        List<String> result = new ArrayList<>();
        if (normalized.isBlank()) {
            return result;
        }

        String[] parts = normalized.split(",");
        for (String part : parts) {
            String cleaned = part.trim();
            if (cleaned.startsWith("\"") && cleaned.endsWith("\"") && cleaned.length() >= 2) {
                cleaned = cleaned.substring(1, cleaned.length() - 1);
            }
            if (!cleaned.isBlank()) {
                result.add(cleaned);
            }
        }

        return result;
    }

    private double parseDouble(String value) {
        try {
            return value == null || value.isBlank() ? 0.0 : Double.parseDouble(value);
        } catch (Exception ex) {
            return 0.0;
        }
    }

    private Integer parseInteger(String value) {
        try {
            return value == null || value.isBlank() ? null : Integer.parseInt(value);
        } catch (Exception ex) {
            return null;
        }
    }

    private List<String> convertImagesToDataUrls(List<MultipartFile> imageFiles) {
        List<String> dataUrls = new ArrayList<>();
        if (imageFiles == null) {
            return dataUrls;
        }

        for (MultipartFile imageFile : imageFiles) {
            if (imageFile == null || imageFile.isEmpty()) {
                continue;
            }

            try {
                String contentType = imageFile.getContentType() == null ? "image/jpeg" : imageFile.getContentType();
                String base64 = Base64.getEncoder().encodeToString(imageFile.getBytes());
                dataUrls.add("data:" + contentType + ";base64," + base64);
            } catch (IOException ignored) {
            }
        }

        return dataUrls;
    }
}
