import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'followupai_user_v2';

const asText = (value, fallback = '') => typeof value === 'string' ? value : fallback;

const initialsFrom = (name = '') =>
  asText(name).split(' ').filter(Boolean).slice(0, 2)
    .map((word) => word[0]).join('').toUpperCase() || 'CU';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null && typeof parsed.email === 'string') {
          setUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = ({ name, email, organization = 'MEDPULSE', role = 'Care Coordinator' }) => {
    const safeEmail = asText(email);
    const safeName = asText(name);
    const safeOrg = asText(organization, 'MEDPULSE');
    const safeRole = asText(role, 'Care Coordinator');
    const sessionUser = { id: safeEmail.toLowerCase(), name: safeName, email: safeEmail, role: safeRole, department: safeOrg, initials: initialsFrom(safeName) };
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
  };

  const login = ({ email }) => {
    const safeEmail = asText(email);
    startSession({
      email: safeEmail,
      name: safeEmail.toLowerCase() === 'sarah@medpulse.health' ? 'Sarah Chen' : safeEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    });
  };

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
