
import bcrypt from 'bcryptjs';
import { users as initialMockUsersArray, type User as MockUserType, mockUsersForSeeding } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth_mock_secure'; 
export const SUPER_ADMIN_EMAIL = 'admin@example.com'; 
const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt

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
        return parsedState;
      }
    } catch (e) {
      console.error("Failed to parse auth state from localStorage", e);
    }
  }
  clearAuthState(); // Ensure clean state if parsing fails or state is invalid
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
  if (typeof window === 'undefined') return [...initialMockUsersArray]; // Return copy for server context
  const usersJson = localStorage.getItem(MANAGED_USERS_STORAGE_KEY);
  if (usersJson) {
    try {
      return JSON.parse(usersJson);
    } catch (e) {
      console.error("Error parsing users from localStorage", e);
      // Fallback to initializing if parsing fails
    }
  }
  // If not in localStorage or parsing failed, initialize with hashed passwords
  const initialUsersWithHashedPasswords = Promise.all(mockUsersForSeeding.map(async user => ({
    ...user,
    // Passwords in mockUsersForSeeding are marked PLAINTEXT and will be hashed here
    passwordHash: await hashPassword(user.passwordHash.replace('_PLAINTEXT', '')), 
  }))).then(users => {
    localStorage.setItem(MANAGED_USERS_STORAGE_KEY, JSON.stringify(users));
    return users;
  }).catch(err => {
    console.error("Error hashing passwords for initial seeding:", err);
    return []; // Return empty if hashing fails during initial load
  });
  // Note: This async operation during initial sync load is not ideal.
  // For real app, this seeding logic is better handled by a dedicated script or one-time setup.
  // For this mock, we accept this limitation. We will assume it resolves.
  // A better immediate return would be [], and let it populate async, but components might load before.
  // Returning initialMockUsersArray as a synchronous placeholder might be safer if async causes issues.
  return initialMockUsersArray; // Simplified for sync return, relies on seedInitialUsersToLocalStorage being called.
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
    if (currentUsers[userIndex].email === SUPER_ADMIN_EMAIL) {
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

  let currentUsers = getManagedUsers(); // Load existing users
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const mockUser of mockUsersForSeeding) {
    const existingUser = currentUsers.find(u => u.email === mockUser.email);
    const plainPassword = mockUser.passwordHash.replace('_PLAINTEXT', '');
    
    try {
      if (!existingUser) {
        const hashedPassword = await hashPassword(plainPassword);
        currentUsers.push({ ...mockUser, passwordHash: hashedPassword });
        successCount++;
      } else {
        // Optional: Update existing user if needed, e.g., ensure super admin role and password
        let updated = false;
        if (existingUser.email === SUPER_ADMIN_EMAIL) {
          if (existingUser.role !== 'admin') {
            existingUser.role = 'admin';
            updated = true;
          }
          // Optionally re-hash and update password if it doesn't match a known hash (more complex to check)
          // For simplicity, we assume if user exists, password was set correctly before or will be managed by user.
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

