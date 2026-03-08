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
     * Generates a random scenario of patients.
     * 
     * Requirements:
     * Patients = random between 5 and 30 (handled by scenario builder)
     * Treatment time = random between 1 and 8 hours
     * Priority score = random between 1 and 20
     * ICU capacity = random between 10 and 50 (handled by scenario builder)
     * 
     * @param numPatients number of patients to generate
     * @return List of newly generated Patient records
     */
    public List<Patient> generatePatients(int numPatients) {
        List<Patient> patients = new ArrayList<>();
        for (int i = 1; i <= numPatients; i++) {
            int treatmentTime = random.nextInt(8) + 1;  // 1 to 8 hours
            int priorityScore = random.nextInt(20) + 1; // 1 to 20 priority
            patients.add(new Patient(i, treatmentTime, priorityScore));
        }
        return patients;
    }

    /**
     * Generates a random capacity.
     * @return random capacity mapped to bounds [10, 50]
     */
    public int generateCapacity() {
        return random.nextInt(41) + 10; // 10 to 50 hours
    }
}
