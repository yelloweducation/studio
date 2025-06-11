
import bcrypt from 'bcryptjs'; // Keep import for now, but bcrypt won't be used
import { users as initialMockUsersArray, type User as MockUserType, mockUsersForSeeding } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth_mock_secure';
export const SUPER_ADMIN_EMAIL = 'admin@example.com';
// const BCRYPT_SALT_ROUNDS_ENV = process.env.BCRYPT_SALT_ROUNDS; // No longer used
// const SALT_ROUNDS = BCRYPT_SALT_ROUNDS_ENV && !isNaN(parseInt(BCRYPT_SALT_ROUNDS_ENV)) ? parseInt(BCRYPT_SALT_ROUNDS_ENV) : 10; // No longer used
// console.log(`[AuthUtils] Using SALT_ROUNDS: ${SALT_ROUNDS}`); // No longer used


export interface AuthState {
  isAuthenticated: boolean;
  user: MockUserType | null;
  role: 'student' | 'admin' | null;
}

// --- Password Hashing Utilities (MODIFIED FOR DEBUGGING - PLAIN TEXT) ---
export const hashPassword = async (password: string): Promise<string> => {
  console.warn(`[AuthUtils - hashPassword - DEBUG MODE] Returning PLAIN TEXT password: ${password.substring(0,3)}... (length: ${password.length})`);
  return Promise.resolve(password); // Store plain text
};

