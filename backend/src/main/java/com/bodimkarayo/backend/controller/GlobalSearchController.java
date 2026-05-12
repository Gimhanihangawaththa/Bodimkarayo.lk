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

    @GetMapping("/global")
    public Map<String, Object> globalSearch(@RequestParam(required = false) String keyword) {
        return globalSearchService.globalSearch(keyword);
    }
}
