
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
    console.error("[AuthActions-Prisma - serverRegisterUser] Server-side registration input validation failed:", validation.error.flatten().fieldErrors);
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    throw new Error(errorMessages || "Invalid registration data. Please check your inputs.");
  }

  try {
    // addUser now interacts with Prisma (via authUtils) and will throw if user exists
    const newUser = await addUser({ 
      name: validation.data.name,
      email: validation.data.email,
      role: validation.data.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'STUDENT',
      // Add other PrismaUserType fields if needed with default values
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
  } catch (error) {
    console.error("[AuthActions-Prisma - serverRegisterUser] Error during user registration process:", error);
    if (error instanceof Error && (error.message === "UserAlreadyExists")) {
        throw error; 
    }
    throw new Error("UserCreationFailure"); 
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

    
