package com.example.hospital_optimization_backend.model;

import java.util.List;

/**
 * Represents a staff member with skills and availability.
 */
public class StaffMember {
    private int id;
    private String name;
    private List<String> skills;
    private List<String> availableDays;
    private int fatiguePerShift;
    private int shiftsAssigned; // track how many shifts assigned

    public StaffMember() {}

    public StaffMember(int id, String name, List<String> skills, List<String> availableDays, int fatiguePerShift) {
        this.id = id;
        this.name = name;
        this.skills = skills;
        this.availableDays = availableDays;
        this.fatiguePerShift = fatiguePerShift;
        this.shiftsAssigned = 0;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public List<String> getSkills() { return skills; }
    public List<String> getAvailableDays() { return availableDays; }
    public int getFatiguePerShift() { return fatiguePerShift; }
    public int getShiftsAssigned() { return shiftsAssigned; }
    public void setShiftsAssigned(int shiftsAssigned) { this.shiftsAssigned = shiftsAssigned; }

    public boolean hasSkill(String skill) {
        return skills.contains(skill);
    }

    public boolean isAvailable(String day) {
        return availableDays.contains(day);
    }

    @Override
    public String toString() {
        return name + " [Fatigue: " + fatiguePerShift + ", Skills: " + skills + "]";
    }
}
