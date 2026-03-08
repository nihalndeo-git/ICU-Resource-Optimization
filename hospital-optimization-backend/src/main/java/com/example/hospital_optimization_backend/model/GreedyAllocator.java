package com.example.hospital_optimization_backend.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Implements the Greedy Algorithm approach for the resource optimization problem.
 * 
 * Strategy:
 * Select patients based on maximum priority-to-treatment-time ratio.
 * 
 * Steps:
 * 1. Compute priorityScore / treatmentTime (done in Patient object)
 * 2. Sort patients in descending order 
 * 3. Allocate patients until ICU capacity is exhausted
 * 
 * Time complexity analysis:
 * Sorting: O(n log n)
 * Selection: O(n)
 * Total: O(n log n)
 * 
 * Note: The greedy approach may fail to produce the optimal solution 
 * in the 0/1 knapsack problem when the optimal subset does not follow 
 * the top-ratio density strictly, leaving gaps in the capacity that 
 * could have fit combinations of lower-ratio but tightly-packed items.
 */
public class GreedyAllocator implements Allocator {

    @Override
    public AllocationResult allocate(List<Patient> patients, int capacity) {
        // Create a copy so we don't mutate the original list structure
        List<Patient> sortedPatients = new ArrayList<>(patients);

        // Sorting: O(n log n)
        Collections.sort(sortedPatients);

        List<Patient> selected = new ArrayList<>();
        int currentCapacityUsed = 0;
        int currentPriorityScore = 0;

        // Selection: O(n)
        for (Patient p : sortedPatients) {
            if (currentCapacityUsed + p.getTreatmentTime() <= capacity) {
                selected.add(p);
                currentCapacityUsed += p.getTreatmentTime();
                currentPriorityScore += p.getPriorityScore();
            }
        }

        return new AllocationResult(selected, currentPriorityScore, currentCapacityUsed);
    }
}
