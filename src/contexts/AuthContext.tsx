
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getAuthState, saveAuthState, clearAuthState, loginUser as apiLogin, registerUser as apiRegister, logoutUser as apiLogout } from '@/lib/authUtils';
import type { User } from '@/data/mockData';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  role: 'student' | 'admin' | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (name: string, email: string, pass: string) => Promise<User | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: User | null;
    role: 'student' | 'admin' | null;
  }>({ isAuthenticated: false, user: null, role: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = getAuthState();
    setAuthState(storedAuth);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    const user = apiLogin(email, pass);
    if (user) {
      const newAuthState = { isAuthenticated: true, user, role: user.role };
      setAuthState(newAuthState);
      saveAuthState(newAuthState);
      setLoading(false);
      return user;
    }
    setLoading(false);
    return null;
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string) => {
    setLoading(true);
    const user = apiRegister(name, email, pass);
    if (user) {
      const newAuthState = { isAuthenticated: true, user, role: user.role };
      setAuthState(newAuthState);
      saveAuthState(newAuthState);
      setLoading(false);
      return user;
    }
    setLoading(false);
    return null;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    const newAuthState = { isAuthenticated: false, user: null, role: null };
    setAuthState(newAuthState);
    clearAuthState();
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
