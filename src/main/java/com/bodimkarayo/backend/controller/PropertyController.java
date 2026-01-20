package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public Property create(@RequestBody Property property) {
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
}
