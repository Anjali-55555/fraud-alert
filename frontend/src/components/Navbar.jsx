import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, UserCheck, ShieldAlert, Cpu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-white/5 py-3 px-6 flex justify-between items-center">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-cyan-200 bg-clip-text text-transparent">
          FraudAlert <span className="text-cyan-400 font-medium text-sm">Lite</span>
        </span>
      </Link>

      {/* Nav Menu */}
      {user && (
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/dashboard') 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {user.role === 'Admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/admin') 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Cpu className="h-4 w-4" />
              Admin Rules & Simulator
            </Link>
          )}
        </div>
      )}

      {/* Action panel */}
      {user ? (
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-200">{user.firstName} {user.lastName}</span>
            <span className="text-[10px] text-cyan-400 font-medium uppercase tracking-widest">{user.role}</span>
          </div>

          <div className="h-8 w-8 rounded-full bg-indigo-950 border border-indigo-500/30 flex justify-center items-center text-xs font-bold text-indigo-300 shadow-md">
            {user.firstName[0]}{user.lastName[0]}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors"
            title="Logout from platform"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Start Free
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
