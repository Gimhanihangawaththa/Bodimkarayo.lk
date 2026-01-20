package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.Property;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.bodimkarayo.backend.repository.PropertyRepository;

import java.util.List;

// controller/PropertyController.java
@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    @Autowired
    private PropertyRepository repo;

    @PostMapping
    public Property add(@RequestBody Property p) {
        return repo.save(p);
    }

    @GetMapping
    public List<Property> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Property get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public Property update(@PathVariable Long id, @RequestBody Property p) {
        p.setId(id);
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
