package com.bodimkarayo.backend.search.document;

import com.bodimkarayo.backend.model.RoommatePost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "roommates", createIndex = false)
public class RoommateSearchDocument {

    @Id
    private Long id;

    @Field(type = FieldType.Text)
    private String gender;

    @Field(type = FieldType.Integer)
    private Integer age;

    @Field(type = FieldType.Text)
    private String occupation;

    @Field(type = FieldType.Text)
    private String location;

    @Field(type = FieldType.Text)
    private String bio;

    @Field(type = FieldType.Text)
    private String about;

    @Field(type = FieldType.Text)
    private String interests;

    @Field(type = FieldType.Text)
    private String preferences;

    @Field(type = FieldType.Text)
    private String preferredLocation;

    @Field(type = FieldType.Text)
    private String moveInDate;

    @Field(type = FieldType.Double)
    private Double budget;

    @Field(type = FieldType.Text)
    private String posterName;

    @Field(type = FieldType.Text)
    private String posterEmail;

    @Field(type = FieldType.Boolean)
    private Boolean posterVerified;

    public static RoommateSearchDocument fromEntity(RoommatePost post) {
        if (post == null) {
            return null;
        }

        return RoommateSearchDocument.builder()
                .id(post.getId())
                .gender(post.getGender())
                .age(post.getAge())
                .occupation(post.getOccupation())
                .location(post.getLocation())
                .bio(post.getBio())
                .about(post.getAbout())
                .interests(post.getInterests())
                .preferences(post.getPreferences())
                .preferredLocation(post.getPreferredLocation())
                .moveInDate(post.getMoveInDate())
                .budget(post.getBudget())
                .posterName(post.getPoster() != null ? post.getPoster().getFullName() : null)
                .posterEmail(post.getPoster() != null ? post.getPoster().getEmail() : null)
                .posterVerified(post.getPoster() != null && Boolean.TRUE.equals(post.getPoster().getVerified()))
                .build();
    }
}
