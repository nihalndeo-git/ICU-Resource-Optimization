package com.example.hospital_optimization_backend.model;

/**
 * Represents a surgery requiring an Operating Room slot.
 * Problem Model mapping:
 * - startTime: hour the surgery begins
 * - endTime: hour the surgery ends
 * - priorityWeight: urgency / importance weight
 */
public class Surgery implements Comparable<Surgery> {
    private int id;
    private int startTime;
    private int endTime;
    private int priorityWeight;

    public Surgery() {}

    public Surgery(int id, int startTime, int endTime, int priorityWeight) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.priorityWeight = priorityWeight;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getStartTime() { return startTime; }
    public void setStartTime(int startTime) { this.startTime = startTime; }
    public int getEndTime() { return endTime; }
    public void setEndTime(int endTime) { this.endTime = endTime; }
    public int getPriorityWeight() { return priorityWeight; }
    public void setPriorityWeight(int priorityWeight) { this.priorityWeight = priorityWeight; }
    public int getDuration() { return endTime - startTime; }

    /**
     * Default sort: by earliest finish time (for Greedy Activity Selection).
     */
    @Override
    public int compareTo(Surgery other) {
        return Integer.compare(this.endTime, other.endTime);
    }

    @Override
    public String toString() {
        return "Surgery " + id + " [" + startTime + "-" + endTime + "h, Weight: " + priorityWeight + "]";
    }
}
