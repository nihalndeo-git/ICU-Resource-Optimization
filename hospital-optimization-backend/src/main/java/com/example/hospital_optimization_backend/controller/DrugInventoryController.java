package com.example.hospital_optimization_backend.controller;

import com.example.hospital_optimization_backend.service.DrugInventoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drug-inventory")
@CrossOrigin(origins = "*")
public class DrugInventoryController {

    private final DrugInventoryService service;

    public DrugInventoryController(DrugInventoryService service) {
        this.service = service;
    }

    @GetMapping("/generate")
    public DrugInventoryService.Scenario generateScenario(@RequestParam(defaultValue = "10") int numDrugs) {
        return service.generateScenario(numDrugs);
    }

    @PostMapping("/compare")
    public DrugInventoryService.ComparisonResult compare(@RequestBody DrugInventoryService.Scenario scenario) {
        return service.compare(scenario);
    }
}
