package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.dto.RecommendationRequest;
import com.bodimkarayo.backend.dto.RecommendationResponse;
import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.RoommateRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiRecommendationService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Autowired
    private PropertyRepository propertyRepository;
    
    @Autowired
    private RoommateRepository roommateRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<RecommendationResponse> getRecommendations(RecommendationRequest request) {
        List<Property> allProperties = propertyRepository.findAll();
        List<RoommatePost> allRoommates = roommateRepository.findAll();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI Matchmaker for Bodimkarayo.lk in Sri Lanka. ");
        prompt.append("A user is looking for a place or a roommate with the following preferences:\n");
        if(request.getPreferences() != null) prompt.append("- Preferences: ").append(request.getPreferences()).append("\n");
        if(request.getMaxBudget() != null) prompt.append("- Max Budget: Rs ").append(request.getMaxBudget()).append("\n");
        if(request.getPreferredLocation() != null) prompt.append("- Preferred Location: ").append(request.getPreferredLocation()).append("\n");
        if(request.getPropertyType() != null) prompt.append("- Property Type: ").append(request.getPropertyType()).append("\n");
        
        prompt.append("\nHere is a list of available properties:\n");
        for (Property p : allProperties) {
            prompt.append(String.format("ID: %d | Title: %s | Location: %s | Rent: Rs %.2f | Type: %s | Gender: %s | Suitable For: %s | Capacity: %s | Offers: %s | Highlights: %s\n",
                    p.getId(), p.getTitle(), p.getLocation(), p.getRent(), p.getPropertyType(), 
                    p.getGenderPreference(), p.getSuitableFor(), p.getNumberOfPeople(),
                    p.getOffers(), p.getHighlights()));
        }
        
        prompt.append("\nHere is a list of available roommate posts:\n");
        for (RoommatePost r : allRoommates) {
            prompt.append(String.format("ID: %d | Gender: %s | Age: %s | Location: %s | Budget: Rs %.2f | Interests: %s | Bio: %s\n",
                    r.getId(), r.getGender(), r.getAge(), r.getLocation(), r.getBudget(), r.getInterests(), r.getBio()));
        }
        
        prompt.append("\nPlease recommend the top 3 best matching items (can be properties or roommate posts) from the lists above based on what the user is looking for. ");
        prompt.append("Respond STRICTLY in JSON format as a list of objects. Each object should have exactly three keys: ");
        prompt.append("\"type\" (must be exactly \"PROPERTY\" or \"ROOMMATE\"), \"itemId\" (the integer ID), and \"aiExplanation\" (a 1-sentence personalized explanation of why it's a good match). ");
        prompt.append("Do not include markdown formatting blocks like ```json.");

        String url = apiUrl + "?key=" + apiKey;
        
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt.toString());
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));
        
        requestBody.put("contents", Collections.singletonList(content));
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String responseStr = restTemplate.postForObject(url, entity, String.class);
            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                String textResponse = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                // Robust JSON extraction
                int start = textResponse.indexOf("[");
                int end = textResponse.lastIndexOf("]");
                if (start != -1 && end != -1 && end > start) {
                    textResponse = textResponse.substring(start, end + 1);
                }

                JsonNode jsonArray = objectMapper.readTree(textResponse);
                List<RecommendationResponse> recommendations = new ArrayList<>();
                
                if (jsonArray.isArray()) {
                    for (JsonNode node : jsonArray) {
                        String type = node.path("type").asText();
                        Long itemId = node.has("itemId") ? node.path("itemId").asLong() : node.path("id").asLong();
                        String explanation = node.path("aiExplanation").asText();
                        
                        if ("PROPERTY".equalsIgnoreCase(type)) {
                            Optional<Property> propertyOpt = propertyRepository.findById(itemId);
                            if (propertyOpt.isPresent()) {
                                recommendations.add(new RecommendationResponse("PROPERTY", propertyOpt.get(), null, explanation));
                            }
                        } else if ("ROOMMATE".equalsIgnoreCase(type)) {
                            Optional<RoommatePost> roommateOpt = roommateRepository.findById(itemId);
                            if (roommateOpt.isPresent()) {
                                recommendations.add(new RecommendationResponse("ROOMMATE", null, roommateOpt.get(), explanation));
                            }
                        }
                    }
                }
                if (!recommendations.isEmpty()) {
                    return recommendations;
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API notice: " + e.getMessage() + ". Activating smart matcher fallback.");
        }
        
        // Smart fallback matchmaker if AI API is temporarily unavailable
        return getAlgorithmicRecommendations(request, allProperties, allRoommates);
    }

    private List<RecommendationResponse> getAlgorithmicRecommendations(
            RecommendationRequest request,
            List<Property> allProperties,
            List<RoommatePost> allRoommates
    ) {
        List<RecommendationResponse> results = new ArrayList<>();
        String prefLoc = request.getPreferredLocation() != null ? request.getPreferredLocation().toLowerCase().trim() : "";
        Double maxBudget = request.getMaxBudget();
        String propType = request.getPropertyType() != null ? request.getPropertyType().toLowerCase().trim() : "";
        String preferences = request.getPreferences() != null ? request.getPreferences().toLowerCase().trim() : "";

        // Rank properties
        for (Property p : allProperties) {
            int score = 0;
            StringBuilder why = new StringBuilder();

            if (!prefLoc.isEmpty() && p.getLocation() != null && p.getLocation().toLowerCase().contains(prefLoc)) {
                score += 40;
                why.append("Prime location in ").append(p.getLocation()).append(". ");
            }
            if (maxBudget != null && p.getRent() <= maxBudget) {
                score += 30;
                why.append(String.format("Fits within your Rs %.0f budget at Rs %.0f/month. ", maxBudget, p.getRent()));
            }
            if (!propType.isEmpty() && p.getPropertyType() != null && p.getPropertyType().toLowerCase().contains(propType)) {
                score += 20;
                why.append("Matches desired type (").append(p.getPropertyType()).append("). ");
            }
            if (!preferences.isEmpty() && p.getDescription() != null) {
                for (String word : preferences.split("\\s+")) {
                    if (word.length() > 3 && p.getDescription().toLowerCase().contains(word)) {
                        score += 5;
                    }
                }
            }

            if (score > 0) {
                String explanation = why.length() > 0 ? why.toString().trim() : "Matches your accommodation preferences and budget criteria.";
                results.add(new RecommendationResponse("PROPERTY", p, null, explanation));
            }
        }

        // Rank roommates
        for (RoommatePost r : allRoommates) {
            int score = 0;
            StringBuilder why = new StringBuilder();

            if (!prefLoc.isEmpty() && (
                    (r.getLocation() != null && r.getLocation().toLowerCase().contains(prefLoc)) ||
                    (r.getPreferredLocation() != null && r.getPreferredLocation().toLowerCase().contains(prefLoc)))) {
                score += 40;
                why.append("Looking in your target area (").append(r.getLocation()).append("). ");
            }
            if (maxBudget != null && r.getBudget() != null && r.getBudget() <= maxBudget + 5000) {
                score += 30;
                why.append(String.format("Compatible budget of Rs %.0f. ", r.getBudget()));
            }
            if (!preferences.isEmpty() && r.getBio() != null) {
                for (String word : preferences.split("\\s+")) {
                    if (word.length() > 3 && r.getBio().toLowerCase().contains(word)) {
                        score += 5;
                    }
                }
            }

            if (score > 0) {
                String explanation = why.length() > 0 ? why.toString().trim() : "Compatible lifestyle, target location, and budget.";
                results.add(new RecommendationResponse("ROOMMATE", null, r, explanation));
            }
        }

        // If no strict score match, recommend top available listings
        if (results.isEmpty()) {
            if (!allProperties.isEmpty()) {
                Property firstP = allProperties.get(0);
                results.add(new RecommendationResponse("PROPERTY", firstP, null, "Recommended listing matching general accommodation preferences."));
            }
            if (!allRoommates.isEmpty()) {
                RoommatePost firstR = allRoommates.get(0);
                results.add(new RecommendationResponse("ROOMMATE", null, firstR, "Active roommate profile matching general student and professional criteria."));
            }
        }

        return results.stream().limit(3).toList();
    }
}
