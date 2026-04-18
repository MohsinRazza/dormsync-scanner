import { useState, useEffect } from 'react';
import { isSessionValid } from '../utils/auth';

/**
 * Tracks login state and re-checks session on an interval. Resets to dashboard tab when session expires.
 */
export function useAuthSession(activeTab, setActiveTab) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (isSessionValid()) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (activeTab !== 'dashboard') {
          setActiveTab('dashboard');
        }
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [activeTab, setActiveTab]);

  return { isAuthenticated, setIsAuthenticated };
}
