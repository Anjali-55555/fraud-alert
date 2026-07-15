import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ArrowLeft, ShieldAlert, User, Smartphone, MapPin, DollarSign, Activity } from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerDetails = async () => {
    try {
      const res = await axios.get(`/api/customers/${id}`);
      if (res.data.success) {
        setCustomer(res.data.data);
        setStats(res.data.stats);
        setTransactions(res.data.recentTransactions);
      }
    } catch (e) {
      addToast('Profile Fetch Error', 'Unable to retrieve customer details.', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex justify-center items-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format risk timeline data for line chart
  const timelineData = (customer?.riskTimeline || []).map((t, idx) => ({
    name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: t.riskScore,
    level: t.riskLevel,
    reason: t.triggerReason
  }));

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Profile Card Header */}
        <div className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-950 border border-indigo-500/20 flex justify-center items-center text-indigo-400">
              <User className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{customer?.fullName}</h2>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  customer?.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>{customer?.status}</span>
              </div>
              <p className="text-xs text-slate-400">ID: {customer?.customerId} • Account: {customer?.accountNumber} • Email: {customer?.email}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-900/60 border border-white/5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">avg transfer</span>
              <span className="text-sm font-bold text-slate-200">${customer?.averageSpending}</span>
            </div>
            <div className="px-4 py-2 bg-slate-900/60 border border-white/5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">risk rating</span>
              <span className={`text-sm font-bold block ${
                customer?.riskLevel === 'High' ? 'text-rose-500' : customer?.riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
              }`}>{customer?.riskLevel}</span>
            </div>
            <div className="px-4 py-2 bg-slate-900/60 border border-white/5 rounded-xl text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">prevented leaks</span>
              <span className="text-sm font-bold text-slate-200">{stats?.fraudCount || 0} alerts</span>
            </div>
          </div>
        </div>

        {/* Risk Timeline Line Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-400" />
                Customer Risk Timeline Trend
              </h3>
              <p className="text-[11px] text-slate-500">Historical trend mapping of computed transaction threat points</p>
            </div>
            <div className="h-[250px] w-full">
              {timelineData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">No timeline data records recorded.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={10} />
                    <YAxis stroke="#6B7280" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#090D16', border: '1px solid rgba(255,255,255,0.05)' }} />
                    <Line type="monotone" name="Risk Score %" dataKey="score" stroke="#818CF8" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Trusted Devices and Locations */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-cyan-400" />
                Trusted Hardware Logs
              </h3>
              <div className="space-y-1.5">
                {customer?.trustedDevices.map((d, idx) => (
                  <div key={idx} className="text-xs px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-300">
                    {d}
                  </div>
                )) || <p className="text-xs text-slate-500">No devices configured</p>}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                Authorized Countries
              </h3>
              <div className="space-y-1.5">
                {customer?.trustedLocations.map((loc, idx) => (
                  <div key={idx} className="text-xs px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-300">
                    {loc}
                  </div>
                )) || <p className="text-xs text-slate-500">No locations configured</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div className="glass-card p-5 rounded-2xl border border-white/5">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider mb-4">Transaction Auditing History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-2">TxID</th>
                  <th className="pb-2">Merchant</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Location</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2 text-right">Auditor Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-mono text-slate-400">{tx.transactionId}</td>
                    <td className="py-2.5 font-medium text-slate-200">{tx.merchant}</td>
                    <td className="py-2.5 font-bold text-slate-100">${tx.amount.toLocaleString()}</td>
                    <td className="py-2.5 text-slate-400">{tx.location}, {tx.country}</td>
                    <td className="py-2.5 text-slate-400">{tx.paymentMethod}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.riskLevel === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>{tx.riskScore}%</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => navigate(`/workspace/${tx.transactionId}`)}
                        className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default CustomerDetails;
