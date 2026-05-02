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
            prompt.append(String.format("ID: %d | Title: %s | Location: %s | Rent: Rs %.2f | Type: %s | Offers: %s | Highlights: %s\n",
                    p.getId(), p.getTitle(), p.getLocation(), p.getRent(), p.getPropertyType(), 
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
                textResponse = textResponse.replaceAll("```json", "").replaceAll("```", "").trim();
                
                JsonNode jsonArray = objectMapper.readTree(textResponse);
                List<RecommendationResponse> recommendations = new ArrayList<>();
                
                if (jsonArray.isArray()) {
                    for (JsonNode node : jsonArray) {
                        String type = node.path("type").asText();
                        Long itemId = node.path("itemId").asLong();
                        String explanation = node.path("aiExplanation").asText();
                        
                        if ("PROPERTY".equals(type)) {
                            Optional<Property> propertyOpt = propertyRepository.findById(itemId);
                            if (propertyOpt.isPresent()) {
                                recommendations.add(new RecommendationResponse("PROPERTY", propertyOpt.get(), null, explanation));
                            }
                        } else if ("ROOMMATE".equals(type)) {
                            Optional<RoommatePost> roommateOpt = roommateRepository.findById(itemId);
                            if (roommateOpt.isPresent()) {
                                recommendations.add(new RecommendationResponse("ROOMMATE", null, roommateOpt.get(), explanation));
                            }
                        }
                    }
                }
                return recommendations;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return Collections.emptyList();
    }
}
