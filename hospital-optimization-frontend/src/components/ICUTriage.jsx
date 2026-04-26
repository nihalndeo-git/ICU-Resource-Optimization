import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Plus, FileBarChart, Users, Clock, Award } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/optimization';

export default function ICUTriage() {
  const [numPatients, setNumPatients] = useState(15);
  const [scenario, setScenario] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('greedy');

  const generateScenario = async () => {
    setLoading(true);
    setComparisonResult(null);
    try {
      const response = await axios.get(`${API_BASE}/generate?numPatients=${numPatients}`);
      setScenario(response.data);
    } catch (error) {
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
    <div>
      <div className="dashboard-grid">
        <div className="controls-section glass-panel">
          <h2><Activity size={24} className="text-accent-primary" /> Setup Scenario</h2>
          <div className="form-group">
            <label>Number of Patients to Simulate</label>
            <input type="number" min="5" max="100" value={numPatients}
              onChange={(e) => setNumPatients(parseInt(e.target.value))} />
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
              <button className="btn btn-success" onClick={runComparison} disabled={loading}>
                <FileBarChart size={20} /> Compare Greedy vs DP
              </button>
            </div>
          )}
        </div>

        <div className="visualization-section">
          {comparisonResult && scenario && (
            <div className="results-section glass-panel mb-6">
              <h2><Award size={24} className="text-success" /> Algorithm Comparison</h2>
              <div className="winner-banner" style={{
                background: comparisonResult.dp.totalPriorityScore > comparisonResult.greedy.totalPriorityScore ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                border: `1px solid ${comparisonResult.dp.totalPriorityScore > comparisonResult.greedy.totalPriorityScore ? '#10b981' : '#3b82f6'}`,
                padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'
              }}>
                <strong style={{color: comparisonResult.dp.totalPriorityScore > comparisonResult.greedy.totalPriorityScore ? '#34d399' : '#60a5fa'}}>
                  {comparisonResult.dp.totalPriorityScore > comparisonResult.greedy.totalPriorityScore
                    ? '🏆 DP found a superior optimal solution!'
                    : '🤝 Both algorithms found equally good solutions!'}
                </strong>
              </div>

              <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={`algo-card ${activeTab === 'greedy' ? 'active-border' : ''}`}
                  onClick={() => setActiveTab('greedy')}
                  style={{ padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s',
                    background: activeTab === 'greedy' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${activeTab === 'greedy' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}` }}>
                  <h3 style={{color: '#60a5fa', marginBottom: '1rem'}}>Greedy (Ratio Sort)</h3>
                  <div className="algo-stat"><span>Score:</span><strong style={{color: comparisonResult.greedy.totalPriorityScore < comparisonResult.dp.totalPriorityScore ? '#ef4444' : '#10b981'}}>{comparisonResult.greedy.totalPriorityScore}</strong></div>
                  <div className="algo-stat"><span>Time Used:</span><strong>{comparisonResult.greedy.totalTreatmentTimeUsed}/{scenario.capacity}</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color: '#a855f7'}}>{comparisonResult.greedy.runtimeMicroseconds}µs</strong></div>
                  <div className="algo-complexity">O(n log n)</div>
                </div>
                <div className={`algo-card ${activeTab === 'dp' ? 'active-border' : ''}`}
                  onClick={() => setActiveTab('dp')}
                  style={{ padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s',
                    background: activeTab === 'dp' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${activeTab === 'dp' ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
                  <h3 style={{color: '#34d399', marginBottom: '1rem'}}>DP (0/1 Knapsack)</h3>
                  <div className="algo-stat"><span>Score:</span><strong style={{color: '#10b981'}}>{comparisonResult.dp.totalPriorityScore}</strong></div>
                  <div className="algo-stat"><span>Time Used:</span><strong>{comparisonResult.dp.totalTreatmentTimeUsed}/{scenario.capacity}</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color: '#a855f7'}}>{comparisonResult.dp.runtimeMicroseconds}µs</strong></div>
                  <div className="algo-complexity">O(nW)</div>
                </div>
              </div>
            </div>
          )}

          {scenario && (
            <div className="glass-panel">
              <h2><Users size={24} /> Patient Queue
                {comparisonResult && <span style={{marginLeft: 'auto', fontSize:'1rem', color:'#94a3b8'}}>Viewing: {activeTab === 'greedy' ? 'Greedy Selection' : 'DP Selection'}</span>}
              </h2>
              <div className="patients-grid">
                {scenario.patients.map(patient => (
                  <div key={patient.id}
                    className={`patient-card ${isSelected(patient.id, activeTab) ? 'selected' : ''}`}
                    style={
                      isSelected(patient.id, activeTab) && activeTab === 'dp'
                      ? { borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.15)', boxShadow: '0 0 15px rgba(16,185,129,0.3)'}
                      : isSelected(patient.id, activeTab) && activeTab === 'greedy'
                      ? { borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)', boxShadow: '0 0 15px rgba(59,130,246,0.3)'}
                      : {}
                    }>
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
