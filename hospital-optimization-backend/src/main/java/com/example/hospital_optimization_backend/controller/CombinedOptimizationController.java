package com.example.hospital_optimization_backend.controller;

import com.example.hospital_optimization_backend.service.CombinedOptimizationService;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/combined")
@CrossOrigin(origins = "*")
public class CombinedOptimizationController {

    private final CombinedOptimizationService service;

    public CombinedOptimizationController(CombinedOptimizationService service) {
        this.service = service;
    }

    /**
     * Generate a combined scenario with items from all selected modules.
     * Example: GET /api/combined/generate?modules=icu,or,drug
     */
    @GetMapping("/generate")
    public CombinedOptimizationService.CombinedScenario generateScenario(
            @RequestParam String modules) {
        List<String> moduleIds = Arrays.asList(modules.split(","));
        return service.generateCombinedScenario(moduleIds);
    }

    /**
     * Run combined Greedy vs DP comparison on the shared resource pool.
     */
    @PostMapping("/compare")
    public CombinedOptimizationService.CombinedResult compare(
            @RequestBody CombinedOptimizationService.CombinedScenario scenario) {
        return service.compareCombined(scenario);
    }
}
