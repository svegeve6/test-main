import React, { useState } from 'react';
import { useAdminSocket } from '../contexts/AdminSocket';
import { 
  Users, Globe, Fish, Trash2, Download, Waves, Anchor
} from 'lucide-react';
import AnimatedFish from './AnimatedFish';

const StatCard = ({ icon: Icon, title, value, secondary, type = 'default' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getGradient = () => {
    switch (type) {
      case 'active':
        return 'from-cyan-400/20 to-transparent';
      case 'banned':
        return 'from-red-400/20 to-transparent';
      case 'status-online':
        return 'from-emerald-400/20 to-transparent';
      case 'status-offline':
        return 'from-gray-400/20 to-transparent';
      default:
        return 'from-blue-400/10 to-transparent';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'active':
        return 'text-cyan-400';
      case 'banned':
        return 'text-red-400';
      case 'status-online':
        return 'text-emerald-400';
      case 'status-offline':
        return 'text-gray-400';
      default:
        return 'text-blue-300';
    }
  };

  const displayValue = typeof value === 'number' ? value : value;

  return (
    <div 
      className="group relative rounded-2xl overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background glow */}
      <div className={`absolute inset-0 blur-3xl transition-opacity duration-1000
                      bg-gradient-to-r ${getGradient()}
                      animate-pulse opacity-40`} />
      
      {/* Primary background with glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl" />
      
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b 
                    from-cyan-400/5 to-transparent 
                    transition-opacity duration-500
                    ${isHovered ? 'opacity-100' : 'opacity-60'}`} />
      
      {/* Border shimmer */}
      <div className="absolute inset-0 rounded-2xl border border-cyan-400/20" />
      
      {/* Content */}
      <div className="relative p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="transition-transform duration-300 group-hover:translate-x-1">
            <h3 className="text-sm font-medium text-cyan-200/70">{title}</h3>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl lg:text-3xl font-semibold text-white">{displayValue}</span>
              {secondary !== undefined && (
                <span className="text-white/40 text-base lg:text-lg">/{secondary}</span>
              )}
            </div>
          </div>
          <div className={`p-2 lg:p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-cyan-400/20
                        transform transition-all duration-300
                        ${isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}`}>
            <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${getIconColor()}
                          transition-transform duration-300
                          ${type === 'status-online' ? 'animate-spin-slow' : ''}
                          ${isHovered ? 'scale-110' : 'scale-100'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, onClick, variant = 'primary', active = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      className={`group relative flex items-center space-x-2 
                px-3 py-2 lg:px-4 lg:py-2 rounded-lg
                bg-white/[0.05] hover:bg-white/[0.08]
                backdrop-blur-xl border border-white/[0.05]
                transition-all duration-300 w-full lg:w-auto
                ${isPressed ? 'scale-95' : 'scale-100'}
                ${active ? 'bg-white/[0.12]' : ''}
                overflow-hidden`}
    >
      {/* Background glow */}
      <div className={`absolute inset-0 transition-opacity duration-300
                    bg-gradient-to-r 
                    ${variant === 'danger' ? 'from-red-500/10' : 'from-blue-500/10'} 
                    to-transparent
                    opacity-0 group-hover:opacity-100`} />

      {/* Icon and label */}
      <Icon className={`w-4 h-4 transition-transform duration-300
                     ${variant === 'danger' ? 'text-red-400' : 'text-blue-400'}
                     ${isHovered ? 'scale-110 rotate-3' : 'scale-100'}
                     ${variant !== 'danger' && isHovered ? 'animate-spin-slow' : ''}`} />
      <span className={`text-sm transition-transform duration-300
                     ${variant === 'danger' ? 'text-red-400' : 'text-blue-400'}
                     group-hover:translate-x-0.5 whitespace-nowrap`}>
        {label}
      </span>
    </button>
  );
};

export default function Dashboard({ selectedBrand, setSelectedBrand }) {
  const { sessions, settings, bannedIPs, clearSessions, updateSettings } = useAdminSocket();

  const activeSessions = sessions.filter(s => s.connected).length;
  const totalSessions = sessions.length;

  return (
    <div className="space-y-4 lg:space-y-6 px-4 lg:px-0">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <StatCard
          icon={Users}
          title="Active Sessions"
          value={activeSessions}
          secondary={totalSessions > 0 ? totalSessions : undefined}
          type="active"
        />
        
        <StatCard
          icon={Shield}
          title="Banned IPs"
          value={bannedIPs.size}
          type="banned"
        />

        <StatCard
          icon={Globe}
          title="Website Status"
          value={settings.websiteEnabled ? 'Online' : 'Offline'}
          type={settings.websiteEnabled ? 'status-online' : 'status-offline'}
        />
      </div>

      {/* Quick Actions */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Glass effect background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl" />
        <div className="absolute inset-0 rounded-2xl border border-cyan-400/20" />
        <div className="relative p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Waves className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white/90 text-lg font-medium">Quick Actions</h3>
          </div>
          <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-3">
            {/* Brand Selector - styled like QuickAction */}
            <button
              className="group relative flex items-center space-x-2 
                       px-3 py-2 lg:px-4 lg:py-2 rounded-lg
                       bg-white/[0.05] hover:bg-white/[0.08]
                       backdrop-blur-xl border border-white/[0.05]
                       transition-all duration-300 w-full lg:w-auto
                       overflow-hidden min-w-[160px]"
            >
              {/* Background glow */}
              <div className="absolute inset-0 transition-opacity duration-300
                            bg-gradient-to-r from-blue-500/10 to-transparent
                            opacity-0 group-hover:opacity-100" />
              
              {/* Brand icon */}
              {selectedBrand === 'Coinbase' ? (
                <i className="fa-brands fa-bitcoin w-4 h-4 text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"></i>
              ) : (
                <i className="fa-light fa-lobster w-4 h-4 text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"></i>
              )}
              
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-blue-400 
                         cursor-pointer appearance-none flex-1 group-hover:translate-x-0.5 
                         transition-transform duration-300"
                style={{ 
                  background: 'transparent',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              >
                <option value="Coinbase" className="bg-[#0A0F1B] text-white/80">Coinbase</option>
                <option value="Lobstr" className="bg-[#0A0F1B] text-white/80">Lobstr</option>
              </select>
              
              {/* Dropdown arrow */}
              <i className="fa-solid fa-caret-down text-blue-400 pointer-events-none"></i>
            </button>

            <QuickAction
              icon={Fish}
              label={`${settings.showEmojis ? 'Hide' : 'Show'} Fish Icons`}
              onClick={() => {
                updateSettings({
                  ...settings,
                  showEmojis: !settings.showEmojis
                });
              }}
              active={settings.showEmojis}
            />
            <QuickAction
              icon={Trash2}
              label="Clear Sessions"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all sessions? This action cannot be undone.')) {
                  clearSessions();
                }
              }}
              variant="danger"
            />
            <QuickAction
              icon={Download}
              label="Export Logs"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}