package com.example.hospital_optimization_backend.model;

import java.util.*;

/**
 * Greedy Earliest-Deadline-First for Staff Rostering.
 *
 * Strategy: Sort shifts by deadline (urgency), then for each shift
 * assign the best-fit available staff member with the lowest fatigue.
 *
 * Time Complexity: O(S log S + S × M) where S = shifts, M = staff
 *
 * Failure mode: Greedy assigns greedily per-shift without considering
 * future consequences — a low-fatigue staff member used now might cause
 * triple-shift overload later, raising total fatigue unnecessarily.
 */
public class GreedyRosterScheduler {

    public static class RosterResult {
        private List<ShiftAssignment> assignments;
        private int totalFatigue;
        private int shiftsUnfilled;
        private long runtimeMicroseconds;

        public RosterResult(List<ShiftAssignment> assignments, int totalFatigue, int shiftsUnfilled, long runtimeMicroseconds) {
            this.assignments = assignments;
            this.totalFatigue = totalFatigue;
            this.shiftsUnfilled = shiftsUnfilled;
            this.runtimeMicroseconds = runtimeMicroseconds;
        }

        public List<ShiftAssignment> getAssignments() { return assignments; }
        public int getTotalFatigue() { return totalFatigue; }
        public int getShiftsUnfilled() { return shiftsUnfilled; }
        public long getRuntimeMicroseconds() { return runtimeMicroseconds; }
    }

    public static class ShiftAssignment {
        private int shiftId;
        private String day;
        private String slotName;
        private int staffId;
        private String staffName;
        private int fatigueCost;

        public ShiftAssignment(int shiftId, String day, String slotName, int staffId, String staffName, int fatigueCost) {
            this.shiftId = shiftId;
            this.day = day;
            this.slotName = slotName;
            this.staffId = staffId;
            this.staffName = staffName;
            this.fatigueCost = fatigueCost;
        }

        public int getShiftId() { return shiftId; }
        public String getDay() { return day; }
        public String getSlotName() { return slotName; }
        public int getStaffId() { return staffId; }
        public String getStaffName() { return staffName; }
        public int getFatigueCost() { return fatigueCost; }
    }

    public RosterResult schedule(List<Shift> shifts, List<StaffMember> staff) {
        long start = System.nanoTime();

        // Sort shifts by deadline (urgency)
        List<Shift> sortedShifts = new ArrayList<>(shifts);
        sortedShifts.sort(Comparator.comparingInt(Shift::getDeadline));

        // Track staff shift counts
        Map<Integer, Integer> staffShiftCount = new HashMap<>();
        for (StaffMember s : staff) staffShiftCount.put(s.getId(), 0);

        List<ShiftAssignment> assignments = new ArrayList<>();
        int totalFatigue = 0;
        int unfilled = 0;

        for (Shift shift : sortedShifts) {
            StaffMember bestFit = null;
            int bestFatigue = Integer.MAX_VALUE;

            for (StaffMember s : staff) {
                if (s.hasSkill(shift.getRequiredSkill()) && s.isAvailable(shift.getDay())) {
                    // Greedy picks lowest immediate fatigue cost
                    int currentCount = staffShiftCount.get(s.getId());
                    int fatigue = s.getFatiguePerShift() * (currentCount + 1); // cumulative fatigue
                    if (fatigue < bestFatigue) {
                        bestFatigue = fatigue;
                        bestFit = s;
                    }
                }
            }

            if (bestFit != null) {
                int count = staffShiftCount.get(bestFit.getId()) + 1;
                staffShiftCount.put(bestFit.getId(), count);
                int fatigueCost = bestFit.getFatiguePerShift() * count;
                totalFatigue += fatigueCost;
                assignments.add(new ShiftAssignment(
                    shift.getId(), shift.getDay(), shift.getSlotName(),
                    bestFit.getId(), bestFit.getName(), fatigueCost
                ));
            } else {
                unfilled++;
            }
        }

        long end = System.nanoTime();
        return new RosterResult(assignments, totalFatigue, unfilled, (end - start) / 1000);
    }
}
