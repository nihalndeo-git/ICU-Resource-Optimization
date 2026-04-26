package com.example.hospital_optimization_backend.model;

/**
 * Represents a drug in the pharmacy inventory.
 * Problem Model mapping:
 * - volume: litres of cold-storage needed per batch
 * - criticalityScore: importance/urgency score
 * - ratio: criticalityScore / volume (for greedy sorting)
 */
public class Drug implements Comparable<Drug> {
    private int id;
    private String name;
    private int volume;          // litres per batch
    private int criticalityScore;
    private double ratio;
    private double fractionTaken; // used for fractional knapsack result

    public Drug() {}

    public Drug(int id, String name, int volume, int criticalityScore) {
        this.id = id;
        this.name = name;
        this.volume = volume;
        this.criticalityScore = criticalityScore;
        this.ratio = (double) criticalityScore / volume;
        this.fractionTaken = 0;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getVolume() { return volume; }
    public void setVolume(int volume) { this.volume = volume; this.ratio = (double) criticalityScore / volume; }
    public int getCriticalityScore() { return criticalityScore; }
    public void setCriticalityScore(int criticalityScore) { this.criticalityScore = criticalityScore; if (volume > 0) this.ratio = (double) criticalityScore / volume; }
    public double getRatio() { return ratio; }
    public void setRatio(double ratio) { this.ratio = ratio; }
    public double getFractionTaken() { return fractionTaken; }
    public void setFractionTaken(double fractionTaken) { this.fractionTaken = fractionTaken; }

    @Override
    public int compareTo(Drug other) {
        return Double.compare(other.ratio, this.ratio); // descending by ratio
    }

    @Override
    public String toString() {
        return name + " [Vol: " + volume + "L, Crit: " + criticalityScore + ", Ratio: " + String.format("%.2f", ratio) + "]";
    }
}
