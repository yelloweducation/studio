
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
import prisma from '@/lib/prisma'; // Import prisma for direct user check in change password

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
  userId: string,
  data: { name?: string; bio?: string | null; avatarUrl?: string | null }
): Promise<PrismaUserType | null> => {
  console.log('============================================================');
  console.log(`[ServerAction serverUpdateUserProfile] ACTION CALLED for userId: ${userId}. Received data:`, JSON.stringify(data, null, 2));
  const validation = UpdateUserProfileSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[ServerAction serverUpdateUserProfile] Validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(errorMessages || "Invalid profile data.");
  }
  try {
    const updatedUser = await updateUserProfileDb(userId, validation.data);
    // @ts-ignore
    const { passwordHash, ...userWithoutPasswordHash } = updatedUser;
    console.log('[ServerAction serverUpdateUserProfile] Profile update successful for userId:', userId);
    console.log('============================================================');
    return userWithoutPasswordHash as PrismaUserType;
  } catch (error: any) {
    console.error('============================================================');
    console.error(`[ServerAction serverUpdateUserProfile] Error updating profile for user ${userId}. Full error details below.`);
    let detailedErrorMessage = "Failed to update profile.";
    if (error instanceof Error) {
        console.error('[ServerAction serverUpdateUserProfile] Error Name:', error.name);
        console.error('[ServerAction serverUpdateUserProfile] Error Message:', error.message);
        console.error('[ServerAction serverUpdateUserProfile] Error Stack:', error.stack);
        detailedErrorMessage = error.message;
    } else {
        console.error(`[ServerAction serverUpdateUserProfile] Non-Error object thrown for user ${userId}:`, error);
    }
    if (error.code) {
        console.error("[ServerAction serverUpdateUserProfile] Prisma Error Code (from caught error):", error.code);
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverUpdateUserProfile] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    if (error.clientVersion) { console.error("[ServerAction serverUpdateUserProfile] Prisma Client Version (from caught error):", error.clientVersion); }
    if (error.digest) { console.error("[ServerAction serverUpdateUserProfile] Error Digest:", error.digest); }
    console.error('============================================================');
    const newError = new Error(`ServerAction serverUpdateUserProfile failed: ${detailedErrorMessage}`);
    // @ts-ignore
    newError.digest = error.digest || error.code || `serverUpdateUserProfile-error-${Date.now()}`;
    throw newError;
  }
};

export const serverChangeCurrentUserPassword = async (
  userId: string,
  data: { currentPassword?: string; newPassword: string; confirmNewPassword: string }
): Promise<{ success: boolean; message: string }> => {
  console.log('============================================================');
  console.log(`[ServerAction serverChangeCurrentUserPassword] ACTION CALLED for userId: ${userId}.`);
  const validation = ChangePasswordSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[ServerAction serverChangeCurrentUserPassword] Validation failed:", validation.error.flatten().fieldErrors);
    return { success: false, message: errorMessages || "Invalid password data." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      console.error(`[ServerAction serverChangeCurrentUserPassword] User not found or no password hash for userId: ${userId}.`);
      return { success: false, message: "User not found or no password set." };
    }

    const isCurrentPasswordCorrect = await comparePassword(validation.data.currentPassword, user.passwordHash);
    if (!isCurrentPasswordCorrect) {
      console.warn(`[ServerAction serverChangeCurrentUserPassword] Incorrect current password for userId: ${userId}.`);
      return { success: false, message: "Incorrect current password." };
    }

    const newPasswordHash = await hashPassword(validation.data.newPassword);
    const passwordChanged = await changeUserPasswordDb(userId, newPasswordHash);

    if (passwordChanged) {
      console.log(`[ServerAction serverChangeCurrentUserPassword] Password changed successfully for userId: ${userId}.`);
      console.log('============================================================');
      return { success: true, message: "Password changed successfully." };
    } else {
      console.error(`[ServerAction serverChangeCurrentUserPassword] changeUserPasswordDb returned false for userId: ${userId}.`);
      console.log('============================================================');
      return { success: false, message: "Failed to change password in DB." };
    }
  } catch (error: any) {
    console.error('============================================================');
    console.error(`[ServerAction serverChangeCurrentUserPassword] Error changing password for user ${userId}. Full error details below.`);
    let detailedErrorMessage = "Failed to change password.";
    if (error instanceof Error) {
        console.error('[ServerAction serverChangeCurrentUserPassword] Error Name:', error.name);
        console.error('[ServerAction serverChangeCurrentUserPassword] Error Message:', error.message);
        console.error('[ServerAction serverChangeCurrentUserPassword] Error Stack:', error.stack);
        detailedErrorMessage = error.message;
    } else {
        console.error(`[ServerAction serverChangeCurrentUserPassword] Non-Error object thrown for user ${userId}:`, error);
    }
    if (error.code) {
        console.error("[ServerAction serverChangeCurrentUserPassword] Prisma Error Code (from caught error):", error.code);
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverChangeCurrentUserPassword] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    if (error.clientVersion) { console.error("[ServerAction serverChangeCurrentUserPassword] Prisma Client Version (from caught error):", error.clientVersion); }
    if (error.digest) { console.error("[ServerAction serverChangeCurrentUserPassword] Error Digest:", error.digest); }
    console.error('============================================================');
    // For this action, we return a structured response, not throw, so client can display specific message.
    return { success: false, message: detailedErrorMessage };
  }
};


