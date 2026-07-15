import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';
import { 
  Sliders, Play, Square, AlertOctagon, ToggleLeft, ToggleRight, 
  Settings, ShieldCheck, Plus, Trash2, ShieldAlert
} from 'lucide-react';

const AdminPanel = () => {
  const { addToast } = useToast();

  // Rules list states
  const [rules, setRules] = useState([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleType, setNewRuleType] = useState('amount_threshold');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleWeight, setNewRuleWeight] = useState(20);
  const [newRuleSeverity, setNewRuleSeverity] = useState('Medium');

  // Simulator states
  const [simRunning, setSimRunning] = useState(false);
  const [simInterval, setSimInterval] = useState(5);

  const fetchRules = async () => {
    try {
      const res = await axios.get('/api/rules');
      if (res.data.success) {
        setRules(res.data.data);
      }
    } catch (e) {
      addToast('Rules Load Failed', 'Failed to retrieve active rules list.', 'error');
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Toggle rule status in Database
  const handleToggleRule = async (ruleId, currentStatus) => {
    try {
      const res = await axios.patch(`/api/rules/${ruleId}`, {
        isActive: !currentStatus
      });
      if (res.data.success) {
        addToast('Rule Config Updated', `Rule ${ruleId} is now ${!currentStatus ? 'Active' : 'Disabled'}.`, 'success');
        fetchRules();
      }
    } catch (e) {
      addToast('Toggle Failed', 'Unable to adjust rule status.', 'error');
    }
  };

  // Create new rule
  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!newRuleName || !newRuleDesc) {
      return addToast('Missing Information', 'Please provide rule name and descriptive conditions.', 'warning');
    }

    try {
      const res = await axios.post('/api/rules', {
        name: newRuleName,
        description: newRuleDesc,
        type: newRuleType,
        scoreWeight: parseInt(newRuleWeight),
        severity: newRuleSeverity
      });
      if (res.data.success) {
        addToast('New Rule Deployed', `Rule created successfully. Engine re-indexed.`, 'success');
        setNewRuleName('');
        setNewRuleDesc('');
        fetchRules();
      }
    } catch (err) {
      addToast('Rule Creation Failed', 'Failed to write rule to database.', 'error');
    }
  };

  // Delete a rule
  const handleDeleteRule = async (ruleId) => {
    try {
      const res = await axios.delete(`/api/rules/${ruleId}`);
      if (res.data.success) {
        addToast('Rule Removed', `Rule ${ruleId} was successfully deleted.`, 'success');
        fetchRules();
      }
    } catch (e) {
      addToast('Deletion Failed', 'Unable to delete rule.', 'error');
    }
  };

  // Simulator actions
  const handleStartSimulator = async () => {
    try {
      const res = await axios.post('/api/simulator/start', { interval: simInterval });
      if (res.data.success) {
        setSimRunning(true);
        addToast('Simulator Online', 'Mock transaction generator active. WebSockets piping live data.', 'success');
      }
    } catch (err) {
      addToast('Simulator Start Fail', 'Ensure backend server is running and accessible.', 'error');
    }
  };

  const handleStopSimulator = async () => {
    try {
      const res = await axios.post('/api/simulator/stop');
      if (res.data.success) {
        setSimRunning(false);
        addToast('Simulator Stopped', 'Mock transaction stream is now offline.', 'info');
      }
    } catch (e) {
      addToast('Stop Failed', 'Failed to halt simulation.', 'error');
    }
  };

  const handleTriggerBurst = async () => {
    addToast('Fraud Burst Triggered', 'Injecting 5 immediate high-risk anomalies into WebSocket feed.', 'info');
    try {
      const res = await axios.post('/api/simulator/burst');
      if (res.data.success) {
        addToast('Burst Sequence Complete', '5 fraudulent transactions generated successfully.', 'success');
      }
    } catch (err) {
      addToast('Burst Trigger Fail', 'Verify database connections.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        
        {/* Page title */}
        <div>
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-400" />
            Compliance Administration Panel
          </h2>
          <p className="text-xs text-slate-400">Configure real-time engine rules and manage live simulation modules</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules List (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Rules Table */}
            <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-4.5 w-4.5 text-indigo-400" />
                Active Fraud Detection Rules
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="pb-2">Rule ID</th>
                      <th className="pb-2">Rule Name</th>
                      <th className="pb-2">Score Weight</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rules.map((rule) => (
                      <tr key={rule.ruleId} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 font-mono text-slate-400">{rule.ruleId}</td>
                        <td className="py-3">
                          <div className="font-medium text-slate-200">{rule.name}</div>
                          <div className="text-[10px] text-slate-500 leading-normal max-w-[320px]">{rule.description}</div>
                        </td>
                        <td className="py-3 font-bold text-indigo-400 text-sm">+{rule.scoreWeight} pts</td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleToggleRule(rule.ruleId, rule.isActive)}
                            className="focus:outline-none cursor-pointer"
                          >
                            {rule.isActive ? (
                              <ToggleRight className="h-6 w-6 text-emerald-400 hover:text-emerald-300 transition-colors" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-slate-600 hover:text-slate-500 transition-colors" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteRule(rule.ruleId)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Rule Form */}
            <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4.5 w-4.5 text-indigo-400" />
                Deploy New Business Rule
              </h3>

              <form onSubmit={handleCreateRule} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Rule Title</label>
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="E.g. Velocity Threat Check"
                    className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Type Category</label>
                  <select
                    value={newRuleType}
                    onChange={(e) => setNewRuleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input bg-slate-900 focus:outline-none"
                  >
                    <option value="amount_threshold">Amount Threshold check</option>
                    <option value="velocity_limit">Velocity counts limit</option>
                    <option value="country_mismatch">Geographic Country mismatch</option>
                    <option value="device_mismatch">Device whitelist check</option>
                    <option value="blacklisted_merchant">Merchant blacklist check</option>
                    <option value="unusual_time">Time range check</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Description Conditions</label>
                  <input
                    type="text"
                    value={newRuleDesc}
                    onChange={(e) => setNewRuleDesc(e.target.value)}
                    placeholder="Triggers if transaction amount is higher than Average Customer Spend Ratio..."
                    className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Weight Severity (Risk points)</label>
                  <input
                    type="number"
                    value={newRuleWeight}
                    onChange={(e) => setNewRuleWeight(e.target.value)}
                    min={5}
                    max={100}
                    className="w-full px-3 py-2 rounded-xl glass-input focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Severity Rating</label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e) => setNewRuleSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input bg-slate-900 focus:outline-none"
                  >
                    <option value="Low">Low Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="High">High Severity</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-lg shadow-indigo-650/15"
                  >
                    Deploy to Engine
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Simulator Console (Right col) */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Live simulator panel */}
            <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none"></div>
              
              <div>
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="text-emerald-400 h-4.5 w-4.5" />
                  Live Transaction Simulator
                </h3>
                <p className="text-xs text-slate-500">Inject automated fake activity into Socket.io channel</p>
              </div>

              {/* Status lights */}
              <div className="p-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Simulator Status</span>
                <span className={`flex items-center gap-1.5 ${simRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${simRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
                  {simRunning ? 'ONLINE (Streaming)' : 'OFFLINE'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Evaluation Speed (Tick Interval)</label>
                <select
                  value={simInterval}
                  onChange={(e) => setSimInterval(parseInt(e.target.value))}
                  disabled={simRunning}
                  className="w-full px-3 py-2 rounded-xl glass-input bg-slate-900 border border-white/10 text-slate-200 focus:outline-none disabled:opacity-50"
                >
                  <option value="2">2 Seconds (High Rate)</option>
                  <option value="5">5 Seconds (Normal Traffic)</option>
                  <option value="10">10 Seconds (Slow Traffic)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleStartSimulator}
                  disabled={simRunning}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/10 flex justify-center items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  Start Live
                </button>
                <button
                  onClick={handleStopSimulator}
                  disabled={!simRunning}
                  className="flex-1 py-3 bg-slate-900 border border-white/5 hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-900 text-rose-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex justify-center items-center gap-1.5"
                >
                  <Square className="h-3.5 w-3.5" />
                  Halt Feed
                </button>
              </div>

              {/* Fraud Burst Injector */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Burst Generator Module</span>
                  <p className="text-[10px] text-slate-500">Triggers 5 highly anomalous foreign transfer sequence alerts instantly</p>
                </div>
                <button
                  onClick={handleTriggerBurst}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-650/15 flex justify-center items-center gap-1.5"
                >
                  <AlertOctagon className="h-4 w-4" />
                  Inject Fraud Burst
                </button>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminPanel;
