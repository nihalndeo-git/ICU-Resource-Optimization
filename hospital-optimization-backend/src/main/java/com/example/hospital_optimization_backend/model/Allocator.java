package com.example.hospital_optimization_backend.model;

import java.util.List;

/**
 * Common interface for all algorithms attempting to solve the
 * hospital resource optimization problem.
 */
public interface Allocator {
    
    /**
     * Allocates ICU capacity to a subset of patients to maximize priority score.
     *
     * @param patients The list of available patients.
     * @param capacity The total available ICU capacity (hours).
     * @return The AllocationResult detailing the chosen patients and total score.
     */
    AllocationResult allocate(List<Patient> patients, int capacity);

    /**
     * Helper class to store the results of an allocation.
     */
    class AllocationResult {
        private final List<Patient> selectedPatients;
        private final int totalPriorityScore;
        private final int totalTreatmentTimeUsed;

        public AllocationResult(List<Patient> selectedPatients, int totalPriorityScore, int totalTreatmentTimeUsed) {
            this.selectedPatients = selectedPatients;
            this.totalPriorityScore = totalPriorityScore;
            this.totalTreatmentTimeUsed = totalTreatmentTimeUsed;
        }

        public List<Patient> getSelectedPatients() {
            return selectedPatients;
        }

        public int getTotalPriorityScore() {
            return totalPriorityScore;
        }

        public int getTotalTreatmentTimeUsed() {
            return totalTreatmentTimeUsed;
        }
    }
}
