import React, { useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Users,
  Shield,
  Activity,
  Menu,
  X,
  ChevronRight,
  Search
} from 'lucide-react';

const ModernLayout = ({ children, activeView, onViewChange }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sessions', label: 'Sessions', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-600/15 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="h-full bg-black/40 backdrop-blur-2xl border-r border-white/5">
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-white font-semibold">Admin Hub</h1>
                <p className="text-xs text-white/40">Control Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Search Bar */}
          {!isSidebarCollapsed && (
            <div className="px-4 py-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10'
                      : 'hover:bg-white/5 text-white/60 hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-all
                    ${isActive ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' : ''}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all">
              <div className="p-2">
                <Activity className="w-5 h-5" />
              </div>
              {!isSidebarCollapsed && <span className="flex-1 text-left font-medium">Support</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Top Bar */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {activeView === 'dashboard' ? 'Dashboard' :
               activeView === 'settings' ? 'Settings' :
               activeView === 'sessions' ? 'Sessions' : 'Overview'}
            </h2>
            <p className="text-sm text-white/40 mt-1">
              {activeView === 'dashboard' ? 'Monitor your system activity' :
               activeView === 'settings' ? 'Configure your preferences' :
               activeView === 'sessions' ? 'Manage active sessions' : ''}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLayout;