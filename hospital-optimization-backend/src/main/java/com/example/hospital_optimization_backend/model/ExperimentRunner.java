package com.example.hospital_optimization_backend.model;

import java.util.List;

/**
 * Main application entry point for the Phase 1 milestone.
 * Generates scenarios, passes data through the Greedy Allocator,
 * and prints results to console to prove simulator logic works.
 */
public class ExperimentRunner {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("Hospital Resource Optimization - Phase 1 Milestone");
        System.out.println("==================================================");

        HospitalSimulator simulator = new HospitalSimulator();
        Allocator greedy = new GreedyAllocator();

        // 1. Generate parameters
        int numPatients = 15; // Example size within bounds [5, 30]
        int capacity = simulator.generateCapacity();

        List<Patient> patients = simulator.generatePatients(numPatients);

        System.out.println("Scenario Variables:");
        System.out.println("Number of Patients: " + numPatients);
        System.out.println("ICU Capacity: " + capacity + " hours\n");

        System.out.println("Available Patients:");
        for (Patient p : patients) {
            System.out.println(p);
        }

        System.out.println("\n--------------------------------------------------");
        System.out.println("Running Greedy Algorithm...");
        System.out.println("--------------------------------------------------");

        long startTime = System.nanoTime();
        Allocator.AllocationResult result = greedy.allocate(patients, capacity);
        long endTime = System.nanoTime();

        System.out.println("Greedy Runtime: " + (endTime - startTime) / 1000 + " microseconds");
        System.out.println("Total Treatment Time Used: " + result.getTotalTreatmentTimeUsed() + " / " + capacity + " hours");
        System.out.println("Total Priority Score Achieved: " + result.getTotalPriorityScore() + "\n");
        
        System.out.println("Selected Patients (Greedy choice, ordered by ratio):");
        for (Patient p : result.getSelectedPatients()) {
            System.out.println(p);
        }

        System.out.println("==================================================");
        System.out.println("Phase 1 simulation completed successfully.");
        System.out.println("==================================================");
    }
}
