import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'followupai_user';

const initialsFrom = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'CU';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = ({ name, email, organization = 'MEDPULSE', role = 'Care Coordinator' }) => {
    const sessionUser = { id: email.toLowerCase(), name, email, role, department: organization, initials: initialsFrom(name) };
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
  };

  const login = ({ email }) => startSession({
    email,
    name: email.toLowerCase() === 'sarah@medpulse.health' ? 'Sarah Chen' : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
  });

  const signup = ({ name, email, organization }) => startSession({ name, email, organization: organization || 'My care workspace' });
  const logout = () => { setUser(null); localStorage.removeItem(STORAGE_KEY); };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
