package com.example.hospital_optimization_backend.model;

import java.util.*;

/**
 * Dijkstra's Algorithm for Ambulance Routing.
 *
 * Classic single-source shortest path algorithm using a priority queue.
 * Dijkstra is DP in nature: it relaxes edges over subproblems,
 * guaranteeing the true shortest route.
 *
 * Time Complexity: O((V + E) log V) with a priority queue
 *
 * Always finds the globally optimal shortest path from source to destination.
 */
public class DijkstraRouter {

    public GreedyRouter.RouteResult findRoute(List<GraphNode> nodes, List<GraphEdge> edges, int source, int destination) {
        long start = System.nanoTime();

        // Build adjacency list
        Map<Integer, List<int[]>> adj = new HashMap<>();
        for (GraphNode n : nodes) adj.put(n.getId(), new ArrayList<>());
        for (GraphEdge e : edges) {
            adj.get(e.getFrom()).add(new int[]{e.getTo(), e.getTravelTime()});
            adj.get(e.getTo()).add(new int[]{e.getFrom(), e.getTravelTime()});
        }

        // Dijkstra's algorithm
        Map<Integer, Integer> dist = new HashMap<>();
        Map<Integer, Integer> prev = new HashMap<>();
        for (GraphNode n : nodes) {
            dist.put(n.getId(), Integer.MAX_VALUE);
            prev.put(n.getId(), -1);
        }
        dist.put(source, 0);

        // Priority queue: [distance, nodeId]
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        pq.offer(new int[]{0, source});

        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int d = curr[0];
            int u = curr[1];

            if (d > dist.get(u)) continue; // stale entry
            if (u == destination) break;    // found shortest to dest

            for (int[] neighbor : adj.getOrDefault(u, new ArrayList<>())) {
                int v = neighbor[0];
                int weight = neighbor[1];
                int newDist = d + weight;

                if (newDist < dist.get(v)) {
                    dist.put(v, newDist);
                    prev.put(v, u);
                    pq.offer(new int[]{newDist, v});
                }
            }
        }

        // Reconstruct path
        List<Integer> path = new ArrayList<>();
        boolean reached = dist.get(destination) != Integer.MAX_VALUE;
        if (reached) {
            int node = destination;
            while (node != -1) {
                path.add(node);
                node = prev.get(node);
            }
            Collections.reverse(path);
        }

        long end = System.nanoTime();
        return new GreedyRouter.RouteResult(path, reached ? dist.get(destination) : -1, reached, (end - start) / 1000);
    }
}
