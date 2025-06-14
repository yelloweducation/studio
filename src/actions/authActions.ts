
'use server';
import { z } from 'zod';
import {
  findUserByEmail,
  updateUserRole,
  addUser,
  comparePassword,
  SUPER_ADMIN_EMAIL,
  getAllUsers,
  seedInitialUsersToDatabase,
} from '@/lib/authUtils';
import type { User as PrismaUserType, Role as PrismaRoleType } from '@prisma/client';

const LoginInputSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

const RegisterInputSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const UpdateRoleInputSchema = z.object({
  userId: z.string(),
  newRole: z.enum(['STUDENT', 'ADMIN']),
});


export const serverLoginUser = async (email_from_form_raw: string, password_from_form: string): Promise<PrismaUserType | null> => {
  const email_from_form = email_from_form_raw.toLowerCase();
  console.log(`[AuthActions-Prisma - serverLoginUser] Attempting login for email: ${email_from_form}`);

  const validation = LoginInputSchema.safeParse({ email: email_from_form, password: password_from_form });
  if (!validation.success) {
    console.error("[AuthActions-Prisma - serverLoginUser] Server-side login input validation failed:", validation.error.flatten().fieldErrors);
    return null;
  }

  const validatedEmail = validation.data.email;
  const validatedPassword = validation.data.password;

  const user = await findUserByEmail(validatedEmail);

  if (user) {
    console.log(`[AuthActions-Prisma - serverLoginUser] User found for ${validatedEmail}. ID: ${user.id}.`);

    const isMatch = await comparePassword(validatedPassword, user.passwordHash || '');

    console.log(`[AuthActions-Prisma - serverLoginUser] Final isMatch result for ${validatedEmail}: ${isMatch}`);

    if (isMatch) {
      console.log(`[AuthActions-Prisma - serverLoginUser] Password match for user ID: ${user.id}. Login successful.`);
      // @ts-ignore
      const { passwordHash, ...userWithoutPasswordHash } = user;
      return userWithoutPasswordHash as PrismaUserType;
    } else {
      console.log(`[AuthActions-Prisma - serverLoginUser] Password mismatch for user ID: ${user.id}.`);
    }
  } else {
    console.log(`[AuthActions-Prisma - serverLoginUser] User not found for email: ${validatedEmail}.`);
  }
  return null;
};

export const serverRegisterUser = async (name: string, email_raw: string, password_param: string): Promise<PrismaUserType | null> => {
  const email = email_raw.toLowerCase();
  console.log(`[AuthActions-Prisma - serverRegisterUser] Attempting registration for email: ${email}, name: ${name}`);
  const validation = RegisterInputSchema.safeParse({ name, email, password: password_param });
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[AuthActions-Prisma - serverRegisterUser] Server-side registration input validation failed:", validation.error.flatten().fieldErrors);
    // Throwing an error here will be caught by the client and can be displayed.
    throw new Error(errorMessages || "Invalid registration data. Please check your inputs.");
  }

  try {
    const newUser = await addUser({
      name: validation.data.name,
      email: validation.data.email,
      role: validation.data.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'STUDENT',
      bio: null,
      avatarUrl: null,
      preferences: null,
      lastLogin: new Date(),
      isActive: true,
    }, validation.data.password);

    console.log(`[AuthActions-Prisma - serverRegisterUser] Registration successful for: ${newUser.email}, ID: ${newUser.id}.`);
    // @ts-ignore
    const { passwordHash, ...userWithoutPasswordHash } = newUser;
    return userWithoutPasswordHash as PrismaUserType;
  } catch (error: any) { // Catch 'any' to inspect it better
    console.error("[AuthActions-Prisma - serverRegisterUser] CAUGHT ERROR during user registration process. Error type:", typeof error);
    if (error instanceof Error) {
        console.error("[AuthActions-Prisma - serverRegisterUser] Error Name:", error.name);
        console.error("[AuthActions-Prisma - serverRegisterUser] Error Message:", error.message);
        console.error("[AuthActions-Prisma - serverRegisterUser] Error Stack:", error.stack);
        // Re-throw specific known errors to be caught by the client
        if (error.message === "UserAlreadyExists") {
            throw new Error("UserAlreadyExists"); // Re-throw with a specific message client can check
        }
         // For other errors, throw the original message if safe
        throw new Error(error.message || "UserCreationFailure");
    } else {
        // If it's not an Error instance, log it and throw a generic message
        console.error("[AuthActions-Prisma - serverRegisterUser] Non-Error object thrown:", error);
        throw new Error("UserCreationFailure: An unexpected issue occurred.");
    }
  }
};


export async function getAllUsersServerAction(): Promise<Omit<PrismaUserType, 'passwordHash'>[]> {
  console.log("[AuthActions-Prisma - getAllUsersServerAction] Fetching all users from DB.");
  return await getAllUsers();
}

export async function updateUserRoleServerAction(userId: string, newRole: PrismaRoleType): Promise<Omit<PrismaUserType, 'passwordHash'> | null> {
  console.log(`[AuthActions-Prisma - updateUserRoleServerAction] Attempting to update role for user ID: ${userId} to ${newRole}`);
  const validation = UpdateRoleInputSchema.safeParse({ userId, newRole });
  if (!validation.success) {
    console.error("[AuthActions-Prisma - updateUserRoleServerAction] Server-side role update input validation failed:", validation.error.flatten().fieldErrors);
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    throw new Error(errorMessages || "Invalid role update data.");
  }

  if (!['STUDENT', 'ADMIN'].includes(newRole)) {
      console.error("[AuthActions-Prisma - updateUserRoleServerAction] Invalid role specified for update:", newRole);
      throw new Error("InvalidRole");
  }
  try {
    return await updateUserRole(validation.data.userId, validation.data.newRole as 'STUDENT' | 'ADMIN');
  } catch (error: any) {
    console.error(`[AuthActions-Prisma - updateUserRoleServerAction] Error updating role for user ${userId}:`, error.message);
    throw error;
  }
}

export async function serverSeedInitialUsers(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> {
  console.log("[AuthActions-Prisma - serverSeedInitialUsers] Seeding initial users to database via authUtils.");
  return seedInitialUsersToDatabase();
}
    
