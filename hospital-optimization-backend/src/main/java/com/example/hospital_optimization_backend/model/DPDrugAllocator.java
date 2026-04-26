package com.example.hospital_optimization_backend.model;

import java.util.ArrayList;
import java.util.List;

/**
 * 0/1 Knapsack (DP) for Drug Inventory.
 *
 * Strategy: Standard 0/1 Knapsack DP table where each drug must be
 * taken as a whole batch or not at all.
 *
 * Recurrence:
 * dp[i][w] = max(dp[i-1][w], criticality[i] + dp[i-1][w - volume[i]])
 *
 * Time Complexity: O(nW)
 * Space Complexity: O(nW)
 *
 * This is optimal for the integer-constrained (whole-batch) variant.
 * The comparison with Fractional Greedy shows students when
 * Greedy is optimal (fractional) vs when it fails (integer).
 */
public class DPDrugAllocator {

    public GreedyDrugAllocator.DrugAllocationResult allocate(List<Drug> drugs, int capacity) {
        long start = System.nanoTime();

        int n = drugs.size();
        int[][] dp = new int[n + 1][capacity + 1];

        // Build DP table
        for (int i = 1; i <= n; i++) {
            Drug d = drugs.get(i - 1);
            int weight = d.getVolume();
            int value = d.getCriticalityScore();

            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w];
                if (weight <= w) {
                    dp[i][w] = Math.max(dp[i][w], value + dp[i - 1][w - weight]);
                }
            }
        }

        // Backtrack to find selected drugs
        List<GreedyDrugAllocator.DrugAllocation> allocations = new ArrayList<>();
        int w = capacity;
        int totalVolumeUsed = 0;

        for (int i = n; i > 0 && dp[i][w] > 0; i--) {
            if (dp[i][w] != dp[i - 1][w]) {
                Drug d = drugs.get(i - 1);
                allocations.add(new GreedyDrugAllocator.DrugAllocation(
                    d.getId(), d.getName(), 1.0, d.getVolume(), d.getCriticalityScore()
                ));
                w -= d.getVolume();
                totalVolumeUsed += d.getVolume();
            }
        }

        long end = System.nanoTime();
        return new GreedyDrugAllocator.DrugAllocationResult(
            allocations, dp[n][capacity], totalVolumeUsed, (end - start) / 1000
        );
    }
}
