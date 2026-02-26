package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.exception.BadRequestException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private static final long MAX_PROFILE_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L;

    @Autowired
    private Cloudinary cloudinary;

    public String uploadPropertyImage(MultipartFile file, Long propertyId) {
        validateImage(file, 15L * 1024L * 1024L);
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
}
