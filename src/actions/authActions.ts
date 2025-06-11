
'use server';

import prisma from '@/lib/prisma';
import type { User, Role } from '@prisma/client';
import { SUPER_ADMIN_EMAIL } from '@/lib/authUtils'; // Import for role assignment

// Helper to get user by email from Prisma (kept internal or could be from dbUtils if generic enough)
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

export const serverLoginUser = async (email: string, password_raw: string): Promise<User | null> => {
  const user = await getUserByEmailFromPrisma(email);
  // IMPORTANT: This is a simplified password check.
  // In a real app, hash passwords using bcrypt or similar and compare hashes.
  if (user && user.passwordHash === password_raw) {
    return user; // Return user data; AuthContext will handle localStorage
  }
  return null;
};

export const serverRegisterUser = async (name: string, email: string, password_raw: string): Promise<User | null> => {
  const existingUser = await getUserByEmailFromPrisma(email);
  if (existingUser) {
    console.error("User already exists with this email.");
    // Optionally, throw an error or return a specific error object
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
    return newUser; // Return user data; AuthContext will handle localStorage
  } catch (error) {
    console.error("Error registering user in Prisma:", error);
    // Optionally, throw an error or return a specific error object
    return null;
  }
};

// You can also move other Prisma-dependent auth utilities here if they are only called server-side
// For example, getAllUsersFromPrisma and updateUserRoleInPrisma could become server actions too
// if UserManagement directly calls them. For now, they can stay in authUtils if called by other server code.

export async function getAllUsersServerAction(): Promise<User[]> {
    try {
        return await prisma.user.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    } catch (error) {
        console.error("Error fetching all users from Prisma via Server Action:", error);
        return [];
    }
}

export async function updateUserRoleServerAction(userId: string, newRole: Role): Promise<User | null> {
    try {
        const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
        if (userToUpdate && userToUpdate.email === SUPER_ADMIN_EMAIL) {
            console.warn("Attempted to change the role of the super admin. This action is not allowed.");
            throw new Error("Cannot change the role of the super admin.");
        }

        return await prisma.user.update({
            where: { id: userId },
            data: { role: newRole, updatedAt: new Date() },
        });
    } catch (error) {
        console.error(`Error updating role for user ${userId} in Prisma via Server Action:`, error);
        throw error; // Rethrow to be handled by the caller
    }
}
