import type { User } from '@/data/mockData';
import { users as mockUsers } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: 'student' | 'admin' | null;
}

export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, role: null };
  }
  const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (e) {
      console.error("Failed to parse auth state from localStorage", e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
  return { isAuthenticated: false, user: null, role: null };
};

export const saveAuthState = (authState: AuthState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  }
};

export const clearAuthState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

export const loginUser = (email: string, password_raw: string): User | null => {
  const user = mockUsers.find(u => u.email === email && u.passwordHash === password_raw);
  if (user) {
    saveAuthState({ isAuthenticated: true, user, role: user.role });
    return user;
  }
  return null;
};

export const registerUser = (name: string, email: string, password_raw: string): User | null => {
  if (mockUsers.some(u => u.email === email)) {
    return null; // User already exists
  }
  const newUser: User = {
    id: `user${mockUsers.length + 1}`,
    name,
    email,
    role: 'student', // Default role
    passwordHash: password_raw, // Storing raw for demo purposes
  };
  mockUsers.push(newUser); // In a real app, this would be an API call
  saveAuthState({ isAuthenticated: true, user: newUser, role: newUser.role });
  return newUser;
};

export const logoutUser = () => {
  clearAuthState();
};
