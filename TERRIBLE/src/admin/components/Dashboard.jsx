import React, { useState } from 'react';
import { useAdminSocket } from '../contexts/AdminSocket';
import { 
  Users, Shield, Globe, Fish, Trash2, Download, Waves, Anchor
} from 'lucide-react';
import AnimatedFish from './AnimatedFish';

const StatCard = ({ icon: Icon, title, value, secondary, type = 'default' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getAccentColor = () => {
    switch (type) {
      case 'active':
        return { bg: 'from-blue-500/10 to-blue-600/5', icon: 'text-blue-400', border: 'border-blue-500/20' };
      case 'banned':
        return { bg: 'from-orange-500/10 to-red-500/5', icon: 'text-orange-400', border: 'border-orange-500/20' };
      case 'status-online':
        return { bg: 'from-green-500/10 to-emerald-500/5', icon: 'text-green-400', border: 'border-green-500/20' };
      case 'status-offline':
        return { bg: 'from-gray-500/10 to-gray-600/5', icon: 'text-gray-400', border: 'border-gray-500/20' };
      default:
        return { bg: 'from-purple-500/10 to-purple-600/5', icon: 'text-purple-400', border: 'border-purple-500/20' };
    }
  };

  const colors = getAccentColor();
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        relative rounded-2xl p-6 transition-all duration-500
        bg-gradient-to-br from-gray-900/50 to-gray-900/30
        backdrop-blur-xl border ${colors.border}
        hover:shadow-2xl hover:shadow-black/20
        hover:-translate-y-1
      `}>
        {/* Subtle gradient overlay */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.bg} opacity-50`} />

        {/* Content */}
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className={`
              p-3 rounded-xl bg-gradient-to-br ${colors.bg}
              border ${colors.border} backdrop-blur-sm
              transition-transform duration-300
              ${isHovered ? 'scale-110 rotate-3' : 'scale-100'}
            `}>
              <Icon className={`w-6 h-6 ${colors.icon}`} />
            </div>
          </div>

          <div>
            <p className="text-sm text-white/50 font-medium mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{displayValue}</span>
              {secondary !== undefined && (
                <span className="text-lg text-white/30">/{secondary}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, onClick, variant = 'primary', active = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getVariantStyles = () => {
    if (variant === 'danger') {
      return {
        bg: 'from-red-500/5 to-red-600/5',
        border: 'border-red-500/20',
        text: 'text-red-400',
        hover: 'hover:border-red-500/30'
      };
    }
    return {
      bg: 'from-blue-500/5 to-purple-500/5',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      hover: 'hover:border-blue-500/30'
    };
  };

  const styles = getVariantStyles();

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
      className={`
        group relative flex items-center gap-3 px-4 py-3 rounded-xl
        bg-gradient-to-br ${styles.bg}
        border ${styles.border} ${styles.hover}
        backdrop-blur-xl transition-all duration-300
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${active ? 'bg-white/10' : ''}
        hover:shadow-lg hover:shadow-black/10
        hover:-translate-y-0.5
      `}
    >
      <Icon className={`w-5 h-5 ${styles.text} transition-transform duration-300
                     ${isHovered ? 'scale-110' : 'scale-100'}`} />
      <span className={`text-sm font-medium ${styles.text}`}>
        {label}
      </span>
    </button>
  );
};

export default function Dashboard() {
  const { sessions, settings, bannedIPs, clearSessions, updateSettings } = useAdminSocket();

  const activeSessions = sessions.filter(s => s.connected).length;
  const totalSessions = sessions.length;

  return (
    <div className="space-y-6">
      {/* Header with Total Value */}
      <div className="mb-8">
        <p className="text-sm text-white/40 mb-2">Total Net Worth</p>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold text-white">
            ${(activeSessions * 1000 + bannedIPs.size * 500).toLocaleString()}
          </span>
          <span className="text-lg text-white/40">USD</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Quick Actions Panel */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-white/5 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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