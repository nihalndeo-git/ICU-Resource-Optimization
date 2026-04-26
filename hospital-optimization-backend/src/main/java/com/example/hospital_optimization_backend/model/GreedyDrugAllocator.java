package com.example.hospital_optimization_backend.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Fractional Knapsack (Greedy) for Drug Inventory.
 *
 * Strategy: Sort drugs by criticality/volume ratio (descending),
 * take as much as possible of each drug, including fractions.
 *
 * Time Complexity: O(n log n)
 *
 * This is PROVABLY OPTIMAL for the fractional knapsack variant.
 * Unlike the 0/1 case, allowing fractions means the greedy
 * ratio-based approach always yields the maximum total criticality.
 */
public class GreedyDrugAllocator {

    public static class DrugAllocationResult {
        private List<DrugAllocation> allocations;
        private double totalCriticality;
        private double totalVolumeUsed;
        private long runtimeMicroseconds;

        public DrugAllocationResult(List<DrugAllocation> allocations, double totalCriticality, double totalVolumeUsed, long runtimeMicroseconds) {
            this.allocations = allocations;
            this.totalCriticality = totalCriticality;
            this.totalVolumeUsed = totalVolumeUsed;
            this.runtimeMicroseconds = runtimeMicroseconds;
        }

        public List<DrugAllocation> getAllocations() { return allocations; }
        public double getTotalCriticality() { return totalCriticality; }
        public double getTotalVolumeUsed() { return totalVolumeUsed; }
        public long getRuntimeMicroseconds() { return runtimeMicroseconds; }
    }

    public static class DrugAllocation {
        private int drugId;
        private String drugName;
        private double fractionTaken; // 0.0 to 1.0
        private double volumeUsed;
        private double criticalityGained;

        public DrugAllocation(int drugId, String drugName, double fractionTaken, double volumeUsed, double criticalityGained) {
            this.drugId = drugId;
            this.drugName = drugName;
            this.fractionTaken = fractionTaken;
            this.volumeUsed = volumeUsed;
            this.criticalityGained = criticalityGained;
        }

        public int getDrugId() { return drugId; }
        public String getDrugName() { return drugName; }
        public double getFractionTaken() { return fractionTaken; }
        public double getVolumeUsed() { return volumeUsed; }
        public double getCriticalityGained() { return criticalityGained; }
    }

    public DrugAllocationResult allocate(List<Drug> drugs, int capacity) {
        long start = System.nanoTime();

        List<Drug> sorted = new ArrayList<>(drugs);
        Collections.sort(sorted); // sort by ratio descending

        List<DrugAllocation> allocations = new ArrayList<>();
        double totalCriticality = 0;
        double totalVolumeUsed = 0;
        int remainingCapacity = capacity;

        for (Drug d : sorted) {
            if (remainingCapacity <= 0) break;

            if (d.getVolume() <= remainingCapacity) {
                // Take full batch
                allocations.add(new DrugAllocation(d.getId(), d.getName(), 1.0, d.getVolume(), d.getCriticalityScore()));
                totalCriticality += d.getCriticalityScore();
                totalVolumeUsed += d.getVolume();
                remainingCapacity -= d.getVolume();
            } else {
                // Take fraction
                double fraction = (double) remainingCapacity / d.getVolume();
                double critGained = d.getCriticalityScore() * fraction;
                allocations.add(new DrugAllocation(d.getId(), d.getName(), fraction, remainingCapacity, critGained));
                totalCriticality += critGained;
                totalVolumeUsed += remainingCapacity;
                remainingCapacity = 0;
            }
        }

        long end = System.nanoTime();
        return new DrugAllocationResult(allocations, totalCriticality, totalVolumeUsed, (end - start) / 1000);
    }
}
