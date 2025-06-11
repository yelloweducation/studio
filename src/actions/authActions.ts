
'use server';
import { z } from 'zod';
import {
  findUserByEmailFromMock,
  updateUserRoleInMock,
  addUserToMock,
  comparePassword, // Will still be used for non-admin users
  hashPassword, // Import hashPassword for on-the-fly hashing of admin pass
  SUPER_ADMIN_EMAIL,
  getAllUsersFromMock as getAllUsersFromMockUtil
} from '@/lib/authUtils';
import type { User as MockUserType, Role as PrismaRoleType } from '@/lib/authUtils';

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


export const serverLoginUser = async (email: string, password_from_form: string): Promise<MockUserType | null> => {
  console.log(`[AuthActions - serverLoginUser] Attempting login for email: ${email}, password_from_form (prefix): ${password_from_form.substring(0,3)}... (length: ${password_from_form.length})`);
  const validation = LoginInputSchema.safeParse({ email, password: password_from_form });
  if (!validation.success) {
    console.error("[AuthActions - serverLoginUser] Server-side login input validation failed:", validation.error.flatten().fieldErrors);
    return null;
  }

  const validatedEmail = validation.data.email;
  const validatedPassword = validation.data.password;

  const user = findUserByEmailFromMock(validatedEmail);

  if (user) {
    console.log(`[AuthActions - serverLoginUser] User found for ${validatedEmail}. ID: ${user.id}. Stored hash (prefix): ${user.passwordHash?.substring(0,10)}...`);
    
    let isMatch = false;

    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      console.warn(`[AuthActions - serverLoginUser] ADMIN LOGIN ATTEMPT for ${SUPER_ADMIN_EMAIL}.`);
      if (validatedPassword === 'superadminpass') {
        // For admin, re-hash "superadminpass" on the fly and compare with the stored hash.
        // This helps diagnose if the stored hash is the issue.
        console.log(`[AuthActions - serverLoginUser] Admin trying to login with 'superadminpass'. Will re-hash and compare.`);
        const freshlyHashedSuperAdminPassword = await hashPassword('superadminpass');
        console.log(`[AuthActions - serverLoginUser] Freshly hashed 'superadminpass' (prefix): ${freshlyHashedSuperAdminPassword.substring(0,10)}...`);
        console.log(`[AuthActions - serverLoginUser] Stored hash for admin (prefix): ${user.passwordHash?.substring(0,10)}...`);
        
        if (user.passwordHash === freshlyHashedSuperAdminPassword) {
            console.log("[AuthActions - serverLoginUser] DIAGNOSTIC: Freshly hashed 'superadminpass' MATCHES the stored hash for admin.");
            isMatch = true;
        } else {
            console.error("[AuthActions - serverLoginUser] DIAGNOSTIC: Freshly hashed 'superadminpass' DOES NOT MATCH the stored hash for admin. This indicates an issue with how the admin's hash was stored or retrieved during seeding.");
            // Fallback: try direct bcrypt compare with the provided password and stored hash anyway, for completeness of logging.
            isMatch = await comparePassword(validatedPassword, user.passwordHash || '');
            console.log(`[AuthActions - serverLoginUser] bcrypt.compare result for admin with validatedPassword and storedHash: ${isMatch}`);
            if(!isMatch) {
              console.error(`[AuthActions - serverLoginUser] bcrypt.compare also failed. This is very odd if the above diagnostic said hashes don't match.`)
            }
        }
      } else {
        // Admin is logging in with a password other than "superadminpass"
        console.log(`[AuthActions - serverLoginUser] Admin attempting login with a password other than 'superadminpass'. Proceeding with normal bcrypt.compare.`);
        isMatch = await comparePassword(validatedPassword, user.passwordHash || '');
      }
    } else {
      // Non-admin user
      console.log(`[AuthActions - serverLoginUser] Non-admin user. Proceeding with normal bcrypt.compare.`);
      isMatch = await comparePassword(validatedPassword, user.passwordHash || '');
    }
    
    console.log(`[AuthActions - serverLoginUser] Final isMatch result for ${validatedEmail}: ${isMatch}`);

    if (isMatch) {
      console.log(`[AuthActions - serverLoginUser] Password match for user ID: ${user.id}. Login successful.`);
      const { passwordHash, ...userWithoutPasswordHash } = user;
      return userWithoutPasswordHash as MockUserType;
    } else {
      console.log(`[AuthActions - serverLoginUser] Password mismatch for user ID: ${user.id}.`);
    }
  } else {
    console.log(`[AuthActions - serverLoginUser] User not found for email: ${validatedEmail}.`);
  }
  return null;
};

