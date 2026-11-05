package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.model.UserFavoriteProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserFavoritePropertyRepository extends JpaRepository<UserFavoriteProperty, Long> {

    boolean existsByUser_IdAndProperty_Id(Long userId, Long propertyId);

    Optional<UserFavoriteProperty> findByUser_IdAndProperty_Id(Long userId, Long propertyId);

    List<UserFavoriteProperty> findByUser_IdOrderByCreatedAtDesc(Long userId);

    void deleteByUser_IdAndProperty_Id(Long userId, Long propertyId);

    @Transactional
    @Modifying
    @Query("DELETE FROM UserFavoriteProperty ufp WHERE ufp.user = :user")
    void deleteByUser(@Param("user") User user);

    @Transactional
    @Modifying
    @Query("DELETE FROM UserFavoriteProperty ufp WHERE ufp.property = :property")
    void deleteByProperty(@Param("property") Property property);
}
