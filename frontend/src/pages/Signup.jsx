import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Mail, Lock, User, PlusCircle } from 'lucide-react';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const { signup, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      return addToast('Required Fields Missing', 'Please fill in all registration fields.', 'warning');
    }

    const result = await signup(email, password, firstName, lastName, role);
    if (result.success) {
      addToast('Registration Successful', `Created ${role} account and logged in automatically.`, 'success');
      navigate('/dashboard');
    } else {
      addToast('Signup Failed', result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col justify-center items-center px-6 py-12 bank-grid">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-white/5 relative z-10 space-y-5 shadow-2xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/25">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Create Compliance Account</h2>
          <p className="text-xs text-slate-400">Join the FraudAlert Lite threat intelligence platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sarah"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Connor"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@fraudalert.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
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

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned Console Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl glass-input bg-slate-900 border border-white/10 text-slate-200 focus:outline-none"
            >
              <option value="Customer">Customer (Personal Dashboard)</option>
              <option value="Analyst">Analyst (Investigator Workspace)</option>
              <option value="Manager">Manager (Compliance Analytics)</option>
              <option value="Admin">Admin (Rules & Simulator Panel)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            {loading ? 'Generating User...' : (
              <>
                Register Account
                <PlusCircle className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[11px] text-slate-400">
            Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
