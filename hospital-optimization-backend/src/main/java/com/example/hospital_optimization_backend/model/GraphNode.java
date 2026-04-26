package com.example.hospital_optimization_backend.model;

/**
 * Represents a location node in the hospital network graph.
 * Includes x,y coordinates for canvas rendering.
 */
public class GraphNode {
    private int id;
    private String name;
    private double x;  // canvas x coordinate
    private double y;  // canvas y coordinate

    public GraphNode() {}

    public GraphNode(int id, String name, double x, double y) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public double getX() { return x; }
    public double getY() { return y; }

    @Override
    public String toString() {
        return name + " (id=" + id + ")";
    }
}
