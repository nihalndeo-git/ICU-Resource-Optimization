package com.example.hospital_optimization_backend.service;

import com.example.hospital_optimization_backend.model.ResourceItem;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Combined optimization service that generates interdependent multi-module scenarios
 * and runs combined Greedy vs DP over a shared resource pool (Hospital Budget).
 *
 * All selected modules' items compete for the same total capacity.
 * Greedy: Sort all items by value/cost ratio, pick greedily.
 * DP: 0/1 Knapsack over all pooled items for global optimum.
 */
@Service
public class CombinedOptimizationService {

    private final Random random = new Random();

    // Drug names for generation
    private static final String[] DRUG_NAMES = {
        "Remdesivir", "Dexamethasone", "Heparin", "Norepinephrine", "Propofol",
        "Midazolam", "Fentanyl", "Vancomycin", "Meropenem", "Insulin"
    };

    // Staff names for generation
    private static final String[] STAFF_NAMES = {
        "Dr. Smith", "Dr. Patel", "Dr. Chen", "Nurse Jones", "Nurse Williams", "Dr. Kumar"
    };

    // Location names for ambulance
    private static final String[] LOCATION_NAMES = {
        "Hospital", "Clinic A", "Clinic B", "Pharmacy", "Lab", "Emergency Site"
    };

    /**
     * Generates a combined scenario with items from all selected modules,
     * sharing one total capacity budget.
     */
    public CombinedScenario generateCombinedScenario(List<String> moduleIds) {
        List<ResourceItem> allItems = new ArrayList<>();
        int globalId = 1;

        for (String moduleId : moduleIds) {
            switch (moduleId) {
                case "icu":
                    globalId = generateICUItems(allItems, globalId);
                    break;
                case "or":
                    globalId = generateORItems(allItems, globalId);
                    break;
                case "drug":
                    globalId = generateDrugItems(allItems, globalId);
                    break;
                case "roster":
                    globalId = generateRosterItems(allItems, globalId);
                    break;
                case "ambulance":
                    globalId = generateAmbulanceItems(allItems, globalId);
                    break;
            }
        }

        // Total capacity = ~50% of total cost (forces interesting trade-offs)
        int totalCost = allItems.stream().mapToInt(ResourceItem::getCost).sum();
        int totalCapacity = Math.max(10, (int)(totalCost * 0.5));

        return new CombinedScenario(moduleIds, allItems, totalCapacity);
    }

