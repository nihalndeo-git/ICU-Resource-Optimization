package com.example.hospital_optimization_backend.service;

import com.example.hospital_optimization_backend.model.*;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class DrugInventoryService {
    private final GreedyDrugAllocator greedyAllocator = new GreedyDrugAllocator();
    private final DPDrugAllocator dpAllocator = new DPDrugAllocator();

    private static final String[] DRUG_NAMES = {
        "Remdesivir", "Dexamethasone", "Heparin", "Norepinephrine", "Propofol",
        "Midazolam", "Fentanyl", "Vancomycin", "Meropenem", "Insulin",
        "Epinephrine", "Amiodarone", "Dopamine", "Atropine", "Mannitol"
    };

    public Scenario generateScenario(int numDrugs) {
        List<Drug> drugs = new ArrayList<>();
        Random random = new Random();

        for (int i = 0; i < numDrugs && i < DRUG_NAMES.length; i++) {
            int volume = random.nextInt(8) + 2;         // 2-9 litres
            int criticality = random.nextInt(15) + 5;    // 5-19
            drugs.add(new Drug(i + 1, DRUG_NAMES[i], volume, criticality));
        }

        // Capacity ~40-60% of total volume to force interesting trade-offs
        int totalVolume = drugs.stream().mapToInt(Drug::getVolume).sum();
        int capacity = (int)(totalVolume * 0.5);

        return new Scenario(drugs, capacity);
    }

    public ComparisonResult compare(Scenario scenario) {
        GreedyDrugAllocator.DrugAllocationResult fractionalResult =
            greedyAllocator.allocate(scenario.getDrugs(), scenario.getCapacity());
        GreedyDrugAllocator.DrugAllocationResult wholeBatchResult =
            dpAllocator.allocate(scenario.getDrugs(), scenario.getCapacity());
        return new ComparisonResult(fractionalResult, wholeBatchResult);
    }

    // --- DTOs ---
    public static class Scenario {
        private List<Drug> drugs;
        private int capacity;
        public Scenario() {}
        public Scenario(List<Drug> drugs, int capacity) { this.drugs = drugs; this.capacity = capacity; }
        public List<Drug> getDrugs() { return drugs; }
        public void setDrugs(List<Drug> drugs) { this.drugs = drugs; }
        public int getCapacity() { return capacity; }
        public void setCapacity(int capacity) { this.capacity = capacity; }
    }

    public static class ComparisonResult {
        private GreedyDrugAllocator.DrugAllocationResult fractional;
        private GreedyDrugAllocator.DrugAllocationResult wholeBatch;
        public ComparisonResult(GreedyDrugAllocator.DrugAllocationResult fractional, GreedyDrugAllocator.DrugAllocationResult wholeBatch) {
            this.fractional = fractional; this.wholeBatch = wholeBatch;
        }
        public GreedyDrugAllocator.DrugAllocationResult getFractional() { return fractional; }
        public GreedyDrugAllocator.DrugAllocationResult getWholeBatch() { return wholeBatch; }
    }
}
