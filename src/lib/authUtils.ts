
import bcrypt from 'bcryptjs';
import { users as initialMockUsersArray, type User as MockUserType, mockUsersForSeeding } from '@/data/mockData';

const AUTH_STORAGE_KEY = 'luminaLearnAuth_mock_secure';
export const SUPER_ADMIN_EMAIL = 'admin@example.com';
const BCRYPT_SALT_ROUNDS_ENV = process.env.BCRYPT_SALT_ROUNDS;
const SALT_ROUNDS = BCRYPT_SALT_ROUNDS_ENV && !isNaN(parseInt(BCRYPT_SALT_ROUNDS_ENV)) ? parseInt(BCRYPT_SALT_ROUNDS_ENV) : 10;
console.log(`[AuthUtils] Using SALT_ROUNDS: ${SALT_ROUNDS}`);


export interface AuthState {
  isAuthenticated: boolean;
  user: MockUserType | null;
  role: 'student' | 'admin' | null;
}

// --- Password Hashing Utilities ---
export const hashPassword = async (password: string): Promise<string> => {
  console.log(`[AuthUtils - hashPassword] Hashing password starting with: ${password.substring(0,3)}... (length: ${password.length})`);
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  console.log(`[AuthUtils - hashPassword] Generated hash: ${hash.substring(0,10)}... Full hash (for debug): ${hash}`);
  return hash;
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  console.log(`[AuthUtils - comparePassword] Comparing password starting with: ${password.substring(0,3)}... (length: ${password.length}) against hash: ${hash.substring(0,10)}... (length: ${hash.length})`);
  const isMatch = await bcrypt.compare(password, hash);
  console.log(`[AuthUtils - comparePassword] Comparison result: ${isMatch}`);
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
      if (parsedState.isAuthenticated && parsedState.user) {
        // For mock purposes, passwordHash might be in client-side auth state.
        // In a real app, only a session token would be stored client-side.
        // For production, using secure, httpOnly cookies for session tokens is recommended over localStorage.
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
    // For server-side contexts or pre-hydration, return a copy of the base mock users.
    // This list won't include dynamically registered users from client-side localStorage.
    return JSON.parse(JSON.stringify(mockUsersForSeeding)); // Return a deep copy
  }

  const usersJson = localStorage.getItem(MANAGED_USERS_STORAGE_KEY);
  if (usersJson) {
    try {
      const parsedUsers = JSON.parse(usersJson);
      if (Array.isArray(parsedUsers)) {
        return parsedUsers;
      } else {
        console.error("[AuthUtils - getManagedUsers] Managed users in localStorage is not an array. Clearing and starting fresh.");
        localStorage.removeItem(MANAGED_USERS_STORAGE_KEY); // Clear corrupted data
      }
    } catch (e) {
      console.error("[AuthUtils - getManagedUsers] Error parsing users from localStorage. Clearing and starting fresh.", e);
      localStorage.removeItem(MANAGED_USERS_STORAGE_KEY); // Clear corrupted data
    }
  }
  // If localStorage is empty, or was cleared due to error, return an empty array.
  // The seeding function (seedInitialUsersToLocalStorage) will populate it if called.
  return [];
};


const saveManagedUsers = (users: MockUserType[]) => {
  if (typeof window !== 'undefined') {
    console.log(`[AuthUtils - saveManagedUsers] Saving ${users.length} users to localStorage. First user's hash (if any): ${users[0]?.passwordHash?.substring(0,10)}...`);
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
    console.log(`[AuthUtils - findUserByEmailFromMock] Found user for email ${email}. User ID: ${foundUser.id}, Stored Hash (prefix): ${foundUser.passwordHash?.substring(0,10)}... Full hash (for debug only, if problem persists): ${foundUser.passwordHash}`);
  } else {
    console.log(`[AuthUtils - findUserByEmailFromMock] User not found for email ${email}`);
  }
  return foundUser;
};

export const addUserToMock = async (userData: Omit<MockUserType, 'id' | 'passwordHash' | 'createdAt'>, password_raw: string): Promise<MockUserType> => {
  console.log(`[AuthUtils - addUserToMock] Attempting to add user: ${userData.email} with password starting: ${password_raw.substring(0,3)}... (length: ${password_raw.length})`);
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
  console.log(`[AuthUtils - addUserToMock] User ${newUser.email} added with ID ${newUser.id} and hash ${hashedPassword.substring(0,10)}...`);
  return newUser;
};


