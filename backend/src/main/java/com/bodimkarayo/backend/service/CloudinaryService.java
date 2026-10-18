package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.exception.BadRequestException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CloudinaryService {

    private static final long MAX_PROFILE_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final Pattern CLOUDINARY_PUBLIC_ID_PATTERN =
            Pattern.compile(".*/upload/(?:v\\d+/)?(.+)\\.[a-zA-Z0-9]+$");

    @Autowired
    private Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    public String uploadPropertyImage(MultipartFile file, Long propertyId) {
        validateImage(file, 15L * 1024L * 1024L);
        if (!isCloudinaryConfigured()) {
            return toDataUrl(file);
        }

        try {
            String publicId = "bodimkarayo/properties/" + propertyId + "/" + UUID.randomUUID();
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "image",
                    "public_id", publicId,
                    "overwrite", false,
                    "folder", "bodimkarayo/properties"
            ));
            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary upload failed to return a secure URL");
            }
            return secureUrl.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to upload property image", ex);
        }
    }

    public String uploadUserProfileImage(MultipartFile file, Long userId) {
        validateImage(file, MAX_PROFILE_IMAGE_SIZE_BYTES);
        if (!isCloudinaryConfigured()) {
            return toDataUrl(file);
        }

        try {
            String publicId = "bodimkarayo/users/" + userId + "/profile";
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "image",
                    "public_id", publicId,
                    "overwrite", true,
                    "invalidate", true,
                    "folder", "bodimkarayo/users"
            ));
            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary upload failed to return a secure URL");
            }
            return secureUrl.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to upload profile image", ex);
        }
    }

    public void deleteImageByUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        String publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", "image",
                    "invalidate", true
            ));
        } catch (Exception ex) {
            System.err.println("Failed to delete image from Cloudinary for publicId " + publicId + ": " + ex.getMessage());
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        String sanitized = imageUrl.split("\\?")[0];
        Matcher matcher = CLOUDINARY_PUBLIC_ID_PATTERN.matcher(sanitized);
        if (matcher.matches()) {
            return matcher.group(1);
        }
        return null;
    }

    private void validateImage(MultipartFile file, long maxSizeBytes) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        if (file.getSize() > maxSizeBytes) {
            throw new BadRequestException("Image size exceeds allowed limit");
        }
    }

    private boolean isCloudinaryConfigured() {
        return cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }

    private String toDataUrl(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = "image/png";
            }

            String encoded = Base64.getEncoder().encodeToString(file.getBytes());
            return "data:" + contentType + ";base64," + encoded;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to process image upload", ex);
        }
    }
}
