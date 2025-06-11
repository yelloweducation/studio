
import bcrypt from 'bcryptjs';
import { users as initialMockUsersArray, type User as MockUserType, mockUsersForSeeding } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth_mock_secure';
export const SUPER_ADMIN_EMAIL = 'admin@example.com';
const BCRYPT_SALT_ROUNDS_ENV = process.env.BCRYPT_SALT_ROUNDS;
const SALT_ROUNDS = BCRYPT_SALT_ROUNDS_ENV && !isNaN(parseInt(BCRYPT_SALT_ROUNDS_ENV)) ? parseInt(BCRYPT_SALT_ROUNDS_ENV) : 10;
console.log(`[AuthUtils] Using bcrypt SALT_ROUNDS: ${SALT_ROUNDS}`);


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

// --- Client-side localStorage utilities ---
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


// --- User Data Management (Mock, with localStorage for persistence) ---
const MANAGED_USERS_STORAGE_KEY = 'managedUsers_hashed';

const getManagedUsers = (): MockUserType[] => {
  if (typeof window === 'undefined') {
    return JSON.parse(JSON.stringify(mockUsersForSeeding)); // Return a copy for server/build
  }

  const usersJson = localStorage.getItem(MANAGED_USERS_STORAGE_KEY);
  if (usersJson) {
    try {
      const parsedUsers = JSON.parse(usersJson);
      if (Array.isArray(parsedUsers)) {
        return parsedUsers;
      } else {
        console.error("[AuthUtils - getManagedUsers] Managed users in localStorage is not an array. Clearing and returning empty array.");
        localStorage.removeItem(MANAGED_USERS_STORAGE_KEY);
        return [];
      }
    } catch (e) {
      console.error("[AuthUtils - getManagedUsers] Error parsing users from localStorage. Clearing and returning empty array.", e);
      localStorage.removeItem(MANAGED_USERS_STORAGE_KEY);
      return [];
    }
  }
  return [];
};


const saveManagedUsers = (users: MockUserType[]) => {
  if (typeof window !== 'undefined') {
    console.log(`[AuthUtils - saveManagedUsers] Saving ${users.length} users to localStorage.`);
    if (users.length > 0 && users[0]?.passwordHash) {
        console.log(`[AuthUtils - saveManagedUsers] First user's stored hash (prefix): ${users[0].passwordHash.substring(0,10)}...`);
    }
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
      console.warn("[AuthUtils - updateUserRoleInMock] Attempted to change the role of the super admin. This action is not allowed.");
      throw new Error("Cannot change the role of the super admin.");
    }
    currentUsers[userIndex].role = newRole;
    saveManagedUsers(currentUsers);
    console.log(`[AuthUtils - updateUserRoleInMock] Updated role for user ID ${userId} to ${newRole}`);
    return currentUsers[userIndex];
  }
  console.warn(`[AuthUtils - updateUserRoleInMock] User ID ${userId} not found for role update.`);
  return null;
};

export const findUserByEmailFromMock = (email: string): MockUserType | null => {
  const normalizedEmail = email.toLowerCase();
  console.log(`[AuthUtils - findUserByEmailFromMock] Searching for user with email: ${normalizedEmail}`);
  const allUsers = getManagedUsers();
  const foundUser = allUsers.find(user => user.email.toLowerCase() === normalizedEmail) || null;
  if (foundUser) {
    console.log(`[AuthUtils - findUserByEmailFromMock] Found user. ID: ${foundUser.id}, Email: ${foundUser.email}, Role: ${foundUser.role}, Stored Hash (prefix): ${foundUser.passwordHash?.substring(0,10)}..., Hash length: ${foundUser.passwordHash?.length}`);
  } else {
    console.log(`[AuthUtils - findUserByEmailFromMock] User not found for email: ${normalizedEmail}`);
  }
  return foundUser;
};

export const addUserToMock = async (userData: Omit<MockUserType, 'id' | 'passwordHash' | 'createdAt'>, password_raw: string): Promise<MockUserType> => {
  console.log(`[AuthUtils - addUserToMock] Attempting to add user: ${userData.email}`);
  const hashedPassword = await hashPassword(password_raw);
  const newUser: MockUserType = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
    ...userData,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString(),
  };
  let currentUsers = getManagedUsers();
  currentUsers.push(newUser);
  saveManagedUsers(currentUsers);
  console.log(`[AuthUtils - addUserToMock] User ${newUser.email} added with ID ${newUser.id}. Hash (prefix) stored: ${hashedPassword.substring(0,10)}...`);
  return newUser;
};


