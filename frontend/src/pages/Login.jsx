import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleMockLogin = (roleEmail) => {
    setEmail(roleEmail);
    if (roleEmail === 'ramadevik768@gmail.com') {
      setPassword('ramadevi55');
    } else {
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return addToast('Required Fields Missing', 'Please enter email and password credentials.', 'warning');
    }

    const result = await login(email, password);
    if (result.success) {
      addToast('Welcome Back', 'Logged into FraudAlert Lite console successfully.', 'success');
      navigate('/dashboard');
    } else {
      addToast('Authentication Failed', result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col justify-center items-center px-6 py-12 bank-grid">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-white/5 relative z-10 space-y-6 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/25">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Access Risk Console</h2>
          <p className="text-xs text-slate-400">Enter credentials or select a mock user role below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@fraudalert.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
              <a href="#" className="text-[10px] text-indigo-400 hover:text-indigo-300">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            {loading ? 'Validating Token...' : (
              <>
                Login to Account
                <LogIn className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Mock Login Grid */}
        <div className="border-t border-white/5 pt-4 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">Quick Demonstration Access</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleMockLogin('admin@fraudalert.com')}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-[10px] font-medium text-indigo-400 transition-colors"
            >
              Admin Role
            </button>
            <button
              onClick={() => handleMockLogin('analyst1@fraudalert.com')}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-[10px] font-medium text-cyan-400 transition-colors"
            >
              Analyst Role
            </button>
            <button
              onClick={() => handleMockLogin('ramadevik768@gmail.com')}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-[10px] font-medium text-emerald-400 transition-colors"
            >
              Customer
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-400">
            Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
