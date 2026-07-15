import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const LiveFeed = ({ transactions = [] }) => {
  const navigate = useNavigate();

  const getRiskColor = (score) => {
    if (score >= 70) return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
    if (score >= 35) return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-amber-500 animate-pulse" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
    }
  };

  return (
    <div className="w-full glass-card p-5 rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Real-Time Activity Feed
          </h3>
          <p className="text-xs text-slate-400">WebSocket transaction stream & anomaly alerts</p>
        </div>
        <span className="text-[10px] bg-slate-900 border border-white/5 text-slate-400 px-2 py-0.5 rounded-md font-semibold tracking-wider uppercase">
          LIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-2">
        {transactions.length === 0 ? (
          <div className="h-[250px] flex flex-col items-center justify-center text-center p-4">
            <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin mb-3"></div>
            <p className="text-xs text-slate-500">Awaiting stream packets from Risk Engine...</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.transactionId}
              onClick={() => navigate(`/workspace/${tx.transactionId}`)}
              className="p-3 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-900/60 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
                  {getStatusIcon(tx.status)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">{tx.customerName}</span>
                    <span className="text-[9px] text-slate-500">({tx.transactionId})</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {tx.merchant} • {new Date(tx.dateTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-100">${tx.amount.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-500 block">{tx.country}</span>
                </div>
                <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getRiskColor(tx.riskScore)}`}>
                  {tx.riskScore}%
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveFeed;
