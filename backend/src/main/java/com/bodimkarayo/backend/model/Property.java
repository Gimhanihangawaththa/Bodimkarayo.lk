package com.bodimkarayo.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String location;
    private double rent;
    private String imageUrl;
    private String propertyType;
    private String availableFrom;
    private String address;
    private String numberOfPeople;
    private Integer bedrooms;
    private Integer kitchens;
    private Integer bathrooms;
    private String sizeSqft;
    private String floor;
    private String furnished;
    private String parking;
    private String security;
    private String petsAllowed;
    private String yearBuilt;
    private String mapEmbedUrl;

    @ElementCollection
    @CollectionTable(name = "property_offers", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "offer")
    private List<String> offers;

    @ElementCollection
    @CollectionTable(name = "property_highlights", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "highlight")
    private List<String> highlights;

    @ElementCollection
    @CollectionTable(name = "property_rules", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "rule_item")
    private List<String> rules;

    @ElementCollection
    @CollectionTable(name = "property_nearby", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "nearby_place")
    private List<String> nearby;

    @ElementCollection
    @CollectionTable(name = "property_images", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private List<String> images;

    @ManyToOne
    private User owner;
}
