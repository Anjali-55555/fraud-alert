import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, ShieldAlert, CheckCircle, XCircle, Snowflake, 
  Send, FileText, Calendar, Shield, Smartphone, Globe, Landmark, Laptop
} from 'lucide-react';

const InvestigatorWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // States
  const [transaction, setTransaction] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const fetchCaseDetails = async () => {
    try {
      const res = await axios.get(`/api/transactions/${id}`);
      if (res.data.success) {
        setTransaction(res.data.data);
        setCaseDetails(res.data.caseDetails);
      }
    } catch (e) {
      addToast('Fetch Error', 'Failed to retrieve transaction audit records', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  // Handle case resolve actions (Approve, Reject, Freeze)
  const handleResolve = async (action) => {
    if (!noteText.trim()) {
      return addToast('Note Required', 'An explanation note is required to change transaction status.', 'warning');
    }
    
    setLoading(true);
    try {
      const res = await axios.patch(`/api/transactions/${id}/resolve`, {
        action,
        note: noteText
      });
      if (res.data.success) {
        addToast('Investigation Case Updated', `State resolved successfully: ${action}`, 'success');
        setNoteText('');
        fetchCaseDetails();
      }
    } catch (err) {
      addToast('Status Change Fail', 'Failed to update resolution status.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Triggers browser print layout for report
  const handleDownloadReport = async () => {
    setReportLoading(true);
    try {
      const res = await axios.get(`/api/reports/transaction/${id}`);
      if (res.data.success) {
        const reportHtml = res.data.data.htmlContent;
        
        // Open printable window frame
        const printWindow = window.open('', '_blank');
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (err) {
      addToast('Report Generation Failed', 'Failed to compile AI investigation PDF layout', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex justify-center items-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Risk Score color definitions
  const score = transaction?.riskScore || 0;
  const progressColor = score >= 70 ? 'bg-rose-500' : score >= 35 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Back navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          {/* AI Report compilation button */}
          <button
            onClick={handleDownloadReport}
            disabled={reportLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText className="h-4.5 w-4.5" />
            {reportLoading ? 'Compiling PDF...' : 'Download AI Investigation Report'}
          </button>
        </div>

        {/* Dynamic Case Header */}
        <div className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Case Inquest Panel</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                caseDetails?.status?.includes('Resolved') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400 animate-pulse'
              }`}>{caseDetails?.status || 'Open'}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              Investigating Transaction {transaction?.transactionId}
            </h2>
            <p className="text-xs text-slate-400">Merchant: {transaction?.merchant} • Target Client: {transaction?.customerName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Risk Score Index</span>
              <span className={`text-3xl font-extrabold block bg-gradient-to-r ${score >= 70 ? 'from-rose-400 to-amber-500' : 'from-emerald-400 to-indigo-400'} bg-clip-text text-transparent`}>
                {score}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details & Explainable AI */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Summary Diagnostic Box */}
            <div className="p-5 rounded-2xl glass-accent border border-indigo-500/20 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <Shield className="h-4.5 w-4.5 text-indigo-400" />
                AI Copilot Threat Diagnostic Summary
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{transaction?.aiExplanation || 'AI Analysis pending calculation.'}"
              </p>
            </div>

            {/* Explainable AI breakdown grid */}
            <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Explainable AI Contribution Breakdown</h3>
                <p className="text-xs text-slate-500">Evaluated threat parameters score distribution</p>
              </div>
              
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Transaction Value Anomaly (Amount)</span>
                    <span className="font-bold text-slate-200">+{transaction?.riskContributors?.amount || 0} pts</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${transaction?.riskContributors?.amount || 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Geographic Distance Anomalies (Location)</span>
                    <span className="font-bold text-slate-200">+{transaction?.riskContributors?.location || 0} pts</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${transaction?.riskContributors?.location || 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Frequency Spikes (Velocity)</span>
                    <span className="font-bold text-slate-200">+{transaction?.riskContributors?.velocity || 0} pts</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${transaction?.riskContributors?.velocity || 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Hardware Signature Checks (Device)</span>
                    <span className="font-bold text-slate-200">+{transaction?.riskContributors?.device || 0} pts</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: `${transaction?.riskContributors?.device || 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Merchant Category Blacklist Match</span>
                    <span className="font-bold text-slate-200">+{transaction?.riskContributors?.merchant || 0} pts</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${transaction?.riskContributors?.merchant || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Transaction Metadata */}
            <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Transaction Properties</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3 bg-slate-900/40 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Merchant Entity</span>
                  <div className="text-slate-200 font-semibold">{transaction?.merchant}</div>
                </div>
                <div className="space-y-1 p-3 bg-slate-900/40 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Transaction Value</span>
                  <div className="text-slate-100 font-extrabold text-sm">${transaction?.amount.toLocaleString()} {transaction?.currency}</div>
                </div>
                <div className="space-y-1 p-3 bg-slate-900/40 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Terminal Location</span>
                  <div className="text-slate-200 font-medium">{transaction?.location}, {transaction?.country}</div>
                </div>
                <div className="space-y-1 p-3 bg-slate-900/40 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-slate-500">IP / Device User-Agent</span>
                  <div className="text-slate-200 truncate font-mono" title={transaction?.device}>{transaction?.ipAddress} • {transaction?.device}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Decisions, Notes & Audit logs */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Analyst Decision Control Panel */}
            <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Compliance Decision Panel</h3>
                <p className="text-xs text-slate-500 font-medium">Record notes and click action to resolve case</p>
              </div>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log notes detailing client confirmation, geographical validation, etc. (Required for status updates)"
                className="w-full h-[90px] p-3 text-xs rounded-xl glass-input placeholder-slate-650 resize-none"
              />

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleResolve('Approve')}
                  className="py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-colors shadow-lg shadow-emerald-600/10"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleResolve('Reject')}
                  className="py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-colors shadow-lg shadow-rose-600/10"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleResolve('Freeze')}
                  className="py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-colors shadow-lg shadow-cyan-600/10"
                >
                  <Snowflake className="h-4 w-4" />
                  Lock A/C
                </button>
              </div>
            </div>

            {/* Case timeline audit log */}
            <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4 max-h-[350px] overflow-y-auto">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Case Action Audit Trail</h3>
              
              <div className="space-y-4 relative border-l border-white/5 pl-4 ml-2">
                {caseDetails?.timeline.map((item, idx) => (
                  <div key={idx} className="relative text-xs space-y-0.5">
                    {/* Circle indicators */}
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 border border-darkBg"></span>
                    <div className="font-semibold text-slate-200">{item.activity}</div>
                    <div className="text-[10px] text-slate-500">
                      {item.performer} • {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default InvestigatorWorkspace;
