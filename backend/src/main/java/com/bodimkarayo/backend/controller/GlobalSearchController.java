package com.bodimkarayo.backend.controller;

import com.bodimkarayo.backend.service.GlobalSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class GlobalSearchController {

    @Autowired
    private GlobalSearchService globalSearchService;

    @Autowired(required = false)
    private com.bodimkarayo.backend.search.SearchIndexService searchIndexService;

    @GetMapping("/global")
    public Map<String, Object> globalSearch(@RequestParam(required = false) String keyword) {
        return globalSearchService.globalSearch(keyword);
    }

    @RequestMapping(value = "/sync", method = {RequestMethod.GET, RequestMethod.POST})
    public Map<String, Object> syncIndices() {
        if (searchIndexService != null) {
            searchIndexService.reindexOnStartup();
            return Map.of("status", "success", "message", "Elasticsearch indices synchronized successfully");
        }
        return Map.of("status", "skipped", "message", "Elasticsearch service is not active");
    }
}
