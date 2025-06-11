
import type { User as MockUserType } from '@/data/mockData'; // Keep for mock seeding type
import { mockUsersForSeeding } from '@/data/mockData';
import prisma from '@/lib/prisma'; // Import Prisma client
import type { User, Role } from '@prisma/client'; // Import Prisma generated types

const AUTH_STORAGE_KEY = 'luminaLearnAuth_prisma'; // Changed key to avoid conflict
export const SUPER_ADMIN_EMAIL = 'admin@example.com';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null; // Prisma User type
  role: Role | null; // Prisma Role enum
}

// Helper to get user by email from Prisma
const getUserByEmailFromPrisma = async (email: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error("Error fetching user by email from Prisma:", error);
    return null;
  }
};

export const getAllUsersFromPrisma = async (): Promise<User[]> => {
  try {
    return await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error("Error fetching all users from Prisma:", error);
    return [];
  }
};

export const updateUserRoleInPrisma = async (userId: string, newRole: Role): Promise<void> => {
  try {
    const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
    if (userToUpdate && userToUpdate.email === SUPER_ADMIN_EMAIL) {
      console.warn("Attempted to change the role of the super admin. This action is not allowed.");
      throw new Error("Cannot change the role of the super admin.");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole, updatedAt: new Date() },
    });
  } catch (error) {
    console.error(`Error updating role for user ${userId} in Prisma:`, error);
    throw error;
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
        // TODO: Potentially re-verify user against DB if session is old
        return parsedState;
      }
    } catch (e) {
      console.error("Failed to parse auth state from localStorage", e);
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

export const loginUser = async (email: string, password_raw: string): Promise<User | null> => {
  const user = await getUserByEmailFromPrisma(email);
  // IMPORTANT: This is a simplified password check.
  // In a real app, hash passwords using bcrypt or similar.
  if (user && user.passwordHash === password_raw) {
    saveAuthState({ isAuthenticated: true, user, role: user.role });
    return user;
  }
  clearAuthState();
  return null;
};

export const registerUser = async (name: string, email: string, password_raw: string): Promise<User | null> => {
  const existingUser = await getUserByEmailFromPrisma(email);
  if (existingUser) {
    console.error("User already exists with this email.");
    return null;
  }

  // IMPORTANT: Hash password_raw before storing in a real app.
  const passwordHash = password_raw; // Placeholder for actual hashing

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'STUDENT',
      },
    });
    saveAuthState({ isAuthenticated: true, user: newUser, role: newUser.role });
    return newUser;
  } catch (error) {
    console.error("Error registering user in Prisma:", error);
    return null;
  }
};

export const logoutUser = () => {
  clearAuthState();
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await getUserByEmailFromPrisma(email);
};

// --- Seeding Function for Users ---
export const seedInitialUsersToPrisma = async (): Promise<{ successCount: number, errorCount: number, skippedCount: number }> => {
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const mockUser of mockUsersForSeeding) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: mockUser.email },
      });

      if (existingUser) {
        // Optionally update role if super admin exists but has wrong role
        if (mockUser.email === SUPER_ADMIN_EMAIL && existingUser.role !== 'ADMIN') {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: 'ADMIN' },
          });
          console.log(`Super admin ${mockUser.email} role updated to ADMIN.`);
        }
        skippedCount++;
        continue;
      }
      
      // IMPORTANT: Password hashing should be done here in a real app.
      // Using mockUser.passwordHash directly as it's already "hashed" (or plain in mock data)
      await prisma.user.create({
        data: {
          id: mockUser.id, // Use ID from mock data if you want to pre-define it
          name: mockUser.name,
          email: mockUser.email,
          passwordHash: mockUser.passwordHash,
          role: mockUser.role.toUpperCase() as Role, // Ensure role matches Prisma enum
        },
      });
      successCount++;
    } catch (e) {
      console.error(`Error seeding user ${mockUser.email}:`, e);
      errorCount++;
    }
  }
  return { successCount, errorCount, skippedCount };
};
