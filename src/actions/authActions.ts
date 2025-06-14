
'use server';
import { z } from 'zod';
import {
  findUserByEmail,
  updateUserRole,
  addUser, // Re-use for admin add user, role is part of userData
  comparePassword,
  hashPassword, // For password changes
  SUPER_ADMIN_EMAIL,
  getAllUsers,
  seedInitialUsersToDatabase,
  updateUserProfileDb, // New DB util
  changeUserPasswordDb, // New DB util
  updateUserActiveStatusDb, // New DB util
} from '@/lib/authUtils';
import type { User as PrismaUserType, Role as PrismaRoleType } from '@prisma/client';
import { getAuthState } from '@/lib/authUtils'; // To get current user from server-side (not directly possible in actions, requires passing or alternative strategy for user ID)

// --- Schemas for Validation ---
const LoginInputSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

const RegisterInputSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const AdminAddUserInputSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(['STUDENT', 'ADMIN']),
});

const UpdateRoleInputSchema = z.object({
  userId: z.string(),
  newRole: z.enum(['STUDENT', 'ADMIN']),
});

const UpdateUserProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters.").optional().nullable(),
  avatarUrl: z.string().url("Invalid URL format for avatar.").optional().nullable(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

const AdminSetPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
});

// --- Standard Auth Actions ---
export const serverLoginUser = async (email_from_form_raw: string, password_from_form: string): Promise<PrismaUserType | null> => {
  const email_from_form = email_from_form_raw.toLowerCase();
  const validation = LoginInputSchema.safeParse({ email: email_from_form, password: password_from_form });
  if (!validation.success) {
    console.error("[AuthActions-Prisma - serverLoginUser] Server-side login input validation failed:", validation.error.flatten().fieldErrors);
    return null;
  }
  const validatedEmail = validation.data.email;
  const validatedPassword = validation.data.password;
  const user = await findUserByEmail(validatedEmail);
  if (user && user.passwordHash) {
    const isMatch = await comparePassword(validatedPassword, user.passwordHash);
    if (isMatch) {
      // @ts-ignore // Prisma types might not perfectly omit passwordHash in all scenarios
      const { passwordHash, ...userWithoutPasswordHash } = user;
      return userWithoutPasswordHash as PrismaUserType;
    }
  }
  return null;
};

export const serverRegisterUser = async (name: string, email_raw: string, password_param: string): Promise<PrismaUserType | null> => {
  const email = email_raw.toLowerCase();
  const validation = RegisterInputSchema.safeParse({ name, email, password: password_param });
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[AuthActions-Prisma - serverRegisterUser] Validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(errorMessages || "Invalid registration data.");
  }
  try {
    // Determine role: SUPER_ADMIN_EMAIL becomes ADMIN, others STUDENT
    const role: PrismaRoleType = validation.data.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'STUDENT';
    const newUser = await addUser({
      name: validation.data.name,
      email: validation.data.email,
      role: role,
      isActive: true, // New users are active by default
      // other fields like bio, avatarUrl can be null by default as per schema
    }, validation.data.password);
    // @ts-ignore
    const { passwordHash, ...userWithoutPasswordHash } = newUser;
    return userWithoutPasswordHash as PrismaUserType;
  } catch (error: any) {
    console.error("[AuthActions-Prisma - serverRegisterUser] CAUGHT ERROR:", error);
    if (error.message === "UserAlreadyExists") {
      throw new Error("UserAlreadyExists");
    }
    throw new Error(error.message || "UserCreationFailure");
  }
};

// --- User Settings Actions ---
export const serverUpdateUserProfile = async (
  userId: string, // userId must be passed securely, e.g. from session, not client input
  data: { name?: string; bio?: string | null; avatarUrl?: string | null }
): Promise<PrismaUserType | null> => {
  const validation = UpdateUserProfileSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[AuthActions-Prisma - serverUpdateUserProfile] Validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(errorMessages || "Invalid profile data.");
  }
  try {
    const updatedUser = await updateUserProfileDb(userId, validation.data);
    // @ts-ignore
    const { passwordHash, ...userWithoutPasswordHash } = updatedUser;
    return userWithoutPasswordHash as PrismaUserType;
  } catch (error: any) {
    console.error(`[AuthActions-Prisma - serverUpdateUserProfile] Error for user ${userId}:`, error);
    throw new Error(error.message || "ProfileUpdateFailure");
  }
};

