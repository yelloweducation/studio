
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getAuthState as getInitialAuthState, saveAuthState, clearAuthState, loginUser as apiLogin, registerUser as apiRegister, logoutUser as apiLogout } from '@/lib/authUtils';
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
    // getInitialAuthState now handles re-verification of role from localStorage users list
    const storedAuth = getInitialAuthState();
    setAuthState(storedAuth);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    const user = apiLogin(email, pass); // apiLogin now uses central user list and saves auth state
    if (user) {
      // Auth state is already saved by apiLogin, just update local context state
      setAuthState({ isAuthenticated: true, user, role: user.role });
      setLoading(false);
      return user;
    }
    setLoading(false);
    return null;
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string) => {
    setLoading(true);
    const user = apiRegister(name, email, pass); // apiRegister now adds to central list and saves auth state
    if (user) {
      // Auth state is already saved by apiRegister
      setAuthState({ isAuthenticated: true, user, role: user.role });
      setLoading(false);
      return user;
    }
    setLoading(false);
    return null;
  }, []);

  const logout = useCallback(() => {
    apiLogout(); // Clears auth state from localStorage
    const newAuthState = { isAuthenticated: false, user: null, role: null };
    setAuthState(newAuthState);
    // No need to call clearAuthState() here as apiLogout does it.
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
