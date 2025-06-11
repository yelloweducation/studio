
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
  console.log(`[AuthUtils - hashPassword] Hashing password starting with: ${password.substring(0,3)}... (length: ${password.length})`);
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  console.log(`[AuthUtils - hashPassword] Generated hash (prefix): ${hash.substring(0,10)}...`);
  return hash;
};

export const comparePassword = async (password: string, storedHash: string): Promise<boolean> => {
  console.log(`[AuthUtils - comparePassword] Comparing password starting with: ${password.substring(0,3)}... (length: ${password.length}) against stored hash (prefix): ${storedHash.substring(0,10)}...`);
  const isMatch = await bcrypt.compare(password, storedHash);
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
      // It's good practice to re-validate the shape of the parsed object here
      // especially if the AuthState structure evolves.
      if (parsedState.isAuthenticated && parsedState.user && (parsedState.role === 'student' || parsedState.role === 'admin')) {
        return parsedState;
      } else {
        console.warn("[AuthUtils - getAuthState] Parsed auth state from localStorage is invalid. Clearing.");
        clearAuthState(); // Clear invalid state
      }
    } catch (e) {
      console.error("[AuthUtils - getAuthState] Failed to parse auth state from localStorage. Clearing.", e);
      clearAuthState(); // Clear corrupted state
    }
  }
  return { isAuthenticated: false, user: null, role: null };
};

export const saveAuthState = (authState: AuthState) => {
  if (typeof window !== 'undefined') {
    // Note: Storing sensitive user details (even if just name/role) in localStorage
    // for client-side access is common in some architectures but has security implications
    // (XSS). For production, prefer secure, httpOnly cookies for session tokens
    // and fetch user details from the server as needed.
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
    // For server-side or build-time, return a copy of the seed data (no localStorage)
    // This part is more for conceptual purity, as most user management ops will be client-side here.
    return JSON.parse(JSON.stringify(mockUsersForSeeding));
  }

  const usersJson = localStorage.getItem(MANAGED_USERS_STORAGE_KEY);
  if (usersJson) {
    try {
      const parsedUsers = JSON.parse(usersJson);
      if (Array.isArray(parsedUsers)) { // Ensure it's an array
        return parsedUsers;
      } else {
        console.error("[AuthUtils - getManagedUsers] Managed users in localStorage is not an array. Clearing and returning empty array.");
        localStorage.removeItem(MANAGED_USERS_STORAGE_KEY); // Clear corrupted data
        return []; // Return empty array
      }
    } catch (e) {
      console.error("[AuthUtils - getManagedUsers] Error parsing users from localStorage. Clearing and returning empty array.", e);
      localStorage.removeItem(MANAGED_USERS_STORAGE_KEY); // Clear corrupted data
      return []; // Return empty array
    }
  }
  // If no users are in localStorage, return an empty array. Seeding will populate it.
  return [];
};


const saveManagedUsers = (users: MockUserType[]) => {
  if (typeof window !== 'undefined') {
    console.log(`[AuthUtils - saveManagedUsers] Saving ${users.length} users to localStorage. First user's stored hash (prefix): ${users[0]?.passwordHash?.substring(0,10)}...`);
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
    console.log(`[AuthUtils - findUserByEmailFromMock] Found user. ID: ${foundUser.id}, Email: ${foundUser.email}, Role: ${foundUser.role}, Stored Hash (prefix): ${foundUser.passwordHash?.substring(0,10)}...`);
  } else {
    console.log(`[AuthUtils - findUserByEmailFromMock] User not found for email: ${normalizedEmail}`);
  }
  return foundUser;
};

export const addUserToMock = async (userData: Omit<MockUserType, 'id' | 'passwordHash' | 'createdAt'>, password_raw: string): Promise<MockUserType> => {
  console.log(`[AuthUtils - addUserToMock] Attempting to add user: ${userData.email}`);
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
  console.log(`[AuthUtils - addUserToMock] User ${newUser.email} added with ID ${newUser.id}. Hash (prefix) stored: ${hashedPassword.substring(0,10)}...`);
  return newUser;
};


