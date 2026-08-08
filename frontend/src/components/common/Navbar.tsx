import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            AI Quiz Studio
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            RAG Powered
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-sm">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span className="font-medium text-slate-200">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="glow-button text-sm font-semibold text-white px-4 py-2 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
