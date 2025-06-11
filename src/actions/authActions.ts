
'use server';
import { z } from 'zod';
import {
  findUserByEmailFromMock,
  getAllUsersFromMock,
  updateUserRoleInMock,
  addUserToMock,
  comparePassword,
  SUPER_ADMIN_EMAIL
} from '@/lib/authUtils';
import type { User as MockUserType, Role as PrismaRoleType } from '@/lib/dbUtils'; // Using dbUtils as the source of truth for shared types now

// Define Zod schemas for input validation
const LoginInputSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password_raw: z.string().min(1, { message: "Password cannot be empty." }),
});

const RegisterInputSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password_raw: z.string().min(6, { message: "Password must be at least 6 characters." }),
});


export const serverLoginUser = async (email: string, password_raw: string): Promise<MockUserType | null> => {
  const validation = LoginInputSchema.safeParse({ email, password_raw });
  if (!validation.success) {
    console.error("Server-side login input validation failed:", validation.error.flatten().fieldErrors);
    // Return null, which the client-side LoginForm interprets as "Invalid email or password."
    // This is consistent with other failure modes like password mismatch.
    return null;
  }

  const user = findUserByEmailFromMock(validation.data.email);

  if (user && user.passwordHash) {
    const isMatch = await comparePassword(validation.data.password_raw, user.passwordHash);
    if (isMatch) {
      return user;
    }
  }
  return null;
};

export const serverRegisterUser = async (name: string, email: string, password_raw: string): Promise<MockUserType | null> => {
  const validation = RegisterInputSchema.safeParse({ name, email, password_raw });
  if (!validation.success) {
    console.error("Server-side registration input validation failed:", validation.error.flatten().fieldErrors);
    // Construct a user-friendly error message from validation issues
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    throw new Error(errorMessages || "Invalid registration data. Please check your inputs.");
  }

  const existingUser = findUserByEmailFromMock(validation.data.email);
  if (existingUser) {
    console.error("User already exists with this email (serverRegisterUser).");
    throw new Error("UserAlreadyExists");
  }

  try {
    // addUserToMock will handle hashing
    const newUser = await addUserToMock({
      name: validation.data.name,
      email: validation.data.email,
      // Default role is 'student', super admin role is handled by seeding/specific checks
      role: validation.data.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'STUDENT',
    }, validation.data.password_raw);

    console.log("Simulating user registration for:", newUser.email);
    return newUser;
  } catch (error) {
    console.error("Error during user registration process:", error);
    // Re-throw specific errors if needed, or a generic one
    if (error instanceof Error && (error.message === "UserAlreadyExists")) {
        throw error;
    }
    throw new Error("UserCreationFailure");
  }
};


export async function getAllUsersServerAction(): Promise<MockUserType[]> {
  return getAllUsersFromMock();
}

export async function updateUserRoleServerAction(userId: string, newRole: PrismaRoleType): Promise<MockUserType | null> {
  // Basic validation for role
  if (!['STUDENT', 'ADMIN'].includes(newRole)) {
      console.error("Invalid role specified for update:", newRole);
      throw new Error("InvalidRole");
  }
  try {
    const updatedUser = updateUserRoleInMock(userId, newRole);
    return updatedUser;
  } catch (error: any) {
    console.error(`Error updating role for user ${userId} via Server Action (mock):`, error.message);
    throw error;
  }
}
