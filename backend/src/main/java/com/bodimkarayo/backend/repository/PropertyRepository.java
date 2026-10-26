package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.bodimkarayo.backend.model.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByLocationContaining(String location);
    List<Property> findByOwner(User owner);

    @Query("SELECT p FROM Property p LEFT JOIN FETCH p.images WHERE p.id = :id")
    Optional<Property> findByIdWithImages(@Param("id") Long id);
}

