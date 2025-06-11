
'use server';
import { z } from 'zod';
import {
  findUserByEmailFromMock,
  updateUserRoleInMock,
  addUserToMock,
  comparePassword,
  SUPER_ADMIN_EMAIL,
  getAllUsersFromMock as getAllUsersFromMockUtil // Renamed import
} from '@/lib/authUtils';
import type { User as MockUserType, Role as PrismaRoleType } from '@/lib/authUtils'; // Using authUtils as source for types too

// Define Zod schemas for input validation
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
  newRole: z.enum(['STUDENT', 'ADMIN']), // Make sure this aligns with PrismaRoleType
});


export const serverLoginUser = async (email: string, password: string): Promise<MockUserType | null> => {
  console.log(`[AuthActions - serverLoginUser] Attempting login for email: ${email}, password starts with: ${password.substring(0,3)}... (length: ${password.length})`);
  const validation = LoginInputSchema.safeParse({ email, password });
  if (!validation.success) {
    console.error("[AuthActions - serverLoginUser] Server-side login input validation failed:", validation.error.flatten().fieldErrors);
    return null;
  }

  const user = findUserByEmailFromMock(validation.data.email);

  if (user && user.passwordHash) {
    console.log(`[AuthActions - serverLoginUser] User found (ID: ${user.id}). Comparing password. Stored hash (prefix): ${user.passwordHash.substring(0,10)}...`);
    
    let isMatch = false;
    // !!! TEMPORARY DEBUGGING BYPASS !!!
    // This is highly insecure and should be removed once the root cause is found.
    if (validation.data.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && validation.data.password === 'superadminpass') {
      console.warn(`[AuthActions - serverLoginUser] !!! DEBUGGING BYPASS ACTIVATED for ${SUPER_ADMIN_EMAIL} !!! Password check skipped.`);
      isMatch = true;
    } else {
      console.log(`[AuthActions - serverLoginUser] Calling comparePassword with plain password (len: ${validation.data.password.length}) and stored hash (len: ${user.passwordHash.length})`);
      isMatch = await comparePassword(validation.data.password, user.passwordHash);
      console.log(`[AuthActions - serverLoginUser] comparePassword result: ${isMatch}`);
    }
    // !!! END TEMPORARY DEBUGGING BYPASS !!!

    if (isMatch) {
      console.log(`[AuthActions - serverLoginUser] Password match for user ID: ${user.id}. Login successful.`);
      // Omit passwordHash from the user object returned to the client
      const { passwordHash, ...userWithoutPasswordHash } = user;
      return userWithoutPasswordHash as MockUserType;
    } else {
      console.log(`[AuthActions - serverLoginUser] Password mismatch for user ID: ${user.id}.`);
    }
  } else {
    if (!user) {
      console.log(`[AuthActions - serverLoginUser] User not found for email: ${validation.data.email}.`);
    } else if (!user.passwordHash) {
      console.log(`[AuthActions - serverLoginUser] User found for email ${validation.data.email} but has no passwordHash! User ID: ${user.id}`);
    }
  }
  return null;
};

export const serverRegisterUser = async (name: string, email: string, password: string): Promise<MockUserType | null> => {
  console.log(`[AuthActions - serverRegisterUser] Attempting registration for email: ${email}, name: ${name}, password starts with: ${password.substring(0,3)}... (length: ${password.length})`);
  const validation = RegisterInputSchema.safeParse({ name, email, password });
  if (!validation.success) {
    console.error("[AuthActions - serverRegisterUser] Server-side registration input validation failed:", validation.error.flatten().fieldErrors);
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    throw new Error(errorMessages || "Invalid registration data. Please check your inputs.");
  }

  const existingUser = findUserByEmailFromMock(validation.data.email);
  if (existingUser) {
    console.error("[AuthActions - serverRegisterUser] User already exists with this email.");
    throw new Error("UserAlreadyExists");
  }

  try {
    const newUser = await addUserToMock({
      name: validation.data.name,
      email: validation.data.email,
      role: validation.data.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'STUDENT',
    }, validation.data.password); // Pass the plain password here

    console.log(`[AuthActions - serverRegisterUser] Registration successful for: ${newUser.email}, ID: ${newUser.id}. Hash stored (prefix): ${newUser.passwordHash.substring(0,10)}...`);
    // Omit passwordHash from the user object returned
    const { passwordHash, ...userWithoutPasswordHash } = newUser;
    return userWithoutPasswordHash as MockUserType;
  } catch (error) {
    console.error("[AuthActions - serverRegisterUser] Error during user registration process:", error);
    if (error instanceof Error && (error.message === "UserAlreadyExists")) { // Should be caught above, but good practice
        throw error;
    }
    throw new Error("UserCreationFailure");
  }
};


export async function getAllUsersServerAction(): Promise<MockUserType[]> {
  console.log("[AuthActions - getAllUsersServerAction] Fetching all users.");
  const users = getAllUsersFromMockUtil(); // Use the renamed util function
  // Ensure passwordHash is not sent to client from this action either
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

  if (!['STUDENT', 'ADMIN'].includes(newRole)) { // Redundant with Zod enum but good for clarity
      console.error("[AuthActions - updateUserRoleServerAction] Invalid role specified for update:", newRole);
      throw new Error("InvalidRole");
  }
  try {
    const updatedUser = updateUserRoleInMock(validation.data.userId, validation.data.newRole as 'student' | 'admin');
    if (updatedUser) {
      console.log(`[AuthActions - updateUserRoleServerAction] Role updated successfully for user ID: ${userId} to ${newRole}`);
      // Omit passwordHash
      const { passwordHash, ...userWithoutPasswordHash } = updatedUser;
      return userWithoutPasswordHash as MockUserType;
    } else {
      console.warn(`[AuthActions - updateUserRoleServerAction] User not found or update failed for user ID: ${userId}`);
      return null;
    }
  } catch (error: any) {
    console.error(`[AuthActions - updateUserRoleServerAction] Error updating role for user ${userId}:`, error.message);
    throw error; // Re-throw the original error to be handled by the caller
  }
}
