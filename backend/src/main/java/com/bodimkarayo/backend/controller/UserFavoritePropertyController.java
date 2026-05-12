package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.service.UserFavoritePropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/favorites/properties")
public class UserFavoritePropertyController {

    @Autowired
    private UserFavoritePropertyService favoritePropertyService;

    private User requireCurrentUser(Authentication authentication, Long userId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User current)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        if (current.getId() == null || !current.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access your own favorites");
        }
        return current;
    }

    @GetMapping
    public List<Property> listFavorites(@PathVariable Long userId, Authentication authentication) {
        requireCurrentUser(authentication, userId);
        return favoritePropertyService.listFavorites(userId);
    }

    @GetMapping("/{propertyId}/status")
    public Map<String, Boolean> favoriteStatus(
            @PathVariable Long userId,
            @PathVariable Long propertyId,
            Authentication authentication
    ) {
        requireCurrentUser(authentication, userId);
        boolean favorited = favoritePropertyService.isFavorite(userId, propertyId);
        return Map.of("favorited", favorited);
    }

    @PostMapping("/{propertyId}")
    public void addFavorite(
            @PathVariable Long userId,
            @PathVariable Long propertyId,
            Authentication authentication
    ) {
        requireCurrentUser(authentication, userId);
        favoritePropertyService.addFavorite(userId, propertyId);
    }

    @DeleteMapping("/{propertyId}")
    public void removeFavorite(
            @PathVariable Long userId,
            @PathVariable Long propertyId,
            Authentication authentication
    ) {
        requireCurrentUser(authentication, userId);
        favoritePropertyService.removeFavorite(userId, propertyId);
    }
}
