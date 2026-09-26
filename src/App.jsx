import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import AuthModal from './components/AuthModal';
import { authService } from './services/authService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const unsubscribe = authService.subscribe(({ isAuthenticated: authStatus }) => {
      setIsAuthenticated(authStatus);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthenticated) {
    return <AuthModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard />;
}
