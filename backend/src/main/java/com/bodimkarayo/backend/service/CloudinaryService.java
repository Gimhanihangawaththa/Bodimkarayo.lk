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
                    "overwrite", false
            ));
            Object secureUrl = result.get("secure_url");
            if (secureUrl != null && !secureUrl.toString().isBlank()) {
                return secureUrl.toString();
            }
        } catch (Exception ex) {
            System.err.println("Cloudinary property image upload failed: " + ex.getMessage() + ". Falling back to data URL.");
            return toDataUrl(file);
        }
        return toDataUrl(file);
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
                    "invalidate", true
            ));
            Object secureUrl = result.get("secure_url");
            if (secureUrl != null && !secureUrl.toString().isBlank()) {
                return secureUrl.toString();
            }
        } catch (Exception ex) {
            System.err.println("Cloudinary profile image upload failed for user " + userId + ": " + ex.getMessage() + ". Falling back to data URL.");
            return toDataUrl(file);
        }
        return toDataUrl(file);
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
            byte[] bytes = file.getBytes();
            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = "image/png";
            }

            if (bytes.length > 250 * 1024) {
                try {
                    java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(bytes);
                    java.awt.image.BufferedImage originalImage = javax.imageio.ImageIO.read(bais);
                    if (originalImage != null) {
                        int maxDim = 800;
                        int width = originalImage.getWidth();
                        int height = originalImage.getHeight();
                        if (width > maxDim || height > maxDim) {
                            double scale = Math.min((double) maxDim / width, (double) maxDim / height);
                            int targetWidth = Math.max(1, (int) (width * scale));
                            int targetHeight = Math.max(1, (int) (height * scale));

                            java.awt.image.BufferedImage resizedImage = new java.awt.image.BufferedImage(
                                    targetWidth, targetHeight, java.awt.image.BufferedImage.TYPE_INT_RGB);
                            java.awt.Graphics2D g = resizedImage.createGraphics();
                            g.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                            g.drawImage(originalImage, 0, 0, targetWidth, targetHeight, null);
                            g.dispose();

                            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                            javax.imageio.ImageIO.write(resizedImage, "jpg", baos);
                            bytes = baos.toByteArray();
                            contentType = "image/jpeg";
                        }
                    }
                } catch (Exception resizeEx) {
                    // Fall back to original bytes if resize cannot process image
                }
            }

            String encoded = Base64.getEncoder().encodeToString(bytes);
            return "data:" + contentType + ";base64," + encoded;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to process image upload", ex);
        }
    }
}
