import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Scissors, 
  Settings, 
  LogOut, 
  ArrowLeft,
  Users,
  ShieldAlert
} from 'lucide-react';
import { apiClient } from '../../api/client';

export type AdminTab = 'dashboard' | 'appointments' | 'services' | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onNavigateTab: (tab: AdminTab) => void;
  onNavigateClient: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onNavigateTab,
  onNavigateClient,
  onLogout,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#e6e4df] flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-[#101216] border-b md:border-b-0 md:border-r border-[#20242e] flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#20242e] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#c5a880] block font-semibold">
              Admin Operations
            </span>
            <h1 className="text-base font-serif text-white tracking-tight">
              Good Luck Salon
            </h1>
          </div>
          <button
            type="button"
            onClick={onNavigateClient}
            className="text-xs text-[#8c92a0] hover:text-white flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#181b22] transition-colors"
            title="Return to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 flex-1">
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'dashboard'
                ? 'bg-[#c5a880] text-black font-semibold'
                : 'text-[#a29e95] hover:bg-[#181b22] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('appointments')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'appointments'
                ? 'bg-[#c5a880] text-black font-semibold'
                : 'text-[#a29e95] hover:bg-[#181b22] hover:text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Appointments</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('services')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'services'
                ? 'bg-[#c5a880] text-black font-semibold'
                : 'text-[#a29e95] hover:bg-[#181b22] hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Service Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'settings'
                ? 'bg-[#c5a880] text-black font-semibold'
                : 'text-[#a29e95] hover:bg-[#181b22] hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Business Settings</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#20242e] space-y-1">
          <div className="px-3 py-2 text-[11px] text-[#717684] flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>2 Active Chairs</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0c0d10]">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
