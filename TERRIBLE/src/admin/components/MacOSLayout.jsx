import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Settings, Activity, Search, UserCog } from 'lucide-react';

const MacOSLayout = ({ children, activeView, onViewChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const [pruneJuiceLevel, setPruneJuiceLevel] = useState(0);

  useEffect(() => {
    // Set random prune juice level on mount and refresh
    setPruneJuiceLevel(Math.floor(Math.random() * 100));
  }, []);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0F1117] text-gray-100 flex">
      {/* Sidebar */}
      <div className="w-72 bg-[#161A22] border-r border-gray-800/50 flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
              <UserCog className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">FishTank</div>
              <div className="text-xs text-gray-400 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded inline-block mt-1">ADMIN</div>
              <div className="text-xs text-gray-500 mt-1">All-in-One Dashboard</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-[#1C2029] border border-gray-800/50 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-[#1E222B]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 bg-[#1C2029] px-1.5 py-0.5 rounded border border-gray-800/50">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 transition-all duration-200 relative
                ${activeView === item.id
                  ? 'bg-blue-500/10 text-blue-400 border-r-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Prune Juice Meter */}
        <div className="p-6 border-t border-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Prune Juice Meter</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="h-2 bg-[#1C2029] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: `${pruneJuiceLevel}%` }}></div>
          </div>
          <div className="text-xs text-gray-600 mt-1 text-right">{pruneJuiceLevel}%</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#0F1117] overflow-auto">
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MacOSLayout;