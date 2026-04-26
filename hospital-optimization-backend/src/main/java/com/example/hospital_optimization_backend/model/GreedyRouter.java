package com.example.hospital_optimization_backend.model;

import java.util.*;

/**
 * Greedy Nearest-Neighbour Router for Ambulance Routing.
 *
 * Strategy: From the source, always move to the nearest adjacent
 * unvisited node until reaching the destination.
 *
 * Time Complexity: O(V²) worst case
 *
 * Failure mode: Can get trapped in suboptimal local paths.
 * May take a short first hop that leads to a longer overall route,
 * while Dijkstra would have found a slightly longer first hop
 * that leads to a much shorter total path.
 */
public class GreedyRouter {

    public static class RouteResult {
        private List<Integer> path;       // node IDs in order
        private int totalDistance;
        private boolean reachedDestination;
        private long runtimeMicroseconds;

        public RouteResult(List<Integer> path, int totalDistance, boolean reachedDestination, long runtimeMicroseconds) {
            this.path = path;
            this.totalDistance = totalDistance;
            this.reachedDestination = reachedDestination;
            this.runtimeMicroseconds = runtimeMicroseconds;
        }

        public List<Integer> getPath() { return path; }
        public int getTotalDistance() { return totalDistance; }
        public boolean isReachedDestination() { return reachedDestination; }
        public long getRuntimeMicroseconds() { return runtimeMicroseconds; }
    }

    public RouteResult findRoute(List<GraphNode> nodes, List<GraphEdge> edges, int source, int destination) {
        long start = System.nanoTime();

        // Build adjacency list
        Map<Integer, List<int[]>> adj = new HashMap<>();
        for (GraphNode n : nodes) adj.put(n.getId(), new ArrayList<>());
        for (GraphEdge e : edges) {
            adj.get(e.getFrom()).add(new int[]{e.getTo(), e.getTravelTime()});
            adj.get(e.getTo()).add(new int[]{e.getFrom(), e.getTravelTime()});
        }

        List<Integer> path = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();
        int current = source;
        int totalDistance = 0;
        path.add(current);
        visited.add(current);

        while (current != destination) {
            List<int[]> neighbors = adj.getOrDefault(current, new ArrayList<>());

            // Find nearest unvisited neighbor
            int nearest = -1;
            int nearestDist = Integer.MAX_VALUE;

            for (int[] neighbor : neighbors) {
                if (!visited.contains(neighbor[0]) && neighbor[1] < nearestDist) {
                    nearest = neighbor[0];
                    nearestDist = neighbor[1];
                }
            }

            if (nearest == -1) break; // stuck, no unvisited neighbors

            path.add(nearest);
            visited.add(nearest);
            totalDistance += nearestDist;
            current = nearest;
        }

        long end = System.nanoTime();
        return new RouteResult(path, totalDistance, current == destination, (end - start) / 1000);
    }
}
