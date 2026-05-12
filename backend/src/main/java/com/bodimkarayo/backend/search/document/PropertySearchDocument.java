package com.bodimkarayo.backend.search.document;

import com.bodimkarayo.backend.model.Property;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "properties", createIndex = false)
public class PropertySearchDocument {

    @Id
    private Long id;

    @Field(type = FieldType.Text)
    private String title;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Text)
    private String location;

    @Field(type = FieldType.Double)
    private Double rent;

    @Field(type = FieldType.Text)
    private String propertyType;

    @Field(type = FieldType.Text)
    private String availableFrom;

    @Field(type = FieldType.Text)
    private String address;

    @Field(type = FieldType.Integer)
    private Integer bedrooms;

    @Field(type = FieldType.Integer)
    private Integer bathrooms;

    @Field(type = FieldType.Text)
    private String furnished;

    @Field(type = FieldType.Text)
    private String parking;

    @Field(type = FieldType.Text)
    private String petsAllowed;

    @Field(type = FieldType.Text)
    private List<String> offers;

    @Field(type = FieldType.Text)
    private List<String> highlights;

    @Field(type = FieldType.Text)
    private List<String> rules;

    @Field(type = FieldType.Text)
    private List<String> nearby;

    @Field(type = FieldType.Text)
    private List<String> images;

    public static PropertySearchDocument fromEntity(Property property) {
        if (property == null) {
            return null;
        }

        return PropertySearchDocument.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .location(property.getLocation())
                .rent(property.getRent())
                .propertyType(property.getPropertyType())
                .availableFrom(property.getAvailableFrom())
                .address(property.getAddress())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .furnished(property.getFurnished())
                .parking(property.getParking())
                .petsAllowed(property.getPetsAllowed())
                .offers(property.getOffers())
                .highlights(property.getHighlights())
                .rules(property.getRules())
                .nearby(property.getNearby())
                .images(property.getImages())
                .build();
    }
}
