package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.model.UserFavoriteProperty;
import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.UserFavoritePropertyRepository;
import com.bodimkarayo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserFavoritePropertyService {

    @Autowired
    private UserFavoritePropertyRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    public boolean isFavorite(Long userId, Long propertyId) {
        return favoriteRepository.existsByUser_IdAndProperty_Id(userId, propertyId);
    }

    public List<Property> listFavorites(Long userId) {
        return favoriteRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(UserFavoriteProperty::getProperty)
                .toList();
    }

    @Transactional
    public void addFavorite(Long userId, Long propertyId) {
        if (favoriteRepository.existsByUser_IdAndProperty_Id(userId, propertyId)) {
            return;
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        UserFavoriteProperty row = UserFavoriteProperty.builder()
                .user(user)
                .property(property)
                .build();
        favoriteRepository.save(row);
    }

    @Transactional
    public void removeFavorite(Long userId, Long propertyId) {
        favoriteRepository.deleteByUser_IdAndProperty_Id(userId, propertyId);
    }
}
