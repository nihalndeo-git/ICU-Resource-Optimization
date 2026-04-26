package com.example.hospital_optimization_backend.service;

import com.example.hospital_optimization_backend.model.*;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class ORSchedulingService {
    private final Random random = new Random();
    private final GreedyORScheduler greedyScheduler = new GreedyORScheduler();
    private final DPORScheduler dpScheduler = new DPORScheduler();

    public Scenario generateScenario(int numSurgeries) {
        List<Surgery> surgeries = new ArrayList<>();

        // --- GREEDY TRAP ---
        // Greedy (earliest-finish) picks Surgery 1 (finishes at 4, weight 2)
        // then Surgery 3 (starts at 6, finishes at 9, weight 3) = total 5.
        // DP picks Surgery 2 (4-7, weight 6) + Surgery 4 (7-9, weight 5) = total 11!
        surgeries.add(new Surgery(1, 0, 4, 2));   // finishes early, low weight
        surgeries.add(new Surgery(2, 4, 7, 6));   // medium, high weight
        surgeries.add(new Surgery(3, 6, 9, 3));   // overlaps with 2
        surgeries.add(new Surgery(4, 7, 9, 5));   // fits after 2

        // Generate remaining random surgeries
        for (int i = 5; i <= numSurgeries; i++) {
            int startTime = random.nextInt(20);              // 0-19
            int duration = random.nextInt(3) + 1;            // 1-3 hours
            int endTime = startTime + duration;
            int priorityWeight = random.nextInt(3) + 1;      // low weights so trap dominates
            surgeries.add(new Surgery(i, startTime, Math.min(endTime, 24), priorityWeight));
        }

        return new Scenario(surgeries);
    }

    public ComparisonResult compare(Scenario scenario) {
        GreedyORScheduler.ScheduleResult greedyRes = greedyScheduler.schedule(scenario.getSurgeries());
        GreedyORScheduler.ScheduleResult dpRes = dpScheduler.schedule(scenario.getSurgeries());
        return new ComparisonResult(greedyRes, dpRes);
    }

    // --- DTOs ---
    public static class Scenario {
        private List<Surgery> surgeries;
        public Scenario() {}
        public Scenario(List<Surgery> surgeries) { this.surgeries = surgeries; }
        public List<Surgery> getSurgeries() { return surgeries; }
        public void setSurgeries(List<Surgery> surgeries) { this.surgeries = surgeries; }
    }

    public static class ComparisonResult {
        private GreedyORScheduler.ScheduleResult greedy;
        private GreedyORScheduler.ScheduleResult dp;
        public ComparisonResult(GreedyORScheduler.ScheduleResult greedy, GreedyORScheduler.ScheduleResult dp) {
            this.greedy = greedy; this.dp = dp;
        }
        public GreedyORScheduler.ScheduleResult getGreedy() { return greedy; }
        public GreedyORScheduler.ScheduleResult getDp() { return dp; }
    }
}
