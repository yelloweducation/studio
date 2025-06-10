
import type { User } from '@/data/mockData';
import { users as initialMockUsers } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth';
const ADMIN_MANAGED_USERS_KEY = 'adminManagedUsers';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: 'student' | 'admin' | null;
}

export const getUsersFromStorage = (): User[] => {
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
      if (parsedState.isAuthenticated && parsedState.user) {
        const allUsers = getUsersFromStorage(); // From localStorage or defaults to initialMockUsers
        const userFromManagedList = allUsers.find(u => u.id === parsedState.user?.id);

        if (userFromManagedList) {
          // User found in the managed list, use its role and details (most up-to-date)
          return {
            isAuthenticated: true,
            user: userFromManagedList,
            role: userFromManagedList.role,
          };
        } else {
          // User NOT in managed list.
          // Check if the ADMIN_MANAGED_USERS_KEY was actually present in localStorage.
          // If it wasn't, it means `allUsers` is just `initialMockUsers`.
          // In this scenario (e.g., after a fresh deploy resetting localStorage for users),
          // we might trust the user details (including role) from the AUTH_STORAGE_KEY.
          const adminManagedUsersLocalStorageEntry = localStorage.getItem(ADMIN_MANAGED_USERS_KEY);
          if (adminManagedUsersLocalStorageEntry === null) {
            // The user list from localStorage was genuinely empty (not just empty array string).
            // This indicates a fresh state where `getUsersFromStorage` returned `initialMockUsers`.
            // Trust the user object (including role) from the AUTH_STORAGE_KEY if it's a registered user.
            return {
              isAuthenticated: true,
              user: parsedState.user, // Trust user from AUTH_STORAGE_KEY
              role: parsedState.user.role, // Trust role from AUTH_STORAGE_KEY
            };
          } else {
            // User list *did* exist in localStorage (even if it was an empty array string,
            // or contained other users), but this specific authenticated user isn't in it.
            // This implies the user was deleted or is invalid according to the managed list. Log them out.
            clearAuthState();
            return { isAuthenticated: false, user: null, role: null };
          }
        }
      }
      // If parsedState.isAuthenticated is false or parsedState.user is null, it's an invalid/logged-out state.
      // Or if the original parsedState was already { isAuthenticated: false, ... }
      return { isAuthenticated: false, user: null, role: null };

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
