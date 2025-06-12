
import bcrypt from 'bcryptjs';
import prisma from './prisma'; // Import Prisma client
import type { User as PrismaUserType, Role as PrismaRoleType } from '@prisma/client';
import { mockUsersForSeeding } from '@/data/mockData'; // Still needed for seeding structure

export const AUTH_STORAGE_KEY = 'luminaLearnAuth_v2_prisma'; // Updated key
export const SUPER_ADMIN_EMAIL = 'admin@example.com';
const BCRYPT_SALT_ROUNDS_ENV = process.env.BCRYPT_SALT_ROUNDS;
const SALT_ROUNDS = BCRYPT_SALT_ROUNDS_ENV && !isNaN(parseInt(BCRYPT_SALT_ROUNDS_ENV)) ? parseInt(BCRYPT_SALT_ROUNDS_ENV) : 10;
console.log(`[AuthUtils-Prisma] Using bcrypt SALT_ROUNDS: ${SALT_ROUNDS}`);

export interface AuthState {
  isAuthenticated: boolean;
  user: PrismaUserType | null;
  role: PrismaRoleType | null;
}

// --- Password Hashing Utilities (bcryptjs) ---
export const hashPassword = async (password: string): Promise<string> => {
  if (!password) {
    console.error("[AuthUtils-Prisma - hashPassword] Error: Password is empty or undefined.");
    throw new Error("Password cannot be empty.");
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
};

export const comparePassword = async (password_from_form: string, storedHash: string): Promise<boolean> => {
  if (!password_from_form || !storedHash) {
    console.error("[AuthUtils-Prisma - comparePassword] Error: Password from form or stored hash is missing.");
    return false;
  }
  const isMatch = await bcrypt.compare(password_from_form, storedHash);
  return isMatch;
};

// --- Client-side localStorage utilities for session state (Unchanged) ---
export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, role: null };
  }
  const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState) as AuthState;
      // Basic validation of stored state structure
      if (typeof parsedState.isAuthenticated === 'boolean' && 
          (parsedState.user === null || typeof parsedState.user === 'object')) {
        return parsedState;
      } else {
        console.warn("[AuthUtils-Prisma - getAuthState] Parsed auth state from localStorage is invalid. Clearing.");
        clearAuthState();
      }
    } catch (e) {
      console.error("[AuthUtils-Prisma - getAuthState] Failed to parse auth state. Clearing.", e);
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

// --- User Data Management (Using Prisma) ---
export const getAllUsers = async (): Promise<Omit<PrismaUserType, 'passwordHash'>[]> => {
  console.log("[AuthUtils-Prisma - getAllUsers] Fetching all users from DB.");
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } // Exclude passwordHash
    });
    return users;
  } catch (error) {
    console.error("[AuthUtils-Prisma - getAllUsers] Error fetching users:", error);
    throw error;
  }
};

export const findUserByEmail = async (email: string): Promise<PrismaUserType | null> => {
  const normalizedEmail = email.toLowerCase();
  console.log(`[AuthUtils-Prisma - findUserByEmail] Searching DB for user: ${normalizedEmail}`);
  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (user) {
      console.log(`[AuthUtils-Prisma - findUserByEmail] Found user in DB. ID: ${user.id}, Email: ${user.email}`);
    } else {
      console.log(`[AuthUtils-Prisma - findUserByEmail] User not found in DB for email: ${normalizedEmail}`);
    }
    return user;
  } catch (error) {
    console.error(`[AuthUtils-Prisma - findUserByEmail] Error finding user ${normalizedEmail}:`, error);
    throw error;
  }
};

export const addUser = async (userData: Omit<PrismaUserType, 'id' | 'passwordHash' | 'createdAt' | 'updatedAt'>, password_raw: string): Promise<PrismaUserType> => {
  console.log(`[AuthUtils-Prisma - addUser] Attempting to add user to DB: ${userData.email}`);
  
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    console.error(`[AuthUtils-Prisma - addUser] User already exists in DB with email: ${userData.email}.`);
    throw new Error("UserAlreadyExists");
  }

  const hashedPassword = await hashPassword(password_raw);
  try {
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
      },
    });
    console.log(`[AuthUtils-Prisma - addUser] User ${newUser.email} added to DB with ID ${newUser.id}.`);
    return newUser;
  } catch (error) {
    console.error(`[AuthUtils-Prisma - addUser] Error creating user ${userData.email} in DB:`, error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, newRole: PrismaRoleType): Promise<Omit<PrismaUserType, 'passwordHash'> | null> => {
  console.log(`[AuthUtils-Prisma - updateUserRole] Updating role for user ID ${userId} to ${newRole} in DB.`);
  try {
    const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
    if (userToUpdate && userToUpdate.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      console.warn("[AuthUtils-Prisma - updateUserRole] Attempted to change role of super admin. Denied.");
      throw new Error("Cannot change the role of the super admin.");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } // Exclude passwordHash
    });
    console.log(`[AuthUtils-Prisma - updateUserRole] Role updated for user ID ${userId}.`);
    return updatedUser;
  } catch (error) {
    console.error(`[AuthUtils-Prisma - updateUserRole] Error updating role for user ${userId}:`, error);
    throw error;
  }
};

// Seeds users to the actual database using Prisma.
export const seedInitialUsersToDatabase = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[AuthUtils-Prisma - seedInitialUsersToDatabase] Seeding initial users to database.");
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const mockUser of mockUsersForSeeding) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: mockUser.email.toLowerCase() },
      });

      if (existingUser) {
        skippedCount++;
        console.log(`[AuthUtils-Prisma - seedInitialUsersToDatabase] User ${mockUser.email} already exists. Skipped.`);
        continue;
      }
      
      const plainPassword = mockUser.passwordHash.replace('_PLAINTEXT', '');
      const hashedPassword = await hashPassword(plainPassword);
      
      await prisma.user.create({
        data: {
          id: mockUser.id, // Use mock ID if provided for consistency with other seeded data
          name: mockUser.name,
          email: mockUser.email.toLowerCase(),
          role: mockUser.role as PrismaRoleType,
          passwordHash: hashedPassword,
        },
      });
      successCount++;
      console.log(`[AuthUtils-Prisma - seedInitialUsersToDatabase] User ${mockUser.email} seeded successfully.`);
    } catch (err) {
      console.error(`[AuthUtils-Prisma - seedInitialUsersToDatabase] Error seeding user ${mockUser.email}:`, err);
      errorCount++;
    }
  }
  console.log(`[AuthUtils-Prisma - seedInitialUsersToDatabase] Seeding complete. Success: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}.`);
  return { successCount, errorCount, skippedCount };
};

export const logoutUser = () => {
  clearAuthState();
};

    