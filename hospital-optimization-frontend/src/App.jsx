import React, { useState } from 'react';
import { Activity, Clock, Pill, Calendar, Map, Layers, Check, ChevronRight, Zap } from 'lucide-react';
import CombinedComparison from './components/CombinedComparison';
import './index.css';

const MODULES = [
  { id: 'icu',       label: 'ICU Triage',        icon: Activity,  color: '#3b82f6', description: '0/1 Knapsack — Maximize patient priority within ICU capacity' },
  { id: 'or',        label: 'OR Scheduling',      icon: Clock,     color: '#a855f7', description: 'Weighted Interval Scheduling — Maximize OR utilization' },
  { id: 'drug',      label: 'Drug Inventory',     icon: Pill,      color: '#10b981', description: 'Fractional vs 0/1 Knapsack — Optimize drug storage' },
  { id: 'roster',    label: 'Staff Rostering',    icon: Calendar,  color: '#f59e0b', description: 'Job Scheduling — Minimize staff fatigue' },
  { id: 'ambulance', label: 'Ambulance Routing',  icon: Map,       color: '#ef4444', description: 'Shortest Path — Dijkstra vs Nearest-Neighbour' },
];

const PARTS = [
  {
    id: 1,
    title: 'Part 1',
    subtitle: '1 Fixed Parameter',
    description: 'Select one module to analyze with Greedy vs DP comparison',
    requiredCount: 1,
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    id: 2,
    title: 'Part 2',
    subtitle: '2 Fixed Parameters',
    description: 'Select two modules and run side-by-side Greedy vs DP analysis',
    requiredCount: 2,
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    glowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    id: 3,
    title: 'Part 3',
    subtitle: '3 Fixed Parameters',
    description: 'Select three modules for a comprehensive multi-parameter comparison',
    requiredCount: 3,
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
];

function App() {
  const [activePart, setActivePart] = useState(null);       // null = landing, 1/2/3 = part selected
  const [selectedModules, setSelectedModules] = useState([]); // array of module ids
  const [locked, setLocked] = useState(false);                // once locked, show modules

  const currentPart = PARTS.find(p => p.id === activePart);

  const handlePartSelect = (partId) => {
    setActivePart(partId);
    setSelectedModules([]);
    setLocked(false);
  };

  const handleModuleToggle = (moduleId) => {
    if (locked) return; // can't change once locked
    setSelectedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      }
      // Enforce max selection count
      if (prev.length >= currentPart.requiredCount) {
        return prev;
      }
      return [...prev, moduleId];
    });
  };

  const handleLock = () => {
    if (selectedModules.length === currentPart.requiredCount) {
      setLocked(true);
    }
  };

  const handleReset = () => {
    setSelectedModules([]);
    setLocked(false);
  };

  const handleBackToLanding = () => {
    setActivePart(null);
    setSelectedModules([]);
    setLocked(false);
  };

  // ===== LANDING VIEW (no Part selected) =====
  if (!activePart) {
    return (
      <div className="app-container">
        <header>
          <h1>Hospital Resource Optimization</h1>
          <p className="subtitle">DAA Course Project — Greedy vs Dynamic Programming</p>
        </header>

        <div className="parts-landing">
          <p className="parts-landing-intro">
            Choose a part to begin. Each part fixes a different number of optimization parameters
            for Greedy vs DP comparison.
          </p>
          <div className="parts-grid">
            {PARTS.map(part => (
              <button
                key={part.id}
                className="part-card"
                onClick={() => handlePartSelect(part.id)}
                style={{ '--part-gradient': part.gradient, '--part-glow': part.glowColor }}
              >
                <div className="part-card-number">{part.id}</div>
                <h2 className="part-card-title">{part.title}</h2>
                <span className="part-card-badge">{part.subtitle}</span>
                <p className="part-card-desc">{part.description}</p>
                <div className="part-card-arrow">
                  <ChevronRight size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== PART VIEW (Part selected) =====
  return (
    <div className="app-container">
      <header>
        <h1>Hospital Resource Optimization</h1>
        <p className="subtitle">DAA Course Project — Greedy vs Dynamic Programming</p>
      </header>

      {/* Part Navigation Bar */}
      <div className="part-nav">
        <button className="part-nav-back" onClick={handleBackToLanding}>
          ← All Parts
        </button>
        <div className="part-nav-tabs">
          {PARTS.map(part => (
            <button
              key={part.id}
              className={`part-nav-tab ${activePart === part.id ? 'part-nav-tab-active' : ''}`}
              onClick={() => handlePartSelect(part.id)}
              style={activePart === part.id ? { borderColor: part.gradient.includes('#3b82f6') ? '#3b82f6' : part.gradient.includes('#8b5cf6') ? '#8b5cf6' : '#f59e0b' } : {}}
            >
              {part.title}
            </button>
          ))}
        </div>
      </div>

      {/* Module Picker */}
      {!locked && (
        <div className="module-picker glass-panel" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <div className="module-picker-header">
            <Layers size={24} style={{ color: currentPart.gradient.includes('#3b82f6') ? '#3b82f6' : currentPart.gradient.includes('#8b5cf6') ? '#8b5cf6' : '#f59e0b' }} />
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>
                {currentPart.title}: Select {currentPart.requiredCount} Parameter{currentPart.requiredCount > 1 ? 's' : ''}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                {selectedModules.length}/{currentPart.requiredCount} selected — {currentPart.description}
              </p>
            </div>
          </div>

          <div className="module-checkbox-grid">
            {MODULES.map(mod => {
              const Icon = mod.icon;
              const isSelected = selectedModules.includes(mod.id);
              const isDisabled = !isSelected && selectedModules.length >= currentPart.requiredCount;
              return (
                <button
                  key={mod.id}
                  className={`module-checkbox ${isSelected ? 'module-checkbox-selected' : ''} ${isDisabled ? 'module-checkbox-disabled' : ''}`}
                  onClick={() => handleModuleToggle(mod.id)}
                  style={isSelected ? { borderColor: mod.color, boxShadow: `0 0 20px ${mod.color}33` } : {}}
                >
                  <div className="module-checkbox-icon" style={{ background: isSelected ? `${mod.color}22` : 'rgba(15, 23, 42, 0.5)' }}>
                    {isSelected ? <Check size={20} style={{ color: mod.color }} /> : <Icon size={20} style={{ color: '#64748b' }} />}
                  </div>
                  <div className="module-checkbox-info">
                    <span className="module-checkbox-label" style={isSelected ? { color: mod.color } : {}}>{mod.label}</span>
                    <span className="module-checkbox-desc">{mod.description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="module-picker-actions">
            <button
              className="btn"
              onClick={handleLock}
              disabled={selectedModules.length !== currentPart.requiredCount}
              style={selectedModules.length === currentPart.requiredCount ? { background: currentPart.gradient } : { opacity: 0.4, cursor: 'not-allowed' }}
            >
              <Zap size={20} />
              Lock Parameters & Generate
            </button>
          </div>
        </div>
      )}

      {/* Locked State — Show Combined Comparison */}
      {locked && (
        <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          {/* Locked Banner */}
          <div className="locked-banner glass-panel">
            <div className="locked-banner-info">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                {currentPart.title} — {currentPart.requiredCount} Fixed Parameter{currentPart.requiredCount > 1 ? 's' : ''}
              </h3>
              <div className="locked-badges">
                {selectedModules.map(modId => {
                  const mod = MODULES.find(m => m.id === modId);
                  return (
                    <span key={modId} className="locked-badge" style={{ background: `${mod.color}22`, color: mod.color, border: `1px solid ${mod.color}44` }}>
                      {React.createElement(mod.icon, { size: 14 })} {mod.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <button className="btn-reset" onClick={handleReset}>
              Change Selection
            </button>
          </div>

          {/* Combined Interdependent Comparison */}
          <CombinedComparison modules={selectedModules} />
        </div>
      )}
    </div>
  );
}

export default App;
