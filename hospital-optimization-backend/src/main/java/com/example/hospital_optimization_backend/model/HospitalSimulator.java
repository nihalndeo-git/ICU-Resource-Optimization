package com.example.hospital_optimization_backend.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Generates random datasets for the hospital simulation scenarios.
 */
public class HospitalSimulator {

    private final Random random;

    public HospitalSimulator() {
        this.random = new Random();
    }

    /**
     * Generates a random scenario of patients with an explicit Knapsack Trap
     * added to ensure DP always defeats Greedy algorithm on the dashboard.
     * 
     * @param numPatients number of patients to generate
     * @return List of newly generated Patient records
     */
    public List<Patient> generatePatients(int numPatients) {
        List<Patient> patients = new ArrayList<>();
        
        if (numPatients <= 100) {
            // --- THE GREEDY TRAP (DP Wins on Accuracy) ---
            // Greedy sorts by ratio: (24/4=6.0), (23/4=5.75), (31/6=5.16)
            // If Capacity is 11, Greedy takes Patient 1 + Patient 2 = Score 47.
            // DP will realize Patient 1 + Patient 3 = Score 55! DP Wins!
            patients.add(new Patient(1, 4, 24)); 
            patients.add(new Patient(2, 4, 23)); 
            patients.add(new Patient(3, 6, 31));

            // Generate the rest using randomly constrained logic that doesn't 
            // accidentally out-value our trap at the top.
            for (int i = 4; i <= numPatients; i++) {
                int treatmentTime = random.nextInt(5) + 5;  // 5 to 9 hours
                int priorityScore = (treatmentTime * 3) + random.nextInt(6) - 3; // Ratio around ~3.0
                patients.add(new Patient(i, treatmentTime, priorityScore));
            }
        } else {
            // --- HUGE DATASET (Greedy Wins on Execution Time) ---
            // Randomly generated patients.
            // DP complexity O(n*W) becomes incredibly slow here as both N and W are large.
            for (int i = 1; i <= numPatients; i++) {
                int treatmentTime = random.nextInt(10) + 1; // 1 to 10 hours
                int priorityScore = (treatmentTime * 2) + random.nextInt(10); 
                patients.add(new Patient(i, treatmentTime, priorityScore));
            }
        }
        return patients;
    }

    /**
     * Generates capacity based on the scenario size.
     */
    public int generateCapacity(int numPatients) {
        if (numPatients <= 100) {
            return 11; // Forced trap capacity where DP shines
        } else {
            // Vast capacity causes O(nW) quadratic mathematical explosion in DP
            return numPatients * 2; 
        }
    }
}
