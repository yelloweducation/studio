
import bcrypt from 'bcryptjs';
import { users as initialMockUsersArray, type User as MockUserType, mockUsersForSeeding } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth_mock_secure';
export const SUPER_ADMIN_EMAIL = 'admin@example.com';
const BCRYPT_SALT_ROUNDS_ENV = process.env.BCRYPT_SALT_ROUNDS;
const SALT_ROUNDS = BCRYPT_SALT_ROUNDS_ENV && !isNaN(parseInt(BCRYPT_SALT_ROUNDS_ENV)) ? parseInt(BCRYPT_SALT_ROUNDS_ENV) : 10;


export interface AuthState {
  isAuthenticated: boolean;
  user: MockUserType | null;
  role: 'student' | 'admin' | null;
}

// --- Password Hashing Utilities ---
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// --- Client-side localStorage utilities ---
export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, role: null };
  }
  const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState) as AuthState;
      if (parsedState.isAuthenticated && parsedState.user) {
        // For mock purposes, passwordHash might be in client-side auth state.
        // In a real app, only a session token would be stored client-side.
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


// --- User Data Management (Mock, with localStorage for persistence) ---
const MANAGED_USERS_STORAGE_KEY = 'managedUsers_hashed';

const getManagedUsers = (): MockUserType[] => {
  if (typeof window === 'undefined') {
    // For server-side context (e.g., if Server Actions were run in a Node.js env for tests, not applicable for Netlify)
    // Return a fresh copy of the seed data definition, passwords still plaintext placeholders
    return JSON.parse(JSON.stringify(mockUsersForSeeding));
  }

  const usersJson = localStorage.getItem(MANAGED_USERS_STORAGE_KEY);
  if (usersJson) {
    try {
      const parsedUsers = JSON.parse(usersJson);
      // Basic validation: check if it's an array
      if (Array.isArray(parsedUsers)) {
        return parsedUsers;
      } else {
        console.error("Managed users in localStorage is not an array. Clearing and starting fresh.");
        localStorage.removeItem(MANAGED_USERS_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error parsing users from localStorage. Clearing and starting fresh.", e);
      localStorage.removeItem(MANAGED_USERS_STORAGE_KEY);
    }
  }
  // If localStorage is empty, or was cleared due to error, return an empty array.
  // Relies on seedInitialUsersToLocalStorage to populate if needed.
  return [];
};


const saveManagedUsers = (users: MockUserType[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MANAGED_USERS_STORAGE_KEY, JSON.stringify(users));
  }
};

export const getAllUsersFromMock = (): MockUserType[] => {
  return getManagedUsers().sort((a, b) => a.name.localeCompare(b.name));
};

export const updateUserRoleInMock = (userId: string, newRole: 'student' | 'admin'): MockUserType | null => {
  let currentUsers = getManagedUsers();
  const userIndex = currentUsers.findIndex(u => u.id === userId);

  if (userIndex > -1) {
    if (currentUsers[userIndex].email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      console.warn("Attempted to change the role of the super admin. This action is not allowed.");
      throw new Error("Cannot change the role of the super admin.");
    }
    currentUsers[userIndex].role = newRole;
    saveManagedUsers(currentUsers);
    return currentUsers[userIndex];
  }
  return null;
};

export const findUserByEmailFromMock = (email: string): MockUserType | null => {
  const allUsers = getManagedUsers();
  return allUsers.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const addUserToMock = async (userData: Omit<MockUserType, 'id' | 'passwordHash' | 'createdAt'>, password_raw: string): Promise<MockUserType> => {
  const hashedPassword = await hashPassword(password_raw);
  const newUser: MockUserType = {
    id: `user-${Date.now()}`,
    ...userData,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString(),
  };
  let currentUsers = getManagedUsers();
  currentUsers.push(newUser);
  saveManagedUsers(currentUsers);
  return newUser;
};


export const seedInitialUsersToLocalStorage = async (): Promise<{ successCount: number, errorCount: number, skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };

  let currentUsers = getManagedUsers(); // Loads from localStorage first, or [] if empty/invalid
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const mockUser of mockUsersForSeeding) {
    const existingUser = currentUsers.find(u => u.email.toLowerCase() === mockUser.email.toLowerCase());
    const plainPassword = mockUser.passwordHash.replace('_PLAINTEXT', '');

    try {
      if (!existingUser) {
        const hashedPassword = await hashPassword(plainPassword);
        currentUsers.push({ ...mockUser, passwordHash: hashedPassword, id: mockUser.id || `user-seed-${Date.now()}-${Math.random().toString(36).substring(2,7)}` });
        successCount++;
      } else {
        // Optional: Update existing user if needed, e.g., ensure super admin role and password
        let updated = false;
        if (existingUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
          if (existingUser.role !== 'admin') {
            existingUser.role = 'admin';
            updated = true;
          }
          // Optionally re-hash and update password if it doesn't match the seed password
          // This ensures the superadmin password can be reset to the seed version if needed
          const seedPasswordMatches = await comparePassword(plainPassword, existingUser.passwordHash);
          if (!seedPasswordMatches) {
            existingUser.passwordHash = await hashPassword(plainPassword);
            updated = true;
          }
        }
        if (updated) successCount++; else skippedCount++;
      }
    } catch (err) {
      console.error(`Error processing user ${mockUser.email} for seeding:`, err);
      errorCount++;
    }
  }
  saveManagedUsers(currentUsers);
  return { successCount, errorCount, skippedCount };
};


export const logoutUser = () => {
  clearAuthState();
};