export const serverChangeCurrentUserPassword = async (
  userId: string, // userId must be passed securely
  data: { currentPassword?: string; newPassword: string; confirmNewPassword: string }
): Promise<{ success: boolean; message: string }> => {
  const validation = ChangePasswordSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[AuthActions-Prisma - serverChangeCurrentUserPassword] Validation failed:", validation.error.flatten().fieldErrors);
    return { success: false, message: errorMessages || "Invalid password data." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) {
    return { success: false, message: "User not found or no password set." };
  }

  const isCurrentPasswordCorrect = await comparePassword(validation.data.currentPassword, user.passwordHash);
  if (!isCurrentPasswordCorrect) {
    return { success: false, message: "Incorrect current password." };
  }

  const newPasswordHash = await hashPassword(validation.data.newPassword);
  const success = await changeUserPasswordDb(userId, newPasswordHash);

  if (success) {
    return { success: true, message: "Password changed successfully." };
  } else {
    return { success: false, message: "Failed to change password." };
  }
};

// --- Admin User Management Actions ---
export async function getAllUsersServerAction(): Promise<Omit<PrismaUserType, 'passwordHash'>[]> {
  return await getAllUsers();
}

export async function serverAdminAddUser(
  data: { name: string; email: string; password: string; role: PrismaRoleType }
): Promise<PrismaUserType | null> {
  const validation = AdminAddUserInputSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[AuthActions-Prisma - serverAdminAddUser] Validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(errorMessages || "Invalid user data for admin creation.");
  }
  try {
    const newUser = await addUser({
      name: validation.data.name,
      email: validation.data.email.toLowerCase(),
      role: validation.data.role,
      isActive: true, // Default to active
    }, validation.data.password);
    // @ts-ignore
    const { passwordHash, ...userWithoutPasswordHash } = newUser;
    return userWithoutPasswordHash as PrismaUserType;
  } catch (error: any) {
    console.error("[AuthActions-Prisma - serverAdminAddUser] CAUGHT ERROR:", error);
    if (error.message === "UserAlreadyExists") {
      throw new Error("UserAlreadyExists");
    }
    throw new Error(error.message || "AdminUserCreationFailure");
  }
}

export async function serverAdminUpdateUserRole(userId: string, newRole: PrismaRoleType): Promise<Omit<PrismaUserType, 'passwordHash'> | null> {
  const validation = UpdateRoleInputSchema.safeParse({ userId, newRole });
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    throw new Error(errorMessages || "Invalid role update data.");
  }
  if (!['STUDENT', 'ADMIN'].includes(newRole)) {
      throw new Error("InvalidRole");
  }
  try {
    return await updateUserRole(validation.data.userId, validation.data.newRole as 'STUDENT' | 'ADMIN');
  } catch (error: any) {
    console.error(`[AuthActions-Prisma - serverAdminUpdateUserRole] Error for user ${userId}:`, error.message);
    throw error;
  }
}

export async function serverAdminUpdateUserStatus(userId: string, isActive: boolean): Promise<PrismaUserType | null> {
  try {
    const updatedUser = await updateUserActiveStatusDb(userId, isActive);
    // @ts-ignore
    const { passwordHash, ...userWithoutPasswordHash } = updatedUser;
    return userWithoutPasswordHash as PrismaUserType;
  } catch (error: any) {
    console.error(`[AuthActions-Prisma - serverAdminUpdateUserStatus] Error for user ${userId}:`, error.message);
    throw error;
  }
}

export async function serverAdminSetUserPassword(userId: string, newPasswordRaw: string): Promise<{ success: boolean; message: string }> {
  const validation = AdminSetPasswordSchema.safeParse({ userId, newPassword: newPasswordRaw });
   if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    return { success: false, message: errorMessages || "Invalid password data." };
  }

  const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
  if (userToUpdate && userToUpdate.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: "Cannot change password for the super admin account directly." };
  }

  try {
    const newPasswordHash = await hashPassword(validation.data.newPassword);
    const success = await changeUserPasswordDb(userId, newPasswordHash);
    if (success) {
      return { success: true, message: "User password updated successfully." };
    } else {
      return { success: false, message: "Failed to update user password." };
    }
  } catch (error: any) {
    console.error(`[AuthActions-Prisma - serverAdminSetUserPassword] Error for user ${userId}:`, error.message);
    return { success: false, message: error.message || "Failed to set user password." };
  }
}

// --- Seeding ---
export async function serverSeedInitialUsers(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> {
  return seedInitialUsersToDatabase();
}
