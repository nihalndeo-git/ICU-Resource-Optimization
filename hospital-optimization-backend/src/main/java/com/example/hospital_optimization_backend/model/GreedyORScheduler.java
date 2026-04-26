package com.example.hospital_optimization_backend.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Greedy Activity Selection for OR Scheduling.
 *
 * Strategy: Sort surgeries by earliest finish time, greedily pick
 * non-overlapping surgeries. This is provably optimal ONLY when
 * all surgeries have equal weight (unweighted case).
 *
 * Time Complexity: O(n log n)  (sorting dominates)
 *
 * Failure mode: When surgeries have different priority weights,
 * greedy may pick a low-weight surgery that finishes early,
 * blocking two high-weight surgeries that could have fit.
 */
public class GreedyORScheduler {

    public static class ScheduleResult {
        private List<Surgery> selectedSurgeries;
        private int totalPriorityWeight;
        private long runtimeMicroseconds;

        public ScheduleResult(List<Surgery> selectedSurgeries, int totalPriorityWeight, long runtimeMicroseconds) {
            this.selectedSurgeries = selectedSurgeries;
            this.totalPriorityWeight = totalPriorityWeight;
            this.runtimeMicroseconds = runtimeMicroseconds;
        }

        public List<Surgery> getSelectedSurgeries() { return selectedSurgeries; }
        public int getTotalPriorityWeight() { return totalPriorityWeight; }
        public long getRuntimeMicroseconds() { return runtimeMicroseconds; }
    }

    public ScheduleResult schedule(List<Surgery> surgeries) {
        long start = System.nanoTime();

        List<Surgery> sorted = new ArrayList<>(surgeries);
        Collections.sort(sorted); // sort by finish time

        List<Surgery> selected = new ArrayList<>();
        int totalWeight = 0;
        int lastFinishTime = -1;

        for (Surgery s : sorted) {
            if (s.getStartTime() >= lastFinishTime) {
                selected.add(s);
                totalWeight += s.getPriorityWeight();
                lastFinishTime = s.getEndTime();
            }
        }

        long end = System.nanoTime();
        return new ScheduleResult(selected, totalWeight, (end - start) / 1000);
    }
}
