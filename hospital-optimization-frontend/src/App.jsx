import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Plus, Play, Clock, Award, Users, FileBarChart } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:8080/api/optimization';

function App() {
  const [numPatients, setNumPatients] = useState(15);
  const [scenario, setScenario] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('greedy'); // 'greedy' or 'dp'

  const generateScenario = async () => {
    setLoading(true);
    setComparisonResult(null);
    try {
      const response = await axios.get(`${API_BASE}/generate?numPatients=${numPatients}`);
      setScenario(response.data);
    } catch (error) {
      console.error("Error generating scenario:", error);
      alert("Requires Backend to be running on port 8080");
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async () => {
    if (!scenario) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/allocate/compare`, scenario);
      setComparisonResult(response.data);
    } catch (error) {
      console.error("Error running algorithm:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (patientId, algo) => {
    if (!comparisonResult) return false;
    const result = algo === 'greedy' ? comparisonResult.greedy : comparisonResult.dp;
    return result.selectedPatients.some(p => p.id === patientId);
  };

  // Top-level View toggle
  const [currentView, setCurrentView] = useState('simulation'); // 'simulation' or 'theory'

  return (
    <div className="app-container">
      <header>
        <h1>ICU Resource Optimization</h1>
        <p className="subtitle">Algorithmic Triage Allocation System</p>
        
        {/* Main Navigation Tabs */}
        <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem'}}>
          <button 
            className={`btn ${currentView === 'simulation' ? '' : 'inactive-btn'}`}
            style={{ 
              background: currentView === 'simulation' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--glass-bg)',
              border: currentView === 'simulation' ? 'none' : '1px solid var(--glass-border)'
            }}
            onClick={() => setCurrentView('simulation')}
          >
            <Activity size={18} /> Simulation Dashboard
          </button>
          <button 
            className={`btn ${currentView === 'theory' ? '' : 'inactive-btn'}`}
            style={{ 
              background: currentView === 'theory' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--glass-bg)',
              border: currentView === 'theory' ? 'none' : '1px solid var(--glass-border)'
            }}
            onClick={() => setCurrentView('theory')}
          >
            <FileBarChart size={18} /> Mathematical Theory
          </button>
        </div>
      </header>

      {/* --- SIMULATION VIEW --- */}
      {currentView === 'simulation' && (
        <div className="dashboard-grid">
          {/* Controls Panel */}
          <div className="controls-section glass-panel">
            <h2><Activity size={24} className="text-accent-primary" /> Setup Scenario</h2>
            
            <div className="form-group">
              <label>Number of Patients to Simulate</label>
              <input 
                type="number" 
                min="5" 
                max="100" 
                value={numPatients} 
                onChange={(e) => setNumPatients(parseInt(e.target.value))}
              />
            </div>
            
            <button className="btn" onClick={generateScenario} disabled={loading}>
              <Plus size={20} /> Generate Dataset
            </button>

            {scenario && (
              <div className="mt-8 pt-6 border-t border-glass-border">
                <div className="form-group mb-4">
                  <label>Available ICU Capacity (Hours)</label>
                  <input type="number" value={scenario.capacity} disabled />
                </div>
                <button 
                  className="btn" 
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  onClick={runComparison} 
                  disabled={loading}
                >
                  <FileBarChart size={20} /> Compare Greedy vs DP
                </button>
              </div>
            )}
          </div>

          {/* Visualization Panel */}
          <div className="visualization-section">
            {comparisonResult && scenario && (
              <div className="results-section glass-panel mb-6">
                <h2 className="mb-4"><Award size={24} className="text-success" /> Algorithm Comparison</h2>
                
                <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  
                  {/* Greedy Stats */}
                  <div 
                    className={`algo-card ${activeTab === 'greedy' ? 'active-border' : ''}`}
                    onClick={() => setActiveTab('greedy')}
                    style={{ 
                      padding: '1.5rem', 
                      borderRadius: '12px', 
                      background: activeTab === 'greedy' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${activeTab === 'greedy' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    <h3 style={{color: '#60a5fa', marginBottom: '1rem'}}>1. Greedy Algorithm</h3>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                      <span style={{color: '#94a3b8'}}>Score:</span>
                      <strong style={{color: comparisonResult.greedy.totalPriorityScore < comparisonResult.dp.totalPriorityScore ? '#ef4444' : '#10b981'}}>
                        {comparisonResult.greedy.totalPriorityScore}
                      </strong>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                      <span style={{color: '#94a3b8'}}>Time Used:</span>
                      <strong>{comparisonResult.greedy.totalTreatmentTimeUsed} / {scenario.capacity}</strong>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span style={{color: '#94a3b8'}}>Runtime:</span>
                      <strong style={{color: '#a855f7'}}>{comparisonResult.greedy.runtimeMicroseconds}µs</strong>
                    </div>
                  </div>

                  {/* DP Stats */}
                  <div 
                    className={`algo-card ${activeTab === 'dp' ? 'active-border' : ''}`}
                    onClick={() => setActiveTab('dp')}
                    style={{ 
                      padding: '1.5rem', 
                      borderRadius: '12px', 
                      background: activeTab === 'dp' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${activeTab === 'dp' ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    <h3 style={{color: '#34d399', marginBottom: '1rem'}}>2. Dynamic Programming (0/1 Knapsack)</h3>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                      <span style={{color: '#94a3b8'}}>Score:</span>
                      <strong style={{color: '#10b981'}}>{comparisonResult.dp.totalPriorityScore}</strong>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                      <span style={{color: '#94a3b8'}}>Time Used:</span>
                      <strong>{comparisonResult.dp.totalTreatmentTimeUsed} / {scenario.capacity}</strong>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span style={{color: '#94a3b8'}}>Runtime:</span>
                      <strong style={{color: '#a855f7'}}>{comparisonResult.dp.runtimeMicroseconds}µs</strong>
                    </div>
                  </div>

                </div>
                <p style={{marginTop: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem'}}>
                  Click on an algorithm card above to highlight its selected patients below.
                </p>
              </div>
            )}

            {scenario && (
              <div className="glass-panel">
                <h2><Users size={24} /> Patient Queue 
                  {comparisonResult && <span style={{marginLeft: 'auto', fontSize:'1rem', color:'#94a3b8'}}>Viewing: {activeTab === 'greedy' ? 'Greedy Selection' : 'DP Selection'}</span>}
                </h2>
                <div className="patients-grid">
                  {scenario.patients.map(patient => (
                    <div 
                      key={patient.id} 
                      className={`patient-card ${isSelected(patient.id, activeTab) ? 'selected' : ''}`}
                      style={
                        isSelected(patient.id, activeTab) && activeTab === 'dp' 
                        ? { borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.15)', boxShadow: '0 0 15px rgba(16,185,129,0.3)'} 
                        : isSelected(patient.id, activeTab) && activeTab === 'greedy'
                        ? { borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)', boxShadow: '0 0 15px rgba(59,130,246,0.3)'}
                        : {}
                      }
                    >
                      <div className="patient-header">
                        <span className="patient-id">Patient {patient.id}</span>
                        <span className="patient-ratio">{patient.priorityRatio.toFixed(2)}x</span>
                      </div>
                      <div className="patient-stats">
                        <span>Time: <span className="stat-value">{patient.treatmentTime}h</span></span>
                        <span>Priority: <span className="stat-value">{patient.priorityScore}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- THEORY VIEW --- */}
      {currentView === 'theory' && (
        <div className="glass-panel" style={{marginBottom: '2rem'}}>
          <h2 style={{borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem'}}>
            <Award size={24} className="text-accent-primary" /> Mathematical Derivations & Time Complexity
          </h2>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
            
            {/* Greedy Math */}
            <div style={{background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: '12px'}}>
              <h3 style={{color: '#60a5fa', marginBottom: '1rem', fontSize: '1.2rem'}}>Greedy Algorithm</h3>
              <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                The Greedy approach relies on locally optimal choices (sorting by Priority-to-Time ratio) to approximate a globally optimal solution.
              </p>
              
              <div style={{background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
                <div style={{marginBottom: '0.5rem'}}><strong>Phase A (Sorting):</strong></div>
                <div style={{fontFamily: 'monospace', color: '#a855f7'}}>T(n) = O(n log n)</div>
                <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem'}}>
                  Derived from comparing n items using a Divide and Conquer sort (like MergeSort or Timsort).
                </div>
              </div>

              <div style={{background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
                <div style={{marginBottom: '0.5rem'}}><strong>Phase B (Capacity Fill Loop):</strong></div>
                <div style={{fontFamily: 'monospace', color: '#a855f7'}}>T(n) = O(n)</div>
                <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem'}}>
                  Iterating exactly once through the n sorted items to sum capacity bounds.
                </div>
              </div>

              <div style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem'}}>
                <strong>Final Asymptotic Bound:</strong>
                <div style={{fontSize: '1.5rem', color: '#3b82f6', marginTop: '0.5rem', fontWeight: 'bold'}}>
                  O(n log n)
                </div>
              </div>
            </div>

            {/* DP Math */}
            <div style={{background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: '12px'}}>
              <h3 style={{color: '#10b981', marginBottom: '1rem', fontSize: '1.2rem'}}>Dynamic Programming</h3>
              <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                DP mathematically guarantees the optimal 0/1 Knapsack solution by memoizing overlapping subproblems in a 2D state matrix.
              </p>

              <div style={{background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
                <div style={{marginBottom: '0.5rem'}}><strong>State Recurrence Relation:</strong></div>
                <div style={{fontFamily: 'monospace', color: '#a855f7'}}>dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]])</div>
                <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem'}}>
                  Where i is the patient limit and w is the capacity bound.
                </div>
              </div>

              <div style={{background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
                <div style={{marginBottom: '0.5rem'}}><strong>Matrix Evaluation:</strong></div>
                <div style={{fontFamily: 'monospace', color: '#a855f7'}}>T(n, W) = n × W × O(1)</div>
                <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem'}}>
                  A nested iteration where the outer loop runs n times (patients) and the inner loop bounds by total Capacity W.
                </div>
              </div>

              <div style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem'}}>
                <strong>Final Asymptotic Bound:</strong>
                <div style={{fontSize: '1.5rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 'bold'}}>
                  O(nW)
                </div>
                <div style={{color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem'}}>
                  *Pseudo-polynomial time. Can degrade exponentially if W is extremely large.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
