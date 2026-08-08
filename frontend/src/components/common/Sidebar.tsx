import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  BrainCircuit,
  Layers,
  BarChart3,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Generate Quiz', path: '/generate-quiz', icon: Sparkles },
    { label: 'Flashcard Studio', path: '/flashcards', icon: Layers },
    { label: 'Performance', path: '/performance', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between py-6 px-4 hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Learning Platform
          </p>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 text-center">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2">
          <BrainCircuit className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-slate-200 mb-1">Grounded RAG AI</h4>
        <p className="text-[11px] text-slate-400">Questions linked to source page citations</p>
      </div>
    </aside>
  );
};
