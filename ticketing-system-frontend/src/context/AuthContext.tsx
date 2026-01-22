'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { userAPI } from '@/lib/api';
import { User, Role } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isSupportAgent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      userAPI.getCurrent()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          Cookies.remove('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set('token', token);
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const isAdmin = () => user?.role === Role.ADMIN;
  const isSupportAgent = () => user?.role === Role.SUPPORT_AGENT || user?.role === Role.ADMIN;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isSupportAgent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
