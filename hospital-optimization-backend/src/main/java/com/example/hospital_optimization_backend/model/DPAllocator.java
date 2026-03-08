package com.example.hospital_optimization_backend.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Implements the Dynamic Programming (0/1 Knapsack) approach.
 * 
 * Defines DP state: dp[i][w] = Maximum priority score achievable using 
 * first i patients and ICU capacity w.
 * 
 * Recurrence relation:
 * dp[i][w] = max(dp[i-1][w], priority[i] + dp[i-1][w - treatmentTime[i]])
 * 
 * Time complexity: O(nW)
 * Space complexity: O(nW)
 */
public class DPAllocator implements Allocator {

    @Override
    public AllocationResult allocate(List<Patient> patients, int capacity) {
        int n = patients.size();
        int[][] dp = new int[n + 1][capacity + 1];

        // Build DP table
        // Time Complexity: O(nW)
        for (int i = 1; i <= n; i++) {
            Patient p = patients.get(i - 1);
            int weight = p.getTreatmentTime();
            int value = p.getPriorityScore();

            for (int w = 1; w <= capacity; w++) {
                if (weight <= w) {
                    dp[i][w] = Math.max(dp[i - 1][w], value + dp[i - 1][w - weight]);
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }

        // Backtrack to find selected patients
        List<Patient> selected = new ArrayList<>();
        int w = capacity;
        int totalTimeUsed = 0;

        for (int i = n; i > 0 && dp[i][w] > 0; i--) {
            if (dp[i][w] != dp[i - 1][w]) {
                Patient p = patients.get(i - 1);
                selected.add(p);
                w -= p.getTreatmentTime();
                totalTimeUsed += p.getTreatmentTime();
            }
        }

        // Optional: sort output by ID for clean display
        Collections.sort(selected, (p1, p2) -> Integer.compare(p1.getId(), p2.getId()));

        return new AllocationResult(selected, dp[n][capacity], totalTimeUsed);
    }
}
