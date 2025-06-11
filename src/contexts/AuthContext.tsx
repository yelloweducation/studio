
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
    getAuthState, 
    saveAuthState, 
    clearAuthState,
} from '@/lib/authUtils'; // Client-side localStorage utils
import { serverLoginUser, serverRegisterUser } from '@/actions/authActions'; // Server Actions
import type { User as PrismaUserType, Role as PrismaRoleType } from '@prisma/client';

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
    const storedAuth = getAuthState();
    setAuthState(storedAuth);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    try {
      const user = await serverLoginUser(email, pass); // Call Server Action
      if (user) {
        const newAuthState = { isAuthenticated: true, user, role: user.role };
        setAuthState(newAuthState);
        saveAuthState(newAuthState); // Save to localStorage on client
        return user;
      }
      clearAuthState(); // Clear any old state if login failed
      setAuthState({isAuthenticated: false, user: null, role: null });
      return null;
    } catch (error) {
        console.error("Login error in AuthContext:", error);
        clearAuthState();
        setAuthState({isAuthenticated: false, user: null, role: null });
        return null;
    } finally {
        setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
        const user = await serverRegisterUser(name, email, pass); // Call Server Action
        if (user) {
            const newAuthState = { isAuthenticated: true, user, role: user.role };
            setAuthState(newAuthState);
            saveAuthState(newAuthState); // Save to localStorage on client
            return user;
        }
        // If user is null, it implies registration failure (e.g., email exists)
        return null;
    } catch (error) {
        console.error("Register error in AuthContext:", error);
        return null;
    } finally {
        setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthState(); // Clear localStorage
    setAuthState({ isAuthenticated: false, user: null, role: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