export const comparePassword = async (password: string, storedPasswordAttempt: string): Promise<boolean> => {
  console.warn(`[AuthUtils - comparePassword - DEBUG MODE] Comparing PLAIN TEXT password: ${password.substring(0,3)}... (length: ${password.length}) against stored PLAIN TEXT: ${storedPasswordAttempt.substring(0,3)}... (length: ${storedPasswordAttempt.length})`);
  const isMatch = password === storedPasswordAttempt; // Direct string comparison
  console.warn(`[AuthUtils - comparePassword - DEBUG MODE] Comparison result: ${isMatch}`);
  return Promise.resolve(isMatch);
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
const MANAGED_USERS_STORAGE_KEY = 'managedUsers_hashed'; // Name is now a misnomer

const getManagedUsers = (): MockUserType[] => {
  if (typeof window === 'undefined') {
    return JSON.parse(JSON.stringify(mockUsersForSeeding));
  }

  const usersJson = localStorage.getItem(MANAGED_USERS_STORAGE_KEY);
  if (usersJson) {
    try {
      const parsedUsers = JSON.parse(usersJson);
      if (Array.isArray(parsedUsers)) {
        return parsedUsers;
      } else {
        console.error("[AuthUtils - getManagedUsers] Managed users in localStorage is not an array. Clearing and starting fresh.");
        localStorage.removeItem(MANAGED_USERS_STORAGE_KEY);
      }
    } catch (e) {
      console.error("[AuthUtils - getManagedUsers] Error parsing users from localStorage. Clearing and starting fresh.", e);
      localStorage.removeItem(MANAGED_USERS_STORAGE_KEY);
    }
  }
  return [];
};


const saveManagedUsers = (users: MockUserType[]) => {
  if (typeof window !== 'undefined') {
    console.warn(`[AuthUtils - saveManagedUsers - DEBUG MODE] Saving ${users.length} users to localStorage. First user's stored password (plain text): ${users[0]?.passwordHash?.substring(0,10)}...`);
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
  const allUsers = getManagedUsers();
  const foundUser = allUsers.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  if (foundUser) {
    console.warn(`[AuthUtils - findUserByEmailFromMock - DEBUG MODE] Found user for email ${email}. User ID: ${foundUser.id}, Stored Password (plain text prefix): ${foundUser.passwordHash?.substring(0,10)}... Full stored password (plain text): ${foundUser.passwordHash}`);
  } else {
    console.log(`[AuthUtils - findUserByEmailFromMock] User not found for email ${email}`);
  }
  return foundUser;
};

export const addUserToMock = async (userData: Omit<MockUserType, 'id' | 'passwordHash' | 'createdAt'>, password_raw: string): Promise<MockUserType> => {
  console.warn(`[AuthUtils - addUserToMock - DEBUG MODE] Attempting to add user: ${userData.email} with PLAIN TEXT password starting: ${password_raw.substring(0,3)}... (length: ${password_raw.length})`);
  const plainPasswordToStore = await hashPassword(password_raw); // hashPassword now returns plain text
  const newUser: MockUserType = {
    id: `user-${Date.now()}`,
    ...userData,
    passwordHash: plainPasswordToStore, // Storing plain text
    createdAt: new Date().toISOString(),
  };
  let currentUsers = getManagedUsers();
  currentUsers.push(newUser);
  saveManagedUsers(currentUsers);
  console.warn(`[AuthUtils - addUserToMock - DEBUG MODE] User ${newUser.email} added with ID ${newUser.id} and stored PLAIN TEXT password ${plainPasswordToStore.substring(0,10)}...`);
  return newUser;
};


export const seedInitialUsersToLocalStorage = async (): Promise<{ successCount: number, errorCount: number, skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  console.warn("[AuthUtils - seedInitialUsersToLocalStorage - DEBUG MODE] Starting user seeding process with PLAIN TEXT passwords.");

  let currentUsers = getManagedUsers();
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  const superAdminSeedData = mockUsersForSeeding.find(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

  if (!superAdminSeedData) {
    console.error(`[AuthUtils - seedInitialUsersToLocalStorage] CRITICAL: Super admin email ${SUPER_ADMIN_EMAIL} not found in mockUsersForSeeding. Seeding cannot guarantee super admin setup.`);
    errorCount++;
  } else {
    const superAdminPlainPassword = superAdminSeedData.passwordHash.replace('_PLAINTEXT', '');
    try {
      const existingSuperAdminIndex = currentUsers.findIndex(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
      const plainPasswordToStoreForAdmin = superAdminPlainPassword; 

      if (existingSuperAdminIndex !== -1) {
        console.warn(`[AuthUtils - seedInitialUsersToLocalStorage - DEBUG MODE] Super admin ${SUPER_ADMIN_EMAIL} exists. Updating details and forcing PLAIN TEXT password update.`);
        currentUsers[existingSuperAdminIndex] = {
          ...currentUsers[existingSuperAdminIndex],
          name: superAdminSeedData.name,
          email: superAdminSeedData.email,
          role: 'admin',
          passwordHash: plainPasswordToStoreForAdmin, // Storing plain text
          updatedAt: new Date().toISOString(),
        };
        console.warn(`[AuthUtils - seedInitialUsersToLocalStorage - DEBUG MODE] Updated super admin ${SUPER_ADMIN_EMAIL}. PLAIN TEXT password starts with: ${plainPasswordToStoreForAdmin.substring(0, 10)}`);
        successCount++;
      } else {
        console.warn(`[AuthUtils - seedInitialUsersToLocalStorage - DEBUG MODE] Super admin ${SUPER_ADMIN_EMAIL} not found in current users. Adding with PLAIN TEXT password.`);
        currentUsers.push({
          id: superAdminSeedData.id || `user-super-admin-${Date.now()}`,
          name: superAdminSeedData.name,
          email: superAdminSeedData.email,
          role: 'admin',
          passwordHash: plainPasswordToStoreForAdmin, // Storing plain text
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.warn(`[AuthUtils - seedInitialUsersToLocalStorage - DEBUG MODE] Added super admin ${SUPER_ADMIN_EMAIL}. PLAIN TEXT password starts with: ${plainPasswordToStoreForAdmin.substring(0, 10)}`);
        successCount++;
      }
    } catch (err) {
      console.error(`[AuthUtils - seedInitialUsersToLocalStorage] Error processing super admin ${SUPER_ADMIN_EMAIL}:`, err);
      errorCount++;
    }
  }

  for (const mockUser of mockUsersForSeeding) {
    if (mockUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      continue;
    }

    const plainPassword = mockUser.passwordHash.replace('_PLAINTEXT', '');
    try {
      const existingUserIndex = currentUsers.findIndex(u => u.email.toLowerCase() === mockUser.email.toLowerCase());
      const plainPasswordToStoreForUser = plainPassword;

      if (existingUserIndex === -1) {
        console.warn(`[AuthUtils - seedInitialUsersToLocalStorage - DEBUG MODE] Seeding new non-admin user: ${mockUser.email} with PLAIN TEXT password.`);
        currentUsers.push({
          ...mockUser,
          passwordHash: plainPasswordToStoreForUser, // Storing plain text
          id: mockUser.id || `user-seed-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
          createdAt: mockUser.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        successCount++;
      } else {
        console.warn(`[AuthUtils - seedInitialUsersToLocalStorage - DEBUG MODE] Non-admin user ${mockUser.email} already exists. Forcing PLAIN TEXT password update for debugging.`);
        currentUsers[existingUserIndex].passwordHash = plainPasswordToStoreForUser; // Force update to plain text for debug
        currentUsers[existingUserIndex].updatedAt = new Date().toISOString();
        successCount++; 
      }
    } catch (err) {
      console.error(`[AuthUtils - seedInitialUsersToLocalStorage] Error processing user ${mockUser.email} for seeding:`, err);
      errorCount++;
    }
  }

  saveManagedUsers(currentUsers);
  console.warn(`[AuthUtils - seedInitialUsersToLocalStorage - DEBUG MODE] User seeding complete. Total Processed/Updated: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}. Passwords are now PLAIN TEXT.`);
  return { successCount, errorCount, skippedCount };
};


export const logoutUser = () => {
  clearAuthState();
};
