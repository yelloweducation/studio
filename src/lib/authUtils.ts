
import bcrypt from 'bcryptjs';
import { users as initialMockUsersArray, type User as MockUserType, mockUsersForSeeding } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth_mock_secure'; // For client-side session
export const SUPER_ADMIN_EMAIL = 'admin@example.com';
const BCRYPT_SALT_ROUNDS_ENV = process.env.BCRYPT_SALT_ROUNDS;
const SALT_ROUNDS = BCRYPT_SALT_ROUNDS_ENV && !isNaN(parseInt(BCRYPT_SALT_ROUNDS_ENV)) ? parseInt(BCRYPT_SALT_ROUNDS_ENV) : 10;
console.log(`[AuthUtils] Using bcrypt SALT_ROUNDS: ${SALT_ROUNDS}`);

// In-memory store for all mock users, accessible by server-side functions
let currentInMemoryMockUsers: MockUserType[] = [];
let isInMemoryStoreInitialized = false;

export interface AuthState {
  isAuthenticated: boolean;
  user: MockUserType | null;
  role: 'student' | 'admin' | null;
}

// --- Password Hashing Utilities (using bcryptjs) ---
export const hashPassword = async (password: string): Promise<string> => {
  console.log(`[AuthUtils - hashPassword] Attempting to hash password. Length: ${password.length}, Prefix: ${password.substring(0, Math.min(3, password.length))}...`);
  if (!password) {
    console.error("[AuthUtils - hashPassword] Error: Password is empty or undefined. Cannot hash.");
    throw new Error("Password cannot be empty.");
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  console.log(`[AuthUtils - hashPassword] Password hashed successfully. Hash prefix: ${hash.substring(0,10)}...`);
  return hash;
};

export const comparePassword = async (password_from_form: string, storedHash: string): Promise<boolean> => {
  console.log(`[AuthUtils - comparePassword] Attempting to compare password. Form pwd length: ${password_from_form.length}, Stored hash prefix: ${storedHash?.substring(0,10)}...`);
  if (!password_from_form || !storedHash) {
    console.error("[AuthUtils - comparePassword] Error: Password from form or stored hash is missing.");
    return false;
  }
  const isMatch = await bcrypt.compare(password_from_form, storedHash);
  console.log(`[AuthUtils - comparePassword] bcrypt comparison result: ${isMatch}`);
  return isMatch;
};

// --- Client-side localStorage utilities for session state ---
export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, role: null };
  }
  const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState) as AuthState;
      if (parsedState.isAuthenticated && parsedState.user && (parsedState.role === 'student' || parsedState.role === 'admin')) {
        return parsedState;
      } else {
        console.warn("[AuthUtils - getAuthState] Parsed auth state from localStorage is invalid. Clearing.");
        clearAuthState();
      }
    } catch (e) {
      console.error("[AuthUtils - getAuthState] Failed to parse auth state from localStorage. Clearing.", e);
      clearAuthState();
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


// --- User Data Management (In-Memory, for server-side actions) ---

// Initialize or re-initialize the in-memory user store
const initializeInMemoryUserStore = async () => {
  console.log("[AuthUtils - initializeInMemoryUserStore] Initializing/Re-initializing in-memory user store.");
  currentInMemoryMockUsers = []; // Clear existing users
  let successCount = 0;
  let errorCount = 0;

  for (const mockUser of mockUsersForSeeding) {
    const plainPassword = mockUser.passwordHash.replace('_PLAINTEXT', '');
    console.log(`[AuthUtils - initializeInMemoryUserStore] Processing user for in-memory store: ${mockUser.email}. Plain text password: "${plainPassword.substring(0, Math.min(3, plainPassword.length))}..."`);
    try {
      const hashedPassword = await hashPassword(plainPassword);
      console.log(`[AuthUtils - initializeInMemoryUserStore] Hashed password for ${mockUser.email} (prefix): ${hashedPassword.substring(0,10)}...`);
      
      currentInMemoryMockUsers.push({
        ...mockUser,
        passwordHash: hashedPassword,
        id: mockUser.id || `user-mem-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
        createdAt: mockUser.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      successCount++;
    } catch (err) {
      console.error(`[AuthUtils - initializeInMemoryUserStore] Error processing user ${mockUser.email} for in-memory store:`, err);
      errorCount++;
    }
  }
  isInMemoryStoreInitialized = true;
  console.log(`[AuthUtils - initializeInMemoryUserStore] In-memory user store initialization complete. Users loaded: ${successCount}, Errors: ${errorCount}. Total in-memory users: ${currentInMemoryMockUsers.length}`);
  if (currentInMemoryMockUsers.length > 0) {
    const adminUser = currentInMemoryMockUsers.find(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (adminUser) {
      console.log(`[AuthUtils - initializeInMemoryUserStore] Admin user ${adminUser.email} found in store. Hash prefix: ${adminUser.passwordHash.substring(0,10)}...`);
    } else {
      console.warn(`[AuthUtils - initializeInMemoryUserStore] Admin user ${SUPER_ADMIN_EMAIL} NOT found in in-memory store after initialization.`);
    }
  }
};

// Ensures the store is initialized before access, especially for serverless environments
const ensureInMemoryStoreInitialized = async () => {
  if (!isInMemoryStoreInitialized || currentInMemoryMockUsers.length === 0) {
    // If running in a server context for the first time or if store is empty, initialize.
    // This is a simple check; more robust might be needed for true serverless persistence if functions spin down.
    await initializeInMemoryUserStore();
  }
};

export const getAllUsersFromMock = async (): Promise<MockUserType[]> => {
  await ensureInMemoryStoreInitialized();
  return [...currentInMemoryMockUsers].sort((a, b) => a.name.localeCompare(b.name));
};

export const findUserByEmailFromMock = async (email: string): Promise<MockUserType | null> => {
  await ensureInMemoryStoreInitialized();
  const normalizedEmail = email.toLowerCase();
  console.log(`[AuthUtils - findUserByEmailFromMock] Searching in-memory store for user with email: ${normalizedEmail}`);
  const foundUser = currentInMemoryMockUsers.find(user => user.email.toLowerCase() === normalizedEmail) || null;
  if (foundUser) {
    console.log(`[AuthUtils - findUserByEmailFromMock] Found user in-memory. ID: ${foundUser.id}, Email: ${foundUser.email}, Role: ${foundUser.role}, Stored Hash (prefix): ${foundUser.passwordHash?.substring(0,10)}..., Hash length: ${foundUser.passwordHash?.length}`);
  } else {
    console.log(`[AuthUtils - findUserByEmailFromMock] User not found in-memory for email: ${normalizedEmail}`);
  }
  return foundUser ? { ...foundUser } : null; // Return a copy
};

export const addUserToMock = async (userData: Omit<MockUserType, 'id' | 'passwordHash' | 'createdAt'>, password_raw: string): Promise<MockUserType> => {
  await ensureInMemoryStoreInitialized();
  console.log(`[AuthUtils - addUserToMock] Attempting to add user to in-memory store: ${userData.email}`);
  
  const existingUser = currentInMemoryMockUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existingUser) {
    console.error(`[AuthUtils - addUserToMock] User already exists in in-memory store with email: ${userData.email}.`);
    throw new Error("UserAlreadyExists");
  }

  const hashedPassword = await hashPassword(password_raw);
  const newUser: MockUserType = {
    id: `user-mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...userData,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  currentInMemoryMockUsers.push(newUser);
  console.log(`[AuthUtils - addUserToMock] User ${newUser.email} added to in-memory store with ID ${newUser.id}. Hash (prefix) stored: ${hashedPassword.substring(0,10)}...`);
  return { ...newUser }; // Return a copy
};

export const updateUserRoleInMock = async (userId: string, newRole: 'student' | 'admin'): Promise<MockUserType | null> => {
  await ensureInMemoryStoreInitialized();
  const userIndex = currentInMemoryMockUsers.findIndex(u => u.id === userId);

  if (userIndex > -1) {
    if (currentInMemoryMockUsers[userIndex].email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      console.warn("[AuthUtils - updateUserRoleInMock] Attempted to change the role of the super admin in-memory. This action is not allowed.");
      throw new Error("Cannot change the role of the super admin.");
    }
    currentInMemoryMockUsers[userIndex].role = newRole;
    currentInMemoryMockUsers[userIndex].updatedAt = new Date().toISOString();
    console.log(`[AuthUtils - updateUserRoleInMock] Updated role for user ID ${userId} to ${newRole} in-memory.`);
    return { ...currentInMemoryMockUsers[userIndex] }; // Return a copy
  }
  console.warn(`[AuthUtils - updateUserRoleInMock] User ID ${userId} not found in-memory for role update.`);
  return null;
};

// This function is called by the "Data Seeding" admin panel button.
// It re-initializes the in-memory user store.
export const seedInitialUsersToLocalStorage = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  // The name "ToLocalStorage" is now a misnomer for users, but we keep it for consistency with the admin panel button's intent.
  // It effectively seeds/re-seeds the in-memory store.
  console.log("[AuthUtils - seedInitialUsersToLocalStorage] Triggered. Re-initializing in-memory user store.");
  await initializeInMemoryUserStore(); 
  // The counts are now handled within initializeInMemoryUserStore, but we need to return something.
  // For simplicity, let's assume mockUsersForSeeding.length is the intended success count.
  const successCount = currentInMemoryMockUsers.length;
  const errorCount = mockUsersForSeeding.length - successCount; // Rough estimate of errors if any failed during init.
  
  console.log(`[AuthUtils - seedInitialUsersToLocalStorage] In-memory store re-seeded. Success: ${successCount}, Errors: ${errorCount}.`);
  return { successCount, errorCount, skippedCount: 0 };
};

// This function is NOT directly related to server-side auth logic, but for client-side mock data persistence if ever needed.
// It's currently unused by the auth flow for server actions.
export const saveManagedUsersToLocalStorage_DEPRECATED = (users: MockUserType[]) => {
  // This function is now effectively deprecated for server-side auth logic.
  // Kept for potential client-only mock data needs elsewhere if any.
  if (typeof window !== 'undefined') {
    console.warn("[AuthUtils - saveManagedUsersToLocalStorage_DEPRECATED] This function is deprecated for server auth logic and only affects browser localStorage.");
    localStorage.setItem('managedUsers_hashed_DEPRECATED', JSON.stringify(users));
  }
};

export const logoutUser = () => {
  // Only clears client-side session. Server-side (in-memory) users remain until next seed/restart.
  clearAuthState();
};

    