export const seedInitialUsersToLocalStorage = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  console.log("[AuthUtils - seedInitialUsersToLocalStorage] Starting user seeding process with forced super admin refresh.");

  let currentUsers = getManagedUsers();
  console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Loaded ${currentUsers.length} users from localStorage initially.`);
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  // --- Force refresh for Super Admin ---
  const superAdminSeedData = mockUsersForSeeding.find(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

  if (!superAdminSeedData) {
    console.error(`[AuthUtils - seedInitialUsersToLocalStorage] CRITICAL: Super admin email ${SUPER_ADMIN_EMAIL} not found in mockUsersForSeeding. Cannot guarantee super admin setup.`);
    errorCount++;
  } else {
    const superAdminPlainTextPassword = superAdminSeedData.passwordHash.replace('_PLAINTEXT', '');
    console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Super admin plain text password for hashing: "${superAdminPlainTextPassword.substring(0, Math.min(3, superAdminPlainTextPassword.length))}..." (length: ${superAdminPlainTextPassword.length})`);
    try {
      const newSuperAdminHash = await hashPassword(superAdminPlainTextPassword);
      console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Freshly hashed password for super admin (prefix): ${newSuperAdminHash.substring(0,10)}... Full hash length: ${newSuperAdminHash.length}`);

      // Remove any existing super admin from currentUsers to ensure a clean slate for this entry
      currentUsers = currentUsers.filter(u => u.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase());
      console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Removed any existing super admin. Users count now: ${currentUsers.length}`);

      // Add the super admin with the fresh hash
      const superAdminToAdd: MockUserType = {
        id: superAdminSeedData.id || `user-super-admin-${Date.now()}`, // Use defined ID or generate
        name: superAdminSeedData.name,
        email: superAdminSeedData.email, // Use original casing from seed
        role: 'admin', // Ensure role is admin
        passwordHash: newSuperAdminHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      currentUsers.push(superAdminToAdd);
      console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Super admin ${superAdminToAdd.email} ADDED/REPLACED with fresh seed data and new hash. Users count now: ${currentUsers.length}`);
      successCount++;
    } catch (hashError) {
      console.error(`[AuthUtils - seedInitialUsersToLocalStorage] Error hashing password for super admin ${superAdminSeedData.email}:`, hashError);
      errorCount++;
    }
  }

  // --- Process other users from mockUsersForSeeding ---
  for (const mockUser of mockUsersForSeeding) {
    if (mockUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      // Super admin was handled above, skip to avoid duplication or conflicts
      console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Skipping super admin ${mockUser.email} in general loop as it was force-refreshed.`);
      continue;
    }

    const plainPassword = mockUser.passwordHash.replace('_PLAINTEXT', '');
    console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Processing user: ${mockUser.email}. Plain text password: "${plainPassword.substring(0,Math.min(3, plainPassword.length))}..."`);
    try {
      const hashedPassword = await hashPassword(plainPassword);
      console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Hashed password for ${mockUser.email} (prefix): ${hashedPassword.substring(0,10)}...`);
      
      const existingUserIndex = currentUsers.findIndex(u => u.email.toLowerCase() === mockUser.email.toLowerCase());

      if (existingUserIndex === -1) {
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] User ${mockUser.email} not found. Adding new.`);
        currentUsers.push({
          ...mockUser,
          passwordHash: hashedPassword,
          id: mockUser.id || `user-seed-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
          createdAt: mockUser.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        successCount++;
      } else {
        // This case should be less common now for super admin due to pre-filtering,
        // but for other users, it might be an update.
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] User ${mockUser.email} already exists. Updating their details and password hash.`);
        currentUsers[existingUserIndex] = {
          ...currentUsers[existingUserIndex], // Preserve existing ID, createdAt
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          passwordHash: hashedPassword, // Update hash
          updatedAt: new Date().toISOString(),
        };
        successCount++; // Count as a successful operation (update)
      }
    } catch (err) {
      console.error(`[AuthUtils - seedInitialUsersToLocalStorage] Error processing user ${mockUser.email} for seeding:`, err);
      errorCount++;
    }
  }

  saveManagedUsers(currentUsers);
  console.log(`[AuthUtils - seedInitialUsersToLocalStorage] User seeding complete. Total Processed/Updated: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}.`);
  return { successCount, errorCount, skippedCount };
};


export const logoutUser = () => {
  clearAuthState();
};
