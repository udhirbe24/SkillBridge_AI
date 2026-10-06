'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenVal, setRefreshTokenVal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sb_token');
    const savedRefresh = localStorage.getItem('sb_refresh');
    const savedUser = localStorage.getItem('sb_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setRefreshTokenVal(savedRefresh);
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authAPI.login(email, password);
    setToken(data.access_token);
    setRefreshTokenVal(data.refresh_token);
    setUser(data.user);
    localStorage.setItem('sb_token', data.access_token);
    localStorage.setItem('sb_refresh', data.refresh_token);
    localStorage.setItem('sb_user', JSON.stringify(data.user));
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, role = 'student') => {
    const data = await authAPI.register({ email, password, full_name: fullName, role });
    setToken(data.access_token);
    setRefreshTokenVal(data.refresh_token);
    setUser(data.user);
    localStorage.setItem('sb_token', data.access_token);
    localStorage.setItem('sb_refresh', data.refresh_token);
    localStorage.setItem('sb_user', JSON.stringify(data.user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshTokenVal(null);
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_refresh');
    localStorage.removeItem('sb_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken: refreshTokenVal, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
