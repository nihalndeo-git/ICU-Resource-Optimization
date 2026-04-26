package com.example.hospital_optimization_backend.model;

/**
 * Represents an edge in the hospital network graph.
 */
public class GraphEdge {
    private int from;
    private int to;
    private int travelTime;

    public GraphEdge() {}

    public GraphEdge(int from, int to, int travelTime) {
        this.from = from;
        this.to = to;
        this.travelTime = travelTime;
    }

    public int getFrom() { return from; }
    public int getTo() { return to; }
    public int getTravelTime() { return travelTime; }

    @Override
    public String toString() {
        return from + " -> " + to + " (" + travelTime + " min)";
    }
}
