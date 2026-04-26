package com.example.hospital_optimization_backend.model;

/**
 * Unified resource item that represents any hospital resource across all modules.
 * All items share the same "cost" and "value" abstraction for the combined knapsack.
 *
 * - ICU Patient: cost = treatmentTime, value = priorityScore
 * - Surgery:     cost = duration,      value = priorityWeight
 * - Drug:        cost = volume,        value = criticalityScore
 * - Staff Shift: cost = fatigueCost,   value = coverageScore
 * - Ambulance:   cost = travelTime,    value = responseValue
 */
public class ResourceItem implements Comparable<ResourceItem> {
    private int id;
    private String moduleId;   // "icu", "or", "drug", "roster", "ambulance"
    private String moduleName; // "ICU Triage", "OR Scheduling", etc.
    private String label;      // "Patient 3", "Surgery 5", "Remdesivir", etc.
    private int cost;          // resource units consumed (weight in knapsack)
    private int value;         // benefit value (value in knapsack)
    private double ratio;      // value / cost (for greedy sorting)

    public ResourceItem() {}

    public ResourceItem(int id, String moduleId, String moduleName, String label, int cost, int value) {
        this.id = id;
        this.moduleId = moduleId;
        this.moduleName = moduleName;
        this.label = label;
        this.cost = cost;
        this.value = value;
        this.ratio = cost > 0 ? (double) value / cost : 0;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
    public String getModuleName() { return moduleName; }
    public void setModuleName(String moduleName) { this.moduleName = moduleName; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public int getCost() { return cost; }
    public void setCost(int cost) { this.cost = cost; this.ratio = cost > 0 ? (double) value / cost : 0; }
    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; this.ratio = cost > 0 ? (double) value / cost : 0; }
    public double getRatio() { return ratio; }
    public void setRatio(double ratio) { this.ratio = ratio; }

    @Override
    public int compareTo(ResourceItem other) {
        return Double.compare(other.ratio, this.ratio); // descending by ratio
    }

    @Override
    public String toString() {
        return "[" + moduleName + "] " + label + " (cost=" + cost + ", value=" + value + ", ratio=" + String.format("%.2f", ratio) + ")";
    }
}