export const seedInitialUsersToLocalStorage = async (): Promise<{ successCount: number, errorCount: number, skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  console.log("[AuthUtils - seedInitialUsersToLocalStorage] Starting user seeding process.");

  let currentUsers = getManagedUsers();
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  const superAdminSeedData = mockUsersForSeeding.find(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

  if (!superAdminSeedData) {
    console.error(`[AuthUtils - seedInitialUsersToLocalStorage] CRITICAL: Super admin email ${SUPER_ADMIN_EMAIL} not found in mockUsersForSeeding. Cannot guarantee super admin setup.`);
    errorCount++; // Increment error count as this is a critical failure for admin setup
  } else {
    const superAdminPlainPassword = superAdminSeedData.passwordHash.replace('_PLAINTEXT', '');
    console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Processing super admin: ${SUPER_ADMIN_EMAIL}. Plain text password to be hashed: "${superAdminPlainPassword.substring(0,3)}..."`);
    try {
      const hashedSuperAdminPassword = await hashPassword(superAdminPlainPassword);
      console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Hashed super admin password (prefix): ${hashedSuperAdminPassword.substring(0,10)}...`);

      const existingSuperAdminIndex = currentUsers.findIndex(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
      if (existingSuperAdminIndex !== -1) {
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Super admin ${SUPER_ADMIN_EMAIL} found. Updating with fresh hash.`);
        currentUsers[existingSuperAdminIndex] = {
          ...currentUsers[existingSuperAdminIndex], // Preserve existing ID and other fields if any
          name: superAdminSeedData.name,
          email: superAdminSeedData.email, // Ensure email casing is from seed data
          role: 'admin', // Ensure role is admin
          passwordHash: hashedSuperAdminPassword,
          updatedAt: new Date().toISOString(),
        };
        successCount++;
      } else {
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Super admin ${SUPER_ADMIN_EMAIL} not found. Adding new entry.`);
        currentUsers.push({
          id: superAdminSeedData.id || `user-super-admin-${Date.now()}`, // Use seed ID or generate
          name: superAdminSeedData.name,
          email: superAdminSeedData.email,
          role: 'admin',
          passwordHash: hashedSuperAdminPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
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
      // Super admin already handled, skip to avoid reprocessing or issues if it failed above
      continue;
    }

    const plainPassword = mockUser.passwordHash.replace('_PLAINTEXT', '');
    console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Processing user: ${mockUser.email}. Plain text password: "${plainPassword.substring(0,3)}..."`);
    try {
      const hashedPassword = await hashPassword(plainPassword);
      console.log(`[AuthUtils - seedInitialUsersToLocalStorage] Hashed password for ${mockUser.email} (prefix): ${hashedPassword.substring(0,10)}...`);
      const existingUserIndex = currentUsers.findIndex(u => u.email.toLowerCase() === mockUser.email.toLowerCase());

      if (existingUserIndex === -1) {
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] User ${mockUser.email} not found. Adding new.`);
        currentUsers.push({
          ...mockUser, // Spreads id, name, email, role from mockUser
          passwordHash: hashedPassword, // Overwrites passwordHash with the new hash
          id: mockUser.id || `user-seed-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, // Use provided ID or generate
          createdAt: mockUser.createdAt || new Date().toISOString(), // Use provided or new
          updatedAt: new Date().toISOString(),
        });
        successCount++;
      } else {
        console.log(`[AuthUtils - seedInitialUsersToLocalStorage] User ${mockUser.email} already exists. Updating password hash.`);
        currentUsers[existingUserIndex].passwordHash = hashedPassword; // Ensure hash is updated
        currentUsers[existingUserIndex].name = mockUser.name; // Update name
        currentUsers[existingUserIndex].role = mockUser.role; // Update role
        currentUsers[existingUserIndex].updatedAt = new Date().toISOString();
        successCount++; // Count as success because it was processed/updated
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
