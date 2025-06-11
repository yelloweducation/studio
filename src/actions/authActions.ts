
'use server';
import { z } from 'zod';
import {
  findUserByEmailFromMock,
  updateUserRoleInMock,
  addUserToMock,
  comparePassword,
  SUPER_ADMIN_EMAIL
} from '@/lib/authUtils';
import type { User as MockUserType, Role as PrismaRoleType } from '@/lib/authUtils'; // Using dbUtils as the source of truth for shared types now

// Define Zod schemas for input validation
const LoginInputSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }), // Changed from password_raw
});

const RegisterInputSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }), // Changed from password_raw
});

const UpdateRoleInputSchema = z.object({
  userId: z.string(),
  newRole: z.enum(['STUDENT', 'ADMIN']),
});


export const serverLoginUser = async (email: string, password: string): Promise<MockUserType | null> => { // Changed param name from password_raw
  const validation = LoginInputSchema.safeParse({ email, password }); // Use 'password'
  if (!validation.success) {
    console.error("Server-side login input validation failed:", validation.error.flatten().fieldErrors);
    return null;
  }

  const user = findUserByEmailFromMock(validation.data.email);

  if (user && user.passwordHash) {
    const isMatch = await comparePassword(validation.data.password, user.passwordHash); // Use validation.data.password
    if (isMatch) {
      return user;
    }
  }
  return null;
};

export const serverRegisterUser = async (name: string, email: string, password: string): Promise<MockUserType | null> => { // Changed param name from password_raw
  const validation = RegisterInputSchema.safeParse({ name, email, password }); // Use 'password'
  if (!validation.success) {
    console.error("Server-side registration input validation failed:", validation.error.flatten().fieldErrors);
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
      role: validation.data.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'STUDENT',
    }, validation.data.password); // Pass validation.data.password for hashing

    console.log("Simulating user registration for:", newUser.email);
    return newUser;
  } catch (error) {
    console.error("Error during user registration process:", error);
    if (error instanceof Error && (error.message === "UserAlreadyExists")) {
        throw error;
    }
    throw new Error("UserCreationFailure");
  }
};


export async function getAllUsersServerAction(): Promise<MockUserType[]> {
  return getAllUsersFromMock(); // This function seems to be missing from authUtils export or definition based on previous error
}

export async function updateUserRoleServerAction(userId: string, newRole: PrismaRoleType): Promise<MockUserType | null> {
  const validation = UpdateRoleInputSchema.safeParse({ userId, newRole });
  if (!validation.success) {
    console.error("Server-side role update input validation failed:", validation.error.flatten().fieldErrors);
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join(' ');
    throw new Error(errorMessages || "Invalid role update data.");
  }

  if (!['STUDENT', 'ADMIN'].includes(newRole)) {
      console.error("Invalid role specified for update:", newRole);
      throw new Error("InvalidRole");
  }
  try {
    const updatedUser = updateUserRoleInMock(validation.data.userId, validation.data.newRole as 'student' | 'admin');
    return updatedUser;
  } catch (error: any) {
    console.error(`Error updating role for user ${userId} via Server Action (mock):`, error.message);
    throw error;
  }
}
