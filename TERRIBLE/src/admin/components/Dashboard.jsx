import React, { useState } from 'react';
import { useAdminSocket } from '../contexts/AdminSocket';
import {
  Users, Shield, Globe, Activity, TrendingUp, Server,
  Trash2, Download, RefreshCw, Settings2
} from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, secondary, trend, type = 'default' }) => {
  const getCardStyle = () => {
    switch (type) {
      case 'active':
        return 'border-l-4 border-l-orange-500';
      case 'banned':
        return 'border-l-4 border-l-red-500';
      case 'status-online':
        return 'border-l-4 border-l-green-500';
      case 'status-offline':
        return 'border-l-4 border-l-gray-500';
      default:
        return 'border-l-4 border-l-blue-500';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'active':
        return 'text-orange-400';
      case 'banned':
        return 'text-red-400';
      case 'status-online':
        return 'text-green-400';
      case 'status-offline':
        return 'text-gray-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className={`bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-lg p-6 ${getCardStyle()}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            {secondary !== undefined && (
              <span className="text-gray-500 text-lg">/{secondary}</span>
            )}
          </div>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm">{trend}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-[#1a1a1a] ${getIconColor()}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-4 py-2.5 rounded-lg
        transition-all duration-200 font-medium
        ${variant === 'danger'
          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
          : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20'}
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

const ActivityChart = () => {
  return (
    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-lg p-6">
      <h3 className="text-white font-semibold mb-4">Activity Overview</h3>
      <div className="h-48 flex items-end justify-between space-x-2">
        {[40, 70, 45, 80, 65, 90, 75, 85, 60, 95, 70, 80].map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
      </div>
    </div>
  );
};

const ServerStatus = ({ settings }) => {
  const statusItems = [
    { label: 'Server Status', value: settings.websiteEnabled ? 'Online' : 'Offline', online: settings.websiteEnabled },
    { label: 'CPU Usage', value: '45%', online: true },
    { label: 'Memory Usage', value: '2.3GB', online: true },
    { label: 'Disk Space', value: '56GB', online: true }
  ];

  return (
    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Server Status</h3>
        <Server className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {statusItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
            <span className="text-gray-400 text-sm">{item.label}</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">{item.value}</span>
              <div className={`w-2 h-2 rounded-full ${item.online ? 'bg-green-400' : 'bg-gray-400'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { sessions, settings, bannedIPs, clearSessions, updateSettings } = useAdminSocket();

  const activeSessions = sessions.filter(s => s.connected).length;
  const totalSessions = sessions.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Main Dashboard</h1>
        <p className="text-gray-400">Monitor and manage your system in real-time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Active Sessions"
          value={activeSessions}
          secondary={totalSessions}
          trend={12}
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

        <StatCard
          icon={Activity}
          title="Success Rate"
          value="95%"
          trend={5}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <QuickAction
            icon={RefreshCw}
            label="Refresh Data"
            onClick={() => window.location.reload()}
          />
          <QuickAction
            icon={Settings2}
            label="Toggle Website"
            onClick={() => {
              updateSettings({
                ...settings,
                websiteEnabled: !settings.websiteEnabled
              });
            }}
          />
          <QuickAction
            icon={Trash2}
            label="Clear Sessions"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all sessions?')) {
                clearSessions();
              }
            }}
            variant="danger"
          />
          <QuickAction
            icon={Download}
            label="Export Logs"
            onClick={() => {
              console.log('Export logs');
            }}
          />
        </div>
      </div>

      {/* Charts and Server Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart />
        <ServerStatus settings={settings} />
      </div>
    </div>
  );
}