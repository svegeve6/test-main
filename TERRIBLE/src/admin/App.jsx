import React, { useState, useEffect } from 'react';
import { useAdminSocket } from './contexts/AdminSocket';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import SessionList from './components/SessionList';
import Settings from './components/Settings';
import BannedIPs from './components/BannedIPs';
import LoginPage from './pages/LoginPage';
import ProfessionalLayout from './components/ProfessionalLayout';
import { LogOut } from 'lucide-react';

const AppContent = () => {
  const { isConnected } = useAdminSocket();
  const { isAuthenticated, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isAppearing, setIsAppearing] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('Coinbase');

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => setIsAppearing(true), 300);
    } else {
      setIsAppearing(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Connecting to server...</h1>
          <p className="text-gray-400">Please wait while we establish connection</p>
        </div>
      </div>
    );
  }

  return (
    <ProfessionalLayout activeView={activeView} onViewChange={setActiveView}>
      <div className={`
        transition-all duration-700 ease-out
        ${isAppearing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        {activeView === 'dashboard' ? (
          <div className="space-y-6">
            <Dashboard selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />
            <SessionList selectedBrand={selectedBrand} />
          </div>
        ) : activeView === 'sessions' ? (
          <SessionList selectedBrand={selectedBrand} />
        ) : activeView === 'settings' ? (
          <Settings />
        ) : (
          <Dashboard selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />
        )}
      </div>
    </ProfessionalLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}