export const serverRegisterUser = async (name: string, email: string, password_param: string): Promise<MockUserType | null> => {
  console.log(`[AuthActions - serverRegisterUser] Attempting registration for email: ${email}, name: ${name}, password_param (prefix): ${password_param.substring(0,3)}... (length: ${password_param.length})`);
  const validation = RegisterInputSchema.safeParse({ name, email, password: password_param });
  if (!validation.success) {
    console.error("[AuthActions - serverRegisterUser] Server-side registration input validation failed:", validation.error.flatten().fieldErrors);
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    throw new Error(errorMessages || "Invalid registration data. Please check your inputs.");
  }

  const existingUser = findUserByEmailFromMock(validation.data.email);
  if (existingUser) {
    console.error(`[AuthActions - serverRegisterUser] User already exists with email: ${validation.data.email}.`);
    throw new Error("UserAlreadyExists");
  }

  try {
    const newUser = await addUserToMock({
      name: validation.data.name,
      email: validation.data.email,
      role: validation.data.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'STUDENT',
    }, validation.data.password); 

    console.log(`[AuthActions - serverRegisterUser] Registration successful for: ${newUser.email}, ID: ${newUser.id}. Hash stored (prefix): ${newUser.passwordHash.substring(0,10)}...`);
    const { passwordHash, ...userWithoutPasswordHash } = newUser;
    return userWithoutPasswordHash as MockUserType;
  } catch (error) {
    console.error("[AuthActions - serverRegisterUser] Error during user registration process:", error);
    if (error instanceof Error && (error.message === "UserAlreadyExists")) {
        throw error;
    }
    throw new Error("UserCreationFailure");
  }
};


export async function getAllUsersServerAction(): Promise<MockUserType[]> {
  console.log("[AuthActions - getAllUsersServerAction] Fetching all users.");
  const users = getAllUsersFromMockUtil();
  return users.map(user => {
    const { passwordHash, ...userWithoutPasswordHash } = user;
    return userWithoutPasswordHash as MockUserType;
  });
}

export async function updateUserRoleServerAction(userId: string, newRole: PrismaRoleType): Promise<MockUserType | null> {
  console.log(`[AuthActions - updateUserRoleServerAction] Attempting to update role for user ID: ${userId} to ${newRole}`);
  const validation = UpdateRoleInputSchema.safeParse({ userId, newRole });
  if (!validation.success) {
    console.error("[AuthActions - updateUserRoleServerAction] Server-side role update input validation failed:", validation.error.flatten().fieldErrors);
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    throw new Error(errorMessages || "Invalid role update data.");
  }

  if (!['STUDENT', 'ADMIN'].includes(newRole)) { 
      console.error("[AuthActions - updateUserRoleServerAction] Invalid role specified for update:", newRole);
      throw new Error("InvalidRole");
  }
  try {
    const updatedUser = updateUserRoleInMock(validation.data.userId, validation.data.newRole as 'student' | 'admin');
    if (updatedUser) {
      console.log(`[AuthActions - updateUserRoleServerAction] Role updated successfully for user ID: ${userId} to ${newRole}`);
      const { passwordHash, ...userWithoutPasswordHash } = updatedUser;
      return userWithoutPasswordHash as MockUserType;
    } else {
      console.warn(`[AuthActions - updateUserRoleServerAction] User not found or update failed for user ID: ${userId}`);
      return null;
    }
  } catch (error: any) {
    console.error(`[AuthActions - updateUserRoleServerAction] Error updating role for user ${userId}:`, error.message);
    throw error;
  }
}
