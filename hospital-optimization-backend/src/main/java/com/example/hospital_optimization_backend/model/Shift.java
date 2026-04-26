package com.example.hospital_optimization_backend.model;

/**
 * Represents a shift that must be filled.
 */
public class Shift {
    private int id;
    private String day;         // "Mon", "Tue", etc.
    private String slotName;    // "Morning", "Afternoon", "Night"
    private String requiredSkill;
    private int deadline;       // urgency rank (lower = more urgent)

    public Shift() {}

    public Shift(int id, String day, String slotName, String requiredSkill, int deadline) {
        this.id = id;
        this.day = day;
        this.slotName = slotName;
        this.requiredSkill = requiredSkill;
        this.deadline = deadline;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }
    public String getSlotName() { return slotName; }
    public void setSlotName(String slotName) { this.slotName = slotName; }
    public String getRequiredSkill() { return requiredSkill; }
    public void setRequiredSkill(String requiredSkill) { this.requiredSkill = requiredSkill; }
    public int getDeadline() { return deadline; }
    public void setDeadline(int deadline) { this.deadline = deadline; }

    @Override
    public String toString() {
        return "Shift " + id + " [" + day + " " + slotName + ", Skill: " + requiredSkill + "]";
    }
}
