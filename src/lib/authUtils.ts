
import type { User as MockUserType } from '@/data/mockData'; // Keep for mock seeding type
import { mockUsersForSeeding } from '@/data/mockData';
import prisma from '@/lib/prisma'; // Import Prisma client
import type { User, Role } from '@prisma/client'; // Import Prisma generated types

const AUTH_STORAGE_KEY = 'luminaLearnAuth_prisma';
export const SUPER_ADMIN_EMAIL = 'admin@example.com';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: Role | null;
}

// --- Client-side localStorage utilities ---
export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, role: null };
  }
  const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState) as AuthState;
      // Basic check, could be more robust (e.g., token expiry if using tokens)
      if (parsedState.isAuthenticated && parsedState.user) {
        return parsedState;
      }
    } catch (e) {
      console.error("Failed to parse auth state from localStorage", e);
      // Fall through to clear state
    }
  }
  clearAuthState(); // Ensure invalid state is cleared
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
// --- End Client-side localStorage utilities ---


// --- Server-side Prisma utilities (called by Server Actions or other server code) ---
// getUserByEmailFromPrisma is now internal to authActions.ts or could be moved to a common dbUtils if needed by many server actions.

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

export const findUserByEmailFromPrisma = async (email: string): Promise<User | null> => {
   try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error("Error fetching user by email from Prisma:", error);
    return null;
  }
};
// --- End Server-side Prisma utilities ---


// --- Seeding Function for Users (Server-side) ---
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
      
      await prisma.user.create({
        data: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          passwordHash: mockUser.passwordHash, // Remember: HASH THIS IN PRODUCTION
          role: mockUser.role.toUpperCase() as Role,
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
// --- End Seeding Function ---

// Old loginUser and registerUser are removed as their core logic is now in authActions.ts
// logoutUser is a client-side concept of clearing state, so it's effectively clearAuthState
export const logoutUser = () => {
  clearAuthState();
};
