package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByLocationContaining(String location);
}