export const seedInitialUsersToLocalStorage = async (): Promise<{ successCount: number, errorCount: number, skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  console.log("[AuthUtils - seedInitialUsersToLocalStorage] Starting user seeding process.");

  let currentUsers = getManagedUsers(); // This should return [] if localStorage is empty/invalid initially
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  const superAdminSeedData = mockUsersForSeeding.find(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

  if (!superAdminSeedData) {
    console.error(`[AuthUtils - seedInitialUsersToLocalStorage] CRITICAL: Super admin email ${SUPER_ADMIN_EMAIL} not found in mockUsersForSeeding. Seeding cannot guarantee super admin setup.`);
    errorCount++; // Count this as an error as super admin setup is critical
  } else {
    const superAdminPlainPassword = superAdminSeedData.passwordHash.replace('_PLAINTEXT', '');
    try {
      const existingSuperAdminIndex = currentUsers.findIndex(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
      const hashedPassword = await hashPassword(superAdminPlainPassword); // Hash the defined plaintext password

      if (existingSuperAdminIndex !== -1) {
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Super admin ${SUPER_ADMIN_EMAIL} exists. Updating details and forcing password hash update.`);
        currentUsers[existingSuperAdminIndex] = {
          ...currentUsers[existingSuperAdminIndex],
          name: superAdminSeedData.name,
          email: superAdminSeedData.email,
          role: 'admin', // Ensure role is admin
          passwordHash: hashedPassword, // Force update password hash
          updatedAt: new Date().toISOString(),
        };
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Updated super admin ${SUPER_ADMIN_EMAIL}. New hash starts with: ${hashedPassword.substring(0, 10)}`);
        successCount++;
      } else {
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Super admin ${SUPER_ADMIN_EMAIL} not found in current users. Adding with fresh hash.`);
        currentUsers.push({
          id: superAdminSeedData.id || `user-super-admin-${Date.now()}`,
          name: superAdminSeedData.name,
          email: superAdminSeedData.email,
          role: 'admin',
          passwordHash: hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Added super admin ${SUPER_ADMIN_EMAIL}. Hash starts with: ${hashedPassword.substring(0, 10)}`);
        successCount++;
      }
    } catch (err) {
      console.error(`[AuthUtils - seedInitialUsersToLocalStorage] Error processing super admin ${SUPER_ADMIN_EMAIL}:`, err);
      errorCount++;
    }
  }

  // Process other users from mockUsersForSeeding
  for (const mockUser of mockUsersForSeeding) {
    if (mockUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      continue; // Super admin already processed
    }

    const plainPassword = mockUser.passwordHash.replace('_PLAINTEXT', '');
    try {
      const existingUserIndex = currentUsers.findIndex(u => u.email.toLowerCase() === mockUser.email.toLowerCase());

      if (existingUserIndex === -1) {
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Seeding new non-admin user: ${mockUser.email}`);
        const hashedPassword = await hashPassword(plainPassword);
        currentUsers.push({
          ...mockUser, // Spread all properties from mockUser
          passwordHash: hashedPassword,
          id: mockUser.id || `user-seed-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, // Ensure ID exists
          createdAt: mockUser.createdAt || new Date().toISOString(), // Ensure createdAt
          updatedAt: new Date().toISOString(), // Set/Update updatedAt
        });
        successCount++;
      } else {
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Non-admin user ${mockUser.email} already exists. Checking if password needs update (optional).`);
        // Optionally, you could force-update non-admin passwords too, or only if they don't match.
        // For simplicity here, we'll assume if they exist, they are fine unless explicitly changed.
        // const seedPasswordMatches = await comparePassword(plainPassword, currentUsers[existingUserIndex].passwordHash);
        // if (!seedPasswordMatches) {
        //   currentUsers[existingUserIndex].passwordHash = await hashPassword(plainPassword);
        //   console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Updated password for existing user ${mockUser.email}.`);
        //   successCount++; // Count as success if updated
        // } else {
        //   skippedCount++;
        // }
        skippedCount++; // Default to skipping if exists and not super admin
      }
    } catch (err) {
      console.error(`[AuthUtils - seedInitialUsersToLocalStorage] Error processing user ${mockUser.email} for seeding:`, err);
      errorCount++;
    }
  }

  saveManagedUsers(currentUsers);
  console.log(`[AuthUtils - seedInitialUsersToLocalStorage] User seeding complete. Total Processed/Updated: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
  return { successCount, errorCount, skippedCount };
};


export const logoutUser = () => {
  clearAuthState();
};
