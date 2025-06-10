
import type { User } from '@/data/mockData';
import { users as initialMockUsers } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth';
const ADMIN_MANAGED_USERS_KEY = 'adminManagedUsers';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: 'student' | 'admin' | null;
}

const getUsersFromStorage = (): User[] => {
  if (typeof window === 'undefined') {
    return [...initialMockUsers]; // Return a copy for server-side
  }
  const storedUsers = localStorage.getItem(ADMIN_MANAGED_USERS_KEY);
  if (storedUsers) {
    try {
      const parsedUsers = JSON.parse(storedUsers) as User[];
      return Array.isArray(parsedUsers) ? parsedUsers : [...initialMockUsers];
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
      return [...initialMockUsers];
    }
  }
  // If no users in storage, initialize with mock data and save
  localStorage.setItem(ADMIN_MANAGED_USERS_KEY, JSON.stringify(initialMockUsers));
  return [...initialMockUsers];
};

export const saveUsersToStorage = (users: User[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_MANAGED_USERS_KEY, JSON.stringify(users));
  }
};

export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, role: null };
  }
  const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState) as AuthState;
      // Re-verify user details, especially role, from the central user list
      if (parsedState.isAuthenticated && parsedState.user) {
        const allUsers = getUsersFromStorage();
        const currentUserDetails = allUsers.find(u => u.id === parsedState.user?.id);
        if (currentUserDetails) {
          return {
            isAuthenticated: true,
            user: currentUserDetails,
            role: currentUserDetails.role,
          };
        } else {
          // User in auth state no longer exists in user list, treat as logged out
          clearAuthState();
          return { isAuthenticated: false, user: null, role: null };
        }
      }
      return parsedState;
    } catch (e) {
      console.error("Failed to parse auth state from localStorage", e);
      clearAuthState(); // Clear corrupted state
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
  const allUsers = getUsersFromStorage();
  const user = allUsers.find(u => u.email === email && u.passwordHash === password_raw);
  if (user) {
    saveAuthState({ isAuthenticated: true, user, role: user.role });
    return user;
  }
  return null;
};

export const registerUser = (name: string, email: string, password_raw: string): User | null => {
  let allUsers = getUsersFromStorage();
  if (allUsers.some(u => u.email === email)) {
    return null; // User already exists
  }
  const newUser: User = {
    id: `user${Date.now()}`, // More unique ID
    name,
    email,
    role: 'student', // Default role
    passwordHash: password_raw, 
  };
  allUsers.push(newUser);
  saveUsersToStorage(allUsers);
  saveAuthState({ isAuthenticated: true, user: newUser, role: newUser.role });
  return newUser;
};

export const logoutUser = () => {
  clearAuthState();
};

// Helper to get a specific user, e.g., for verifying Super Admin
export const findUserByEmail = (email: string): User | null => {
  const allUsers = getUsersFromStorage();
  return allUsers.find(u => u.email === email) || null;
}
