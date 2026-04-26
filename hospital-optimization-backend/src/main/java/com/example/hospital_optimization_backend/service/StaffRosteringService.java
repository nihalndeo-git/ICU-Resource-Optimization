package com.example.hospital_optimization_backend.service;

import com.example.hospital_optimization_backend.model.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class StaffRosteringService {
    private final GreedyRosterScheduler greedyScheduler = new GreedyRosterScheduler();
    private final DPRosterScheduler dpScheduler = new DPRosterScheduler();

    private static final String[] DAYS = {"Mon", "Tue", "Wed", "Thu", "Fri"};
    private static final String[] SLOTS = {"Morning", "Afternoon", "Night"};
    private static final String[] SKILLS = {"ICU", "ER", "Surgery", "General"};
    private static final String[] NAMES = {
        "Dr. Smith", "Dr. Patel", "Dr. Chen", "Nurse Jones", "Nurse Williams",
        "Dr. Kumar", "Nurse Davis", "Dr. Lee"
    };

    public Scenario generateScenario(int numShifts) {
        Random random = new Random();

        // Generate shifts (keep small for DP performance)
        int actualShifts = Math.min(numShifts, 10);
        List<Shift> shifts = new ArrayList<>();
        for (int i = 1; i <= actualShifts; i++) {
            String day = DAYS[random.nextInt(DAYS.length)];
            String slot = SLOTS[random.nextInt(SLOTS.length)];
            String skill = SKILLS[random.nextInt(SKILLS.length)];
            shifts.add(new Shift(i, day, slot, skill, i)); // deadline = sequential urgency
        }

        // Generate staff (keep manageable)
        int numStaff = Math.min(6, NAMES.length);
        List<StaffMember> staff = new ArrayList<>();
        for (int i = 0; i < numStaff; i++) {
            // Each staff has 2-3 skills
            List<String> skills = new ArrayList<>();
            int numSkills = random.nextInt(2) + 2;
            Set<String> skillSet = new HashSet<>();
            while (skillSet.size() < numSkills) {
                skillSet.add(SKILLS[random.nextInt(SKILLS.length)]);
            }
            skills.addAll(skillSet);

            // Available 3-5 days
            List<String> availDays = new ArrayList<>();
            Set<String> daySet = new HashSet<>();
            int numDays = random.nextInt(3) + 3;
            while (daySet.size() < numDays) {
                daySet.add(DAYS[random.nextInt(DAYS.length)]);
            }
            availDays.addAll(daySet);

            int fatigue = random.nextInt(5) + 3; // 3-7 fatigue per shift
            staff.add(new StaffMember(i + 1, NAMES[i], skills, availDays, fatigue));
        }

        return new Scenario(shifts, staff);
    }

    public ComparisonResult compare(Scenario scenario) {
        GreedyRosterScheduler.RosterResult greedyRes = greedyScheduler.schedule(
            scenario.getShifts(), scenario.getStaff()
        );
        GreedyRosterScheduler.RosterResult dpRes = dpScheduler.schedule(
            scenario.getShifts(), scenario.getStaff()
        );
        return new ComparisonResult(greedyRes, dpRes);
    }

    // --- DTOs ---
    public static class Scenario {
        private List<Shift> shifts;
        private List<StaffMember> staff;
        public Scenario() {}
        public Scenario(List<Shift> shifts, List<StaffMember> staff) {
            this.shifts = shifts; this.staff = staff;
        }
        public List<Shift> getShifts() { return shifts; }
        public void setShifts(List<Shift> shifts) { this.shifts = shifts; }
        public List<StaffMember> getStaff() { return staff; }
        public void setStaff(List<StaffMember> staff) { this.staff = staff; }
    }

    public static class ComparisonResult {
        private GreedyRosterScheduler.RosterResult greedy;
        private GreedyRosterScheduler.RosterResult dp;
        public ComparisonResult(GreedyRosterScheduler.RosterResult greedy, GreedyRosterScheduler.RosterResult dp) {
            this.greedy = greedy; this.dp = dp;
        }
        public GreedyRosterScheduler.RosterResult getGreedy() { return greedy; }
        public GreedyRosterScheduler.RosterResult getDp() { return dp; }
    }
}
