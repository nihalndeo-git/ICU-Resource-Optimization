package com.example.hospital_optimization_backend.controller;

import com.example.hospital_optimization_backend.service.ORSchedulingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/or-scheduling")
@CrossOrigin(origins = "*")
public class ORSchedulingController {

    private final ORSchedulingService service;

    public ORSchedulingController(ORSchedulingService service) {
        this.service = service;
    }

    @GetMapping("/generate")
    public ORSchedulingService.Scenario generateScenario(@RequestParam(defaultValue = "10") int numSurgeries) {
        return service.generateScenario(numSurgeries);
    }

    @PostMapping("/compare")
    public ORSchedulingService.ComparisonResult compare(@RequestBody ORSchedulingService.Scenario scenario) {
        return service.compare(scenario);
    }
}
