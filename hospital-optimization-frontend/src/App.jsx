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

  return (
    <div className="app-container">
      <header>
        <h1>ICU Resource Optimization</h1>
        <p className="subtitle">Algorithmic Triage Allocation System</p>
      </header>

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
              <h2 className="mb-4"><Award size={24} className="text-success" /> Algorithm Comparison & Analysis</h2>
              
              {/* Winner Banner */}
              <div style={{
                background: comparisonResult.dp.totalPriorityScore > comparisonResult.greedy.totalPriorityScore ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                border: `1px solid ${comparisonResult.dp.totalPriorityScore > comparisonResult.greedy.totalPriorityScore ? '#10b981' : '#3b82f6'}`,
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <strong style={{color: comparisonResult.dp.totalPriorityScore > comparisonResult.greedy.totalPriorityScore ? '#34d399' : '#60a5fa'}}>
                  {comparisonResult.dp.totalPriorityScore > comparisonResult.greedy.totalPriorityScore ? 'Dynamic Programming found a superior optimal solution!' : 'Both algorithms found equally good solutions for this dataset!'}
                </strong>
                <p style={{fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem'}}>
                  {comparisonResult.dp.totalPriorityScore > comparisonResult.greedy.totalPriorityScore 
                    ? "The Greedy strategy fell into a local optimum trap and missed the mathematically best combination." 
                    : "Because of the simple dataset, the Greedy ratio sorting happened to perfectly align with the global optimum."}
                </p>
              </div>

              <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                
                {/* ---------- GREEDY COLUMN ---------- */}
                <div>
                  <div 
                    className={`algo-card ${activeTab === 'greedy' ? 'active-border' : ''}`}
                    onClick={() => setActiveTab('greedy')}
                    style={{ 
                      padding: '1.5rem', 
                      borderRadius: '12px', 
                      background: activeTab === 'greedy' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${activeTab === 'greedy' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      marginBottom: '1rem'
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

                  {/* Greedy Math Theory */}
                  {activeTab === 'greedy' && (
                    <div style={{background: 'rgba(15, 23, 42, 0.4)', padding: '1.2rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6', animation: 'fadeIn 0.3s ease-in'}}>
                      <h4 style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase'}}>Mathematical Why</h4>
                      <p style={{color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4'}}>
                        Locally optimal choices (sorting by ratio) approximate a globally optimal solution, which is why it runs much faster.
                      </p>
                      <div style={{background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '6px', fontSize: '0.85rem'}}>
                        <div style={{color: '#a855f7', fontFamily: 'monospace', marginBottom: '0.3rem'}}>T(n) = O(n log n)</div>
                        <span style={{color: '#94a3b8'}}>Sorting ratio calculation bound.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ---------- DP COLUMN ---------- */}
                <div>
                  <div 
                    className={`algo-card ${activeTab === 'dp' ? 'active-border' : ''}`}
                    onClick={() => setActiveTab('dp')}
                    style={{ 
                      padding: '1.5rem', 
                      borderRadius: '12px', 
                      background: activeTab === 'dp' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${activeTab === 'dp' ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      marginBottom: '1rem'
                    }}
                  >
                    <h3 style={{color: '#34d399', marginBottom: '1rem'}}>2. Dynamic Programming</h3>
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

                  {/* DP Math Theory */}
                  {activeTab === 'dp' && (
                    <div style={{background: 'rgba(15, 23, 42, 0.4)', padding: '1.2rem', borderRadius: '8px', borderLeft: '3px solid #10b981', animation: 'fadeIn 0.3s ease-in'}}>
                      <h4 style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase'}}>Mathematical Why</h4>
                      <p style={{color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4'}}>
                        Mathematically guarantees the optimal Knapsack limit by memoizing overlapping subproblems in a 2D matrix.
                      </p>
                      <div style={{background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                        <div style={{color: '#a855f7', fontFamily: 'monospace', marginBottom: '0.3rem'}}>dp[i][w] = max(dp[i-1][w], x + y)</div>
                        <span style={{color: '#94a3b8'}}>State recurrence relation constraint.</span>
                      </div>
                      <div style={{background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '6px', fontSize: '0.85rem'}}>
                        <div style={{color: '#34d399', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '0.3rem'}}>O(nW)</div>
                        <span style={{color: '#94a3b8'}}>Pseudo-polynomial nested boundary.</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
              <p style={{marginTop: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem'}}>
                Click on the algorithm cards above to view their mathematical theory and highlight selected patients below.
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
    </div>
  );
}

export default App;
