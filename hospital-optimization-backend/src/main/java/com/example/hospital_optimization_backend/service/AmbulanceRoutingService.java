package com.example.hospital_optimization_backend.service;

import com.example.hospital_optimization_backend.model.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AmbulanceRoutingService {
    private final GreedyRouter greedyRouter = new GreedyRouter();
    private final DijkstraRouter dijkstraRouter = new DijkstraRouter();

    /**
     * Generates a hospital network graph with a "greedy trap" topology.
     * The graph is designed so that the nearest-neighbour path from
     * the hospital (node 0) to the emergency (last node) is suboptimal.
     *
     * Topology example:
     *   Hospital(0) --2-- A(1) --10-- Emergency(5)
     *        |                           |
     *        3                           1
     *        |                           |
     *       B(2) --1-- C(3) --1-- D(4) --+
     *
     * Greedy picks 0->1 (shortest hop=2), then 1->5 (hop=10), total=12.
     * Dijkstra finds 0->2->3->4->5, total = 3+1+1+1 = 6.
     */
    public Scenario generateScenario(int numNodes) {
        List<GraphNode> nodes = new ArrayList<>();
        List<GraphEdge> edges = new ArrayList<>();

        // Fixed trap topology (at least 6 nodes)
        int n = Math.max(numNodes, 6);

        // Node positions for canvas rendering (placed in a rough layout)
        nodes.add(new GraphNode(0, "Hospital", 80, 200));
        nodes.add(new GraphNode(1, "Clinic A", 250, 100));
        nodes.add(new GraphNode(2, "Clinic B", 250, 300));
        nodes.add(new GraphNode(3, "Pharmacy", 420, 300));
        nodes.add(new GraphNode(4, "Lab", 570, 300));
        nodes.add(new GraphNode(5, "Emergency", 570, 100));

        // THE GREEDY TRAP:
        // Direct path via node 1 looks short at first hop (2) but leads to long edge (10)
        edges.add(new GraphEdge(0, 1, 2));   // Hospital -> Clinic A (short - greedy bait)
        edges.add(new GraphEdge(1, 5, 10));  // Clinic A -> Emergency (very long)

        // Optimal path via nodes 2,3,4 — longer first hop but much shorter total
        edges.add(new GraphEdge(0, 2, 3));   // Hospital -> Clinic B
        edges.add(new GraphEdge(2, 3, 1));   // Clinic B -> Pharmacy
        edges.add(new GraphEdge(3, 4, 1));   // Pharmacy -> Lab
        edges.add(new GraphEdge(4, 5, 1));   // Lab -> Emergency

        // Add some extra edges for visual interest
        edges.add(new GraphEdge(1, 3, 8));   // Cross edge
        edges.add(new GraphEdge(2, 4, 5));   // Cross edge

        // Add random extra nodes if requested
        Random random = new Random();
        for (int i = 6; i < n; i++) {
            double x = 100 + random.nextDouble() * 500;
            double y = 50 + random.nextDouble() * 350;
            nodes.add(new GraphNode(i, "Location " + i, x, y));

            // Connect to 1-2 existing nodes
            int conn1 = random.nextInt(i);
            edges.add(new GraphEdge(i, conn1, random.nextInt(8) + 2));
            if (i > 2) {
                int conn2 = random.nextInt(i);
                while (conn2 == conn1) conn2 = random.nextInt(i);
                edges.add(new GraphEdge(i, conn2, random.nextInt(8) + 2));
            }
        }

        int source = 0;
        int destination = 5;
        return new Scenario(nodes, edges, source, destination);
    }

    public ComparisonResult compare(Scenario scenario) {
        GreedyRouter.RouteResult greedyRes = greedyRouter.findRoute(
            scenario.getNodes(), scenario.getEdges(), scenario.getSource(), scenario.getDestination()
        );
        GreedyRouter.RouteResult dpRes = dijkstraRouter.findRoute(
            scenario.getNodes(), scenario.getEdges(), scenario.getSource(), scenario.getDestination()
        );
        return new ComparisonResult(greedyRes, dpRes);
    }

    // --- DTOs ---
    public static class Scenario {
        private List<GraphNode> nodes;
        private List<GraphEdge> edges;
        private int source;
        private int destination;
        public Scenario() {}
        public Scenario(List<GraphNode> nodes, List<GraphEdge> edges, int source, int destination) {
            this.nodes = nodes; this.edges = edges; this.source = source; this.destination = destination;
        }
        public List<GraphNode> getNodes() { return nodes; }
        public void setNodes(List<GraphNode> nodes) { this.nodes = nodes; }
        public List<GraphEdge> getEdges() { return edges; }
        public void setEdges(List<GraphEdge> edges) { this.edges = edges; }
        public int getSource() { return source; }
        public void setSource(int source) { this.source = source; }
        public int getDestination() { return destination; }
        public void setDestination(int destination) { this.destination = destination; }
    }

    public static class ComparisonResult {
        private GreedyRouter.RouteResult greedy;
        private GreedyRouter.RouteResult dijkstra;
        public ComparisonResult(GreedyRouter.RouteResult greedy, GreedyRouter.RouteResult dijkstra) {
            this.greedy = greedy; this.dijkstra = dijkstra;
        }
        public GreedyRouter.RouteResult getGreedy() { return greedy; }
        public GreedyRouter.RouteResult getDijkstra() { return dijkstra; }
    }
}
