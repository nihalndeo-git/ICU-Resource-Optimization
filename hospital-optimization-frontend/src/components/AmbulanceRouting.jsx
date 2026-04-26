import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Map, Plus, FileBarChart, Award } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/ambulance-routing';

export default function AmbulanceRouting() {
  const [numNodes, setNumNodes] = useState(8);
  const [scenario, setScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const generateScenario = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await axios.get(`${API_BASE}/generate?numNodes=${numNodes}`);
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

  // Canvas drawing
  useEffect(() => {
    if (!scenario || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Scale coordinates
    const maxX = Math.max(...scenario.nodes.map(n => n.x)) + 40;
    const maxY = Math.max(...scenario.nodes.map(n => n.y)) + 40;
    const scale = (x, y) => [(x / maxX) * (W - 80) + 40, (y / maxY) * (H - 80) + 40];
    const nodeMap = {};
    scenario.nodes.forEach(n => { nodeMap[n.id] = n; });

    // Draw edges (all)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#334155';
    scenario.edges.forEach(e => {
      const [x1, y1] = scale(nodeMap[e.from].x, nodeMap[e.from].y);
      const [x2, y2] = scale(nodeMap[e.to].x, nodeMap[e.to].y);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Edge weight label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Outfit';
      ctx.fillText(e.travelTime, (x1 + x2) / 2 + 5, (y1 + y2) / 2 - 5);
    });

    // Draw algorithm paths
    if (result) {
      const drawPath = (path, color, offset) => {
        if (path.length < 2) return;
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.setLineDash([]);
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
          const node = nodeMap[path[i]];
          const [x, y] = scale(node.x, node.y);
          if (i === 0) ctx.moveTo(x + offset, y + offset);
          else ctx.lineTo(x + offset, y + offset);
        }
        ctx.stroke();

        // Draw arrows
        for (let i = 0; i < path.length - 1; i++) {
          const n1 = nodeMap[path[i]], n2 = nodeMap[path[i + 1]];
          const [x1, y1] = scale(n1.x, n1.y);
          const [x2, y2] = scale(n2.x, n2.y);
          const midX = (x1 + x2) / 2 + offset;
          const midY = (y1 + y2) / 2 + offset;
          const angle = Math.atan2(y2 - y1, x2 - x1);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(midX + 8 * Math.cos(angle), midY + 8 * Math.sin(angle));
          ctx.lineTo(midX - 5 * Math.cos(angle - 0.5), midY - 5 * Math.sin(angle - 0.5));
          ctx.lineTo(midX - 5 * Math.cos(angle + 0.5), midY - 5 * Math.sin(angle + 0.5));
          ctx.fill();
        }
      };

      drawPath(result.greedy.path, '#3b82f6', -3);
      drawPath(result.dijkstra.path, '#10b981', 3);
    }

    // Draw nodes
    scenario.nodes.forEach(n => {
      const [x, y] = scale(n.x, n.y);
      const isSource = n.id === scenario.source;
      const isDest = n.id === scenario.destination;
      const radius = isSource || isDest ? 18 : 14;
      const color = isSource ? '#f59e0b' : isDest ? '#ef4444' : '#475569';

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color + '44';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = `${isSource || isDest ? 'bold ' : ''}11px Outfit`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.name.length > 8 ? n.name.substring(0, 8) : n.name, x, y);
    });

  }, [scenario, result]);

  return (
    <div>
      <div className="dashboard-grid">
        <div className="controls-section glass-panel">
          <h2><Map size={24} className="text-accent-primary" /> Network Setup</h2>
          <div className="form-group">
            <label>Number of Locations</label>
            <input type="number" min="6" max="15" value={numNodes}
              onChange={e => setNumNodes(parseInt(e.target.value))} />
          </div>
          <button className="btn" onClick={generateScenario} disabled={loading}>
            <Plus size={20} /> Generate Network
          </button>
          {scenario && (
            <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
              <p style={{color:'#94a3b8', fontSize:'0.9rem'}}>
                {scenario.nodes.length} locations, {scenario.edges.length} roads
              </p>
              <div style={{display: 'flex', gap: '0.5rem', margin: '0.5rem 0', alignItems: 'center'}}>
                <span style={{width:12, height:12, borderRadius: '50%', background: '#f59e0b'}}></span>
                <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>Source: Hospital</span>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <span style={{width:12, height:12, borderRadius: '50%', background: '#ef4444'}}></span>
                <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>Destination: Emergency</span>
              </div>
              <button className="btn btn-success" onClick={runComparison} disabled={loading} style={{marginTop:'1rem'}}>
                <FileBarChart size={20} /> Find Routes
              </button>
            </div>
          )}
          {result && (
            <div style={{marginTop: '1rem'}}>
              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem'}}>
                <span style={{width: 20, height: 3, background: '#3b82f6', borderRadius: 2}}></span>
                <span style={{color: '#60a5fa', fontSize: '0.85rem'}}>Greedy Path</span>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <span style={{width: 20, height: 3, background: '#10b981', borderRadius: 2}}></span>
                <span style={{color: '#34d399', fontSize: '0.85rem'}}>Dijkstra Path</span>
              </div>
            </div>
          )}
          {result && (
            <div className="theory-box" style={{marginTop: '1rem'}}>
              <h4>Algorithm Theory</h4>
              <div className="theory-item">
                <span className="theory-label">Greedy (Nearest-Neighbour)</span>
                <span className="theory-complexity">O(V²)</span>
                <p>Always picks closest adjacent node. Fast but can get trapped.</p>
              </div>
              <div className="theory-item">
                <span className="theory-label">Dijkstra (DP-based)</span>
                <span className="theory-complexity">O((V+E)logV)</span>
                <p>Priority queue relaxation. Guarantees true shortest path.</p>
              </div>
            </div>
          )}
        </div>

        <div className="visualization-section">
          {result && (
            <div className="results-section glass-panel mb-6">
              <h2><Award size={24} className="text-success" /> Routing Comparison</h2>
              <div className="winner-banner" style={{
                background: result.dijkstra.totalDistance < result.greedy.totalDistance ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                border: `1px solid ${result.dijkstra.totalDistance < result.greedy.totalDistance ? '#10b981' : '#3b82f6'}`,
                padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'
              }}>
                <strong style={{color: result.dijkstra.totalDistance < result.greedy.totalDistance ? '#34d399' : '#60a5fa'}}>
                  {result.dijkstra.totalDistance < result.greedy.totalDistance
                    ? `🏆 Dijkstra found shorter route! (${result.dijkstra.totalDistance} vs ${result.greedy.totalDistance} min)`
                    : `🤝 Both found the same route! (${result.dijkstra.totalDistance} min)`}
                </strong>
              </div>

              <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="algo-card" style={{ padding: '1rem', borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' }}>
                  <h3 style={{color: '#60a5fa'}}>Greedy (Nearest-Neighbour)</h3>
                  <div className="algo-stat"><span>Distance:</span><strong style={{color: result.greedy.totalDistance > result.dijkstra.totalDistance ? '#ef4444' : '#10b981'}}>{result.greedy.totalDistance} min</strong></div>
                  <div className="algo-stat"><span>Path:</span><strong>{result.greedy.path.join(' → ')}</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color:'#a855f7'}}>{result.greedy.runtimeMicroseconds}µs</strong></div>
                </div>
                <div className="algo-card" style={{ padding: '1rem', borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }}>
                  <h3 style={{color: '#34d399'}}>Dijkstra (Shortest Path)</h3>
                  <div className="algo-stat"><span>Distance:</span><strong style={{color: '#10b981'}}>{result.dijkstra.totalDistance} min</strong></div>
                  <div className="algo-stat"><span>Path:</span><strong>{result.dijkstra.path.join(' → ')}</strong></div>
                  <div className="algo-stat"><span>Runtime:</span><strong style={{color:'#a855f7'}}>{result.dijkstra.runtimeMicroseconds}µs</strong></div>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel">
            <h2><Map size={24} /> Hospital Network Graph</h2>
            <canvas ref={canvasRef} width={700} height={420}
              style={{width: '100%', height: 'auto', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)'}}
            />
            {!scenario && <p style={{textAlign: 'center', color: '#64748b', marginTop: '1rem'}}>Generate a network to visualize</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
