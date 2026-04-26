package com.example.hospital_optimization_backend.controller;

import com.example.hospital_optimization_backend.service.AmbulanceRoutingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ambulance-routing")
@CrossOrigin(origins = "*")
public class AmbulanceRoutingController {

    private final AmbulanceRoutingService service;

    public AmbulanceRoutingController(AmbulanceRoutingService service) {
        this.service = service;
    }

    @GetMapping("/generate")
    public AmbulanceRoutingService.Scenario generateScenario(@RequestParam(defaultValue = "8") int numNodes) {
        return service.generateScenario(numNodes);
    }

    @PostMapping("/compare")
    public AmbulanceRoutingService.ComparisonResult compare(@RequestBody AmbulanceRoutingService.Scenario scenario) {
        return service.compare(scenario);
    }
}
