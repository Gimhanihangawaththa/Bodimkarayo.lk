package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

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
        property.setImages(updatedProperty.getImages());
        property.setOwner(updatedProperty.getOwner());

        return propertyRepository.save(property);
    }

    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
    }
}
