package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.UserFavoriteProperty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFavoritePropertyRepository extends JpaRepository<UserFavoriteProperty, Long> {

    boolean existsByUser_IdAndProperty_Id(Long userId, Long propertyId);

    Optional<UserFavoriteProperty> findByUser_IdAndProperty_Id(Long userId, Long propertyId);

    List<UserFavoriteProperty> findByUser_IdOrderByCreatedAtDesc(Long userId);

    void deleteByUser_IdAndProperty_Id(Long userId, Long propertyId);
}
