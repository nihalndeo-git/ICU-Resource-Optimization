import React, { useState } from 'react';
import axios from 'axios';
import { Pill, Plus, FileBarChart, Award, ToggleLeft, ToggleRight } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/drug-inventory';

export default function DrugInventory() {
  const [numDrugs, setNumDrugs] = useState(10);
  const [scenario, setScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('fractional'); // 'fractional' or 'wholeBatch'

  const generateScenario = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await axios.get(`${API_BASE}/generate?numDrugs=${numDrugs}`);
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

  const currentResult = result ? (mode === 'fractional' ? result.fractional : result.wholeBatch) : null;
  const otherResult = result ? (mode === 'fractional' ? result.wholeBatch : result.fractional) : null;

  return (
    <div>
      <div className="dashboard-grid">
        <div className="controls-section glass-panel">
          <h2><Pill size={24} className="text-accent-primary" /> Drug Inventory Setup</h2>
          <div className="form-group">
            <label>Number of Drugs</label>
            <input type="number" min="3" max="15" value={numDrugs}
              onChange={e => setNumDrugs(parseInt(e.target.value))} />
          </div>
          <button className="btn" onClick={generateScenario} disabled={loading}>
            <Plus size={20} /> Generate Drug List
          </button>
          {scenario && (
            <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
              <div className="form-group mb-4">
                <label>Cold Storage Capacity (Litres)</label>
                <input type="number" value={scenario.capacity} disabled />
              </div>
              <button className="btn btn-success" onClick={runComparison} disabled={loading}>
                <FileBarChart size={20} /> Compare Fractional vs 0/1
              </button>
            </div>
          )}
          {result && (
            <div style={{marginTop: '1.5rem'}}>
              <label style={{marginBottom: '0.5rem', display: 'block'}}>View Mode</label>
              <div className="mode-toggle" onClick={() => setMode(mode === 'fractional' ? 'wholeBatch' : 'fractional')}>
                {mode === 'fractional' ? <ToggleLeft size={28} style={{color: '#3b82f6'}}/> : <ToggleRight size={28} style={{color: '#10b981'}}/>}
                <span style={{marginLeft: '0.5rem', color: mode === 'fractional' ? '#60a5fa' : '#34d399', fontWeight: 600}}>
                  {mode === 'fractional' ? 'Fractional (Greedy)' : 'Whole Batch (DP)'}
                </span>
              </div>
              <div className="theory-box" style={{marginTop: '1rem'}}>
                <h4>Algorithm Theory</h4>
                <div className="theory-item">
                  <span className="theory-label">Fractional Knapsack (Greedy)</span>
                  <span className="theory-complexity">O(n log n)</span>
                  <p>Sort by ratio, take fractions. <strong>Provably optimal</strong> for fractional case.</p>
                </div>
                <div className="theory-item">
                  <span className="theory-label">0/1 Knapsack (DP)</span>
                  <span className="theory-complexity">O(nW)</span>
                  <p>Whole batches only. dp[i][w] = max(dp[i-1][w], v[i]+dp[i-1][w-w[i]]). Optimal for integer.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="visualization-section">
          {result && (
            <div className="results-section glass-panel mb-6">
              <h2><Award size={24} className="text-success" /> Drug Inventory Comparison</h2>
              <div className="winner-banner" style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid #3b82f6',
                padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'
              }}>
                <strong style={{color: '#60a5fa'}}>
                  💊 Fractional Greedy is provably optimal for fractional case (Score: {result.fractional.totalCriticality.toFixed(1)})
                </strong>
                <br/>
                <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>
                  0/1 DP is optimal for whole-batch constraint (Score: {result.wholeBatch.totalCriticality.toFixed(1)})
                </span>
              </div>

              <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="algo-card" style={{ padding: '1rem', borderRadius: '12px',
                  background: mode === 'fractional' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.05)',
                  border: `1px solid ${mode === 'fractional' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}` }}>
                  <h3 style={{color: '#60a5fa'}}>Fractional (Greedy)</h3>
                  <div className="algo-stat"><span>Criticality:</span><strong>{result.fractional.totalCriticality.toFixed(1)}</strong></div>
                  <div className="algo-stat"><span>Volume Used:</span><strong>{result.fractional.totalVolumeUsed.toFixed(1)}L</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color:'#a855f7'}}>{result.fractional.runtimeMicroseconds}µs</strong></div>
                </div>
                <div className="algo-card" style={{ padding: '1rem', borderRadius: '12px',
                  background: mode === 'wholeBatch' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.05)',
                  border: `1px solid ${mode === 'wholeBatch' ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
                  <h3 style={{color: '#34d399'}}>Whole Batch (DP)</h3>
                  <div className="algo-stat"><span>Criticality:</span><strong>{result.wholeBatch.totalCriticality.toFixed(1)}</strong></div>
                  <div className="algo-stat"><span>Volume Used:</span><strong>{result.wholeBatch.totalVolumeUsed.toFixed(1)}L</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color:'#a855f7'}}>{result.wholeBatch.runtimeMicroseconds}µs</strong></div>
                </div>
              </div>
            </div>
          )}

          {result && currentResult && (
            <div className="glass-panel">
              <h2><Pill size={24} /> Drug Allocation – {mode === 'fractional' ? 'Fractional (Greedy)' : 'Whole Batch (DP)'}</h2>
              <div className="bar-chart-container">
                {scenario.drugs.map(drug => {
                  const alloc = currentResult.allocations.find(a => a.drugId === drug.id);
                  const fraction = alloc ? alloc.fractionTaken : 0;
                  const barColor = mode === 'fractional' ? '#3b82f6' : '#10b981';
                  return (
                    <div key={drug.id} className="bar-chart-row">
                      <span className="bar-chart-label">{drug.name}</span>
                      <div className="bar-chart-bg">
                        <div className="bar-chart-fill" style={{
                          width: `${fraction * 100}%`,
                          background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`
                        }}></div>
                        <span className="bar-chart-value">
                          {fraction === 1 ? '100%' : fraction === 0 ? '0%' : `${(fraction * 100).toFixed(1)}%`}
                          {alloc ? ` (${alloc.criticalityGained.toFixed(1)} crit)` : ''}
                        </span>
                      </div>
                      <span className="bar-chart-meta">{drug.volume}L / Crit: {drug.criticalityScore}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
