package com.example.hospital_optimization_backend.controller;

import com.example.hospital_optimization_backend.service.OptimizationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/optimization")
@CrossOrigin(origins = "*") // Allow frontend to connect
public class OptimizationController {

    private final OptimizationService optimizationService;

    public OptimizationController(OptimizationService optimizationService) {
        this.optimizationService = optimizationService;
    }

    @GetMapping("/generate")
    public OptimizationService.Scenario generateScenario(@RequestParam(defaultValue = "15") int numPatients) {
        return optimizationService.generateScenario(numPatients);
    }

    @PostMapping("/allocate/compare")
    public OptimizationService.ComparisonResult compareAlgorithms(@RequestBody OptimizationService.Scenario scenario) {
        return optimizationService.compareAlgorithms(scenario);
    }
}
