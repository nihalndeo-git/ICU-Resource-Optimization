import React, { useState } from 'react';
import axios from 'axios';
import { Clock, Plus, FileBarChart, Award } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/or-scheduling';

export default function ORScheduling() {
  const [numSurgeries, setNumSurgeries] = useState(10);
  const [scenario, setScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateScenario = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await axios.get(`${API_BASE}/generate?numSurgeries=${numSurgeries}`);
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

  const maxEnd = scenario ? Math.max(...scenario.surgeries.map(s => s.endTime)) : 24;

  const isSelectedBy = (surgeryId, algo) => {
    if (!result) return false;
    const r = algo === 'greedy' ? result.greedy : result.dp;
    return r.selectedSurgeries.some(s => s.id === surgeryId);
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="controls-section glass-panel">
          <h2><Clock size={24} className="text-accent-primary" /> Setup OR Scenario</h2>
          <div className="form-group">
            <label>Number of Surgeries</label>
            <input type="number" min="4" max="20" value={numSurgeries}
              onChange={e => setNumSurgeries(parseInt(e.target.value))} />
          </div>
          <button className="btn" onClick={generateScenario} disabled={loading}>
            <Plus size={20} /> Generate Surgeries
          </button>
          {scenario && (
            <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
              <p style={{color:'#94a3b8', fontSize:'0.9rem'}}>{scenario.surgeries.length} surgeries generated</p>
              <button className="btn btn-success" onClick={runComparison} disabled={loading} style={{marginTop:'1rem'}}>
                <FileBarChart size={20} /> Compare Greedy vs DP
              </button>
            </div>
          )}
          {result && (
            <div className="theory-box" style={{marginTop: '1.5rem'}}>
              <h4>Algorithm Theory</h4>
              <div className="theory-item">
                <span className="theory-label">Greedy (Activity Selection)</span>
                <span className="theory-complexity">O(n log n)</span>
                <p>Sort by finish time, greedily pick non-overlapping. Optimal only when all weights are equal.</p>
              </div>
              <div className="theory-item">
                <span className="theory-label">DP (Weighted Interval)</span>
                <span className="theory-complexity">O(n log n)</span>
                <p>Binary search + memoisation. dp[i] = max(dp[i-1], w[i] + dp[p(i)]). Always optimal.</p>
              </div>
            </div>
          )}
        </div>

        <div className="visualization-section">
          {result && (
            <div className="results-section glass-panel mb-6">
              <h2><Award size={24} className="text-success" /> OR Scheduling Comparison</h2>
              <div className="winner-banner" style={{
                background: result.dp.totalPriorityWeight > result.greedy.totalPriorityWeight ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                border: `1px solid ${result.dp.totalPriorityWeight > result.greedy.totalPriorityWeight ? '#10b981' : '#3b82f6'}`,
                padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'
              }}>
                <strong style={{color: result.dp.totalPriorityWeight > result.greedy.totalPriorityWeight ? '#34d399' : '#60a5fa'}}>
                  {result.dp.totalPriorityWeight > result.greedy.totalPriorityWeight
                    ? `🏆 DP found superior schedule! (Score: ${result.dp.totalPriorityWeight} vs ${result.greedy.totalPriorityWeight})`
                    : `🤝 Both found equal schedules! (Score: ${result.dp.totalPriorityWeight})`}
                </strong>
              </div>

              <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="algo-card" style={{ padding: '1rem', borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' }}>
                  <h3 style={{color: '#60a5fa'}}>Greedy – Activity Selection</h3>
                  <div className="algo-stat"><span>Total Weight:</span><strong>{result.greedy.totalPriorityWeight}</strong></div>
                  <div className="algo-stat"><span>Surgeries Selected:</span><strong>{result.greedy.selectedSurgeries.length}</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color:'#a855f7'}}>{result.greedy.runtimeMicroseconds}µs</strong></div>
                </div>
                <div className="algo-card" style={{ padding: '1rem', borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }}>
                  <h3 style={{color: '#34d399'}}>DP – Weighted Interval</h3>
                  <div className="algo-stat"><span>Total Weight:</span><strong>{result.dp.totalPriorityWeight}</strong></div>
                  <div className="algo-stat"><span>Surgeries Selected:</span><strong>{result.dp.selectedSurgeries.length}</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color:'#a855f7'}}>{result.dp.runtimeMicroseconds}µs</strong></div>
                </div>
              </div>
            </div>
          )}

          {scenario && (
            <div className="glass-panel">
              <h2><Clock size={24} /> Gantt Chart – Surgery Timeline</h2>
              {['Greedy Selection', 'DP Selection'].map((label, idx) => (
                <div key={label} style={{marginBottom: '2rem'}}>
                  <h3 style={{color: idx === 0 ? '#60a5fa' : '#34d399', marginBottom: '0.5rem', fontSize: '1.1rem'}}>{label}</h3>
                  <div className="gantt-container">
                    {/* Time axis */}
                    <div className="gantt-axis">
                      {Array.from({length: maxEnd + 1}, (_, i) => (
                        <span key={i} className="gantt-tick" style={{left: `${(i / maxEnd) * 100}%`}}>{i}</span>
                      ))}
                    </div>
                    {/* Surgery bars */}
                    {scenario.surgeries.map(s => {
                      const algo = idx === 0 ? 'greedy' : 'dp';
                      const selected = isSelectedBy(s.id, algo);
                      const left = (s.startTime / maxEnd) * 100;
                      const width = ((s.endTime - s.startTime) / maxEnd) * 100;
                      return (
                        <div key={s.id} className="gantt-row">
                          <span className="gantt-label">S{s.id} (w:{s.priorityWeight})</span>
                          <div className="gantt-bar-bg">
                            <div className={`gantt-bar ${selected ? (idx === 0 ? 'gantt-selected-greedy' : 'gantt-selected-dp') : 'gantt-rejected'}`}
                              style={{ left: `${left}%`, width: `${width}%` }}>
                              {s.startTime}-{s.endTime}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
