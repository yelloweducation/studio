
import { users as mockUsers, type User as MockUserType, mockUsersForSeeding } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth_mock'; // Changed key to reflect mock data usage
export const SUPER_ADMIN_EMAIL = 'admin@example.com'; // Default super admin

export interface AuthState {
  isAuthenticated: boolean;
  user: MockUserType | null;
  role: 'student' | 'admin' | null; // Role from mock User type
}

// Client-side localStorage utilities
export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, role: null };
  }
  const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState) as AuthState;
      if (parsedState.isAuthenticated && parsedState.user) {
        return parsedState;
      }
    } catch (e) {
      console.error("Failed to parse auth state from localStorage", e);
    }
  }
  clearAuthState();
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

// User data is now primarily from mockData.ts
// These functions simulate database interactions with the mock array.

export const getAllUsersFromMock = (): MockUserType[] => {
  // In a real app, this would fetch from a DB. Here, we use the mock array.
  // We might want to load/save this from localStorage if admin can manage users.
  // For now, it returns the static mockData.
  let storedUsers = [];
  if (typeof window !== 'undefined') {
    const usersJson = localStorage.getItem('managedUsers');
    if (usersJson) {
      try {
        storedUsers = JSON.parse(usersJson);
      } catch (e) {
        console.error("Error parsing users from localStorage", e);
        storedUsers = [...mockUsers]; // fallback
      }
    } else {
      storedUsers = [...mockUsers]; // initialize from mock
      localStorage.setItem('managedUsers', JSON.stringify(storedUsers));
    }
  } else {
     storedUsers = [...mockUsers]; // fallback for server context
  }
  return storedUsers.sort((a, b) => a.name.localeCompare(b.name));
};

export const updateUserRoleInMock = (userId: string, newRole: 'student' | 'admin'): MockUserType | null => {
  let success = false;
  let updatedUser: MockUserType | null = null;
  if (typeof window !== 'undefined') {
    let currentUsers = getAllUsersFromMock(); // Gets from localStorage or initializes
    const userIndex = currentUsers.findIndex(u => u.id === userId);

    if (userIndex > -1) {
      if (currentUsers[userIndex].email === SUPER_ADMIN_EMAIL) {
        console.warn("Attempted to change the role of the super admin. This action is not allowed.");
        throw new Error("Cannot change the role of the super admin.");
      }
      currentUsers[userIndex].role = newRole;
      updatedUser = currentUsers[userIndex];
      localStorage.setItem('managedUsers', JSON.stringify(currentUsers));
      success = true;
    }
  }
  return success ? updatedUser : null;
};

export const findUserByEmailFromMock = (email: string): MockUserType | null => {
  const allUsers = getAllUsersFromMock();
  return allUsers.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

// Seeding function for mock users (if needed for initializing localStorage)
export const seedInitialUsersToLocalStorage = (): { successCount: number, errorCount: number, skippedCount: number } => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };

  let currentUsers = getAllUsersFromMock(); // Load existing or initialize
  let successCount = 0;
  let skippedCount = 0;

  mockUsersForSeeding.forEach(mockUser => {
    const existingUser = currentUsers.find(u => u.email === mockUser.email);
    if (!existingUser) {
      currentUsers.push({...mockUser}); // Add if not exists
      successCount++;
    } else {
      // Ensure super admin role is correct
      if (existingUser.email === SUPER_ADMIN_EMAIL && existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        successCount++; // Count as a successful update/correction
      } else {
        skippedCount++;
      }
    }
  });
  localStorage.setItem('managedUsers', JSON.stringify(currentUsers));
  return { successCount, errorCount: 0, skippedCount };
};

// Logout remains client-side
export const logoutUser = () => {
  clearAuthState();
};
