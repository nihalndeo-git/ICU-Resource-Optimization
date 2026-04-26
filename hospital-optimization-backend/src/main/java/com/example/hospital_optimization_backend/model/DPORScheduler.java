package com.example.hospital_optimization_backend.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Weighted Interval Scheduling via Dynamic Programming.
 *
 * Strategy:
 * 1. Sort surgeries by finish time.
 * 2. For each surgery i, binary search for the latest compatible
 *    surgery p(i) that finishes before surgery i starts.
 * 3. DP recurrence: dp[i] = max(dp[i-1], weight[i] + dp[p(i)])
 * 4. Backtrack to find selected surgeries.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 *
 * Guarantees the globally optimal solution for weighted intervals.
 */
public class DPORScheduler {

    public GreedyORScheduler.ScheduleResult schedule(List<Surgery> surgeries) {
        long start = System.nanoTime();

        int n = surgeries.size();
        if (n == 0) {
            long end = System.nanoTime();
            return new GreedyORScheduler.ScheduleResult(new ArrayList<>(), 0, (end - start) / 1000);
        }

        // Sort by finish time
        List<Surgery> sorted = new ArrayList<>(surgeries);
        Collections.sort(sorted);

        int[] dp = new int[n + 1];
        int[] p = new int[n + 1]; // p[i] = index of latest compatible surgery for i

        // Compute p[i] using binary search
        for (int i = 1; i <= n; i++) {
            int lo = 0, hi = i - 1;
            int target = sorted.get(i - 1).getStartTime();
            p[i] = 0;
            while (lo <= hi) {
                int mid = (lo + hi) / 2;
                if (mid == 0) {
                    lo = mid + 1;
                    continue;
                }
                if (sorted.get(mid - 1).getEndTime() <= target) {
                    p[i] = mid;
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
        }

        // Build DP table
        for (int i = 1; i <= n; i++) {
            int include = sorted.get(i - 1).getPriorityWeight() + dp[p[i]];
            int exclude = dp[i - 1];
            dp[i] = Math.max(include, exclude);
        }

        // Backtrack to find selected surgeries
        List<Surgery> selected = new ArrayList<>();
        int i = n;
        while (i > 0) {
            if (sorted.get(i - 1).getPriorityWeight() + dp[p[i]] >= dp[i - 1]) {
                selected.add(sorted.get(i - 1));
                i = p[i];
            } else {
                i--;
            }
        }
        Collections.reverse(selected);

        long end = System.nanoTime();
        return new GreedyORScheduler.ScheduleResult(selected, dp[n], (end - start) / 1000);
    }
}
