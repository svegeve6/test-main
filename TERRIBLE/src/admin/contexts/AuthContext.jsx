import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'caller'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const authData = JSON.parse(localStorage.getItem('adminAuth'));
    if (authData && authData.expiresAt && new Date().getTime() < authData.expiresAt) {
      setIsAuthenticated(true);
      setUserRole(authData.role || 'admin');
      setCurrentUser(authData.username || 'admin');
    } else {
      localStorage.removeItem('adminAuth');
      setIsAuthenticated(false);
      setUserRole(null);
      setCurrentUser(null);
    }
    setIsLoading(false);
  };

  const login = async (accessKey) => {
    const adminKey = import.meta.env.VITE_ADMIN_KEY;

    // Check if it's a caller login (starts with caller_)
    if (accessKey.startsWith('caller_')) {
      const callerCredentials = accessKey.substring(7); // Remove 'caller_' prefix
      const parts = callerCredentials.split(':');

      // Handle case where password might contain colons
      const username = parts[0];
      const password = parts.slice(1).join(':'); // Join back in case password had colons

      try {
        // Authenticate with server
        const response = await fetch('/api/auth/caller', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
          const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
          localStorage.setItem('adminAuth', JSON.stringify({
            expiresAt,
            role: 'caller',
            username: data.user.username
          }));

          setIsAuthenticated(true);
          setUserRole('caller');
          setCurrentUser(data.user.username);
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('Invalid caller credentials'));
        }
      } catch (error) {
        return Promise.reject(new Error('Authentication failed'));
      }
    } else if (accessKey === adminKey) {
      // Admin login
      const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
      localStorage.setItem('adminAuth', JSON.stringify({
        expiresAt,
        role: 'admin',
        username: 'admin'
      }));
      setIsAuthenticated(true);
      setUserRole('admin');
      setCurrentUser('admin');
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('Invalid access key'));
    }
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userRole, currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};