    /**
     * Runs combined Greedy vs DP on the shared resource pool.
     */
    public CombinedResult compareCombined(CombinedScenario scenario) {
        List<ResourceItem> items = scenario.getItems();
        int capacity = scenario.getTotalCapacity();

        // === GREEDY: Sort all items by ratio, pick greedily ===
        long greedyStart = System.nanoTime();
        List<ResourceItem> greedySorted = new ArrayList<>(items);
        Collections.sort(greedySorted); // sorts by ratio descending

        List<ResourceItem> greedySelected = new ArrayList<>();
        int greedyCostUsed = 0;
        int greedyTotalValue = 0;

        for (ResourceItem item : greedySorted) {
            if (greedyCostUsed + item.getCost() <= capacity) {
                greedySelected.add(item);
                greedyCostUsed += item.getCost();
                greedyTotalValue += item.getValue();
            }
        }
        long greedyEnd = System.nanoTime();

        // === DP: 0/1 Knapsack over all items ===
        long dpStart = System.nanoTime();
        int n = items.size();
        int[][] dp = new int[n + 1][capacity + 1];

        for (int i = 1; i <= n; i++) {
            ResourceItem item = items.get(i - 1);
            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w]; // don't take item i
                if (item.getCost() <= w) {
                    dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - item.getCost()] + item.getValue());
                }
            }
        }

        // Backtrack to find selected items
        List<ResourceItem> dpSelected = new ArrayList<>();
        int dpCostUsed = 0;
        int dpTotalValue = dp[n][capacity];
        int w = capacity;
        for (int i = n; i >= 1; i--) {
            if (dp[i][w] != dp[i - 1][w]) {
                dpSelected.add(items.get(i - 1));
                dpCostUsed += items.get(i - 1).getCost();
                w -= items.get(i - 1).getCost();
            }
        }
        Collections.reverse(dpSelected);
        long dpEnd = System.nanoTime();

        // Build per-module breakdowns
        Map<String, ModuleBreakdown> greedyBreakdown = buildBreakdown(greedySelected, scenario.getModuleIds());
        Map<String, ModuleBreakdown> dpBreakdown = buildBreakdown(dpSelected, scenario.getModuleIds());

        AlgorithmResult greedyResult = new AlgorithmResult(
            "Greedy (Ratio Sort)", "O(n log n)",
            greedySelected, greedyTotalValue, greedyCostUsed,
            (greedyEnd - greedyStart) / 1000, greedyBreakdown
        );

        AlgorithmResult dpResult = new AlgorithmResult(
            "DP (0/1 Knapsack)", "O(nW)",
            dpSelected, dpTotalValue, dpCostUsed,
            (dpEnd - dpStart) / 1000, dpBreakdown
        );

        return new CombinedResult(greedyResult, dpResult);
    }

    // ==================== Item Generators ====================

    private int generateICUItems(List<ResourceItem> items, int startId) {
        int id = startId;

        // Greedy trap: Patient 1 has high ratio but low total value
        items.add(new ResourceItem(id++, "icu", "ICU Triage", "Patient 1 (Critical)", 4, 24));
        items.add(new ResourceItem(id++, "icu", "ICU Triage", "Patient 2 (Severe)", 4, 23));
        items.add(new ResourceItem(id++, "icu", "ICU Triage", "Patient 3 (Moderate)", 6, 31));

        // Random patients
        for (int i = 0; i < 4; i++) {
            int cost = random.nextInt(4) + 3;  // 3-6
            int value = (cost * 3) + random.nextInt(5);
            items.add(new ResourceItem(id++, "icu", "ICU Triage", "Patient " + (i + 4), cost, value));
        }
        return id;
    }

    private int generateORItems(List<ResourceItem> items, int startId) {
        int id = startId;

        // Greedy trap: Surgery 1 has low cost but low weight
        items.add(new ResourceItem(id++, "or", "OR Scheduling", "Cardiac Surgery", 4, 2));
        items.add(new ResourceItem(id++, "or", "OR Scheduling", "Neuro Surgery", 3, 6));
        items.add(new ResourceItem(id++, "or", "OR Scheduling", "Ortho Surgery", 3, 3));
        items.add(new ResourceItem(id++, "or", "OR Scheduling", "Transplant Surgery", 2, 5));

        // Random surgeries
        for (int i = 0; i < 3; i++) {
            int cost = random.nextInt(3) + 2;  // 2-4
            int value = random.nextInt(4) + 1;
            items.add(new ResourceItem(id++, "or", "OR Scheduling", "Surgery " + (i + 5), cost, value));
        }
        return id;
    }

    private int generateDrugItems(List<ResourceItem> items, int startId) {
        int id = startId;
        int count = Math.min(6, DRUG_NAMES.length);

        for (int i = 0; i < count; i++) {
            int cost = random.nextInt(5) + 2;   // 2-6
            int value = random.nextInt(12) + 5;  // 5-16
            items.add(new ResourceItem(id++, "drug", "Drug Inventory", DRUG_NAMES[i], cost, value));
        }
        return id;
    }

    private int generateRosterItems(List<ResourceItem> items, int startId) {
        int id = startId;
        String[] shifts = {"Mon Morning", "Mon Night", "Tue Morning", "Wed Afternoon", "Thu Night", "Fri Morning"};

        for (int i = 0; i < shifts.length; i++) {
            int fatigueCost = random.nextInt(4) + 3;  // 3-6
            int coverageValue = random.nextInt(8) + 5;  // 5-12
            String staffName = STAFF_NAMES[i % STAFF_NAMES.length];
            items.add(new ResourceItem(id++, "roster", "Staff Rostering",
                staffName + " → " + shifts[i], fatigueCost, coverageValue));
        }
        return id;
    }

    private int generateAmbulanceItems(List<ResourceItem> items, int startId) {
        int id = startId;

        // Model ambulance as "dispatch options" — each option costs time and provides response value
        String[] routes = {"Route Alpha (Direct)", "Route Beta (Highway)", "Route Gamma (Shortcut)",
                          "Route Delta (Scenic)", "Route Epsilon (Express)"};
        for (int i = 0; i < routes.length; i++) {
            int timeCost = random.nextInt(5) + 2;      // 2-6
            int responseValue = random.nextInt(10) + 4; // 4-13
            items.add(new ResourceItem(id++, "ambulance", "Ambulance Routing", routes[i], timeCost, responseValue));
        }
        return id;
    }

    // ==================== Breakdown Helper ====================

    private Map<String, ModuleBreakdown> buildBreakdown(List<ResourceItem> selected, List<String> moduleIds) {
        Map<String, ModuleBreakdown> breakdown = new LinkedHashMap<>();

        // Initialize all modules
        for (String modId : moduleIds) {
            breakdown.put(modId, new ModuleBreakdown(modId, 0, 0, 0, new ArrayList<>()));
        }

        // Populate from selected items
        for (ResourceItem item : selected) {
            ModuleBreakdown mb = breakdown.get(item.getModuleId());
            if (mb != null) {
                mb.setTotalValue(mb.getTotalValue() + item.getValue());
                mb.setTotalCost(mb.getTotalCost() + item.getCost());
                mb.setItemCount(mb.getItemCount() + 1);
                mb.getSelectedItems().add(item);
            }
        }

        return breakdown;
    }

    // ==================== DTOs ====================

    public static class CombinedScenario {
        private List<String> moduleIds;
        private List<ResourceItem> items;
        private int totalCapacity;

        public CombinedScenario() {}
        public CombinedScenario(List<String> moduleIds, List<ResourceItem> items, int totalCapacity) {
            this.moduleIds = moduleIds;
            this.items = items;
            this.totalCapacity = totalCapacity;
        }

        public List<String> getModuleIds() { return moduleIds; }
        public void setModuleIds(List<String> moduleIds) { this.moduleIds = moduleIds; }
        public List<ResourceItem> getItems() { return items; }
        public void setItems(List<ResourceItem> items) { this.items = items; }
        public int getTotalCapacity() { return totalCapacity; }
        public void setTotalCapacity(int totalCapacity) { this.totalCapacity = totalCapacity; }
    }

    public static class AlgorithmResult {
        private String algorithmName;
        private String complexity;
        private List<ResourceItem> selectedItems;
        private int totalValue;
        private int totalCostUsed;
        private long runtimeMicroseconds;
        private Map<String, ModuleBreakdown> moduleBreakdown;

        public AlgorithmResult(String algorithmName, String complexity,
                              List<ResourceItem> selectedItems, int totalValue,
                              int totalCostUsed, long runtimeMicroseconds,
                              Map<String, ModuleBreakdown> moduleBreakdown) {
            this.algorithmName = algorithmName;
            this.complexity = complexity;
            this.selectedItems = selectedItems;
            this.totalValue = totalValue;
            this.totalCostUsed = totalCostUsed;
            this.runtimeMicroseconds = runtimeMicroseconds;
            this.moduleBreakdown = moduleBreakdown;
        }

        public String getAlgorithmName() { return algorithmName; }
        public String getComplexity() { return complexity; }
        public List<ResourceItem> getSelectedItems() { return selectedItems; }
        public int getTotalValue() { return totalValue; }
        public int getTotalCostUsed() { return totalCostUsed; }
        public long getRuntimeMicroseconds() { return runtimeMicroseconds; }
        public Map<String, ModuleBreakdown> getModuleBreakdown() { return moduleBreakdown; }
    }

    public static class ModuleBreakdown {
        private String moduleId;
        private int totalValue;
        private int totalCost;
        private int itemCount;
        private List<ResourceItem> selectedItems;

        public ModuleBreakdown() {}
        public ModuleBreakdown(String moduleId, int totalValue, int totalCost, int itemCount, List<ResourceItem> selectedItems) {
            this.moduleId = moduleId;
            this.totalValue = totalValue;
            this.totalCost = totalCost;
            this.itemCount = itemCount;
            this.selectedItems = selectedItems;
        }

        public String getModuleId() { return moduleId; }
        public void setModuleId(String moduleId) { this.moduleId = moduleId; }
        public int getTotalValue() { return totalValue; }
        public void setTotalValue(int totalValue) { this.totalValue = totalValue; }
        public int getTotalCost() { return totalCost; }
        public void setTotalCost(int totalCost) { this.totalCost = totalCost; }
        public int getItemCount() { return itemCount; }
        public void setItemCount(int itemCount) { this.itemCount = itemCount; }
        public List<ResourceItem> getSelectedItems() { return selectedItems; }
        public void setSelectedItems(List<ResourceItem> selectedItems) { this.selectedItems = selectedItems; }
    }

    public static class CombinedResult {
        private AlgorithmResult greedy;
        private AlgorithmResult dp;

        public CombinedResult(AlgorithmResult greedy, AlgorithmResult dp) {
            this.greedy = greedy;
            this.dp = dp;
        }

        public AlgorithmResult getGreedy() { return greedy; }
        public AlgorithmResult getDp() { return dp; }
    }
}
