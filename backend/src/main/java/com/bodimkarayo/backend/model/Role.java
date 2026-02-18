package com.bodimkarayo.backend.model;

public enum Role {
    USER,    // Regular users - can view properties and apply as roommate
    OWNER,   // Property owners - can manage properties + all USER features
    ADMIN    // Administrators - can access admin features + all OWNER features
}
