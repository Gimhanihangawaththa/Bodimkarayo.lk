package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.bodimkarayo.backend.model.User;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByLocationContaining(String location);
    List<Property> findByOwner(User owner);
    List<Property> findByOwnerOrderByIdDesc(User owner);
    List<Property> findByStatusOrderByIdDesc(String status);
    List<Property> findAllByOrderByIdDesc();
    long countByStatus(String status);
}
