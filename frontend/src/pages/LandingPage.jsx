import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Cpu, Activity, Zap, Check, ArrowRight, Star, Globe, BarChart2, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const features = [
    { icon: <Zap className="h-6 w-6 text-indigo-400" />, title: "Instant Risk Engine", desc: "Scan millions of records dynamically using custom-weighted dynamic business rules." },
    { icon: <Cpu className="h-6 w-6 text-cyan-400" />, title: "Gemini AI Explanations", desc: "Obtain structured, natural language summaries explaining exactly why alerts are generated." },
    { icon: <Activity className="h-6 w-6 text-emerald-400" />, title: "Real-Time WebSocket Feed", desc: "Instantly stream transactions, alerts, and hotspots to interactive dashboards." },
    { icon: <Globe className="h-6 w-6 text-indigo-400" />, title: "Hotspot Threat Maps", desc: "Monitor geographic velocity anomalies and localized threat thresholds on vector maps." },
    { icon: <BarChart2 className="h-6 w-6 text-cyan-400" />, title: "Explainable AI Scorecard", desc: "Inspect specific risk contributions (location +20, amount +35) in unified cases." },
    { icon: <Shield className="h-6 w-6 text-rose-400" />, title: "Investigator workspaces", desc: "Equip analysts with timelines, audit histories, and printable PDF report builders." }
  ];

  const pricing = [
    { name: "Starter", price: "$49", desc: "Best for growing startups", features: ["1,000 transactions/day", "6 core rules configured", "Basic email support", "Local risk score explanation"] },
    { name: "Enterprise Pro", price: "$399", desc: "For modern banking operations", features: ["Unlimited transactions", "Dynamic custom rule builder", "Full Gemini AI Copilot", "Interactive Hotspot Heatmap", "24/7 dedicated support", "PDF case exporting"], popular: true },
    { name: "Custom Institution", price: "Custom", desc: "For multinational banks", features: ["On-premise deploy option", "Custom AI LLM fine-tuning", "Dedicated SLA metrics", "Biometric risk verification"] }
  ];

  const faqs = [
    { q: "How does the AI explain the fraud detections?", a: "When a transaction is flagged, our AI model parses the triggered rules, geodistance mismatches, and average spending deviations to write a concise, professional diagnostic summary (e.g. explaining a geo-velocity hijack)." },
    { q: "Can we configure the fraud rules without restarting the server?", a: "Yes. Administrators can create, toggle, delete, or re-weight rules directly from the Admin Panel, and the Risk Engine picks up changes instantly." },
    { q: "Is there a local fallback if Gemini is offline?", a: "Yes. The platform implements an in-memory rule narrative generator that automatically builds risk summaries if the API key is missing or offline." }
  ];

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="glass py-4 px-6 border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            FraudAlert <span className="text-cyan-400 font-medium text-sm">Lite</span>
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/signup" className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white">
            Access Portal
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 px-6 flex flex-col items-center text-center overflow-hidden bank-grid flex-1 justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold tracking-wider uppercase animate-pulse">
            <Sparkles className="h-3.5 w-3.5" /> Next-Generation FinTech Risk Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            AI-Powered Fraud Intelligence for Modern Banking
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Detect suspicious transactions in milliseconds, explain anomalies using structured LLM intelligence, coordinate analyst cases, and view live geographic threat timelines.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-200 font-medium text-xs transition-colors"
            >
              Demo Staff Sign-In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5 bg-slate-950/20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">&lt; 30ms</div>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Response Latency</p>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">99.98%</div>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Uptime SLA</p>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">$145K+</div >
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Fraud Prevented</p>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">93.4%</div>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">AI Detection Accuracy</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold">Comprehensive Threat Operations Suite</h2>
          <p className="text-xs text-slate-400">Everything needed to guard and evaluate transactions at high scale</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-slate-900 w-fit border border-white/5">{f.icon}</div>
              <h3 className="font-bold text-sm text-slate-200">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-950/20 border-y border-white/5 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-xs text-slate-400">Flexible options tailored to transaction processing volumes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((p, i) => (
              <div
                key={i}
                className={`p-8 rounded-2xl border flex flex-col gap-6 relative ${
                  p.popular 
                    ? 'glass-accent border-indigo-500/30' 
                    : 'glass-card border-white/5'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 right-6 px-3 py-1 bg-indigo-600 rounded-full text-[9px] font-bold tracking-widest uppercase">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-base text-slate-200">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">{p.price}</span>
                  {p.price !== 'Custom' && <span className="text-xs text-slate-500 ml-1">/ month</span>}
                </div>
                <div className="space-y-3 flex-1">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
                <Link
                  to="/signup"
                  className={`w-full py-3 text-center rounded-xl text-xs font-semibold transition-all ${
                    p.popular 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/20' 
                      : 'bg-slate-900 border border-white/5 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Start Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-4xl mx-auto px-6 w-full">
        <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((f, i) => (
            <div key={i} className="glass-card p-5 rounded-xl border border-white/5 space-y-2">
              <h4 className="font-bold text-sm text-slate-200">{f.q}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-white/5 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} FraudAlert Lite. All rights reserved. Created for Fintech and AI security compliance demonstration.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
