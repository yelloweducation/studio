
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
    getAuthState as getInitialAuthState, 
    saveAuthState, 
    clearAuthState, 
    loginUser as apiLogin, 
    registerUser as apiRegister, 
    logoutUser as apiLogout 
} from '@/lib/authUtils'; // Now uses Prisma-backed auth functions
import type { User as PrismaUserType, Role as PrismaRoleType } from '@prisma/client'; // Prisma types

interface AuthContextType {
  isAuthenticated: boolean;
  user: PrismaUserType | null;
  role: PrismaRoleType | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<PrismaUserType | null>;
  register: (name: string, email: string, pass: string) => Promise<PrismaUserType | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: PrismaUserType | null;
    role: PrismaRoleType | null;
  }>({ isAuthenticated: false, user: null, role: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = getInitialAuthState(); // This now reads state potentially set by Prisma-backed auth
    setAuthState(storedAuth);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    const user = await apiLogin(email, pass); // apiLogin now uses Prisma
    if (user) {
      setAuthState({ isAuthenticated: true, user, role: user.role });
      // saveAuthState is called within apiLogin now
      setLoading(false);
      return user;
    }
    setLoading(false);
    return null;
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string) => {
    setLoading(true);
    const user = await apiRegister(name, email, pass); // apiRegister now uses Prisma
    if (user) {
      setAuthState({ isAuthenticated: true, user, role: user.role });
      // saveAuthState is called within apiRegister now
      setLoading(false);
      return user;
    }
    setLoading(false);
    return null;
  }, []);

  const logout = useCallback(() => {
    apiLogout(); // Clears auth state from localStorage
    setAuthState({ isAuthenticated: false, user: null, role: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
