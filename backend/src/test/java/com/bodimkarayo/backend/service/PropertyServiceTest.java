package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.search.SearchIndexService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private SearchIndexService searchIndexService;

    @InjectMocks
    private PropertyService propertyService;

    private Property testProperty;
    private User testOwner;

    @BeforeEach
    void setUp() {
        testOwner = User.builder()
                .id(1L)
                .fullName("Owner Name")
                .email("owner@example.com")
                .build();

        testProperty = Property.builder()
                .id(10L)
                .title("Cozy Student Room in Katubedda")
                .description("Walking distance to university")
                .location("Katubedda")
                .address("123 Campus Road")
                .rent(25000.0)
                .propertyType("Room")
                .availableFrom("2026-11-01")
                .numberOfPeople("1 Person")
                .genderPreference("Male")
                .suitableFor("University Students")
                .bedrooms(1)
                .bathrooms(1)
                .furnished("Furnished")
                .parking("Available")
                .petsAllowed("No")
                .owner(testOwner)
                .images(new ArrayList<>(List.of("https://res.cloudinary.com/demo/image1.jpg")))
                .build();
    }

    @Test
    @DisplayName("Should return all properties")
    void getAllProperties_ReturnsList() {
        when(propertyRepository.findAll()).thenReturn(List.of(testProperty));

        List<Property> result = propertyService.getAllProperties();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Cozy Student Room in Katubedda", result.get(0).getTitle());
        verify(propertyRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return property by ID when it exists")
    void getPropertyById_Found() {
        when(propertyRepository.findById(10L)).thenReturn(Optional.of(testProperty));

        Optional<Property> result = propertyService.getPropertyById(10L);

        assertTrue(result.isPresent());
        assertEquals(10L, result.get().getId());
        assertEquals(25000.0, result.get().getRent());
    }

    @Test
    @DisplayName("Should return empty optional when property ID does not exist")
    void getPropertyById_NotFound() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Property> result = propertyService.getPropertyById(999L);

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should save property and synchronize with search index")
    void createProperty_Success() {
        when(propertyRepository.save(any(Property.class))).thenReturn(testProperty);

        Property saved = propertyService.createProperty(testProperty);

        assertNotNull(saved);
        assertEquals(10L, saved.getId());
        verify(propertyRepository, times(1)).save(testProperty);
        verify(searchIndexService, times(1)).syncProperty(testProperty);
    }

    @Test
    @DisplayName("Should update property details and sync with search index")
    void updateProperty_Success() {
        Property updatedDetails = Property.builder()
                .title("Luxury Annex in Katubedda")
                .location("Katubedda")
                .rent(30000.0)
                .propertyType("Annex")
                .genderPreference("Both")
                .suitableFor("Couples")
                .build();

        when(propertyRepository.findById(10L)).thenReturn(Optional.of(testProperty));
        when(propertyRepository.save(any(Property.class))).thenReturn(testProperty);

        Property updated = propertyService.updateProperty(10L, updatedDetails);

        assertNotNull(updated);
        assertEquals("Luxury Annex in Katubedda", updated.getTitle());
        assertEquals(30000.0, updated.getRent());
        assertEquals("Annex", updated.getPropertyType());
        verify(propertyRepository, times(1)).save(testProperty);
        verify(searchIndexService, times(1)).syncProperty(testProperty);
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent property")
    void updateProperty_NotFound_ThrowsException() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> propertyService.updateProperty(999L, testProperty));
        verify(propertyRepository, never()).save(any(Property.class));
    }

    @Test
    @DisplayName("Should delete property and remove from search index")
    void deleteProperty_Success() {
        doNothing().when(propertyRepository).deleteById(10L);

        propertyService.deleteProperty(10L);

        verify(propertyRepository, times(1)).deleteById(10L);
        verify(searchIndexService, times(1)).removeProperty(10L);
    }

    @Test
    @DisplayName("Should filter properties via search service")
    void searchProperties_Success() {
        when(searchIndexService.searchProperties(
                eq("Katubedda"), eq("Katubedda"), eq("Room"),
                eq(10000.0), eq(30000.0), eq(1), eq(1),
                eq(true), eq(true), eq(false),
                eq("Male"), eq("University Students")
        )).thenReturn(List.of(testProperty));

        List<Property> results = propertyService.searchProperties(
                "Katubedda", "Katubedda", "Room",
                10000.0, 30000.0, 1, 1,
                true, true, false,
                "Male", "University Students"
        );

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Katubedda", results.get(0).getLocation());
    }
}
