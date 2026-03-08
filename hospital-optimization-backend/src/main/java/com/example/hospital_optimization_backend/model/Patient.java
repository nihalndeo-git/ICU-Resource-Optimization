package com.example.hospital_optimization_backend.model;

/**
 * Represents a patient requiring ICU treatment.
 * Problem Model mapping:
 * - id: patientId
 * - treatmentTime: hours required in ICU
 * - priorityScore: severity or importance
 */
public class Patient implements Comparable<Patient> {
    private final int id;
    private final int treatmentTime;
    private final int priorityScore;
    private final double priorityRatio;

    public Patient(int id, int treatmentTime, int priorityScore) {
        this.id = id;
        this.treatmentTime = treatmentTime;
        this.priorityScore = priorityScore;
        // Calculate priority-to-treatment-time ratio
        this.priorityRatio = (double) priorityScore / treatmentTime;
    }

    public int getId() {
        return id;
    }

    public int getTreatmentTime() {
        return treatmentTime;
    }

    public int getPriorityScore() {
        return priorityScore;
    }

    public double getPriorityRatio() {
        return priorityRatio;
    }

    /**
     * Compares patients based on their priority ratio in descending order.
     * This is crucial for the Greedy algorithm's sorting step.
     */
    @Override
    public int compareTo(Patient other) {
        // We want descending order, so we compare other to this
        return Double.compare(other.priorityRatio, this.priorityRatio);
    }

    @Override
    public String toString() {
        return "Patient " + id + " [Time: " + treatmentTime + "h, Priority: " + priorityScore + ", Ratio: " + String.format("%.2f", priorityRatio) + "]";
    }
}
