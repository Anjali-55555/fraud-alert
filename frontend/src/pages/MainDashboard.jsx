import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import LiveFeed from '../components/LiveFeed';
import WorldMap from '../components/WorldMap';
import AICopilot from '../components/AICopilot';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  ShieldAlert, ShieldCheck, DollarSign, RefreshCw, Layers, 
  Sparkles, FileUp, FileDown, Search, ArrowRight, UserPlus, Filter, ShieldX
} from 'lucide-react';

const MainDashboard = () => {
  const { user } = useAuth();
  const { liveTransactions, setLiveTransactions } = useSocket();
  const { addToast } = useToast();
  
  // States
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  // Customer-specific states
  const [customerProfile, setCustomerProfile] = useState(null);
  const [newDevice, setNewDevice] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [testMerchant, setTestMerchant] = useState('Walmart Store');
  const [testAmount, setTestAmount] = useState('50.00');
  const [testCountry, setTestCountry] = useState('US');
  const [testDevice, setTestDevice] = useState('Chrome OS / Windows Desktop');
  const [submittingTx, setSubmittingTx] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const fileInputRef = useRef(null);

  // Load staff analytics dashboard
  const fetchDashboardData = async () => {
    try {
      const resStats = await axios.get('/api/analytics/dashboard');
      if (resStats.data.success) {
        setStats(resStats.data.data);
      }
    } catch (e) {
      console.log('Error fetching stats:', e.message);
    }
  };

  // Load transactions list (filtered & paginated)
  const fetchTransactions = async () => {
    try {
      const resTx = await axios.get('/api/transactions', {
        params: {
          page,
          limit: 10,
          search,
          status: statusFilter,
          riskLevel: riskFilter
        }
      });
      if (resTx.data.success) {
        setTransactions(resTx.data.data);
        setTotalPages(resTx.data.pagination.totalPages);
      }
    } catch (e) {
      console.log('Error fetching transactions:', e.message);
    }
  };

  // Load customer profile if role is Customer
  const fetchCustomerProfile = async () => {
    try {
      const detailRes = await axios.get('/api/customers/me');
      if (detailRes.data.success) {
        setCustomerProfile(detailRes.data.data);
        setTransactions(detailRes.data.recentTransactions);
      }
    } catch (e) {
      console.log('Error fetching customer profile:', e.message);
    }
  };

  useEffect(() => {
    if (user.role !== 'Customer') {
      fetchDashboardData();
      fetchTransactions();
    } else {
      fetchCustomerProfile();
    }
    setLoading(false);
  }, [user, page, statusFilter, riskFilter]);

  // Hook search triggers
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (user.role !== 'Customer') fetchTransactions();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Handle live WebSocket insertions
  useEffect(() => {
    if (liveTransactions.length > 0 && user.role !== 'Customer') {
      // Merge live transaction with table locally
      setTransactions(prev => {
        const ids = new Set(prev.map(t => t.transactionId));
        const filteredLive = liveTransactions.filter(lt => !ids.has(lt.transactionId));
        return [...filteredLive, ...prev].slice(0, 10);
      });
      // Refresh aggregate metrics
      fetchDashboardData();
    }
  }, [liveTransactions]);

  // CSV file import handler
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    addToast('CSV Import Started', 'Ingesting transactions list and running dynamic risk assessments.', 'info');

    try {
      const res = await axios.post('/api/transactions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        addToast('CSV Ingest Complete', res.data.message, 'success');
        fetchTransactions();
        fetchDashboardData();
      }
    } catch (err) {
      addToast('CSV Parsing Error', err.response?.data?.message || 'Check CSV column headers compatibility', 'error');
    }
  };

  // Add customer trusted device
  const handleAddTrust = async (type, value) => {
    if (!value.trim()) return;
    try {
      const res = await axios.post(`/api/customers/${customerProfile.customerId}/trust`, { type, value });
      if (res.data.success) {
        addToast('Trusted Log Added', `Successfully added '${value}' to your profile.`, 'success');
        if (type === 'device') {
          setNewDevice('');
        } else {
          setNewLocation('');
        }
        fetchCustomerProfile();
      }
    } catch (e) {
      addToast('Update Failed', 'Unable to record parameter values.', 'error');
    }
  };

  // Execute customer test transaction
  const handleCreateTestTx = async (e) => {
    e.preventDefault();
    if (!testAmount || isNaN(testAmount) || parseFloat(testAmount) <= 0) {
      return addToast('Invalid Amount', 'Please specify a positive numeric value.', 'warning');
    }
    
    setSubmittingTx(true);
    try {
      const res = await axios.post('/api/transactions', {
        customerId: customerProfile.customerId,
        customerName: customerProfile.fullName,
        accountNumber: customerProfile.accountNumber,
        merchant: testMerchant,
        amount: parseFloat(testAmount),
        currency: 'USD',
        location: 'New York',
        country: testCountry.toUpperCase(),
        dateTime: new Date(),
        paymentMethod: 'Credit Card',
        ipAddress: '192.168.1.15',
        device: testDevice
      });
      if (res.data.success) {
        const isApproved = res.data.data.status === 'Approved';
        addToast(
          isApproved ? 'Purchase Approved' : 'Purchase Flagged',
          `Risk score: ${res.data.data.riskScore} (${res.data.data.riskLevel}). ${isApproved ? 'Approved successfully.' : 'Flagged as suspicious.'}`,
          isApproved ? 'success' : 'error'
        );
        setTestAmount('');
        fetchCustomerProfile();
      }
    } catch (err) {
      addToast('Transaction Failed', err.response?.data?.message || 'Server error processing transaction', 'error');
    } finally {
      setSubmittingTx(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex justify-center items-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- CUSTOMER DASHBOARD ---
  if (user.role === 'Customer') {
    return (
      <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
          {/* Hero Widget */}
          <div className="p-6 rounded-2xl glass-accent border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                Secure Account
              </span>
              <h2 className="text-xl font-bold mt-2">Welcome Back, {customerProfile?.fullName || user.firstName}</h2>
              <p className="text-xs text-slate-400">Account: {customerProfile?.accountNumber} • Email: {user.email}</p>
            </div>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Risk Rating</span>
                <div className={`text-sm font-bold mt-0.5 ${
                  customerProfile?.riskLevel === 'High' ? 'text-rose-500' : 'text-emerald-500'
                }`}>{customerProfile?.riskLevel || 'Low'}</div>
              </div>
              <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Avg Spending</span>
                <div className="text-sm font-bold text-slate-100 mt-0.5">${customerProfile?.averageSpending || 0}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trusted parameters */}
            <div className="md:col-span-1 space-y-6">
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="font-bold text-sm text-slate-200">Registered Trusted Devices</h3>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {customerProfile?.trustedDevices.map((d, i) => (
                    <div key={i} className="text-xs px-2.5 py-1.5 bg-slate-900/60 border border-white/5 rounded-lg text-slate-300">
                      {d}
                    </div>
                  )) || <p className="text-xs text-slate-500">None registered</p>}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newDevice}
                    onChange={(e) => setNewDevice(e.target.value)}
                    placeholder="E.g. iPhone 15 / Chrome"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddTrust('device', newDevice)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="font-bold text-sm text-slate-200">Trusted Transaction Countries</h3>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {customerProfile?.trustedLocations.map((loc, i) => (
                    <div key={i} className="text-xs px-2.5 py-1.5 bg-slate-900/60 border border-white/5 rounded-lg text-slate-300">
                      {loc}
                    </div>
                  )) || <p className="text-xs text-slate-500">None registered</p>}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="E.g. US, GB, CA"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddTrust('location', newLocation)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Mock Transaction Terminal Card */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <h3 className="font-bold text-sm text-slate-200">Mock Transaction Terminal</h3>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Simulate a card purchase. Execute transactions with high amounts or from foreign countries to watch the Risk Engine rules and AI analyze them live.
                </p>
                <form onSubmit={handleCreateTestTx} className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500">Merchant</label>
                    <input
                      type="text"
                      value={testMerchant}
                      onChange={(e) => setTestMerchant(e.target.value)}
                      placeholder="E.g. Apple Store"
                      className="w-full px-3 py-1.5 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testAmount}
                        onChange={(e) => setTestAmount(e.target.value)}
                        placeholder="100.00"
                        className="w-full px-3 py-1.5 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Country Code</label>
                      <input
                        type="text"
                        value={testCountry}
                        onChange={(e) => setTestCountry(e.target.value)}
                        placeholder="US"
                        className="w-full px-3 py-1.5 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500">Device signature</label>
                    <input
                      type="text"
                      value={testDevice}
                      onChange={(e) => setTestDevice(e.target.value)}
                      placeholder="iPhone 15 / Chrome"
                      className="w-full px-3 py-1.5 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingTx}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    {submittingTx ? 'Processing Purchase...' : 'Execute Test Purchase'}
                  </button>
                </form>
              </div>
            </div>

            {/* Transactions History */}
            <div className="md:col-span-2 glass-card p-5 rounded-2xl border border-white/5 flex flex-col">
              <h3 className="font-bold text-sm text-slate-200 mb-4">Recent Transaction Statement</h3>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Merchant</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Location</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx) => (
                      <tr 
                        key={tx.transactionId} 
                        onClick={() => setSelectedTx(tx)}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        title="Click to view detailed receipt & AI analysis"
                      >
                        <td className="py-2.5 font-mono text-indigo-400 hover:text-indigo-300 font-semibold">{tx.transactionId}</td>
                        <td className="py-2.5 font-medium">{tx.merchant}</td>
                        <td className="py-2.5 font-bold">${tx.amount.toLocaleString()}</td>
                        <td className="py-2.5 text-slate-400">{tx.location}, {tx.country}</td>
                        <td className="py-2.5 text-slate-400">{new Date(tx.dateTime).toLocaleDateString()}</td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            tx.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Transaction Detail Receipt Modal */}
          {selectedTx && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
              <div className="max-w-md w-full glass-card p-6 rounded-2xl border border-white/10 space-y-6 shadow-2xl relative">
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
                >
                  ✕
                </button>
                
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    selectedTx.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">Transaction Details</h3>
                    <p className="text-[10px] text-indigo-400 font-semibold font-mono">{selectedTx.transactionId}</p>
                  </div>
                </div>

                <div className="divide-y divide-white/5 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Merchant</span>
                    <span className="font-semibold text-slate-200">{selectedTx.merchant}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Amount</span>
                    <span className="font-bold text-slate-200">${selectedTx.amount.toLocaleString()}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Location</span>
                    <span className="text-slate-200">{selectedTx.location}, {selectedTx.country}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Device Signature</span>
                    <span className="text-slate-200">{selectedTx.device}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Payment Method</span>
                    <span className="text-slate-200">{selectedTx.paymentMethod}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Risk Score & Classification</span>
                    <span className={`font-semibold ${
                      selectedTx.riskLevel === 'High' ? 'text-rose-500' : 'text-emerald-500'
                    }`}>
                      {selectedTx.riskScore} ({selectedTx.riskLevel})
                    </span>
                  </div>
                  <div className="py-3.5 space-y-1.5">
                    <span className="text-slate-400 font-semibold block uppercase text-[9px] tracking-wider">AI Copilot Analysis</span>
                    <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-950/40 p-3 rounded-xl border border-white/5 font-medium">
                      {selectedTx.aiExplanation || 'AI analysis is currently evaluating this transaction...'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedTx(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- STAFF DASHBOARD (Analyst, Admin, Manager) ---
  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-6">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">prevented losses</span>
              <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                ${stats?.metrics?.moneySaved ? stats.metrics.moneySaved.toLocaleString() : '142,300'}
              </div>
              <p className="text-[9px] text-emerald-400">Prevented Capital Drain</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Active Alerts</span>
              <div className="text-xl md:text-2xl font-bold text-rose-400">
                {stats?.metrics?.todayFraud || 14}
              </div>
              <p className="text-[9px] text-rose-500">Requires Urgent Action</p>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">False Positive Rate</span>
              <div className="text-xl md:text-2xl font-bold text-indigo-400">
                {stats?.metrics?.falsePositiveRate || '7.8'}%
              </div>
              <p className="text-[9px] text-indigo-400">Analyst verified safe</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Aggregate Volume</span>
              <div className="text-xl md:text-2xl font-bold text-slate-100">
                {stats?.metrics?.totalTransactions || 500}
              </div>
              <p className="text-[9px] text-slate-500">Total API Transactions</p>
            </div>
            <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Visuals - Map & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WorldMap data={stats?.countryDistribution} />
          </div>
          <div className="lg:col-span-1">
            <LiveFeed transactions={transactions} />
          </div>
        </div>

        {/* Dynamic Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trend Area Chart */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 md:col-span-2">
            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Volume & Alert Ingestion Trend</h3>
              <p className="text-[11px] text-slate-500">Historical analysis of scanned transactions</p>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.fraudTrend || []}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={10} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#090D16', border: '1px solid rgba(255,255,255,0.05)' }} />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" name="API Volume" dataKey="transactions" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                  <Area type="monotone" name="Threat Indicators" dataKey="fraudAlerts" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart Distribution */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 md:col-span-1">
            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Risk Segment Breakdown</h3>
              <p className="text-[11px] text-slate-500">Distribution of evaluated transactions</p>
            </div>
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.riskDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.riskDistribution || []).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Scanned Records Registry</h3>
              <p className="text-[11px] text-slate-500">Filter, search, or export MERN transaction data</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[220px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search TxID or Customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
                />
              </div>

              {/* CSV Buttons */}
              <button
                onClick={() => fileInputRef.current.click()}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-[10px] uppercase font-bold text-indigo-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileUp className="h-3.5 w-3.5" />
                Upload CSV
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCSVUpload}
                accept=".csv"
                className="hidden"
              />

              <a
                href="/api/transactions/export"
                download
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-[10px] uppercase font-bold text-cyan-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5" />
                Export CSV
              </a>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 p-3 bg-slate-950/20 rounded-xl border border-white/5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              <span>Quick Filters:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-slate-200 focus:outline-none text-[11px]"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Frozen">Frozen</option>
            </select>
            
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-slate-200 focus:outline-none text-[11px]"
            >
              <option value="">All Risk Ratings</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Account</th>
                  <th className="pb-2">Merchant</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Country</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-slate-400">{tx.transactionId}</td>
                    <td className="py-3 font-medium text-slate-200">
                      <a href={`/customer/${tx.customerId}`} className="hover:text-indigo-400 hover:underline">
                        {tx.customerName}
                      </a>
                    </td>
                    <td className="py-3 text-slate-400 font-mono">{tx.accountNumber}</td>
                    <td className="py-3 text-slate-300">{tx.merchant}</td>
                    <td className="py-3 font-bold text-slate-100">${tx.amount.toLocaleString()}</td>
                    <td className="py-3 text-slate-400">{tx.country}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.riskLevel === 'High' 
                          ? 'bg-rose-500/10 text-rose-400' 
                          : tx.riskLevel === 'Medium' 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>{tx.riskScore}% ({tx.riskLevel})</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.status === 'Approved' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : tx.status === 'Pending' 
                          ? 'bg-amber-500/10 text-amber-400 animate-pulse' 
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>{tx.status}</span>
                    </td>
                    <td className="py-3 text-right">
                      <a
                        href={`/workspace/${tx.transactionId}`}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase"
                      >
                        Investigate
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs">
            <span className="text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 disabled:opacity-50 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 disabled:opacity-50 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Copilot Toggle */}
      {user.role !== 'Customer' && (
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer z-40 border border-indigo-400/30"
        >
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300">
            AI Copilot
          </span>
        </button>
      )}

      {/* Copilot Drawer */}
      <AICopilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
};

export default MainDashboard;