// --- Admin User Management Actions ---
export async function getAllUsersServerAction(): Promise<Omit<PrismaUserType, 'passwordHash'>[]> {
  return await getAllUsers();
}

export async function serverAdminAddUser(
  data: { name: string; email: string; password: string; role: PrismaRoleType }
): Promise<PrismaUserType | null> {
  console.log('============================================================');
  console.log(`[ServerAction serverAdminAddUser] ACTION CALLED. Received data:`, JSON.stringify(data, null, 2));
  const validation = AdminAddUserInputSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[ServerAction serverAdminAddUser] Validation failed:", validation.error.flatten().fieldErrors);
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
    console.log('[ServerAction serverAdminAddUser] User added successfully by admin. UserID:', newUser.id);
    console.log('============================================================');
    return userWithoutPasswordHash as PrismaUserType;
  } catch (error: any) {
    console.error('============================================================');
    console.error(`[ServerAction serverAdminAddUser] Error adding user by admin. Full error details below.`);
    let detailedErrorMessage = "Admin user creation failure.";
    if (error instanceof Error) {
        console.error('[ServerAction serverAdminAddUser] Error Name:', error.name);
        console.error('[ServerAction serverAdminAddUser] Error Message:', error.message);
        console.error('[ServerAction serverAdminAddUser] Error Stack:', error.stack);
        detailedErrorMessage = error.message === "UserAlreadyExists" ? "UserAlreadyExists" : error.message;
    } else {
        console.error(`[ServerAction serverAdminAddUser] Non-Error object thrown:`, error);
    }
    if (error.code) {
        console.error("[ServerAction serverAdminAddUser] Prisma Error Code (from caught error):", error.code);
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverAdminAddUser] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    if (error.clientVersion) { console.error("[ServerAction serverAdminAddUser] Prisma Client Version (from caught error):", error.clientVersion); }
    if (error.digest) { console.error("[ServerAction serverAdminAddUser] Error Digest:", error.digest); }
    console.error('============================================================');
    const newError = new Error(`ServerAction serverAdminAddUser failed: ${detailedErrorMessage}`);
    // @ts-ignore
    newError.digest = error.digest || error.code || `serverAdminAddUser-error-${Date.now()}`;
    throw newError;
  }
}

export async function serverAdminUpdateUserRole(userId: string, newRole: PrismaRoleType): Promise<Omit<PrismaUserType, 'passwordHash'> | null> {
  console.log('============================================================');
  console.log(`[ServerAction serverAdminUpdateUserRole] ACTION CALLED for userId: ${userId}, newRole: ${newRole}.`);
  const validation = UpdateRoleInputSchema.safeParse({ userId, newRole });
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[ServerAction serverAdminUpdateUserRole] Validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(errorMessages || "Invalid role update data.");
  }
  if (!['STUDENT', 'ADMIN'].includes(newRole)) {
      console.error("[ServerAction serverAdminUpdateUserRole] Invalid role provided:", newRole);
      throw new Error("InvalidRole");
  }
  try {
    const updatedUser = await updateUserRole(validation.data.userId, validation.data.newRole as 'STUDENT' | 'ADMIN');
    console.log(`[ServerAction serverAdminUpdateUserRole] Role updated successfully for userId: ${userId}.`);
    console.log('============================================================');
    return updatedUser;
  } catch (error: any) {
    console.error('============================================================');
    console.error(`[ServerAction serverAdminUpdateUserRole] Error updating role for user ${userId}. Full error details below.`);
    let detailedErrorMessage = "Failed to update user role.";
     if (error instanceof Error) {
        console.error('[ServerAction serverAdminUpdateUserRole] Error Name:', error.name);
        console.error('[ServerAction serverAdminUpdateUserRole] Error Message:', error.message);
        console.error('[ServerAction serverAdminUpdateUserRole] Error Stack:', error.stack);
        detailedErrorMessage = error.message;
    } else {
        console.error(`[ServerAction serverAdminUpdateUserRole] Non-Error object thrown for user ${userId}:`, error);
    }
    if (error.code) {
        console.error("[ServerAction serverAdminUpdateUserRole] Prisma Error Code (from caught error):", error.code);
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverAdminUpdateUserRole] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    console.error('============================================================');
    const newError = new Error(`ServerAction serverAdminUpdateUserRole failed: ${detailedErrorMessage}`);
    // @ts-ignore
    newError.digest = error.digest || error.code || `serverAdminUpdateUserRole-error-${Date.now()}`;
    throw newError;
  }
}

