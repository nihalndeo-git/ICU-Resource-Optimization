import React, { useState } from 'react';
import axios from 'axios';
import { Users, Plus, FileBarChart, Award, Calendar } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/staff-rostering';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOTS = ['Morning', 'Afternoon', 'Night'];
const STAFF_COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export default function StaffRostering() {
  const [numShifts, setNumShifts] = useState(8);
  const [scenario, setScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('greedy');

  const generateScenario = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await axios.get(`${API_BASE}/generate?numShifts=${numShifts}`);
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

  const currentResult = result ? (activeView === 'greedy' ? result.greedy : result.dp) : null;

  const getAssignment = (day, slot) => {
    if (!currentResult) return null;
    return currentResult.assignments.find(a => a.day === day && a.slotName === slot);
  };

  const getStaffColor = (staffId) => STAFF_COLORS[(staffId - 1) % STAFF_COLORS.length];

  return (
    <div>
      <div className="dashboard-grid">
        <div className="controls-section glass-panel">
          <h2><Calendar size={24} className="text-accent-primary" /> Roster Setup</h2>
          <div className="form-group">
            <label>Number of Shifts to Fill</label>
            <input type="number" min="3" max="15" value={numShifts}
              onChange={e => setNumShifts(parseInt(e.target.value))} />
          </div>
          <button className="btn" onClick={generateScenario} disabled={loading}>
            <Plus size={20} /> Generate Shifts & Staff
          </button>
          {scenario && (
            <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
              <p style={{color:'#94a3b8', fontSize:'0.9rem'}}>{scenario.shifts.length} shifts, {scenario.staff.length} staff generated</p>
              <button className="btn btn-success" onClick={runComparison} disabled={loading} style={{marginTop:'1rem'}}>
                <FileBarChart size={20} /> Compare Greedy vs DP
              </button>
            </div>
          )}

          {scenario && (
            <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
              <label style={{marginBottom: '0.5rem', display: 'block'}}>Staff Members</label>
              {scenario.staff.map(s => (
                <div key={s.id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.85rem'}}>
                  <span style={{width: '12px', height: '12px', borderRadius: '50%', background: getStaffColor(s.id), flexShrink: 0}}></span>
                  <span style={{color: '#e2e8f0'}}>{s.name}</span>
                  <span style={{color: '#64748b', marginLeft: 'auto'}}>F:{s.fatiguePerShift}</span>
                </div>
              ))}
            </div>
          )}

          {result && (
            <div className="theory-box" style={{marginTop: '1rem'}}>
              <h4>Algorithm Theory</h4>
              <div className="theory-item">
                <span className="theory-label">Greedy (EDF)</span>
                <span className="theory-complexity">O(S×M)</span>
                <p>Earliest Deadline First. Assigns best-fit staff per shift greedily.</p>
              </div>
              <div className="theory-item">
                <span className="theory-label">DP (Job Scheduling)</span>
                <span className="theory-complexity">O(S×M!)</span>
                <p>Exhaustive search with pruning. Finds globally minimum fatigue.</p>
              </div>
            </div>
          )}
        </div>

        <div className="visualization-section">
          {result && (
            <div className="results-section glass-panel mb-6">
              <h2><Award size={24} className="text-success" /> Fatigue Comparison</h2>
              <div className="winner-banner" style={{
                background: result.dp.totalFatigue < result.greedy.totalFatigue ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                border: `1px solid ${result.dp.totalFatigue < result.greedy.totalFatigue ? '#10b981' : '#3b82f6'}`,
                padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'
              }}>
                <strong style={{color: result.dp.totalFatigue < result.greedy.totalFatigue ? '#34d399' : '#60a5fa'}}>
                  {result.dp.totalFatigue < result.greedy.totalFatigue
                    ? `🏆 DP minimized fatigue! (${result.dp.totalFatigue} vs ${result.greedy.totalFatigue})`
                    : `🤝 Both achieved equal fatigue! (${result.dp.totalFatigue})`}
                </strong>
              </div>

              <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className={`algo-card ${activeView === 'greedy' ? '' : ''}`}
                  onClick={() => setActiveView('greedy')}
                  style={{ padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                    background: activeView === 'greedy' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${activeView === 'greedy' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}` }}>
                  <h3 style={{color: '#60a5fa'}}>Greedy (EDF)</h3>
                  <div className="algo-stat"><span>Total Fatigue:</span><strong style={{color: result.greedy.totalFatigue > result.dp.totalFatigue ? '#ef4444' : '#10b981'}}>{result.greedy.totalFatigue}</strong></div>
                  <div className="algo-stat"><span>Unfilled:</span><strong>{result.greedy.shiftsUnfilled}</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color:'#a855f7'}}>{result.greedy.runtimeMicroseconds}µs</strong></div>
                </div>
                <div className={`algo-card`}
                  onClick={() => setActiveView('dp')}
                  style={{ padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                    background: activeView === 'dp' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${activeView === 'dp' ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
                  <h3 style={{color: '#34d399'}}>DP (Job Scheduling)</h3>
                  <div className="algo-stat"><span>Total Fatigue:</span><strong style={{color: '#10b981'}}>{result.dp.totalFatigue}</strong></div>
                  <div className="algo-stat"><span>Unfilled:</span><strong>{result.dp.shiftsUnfilled}</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color:'#a855f7'}}>{result.dp.runtimeMicroseconds}µs</strong></div>
                </div>
              </div>
            </div>
          )}

          {result && currentResult && (
            <div className="glass-panel">
              <h2><Calendar size={24} /> Weekly Roster – {activeView === 'greedy' ? 'Greedy (EDF)' : 'DP (Job Scheduling)'}</h2>
              <div className="roster-grid">
                <div className="roster-header-cell"></div>
                {DAYS.map(d => <div key={d} className="roster-header-cell">{d}</div>)}
                {SLOTS.map(slot => (
                  <React.Fragment key={slot}>
                    <div className="roster-slot-label">{slot}</div>
                    {DAYS.map(day => {
                      const a = getAssignment(day, slot);
                      return (
                        <div key={day+slot} className="roster-cell"
                          style={a ? {background: getStaffColor(a.staffId) + '33', borderColor: getStaffColor(a.staffId)} : {}}>
                          {a ? (
                            <div>
                              <div style={{fontWeight: 600, fontSize: '0.8rem', color: getStaffColor(a.staffId)}}>{a.staffName}</div>
                              <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>Fatigue: {a.fatigueCost}</div>
                            </div>
                          ) : <span style={{color: '#475569', fontSize: '0.75rem'}}>—</span>}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
