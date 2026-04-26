import React, { useState } from 'react';
import axios from 'axios';
import { Zap, FileBarChart, Award, BarChart3, Package, TrendingUp } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/combined';

const MODULE_META = {
  icu:       { label: 'ICU Triage',       color: '#3b82f6' },
  or:        { label: 'OR Scheduling',    color: '#a855f7' },
  drug:      { label: 'Drug Inventory',   color: '#10b981' },
  roster:    { label: 'Staff Rostering',  color: '#f59e0b' },
  ambulance: { label: 'Ambulance Routing',color: '#ef4444' },
};

export default function CombinedComparison({ modules }) {
  const [scenario, setScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateScenario = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await axios.get(`${API_BASE}/generate?modules=${modules.join(',')}`);
      setScenario(res.data);
    } catch (e) { alert("Backend required on port 8080"); }
    finally { setLoading(false); }
  };

  const runComparison = async () => {
    if (!scenario) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/compare`, scenario);
      setResult(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const groupedItems = scenario
    ? modules.map(modId => ({
        modId,
        meta: MODULE_META[modId],
        items: scenario.items.filter(item => item.moduleId === modId),
      }))
    : [];

  const dpWins = result && result.dp.totalValue > result.greedy.totalValue;
  const tie = result && result.dp.totalValue === result.greedy.totalValue;

  return (
    <div>
      {/* Controls Panel */}
      <div className="combined-controls glass-panel">
        <div className="combined-controls-header">
          <Package size={24} className="text-accent-primary" />
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>
              Combined Hospital Budget Optimization
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              {modules.length} interdependent module{modules.length > 1 ? 's' : ''} sharing a single resource pool
            </p>
          </div>
        </div>

        <div className="combined-actions">
          <button className="btn" onClick={generateScenario} disabled={loading}>
            <Zap size={20} />
            Generate Combined Dataset
          </button>
          {scenario && (
            <button className="btn btn-success" onClick={runComparison} disabled={loading}>
              <FileBarChart size={20} />
              Compare Greedy vs DP
            </button>
          )}
        </div>

        {scenario && (
          <div className="combined-stats-row">
            <div className="combined-stat">
              <span className="combined-stat-label">Total Items</span>
              <span className="combined-stat-value">{scenario.items.length}</span>
            </div>
            <div className="combined-stat">
              <span className="combined-stat-label">Shared Budget</span>
              <span className="combined-stat-value">{scenario.totalCapacity} units</span>
            </div>
            <div className="combined-stat">
              <span className="combined-stat-label">Total Cost of All Items</span>
              <span className="combined-stat-value">
                {scenario.items.reduce((sum, i) => sum + i.cost, 0)} units
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="combined-results glass-panel" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          <h2><Award size={24} className="text-success" /> Combined Greedy vs DP</h2>

          {/* Winner Banner */}
          <div className="winner-banner" style={{
            background: dpWins ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${dpWins ? '#10b981' : '#3b82f6'}`,
            padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'
          }}>
            <strong style={{ color: dpWins ? '#34d399' : '#60a5fa', fontSize: '1.1rem' }}>
              {dpWins
                ? `🏆 DP found a superior global optimum! (${result.dp.totalValue} vs ${result.greedy.totalValue})`
                : tie
                ? `🤝 Both algorithms found equally good solutions! (Score: ${result.dp.totalValue})`
                : `⚡ Greedy matched DP! (Score: ${result.greedy.totalValue})`}
            </strong>
          </div>

          {/* Side-by-side algo cards */}
          <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            {/* Greedy Card */}
            <div className="algo-card" style={{
              padding: '1.5rem', borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6'
            }}>
              <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Greedy (Ratio Sort)</h3>
              <div className="algo-stat">
                <span>Combined Score:</span>
                <strong style={{ color: result.greedy.totalValue < result.dp.totalValue ? '#ef4444' : '#10b981', fontSize: '1.2rem' }}>
                  {result.greedy.totalValue}
                </strong>
              </div>
              <div className="algo-stat">
                <span>Budget Used:</span>
                <strong>{result.greedy.totalCostUsed}/{scenario.totalCapacity}</strong>
              </div>
              <div className="algo-stat">
                <span>Items Selected:</span>
                <strong>{result.greedy.selectedItems.length}/{scenario.items.length}</strong>
              </div>
              <div className="algo-stat">
                <span>Runtime:</span>
                <strong style={{ color: '#a855f7' }}>{result.greedy.runtimeMicroseconds}µs</strong>
              </div>
              <div className="algo-complexity">O(n log n)</div>
            </div>

            {/* DP Card */}
            <div className="algo-card" style={{
              padding: '1.5rem', borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981'
            }}>
              <h3 style={{ color: '#34d399', marginBottom: '1rem' }}>DP (0/1 Knapsack)</h3>
              <div className="algo-stat">
                <span>Combined Score:</span>
                <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>
                  {result.dp.totalValue}
                </strong>
              </div>
              <div className="algo-stat">
                <span>Budget Used:</span>
                <strong>{result.dp.totalCostUsed}/{scenario.totalCapacity}</strong>
              </div>
              <div className="algo-stat">
                <span>Items Selected:</span>
                <strong>{result.dp.selectedItems.length}/{scenario.items.length}</strong>
              </div>
              <div className="algo-stat">
                <span>Runtime:</span>
                <strong style={{ color: '#a855f7' }}>{result.dp.runtimeMicroseconds}µs</strong>
              </div>
              <div className="algo-complexity">O(nW)</div>
            </div>
          </div>

          {/* Per-Module Breakdown */}
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} /> Per-Module Budget Allocation
          </h3>
          <div className="module-breakdown-grid">
            {modules.map(modId => {
              const meta = MODULE_META[modId];
              const greedyMod = result.greedy.moduleBreakdown[modId] || { totalValue: 0, totalCost: 0, itemCount: 0 };
              const dpMod = result.dp.moduleBreakdown[modId] || { totalValue: 0, totalCost: 0, itemCount: 0 };
              const maxValue = Math.max(greedyMod.totalValue, dpMod.totalValue, 1);

              return (
                <div key={modId} className="module-breakdown-card" style={{ borderLeftColor: meta.color }}>
                  <h4 style={{ color: meta.color, marginBottom: '0.75rem', fontSize: '1rem' }}>{meta.label}</h4>

                  {/* Greedy bar */}
                  <div className="breakdown-row">
                    <span className="breakdown-algo-label" style={{ color: '#60a5fa' }}>Greedy</span>
                    <div className="breakdown-bar-bg">
                      <div className="breakdown-bar-fill" style={{
                        width: `${(greedyMod.totalValue / maxValue) * 100}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                      }}></div>
                    </div>
                    <span className="breakdown-value">{greedyMod.totalValue} pts ({greedyMod.itemCount} items, {greedyMod.totalCost} cost)</span>
                  </div>

                  {/* DP bar */}
                  <div className="breakdown-row">
                    <span className="breakdown-algo-label" style={{ color: '#34d399' }}>DP</span>
                    <div className="breakdown-bar-bg">
                      <div className="breakdown-bar-fill" style={{
                        width: `${(dpMod.totalValue / maxValue) * 100}%`,
                        background: 'linear-gradient(90deg, #10b981, #34d399)'
                      }}></div>
                    </div>
                    <span className="breakdown-value">{dpMod.totalValue} pts ({dpMod.itemCount} items, {dpMod.totalCost} cost)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Table */}
      {scenario && (
        <div className="combined-items glass-panel" style={{ marginTop: '1.5rem' }}>
          <h2><TrendingUp size={24} /> Resource Items Pool</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
            All items from {modules.length} module{modules.length > 1 ? 's' : ''} competing for shared hospital budget
          </p>

          {groupedItems.map(({ modId, meta, items: modItems }) => (
            <div key={modId} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: meta.color, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                {meta.label} ({modItems.length} items)
              </h4>
              <div className="items-table">
                <div className="items-table-header">
                  <span>Item</span>
                  <span>Cost</span>
                  <span>Value</span>
                  <span>Ratio</span>
                  {result && <span>Greedy</span>}
                  {result && <span>DP</span>}
                </div>
                {modItems.map(item => {
                  const inGreedy = result && result.greedy.selectedItems.some(s => s.id === item.id);
                  const inDP = result && result.dp.selectedItems.some(s => s.id === item.id);
                  return (
                    <div key={item.id} className={`items-table-row ${inDP && result ? 'items-row-dp' : inGreedy && result ? 'items-row-greedy' : ''}`}>
                      <span className="items-label">{item.label}</span>
                      <span>{item.cost}</span>
                      <span>{item.value}</span>
                      <span style={{ color: '#a855f7' }}>{item.ratio.toFixed(2)}</span>
                      {result && (
                        <span style={{ color: inGreedy ? '#60a5fa' : '#475569' }}>
                          {inGreedy ? '✓' : '—'}
                        </span>
                      )}
                      {result && (
                        <span style={{ color: inDP ? '#34d399' : '#475569' }}>
                          {inDP ? '✓' : '—'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Theory Box */}
      {result && (
        <div className="theory-box" style={{ marginTop: '1.5rem' }}>
          <h4>Algorithm Theory — Combined Multi-Module Knapsack</h4>
          <div className="theory-item">
            <span className="theory-label">Greedy (Ratio Sort)</span>
            <span className="theory-complexity">O(n log n)</span>
            <p>
              Pools ALL items from every module, sorts by value/cost ratio, greedily picks
              highest-ratio items regardless of module. Fast but may miss the global optimum
              because it can't "undo" choices.
            </p>
          </div>
          <div className="theory-item">
            <span className="theory-label">DP (0/1 Knapsack)</span>
            <span className="theory-complexity">O(nW)</span>
            <p>
              Considers every possible combination across all modules.
              dp[i][w] = max(dp[i-1][w], value[i] + dp[i-1][w-cost[i]]).
              Guarantees the globally optimal allocation of shared budget.
            </p>
          </div>
          <div className="theory-item">
            <span className="theory-label">Interdependency</span>
            <p>
              All {modules.length} modules share a single budget pool. Allocating budget to one module
              (e.g., ICU patients) leaves less for others (e.g., surgeries, drugs). This creates
              genuine trade-offs that only DP can resolve optimally.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