export async function serverAdminUpdateUserStatus(userId: string, isActive: boolean): Promise<PrismaUserType | null> {
  console.log('============================================================');
  console.log(`[ServerAction serverAdminUpdateUserStatus] ACTION CALLED for userId: ${userId}, isActive: ${isActive}.`);
  try {
    const updatedUser = await updateUserActiveStatusDb(userId, isActive);
    // @ts-ignore
    const { passwordHash, ...userWithoutPasswordHash } = updatedUser;
    console.log(`[ServerAction serverAdminUpdateUserStatus] Status updated successfully for userId: ${userId}.`);
    console.log('============================================================');
    return userWithoutPasswordHash as PrismaUserType;
  } catch (error: any) {
    console.error('============================================================');
    console.error(`[ServerAction serverAdminUpdateUserStatus] Error updating status for user ${userId}. Full error details below.`);
    let detailedErrorMessage = "Failed to update user status.";
     if (error instanceof Error) {
        console.error('[ServerAction serverAdminUpdateUserStatus] Error Name:', error.name);
        console.error('[ServerAction serverAdminUpdateUserStatus] Error Message:', error.message);
        console.error('[ServerAction serverAdminUpdateUserStatus] Error Stack:', error.stack);
        detailedErrorMessage = error.message;
    } else {
        console.error(`[ServerAction serverAdminUpdateUserStatus] Non-Error object thrown for user ${userId}:`, error);
    }
    if (error.code) {
        console.error("[ServerAction serverAdminUpdateUserStatus] Prisma Error Code (from caught error):", error.code);
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverAdminUpdateUserStatus] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    console.error('============================================================');
    const newError = new Error(`ServerAction serverAdminUpdateUserStatus failed: ${detailedErrorMessage}`);
    // @ts-ignore
    newError.digest = error.digest || error.code || `serverAdminUpdateUserStatus-error-${Date.now()}`;
    throw newError;
  }
}

export async function serverAdminSetUserPassword(userId: string, newPasswordRaw: string): Promise<{ success: boolean; message: string }> {
  console.log('============================================================');
  console.log(`[ServerAction serverAdminSetUserPassword] ACTION CALLED for userId: ${userId}.`);
  const validation = AdminSetPasswordSchema.safeParse({ userId, newPassword: newPasswordRaw });
   if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    console.error("[ServerAction serverAdminSetUserPassword] Validation failed:", validation.error.flatten().fieldErrors);
    return { success: false, message: errorMessages || "Invalid password data." };
  }

  try {
    const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
    if (userToUpdate && userToUpdate.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      console.warn(`[ServerAction serverAdminSetUserPassword] Attempt to change password for super admin userId: ${userId}. Denied.`);
      return { success: false, message: "Cannot change password for the super admin account directly." };
    }

    const newPasswordHash = await hashPassword(validation.data.newPassword);
    const success = await changeUserPasswordDb(userId, newPasswordHash);
    if (success) {
      console.log(`[ServerAction serverAdminSetUserPassword] Password set successfully for userId: ${userId}.`);
      console.log('============================================================');
      return { success: true, message: "User password updated successfully." };
    } else {
      console.error(`[ServerAction serverAdminSetUserPassword] changeUserPasswordDb returned false for userId: ${userId}.`);
      console.log('============================================================');
      return { success: false, message: "Failed to update user password in DB." };
    }
  } catch (error: any) {
    console.error('============================================================');
    console.error(`[ServerAction serverAdminSetUserPassword] Error setting password for user ${userId}. Full error details below.`);
    let detailedErrorMessage = "Failed to set user password.";
    if (error instanceof Error) {
        console.error('[ServerAction serverAdminSetUserPassword] Error Name:', error.name);
        console.error('[ServerAction serverAdminSetUserPassword] Error Message:', error.message);
        console.error('[ServerAction serverAdminSetUserPassword] Error Stack:', error.stack);
        detailedErrorMessage = error.message;
    } else {
        console.error(`[ServerAction serverAdminSetUserPassword] Non-Error object thrown for user ${userId}:`, error);
    }
     if (error.code) {
        console.error("[ServerAction serverAdminSetUserPassword] Prisma Error Code (from caught error):", error.code);
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverAdminSetUserPassword] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    console.error('============================================================');
    return { success: false, message: detailedErrorMessage };
  }
}

// --- Seeding ---
export async function serverSeedInitialUsers(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> {
  return seedInitialUsersToDatabase();
}


    