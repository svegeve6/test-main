import React from 'react';
import {
  LayoutDashboard,
  Settings,
  Users,
  Database,
  Shield,
  Activity,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfessionalLayout = ({ children, activeView, onViewChange }) => {
  const { logout } = useAuth();
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'analytics', icon: Activity, label: 'Analytics' },
    { id: 'sessions', icon: Users, label: 'Sessions' },
    { id: 'database', icon: Database, label: 'Database' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#2a2a2a] to-[#1f1f1f] border-r border-gray-800">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-semibold text-white">Admin Panel</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${activeView === item.id
                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 border-l-4 border-orange-500'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="border-t border-gray-800 pt-6">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLayout;