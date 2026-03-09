package com.example.hospital_optimization_backend.service;

import com.example.hospital_optimization_backend.model.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OptimizationService {
    private final HospitalSimulator simulator = new HospitalSimulator();
    private final Allocator greedyAllocator = new GreedyAllocator();
    private final Allocator dpAllocator = new DPAllocator();

    public Scenario generateScenario(int numPatients) {
        return new Scenario(
            simulator.generatePatients(numPatients),
            simulator.generateCapacity(numPatients)
        );
    }

    public ComparisonResult compareAlgorithms(Scenario scenario) {
        // Run Greedy
        long startGreedy = System.nanoTime();
        Allocator.AllocationResult greedyRes = greedyAllocator.allocate(scenario.getPatients(), scenario.getCapacity());
        long endGreedy = System.nanoTime();
        
        AllocationResultDTO greedyDto = new AllocationResultDTO(
            greedyRes.getSelectedPatients(),
            greedyRes.getTotalPriorityScore(),
            greedyRes.getTotalTreatmentTimeUsed(),
            (endGreedy - startGreedy) / 1000 // microseconds
        );

        // Run DP
        long startDP = System.nanoTime();
        Allocator.AllocationResult dpRes = dpAllocator.allocate(scenario.getPatients(), scenario.getCapacity());
        long endDP = System.nanoTime();
        
        AllocationResultDTO dpDto = new AllocationResultDTO(
            dpRes.getSelectedPatients(),
            dpRes.getTotalPriorityScore(),
            dpRes.getTotalTreatmentTimeUsed(),
            (endDP - startDP) / 1000 // microseconds
        );

        return new ComparisonResult(greedyDto, dpDto);
    }

    public static class Scenario {
        private List<Patient> patients;
        private int capacity;
        public Scenario() {}
        public Scenario(List<Patient> patients, int capacity) { this.patients = patients; this.capacity = capacity; }
        public List<Patient> getPatients() { return patients; }
        public int getCapacity() { return capacity; }
    }

    public static class AllocationResultDTO {
        private List<Patient> selectedPatients;
        private int totalPriorityScore;
        private int totalTreatmentTimeUsed;
        private long runtimeMicroseconds;

        public AllocationResultDTO(List<Patient> selectedPatients, int totalPriorityScore, int totalTreatmentTimeUsed, long runtimeMicroseconds) {
            this.selectedPatients = selectedPatients;
            this.totalPriorityScore = totalPriorityScore;
            this.totalTreatmentTimeUsed = totalTreatmentTimeUsed;
            this.runtimeMicroseconds = runtimeMicroseconds;
        }
        public List<Patient> getSelectedPatients() { return selectedPatients; }
        public int getTotalPriorityScore() { return totalPriorityScore; }
        public int getTotalTreatmentTimeUsed() { return totalTreatmentTimeUsed; }
        public long getRuntimeMicroseconds() { return runtimeMicroseconds; }
    }

    public static class ComparisonResult {
        private AllocationResultDTO greedy;
        private AllocationResultDTO dp;

        public ComparisonResult(AllocationResultDTO greedy, AllocationResultDTO dp) {
            this.greedy = greedy;
            this.dp = dp;
        }
        public AllocationResultDTO getGreedy() { return greedy; }
        public AllocationResultDTO getDp() { return dp; }
    }
}
