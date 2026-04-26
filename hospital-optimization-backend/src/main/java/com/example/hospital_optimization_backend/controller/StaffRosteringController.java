package com.example.hospital_optimization_backend.controller;

import com.example.hospital_optimization_backend.service.StaffRosteringService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff-rostering")
@CrossOrigin(origins = "*")
public class StaffRosteringController {

    private final StaffRosteringService service;

    public StaffRosteringController(StaffRosteringService service) {
        this.service = service;
    }

    @GetMapping("/generate")
    public StaffRosteringService.Scenario generateScenario(@RequestParam(defaultValue = "8") int numShifts) {
        return service.generateScenario(numShifts);
    }

    @PostMapping("/compare")
    public StaffRosteringService.ComparisonResult compare(@RequestBody StaffRosteringService.Scenario scenario) {
        return service.compare(scenario);
    }
}
