
'use server'; 
import { 
  findUserByEmailFromMock, 
  getAllUsersFromMock, 
  updateUserRoleInMock,
  addUserToMock, // New function to add user with hashed password
  comparePassword, // For comparing passwords
  hashPassword, // For hashing new passwords
  SUPER_ADMIN_EMAIL
} from '@/lib/authUtils';
import type { User as MockUserType } from '@/data/mockData';


export const serverLoginUser = async (email: string, password_raw: string): Promise<MockUserType | null> => {
  const user = findUserByEmailFromMock(email);

  if (user && user.passwordHash) {
    const isMatch = await comparePassword(password_raw, user.passwordHash);
    if (isMatch) {
      return user;
    }
  }
  return null;
};

export const serverRegisterUser = async (name: string, email: string, password_raw: string): Promise<MockUserType | null> => {
  const existingUser = findUserByEmailFromMock(email);
  if (existingUser) {
    console.error("User already exists with this email (serverRegisterUser).");
    throw new Error("UserAlreadyExists"); 
  }

  try {
    // addUserToMock will handle hashing
    const newUser = await addUserToMock({
      name,
      email,
      role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student',
    }, password_raw);
    
    console.log("Simulating user registration for:", newUser.email);
    return newUser;
  } catch (error) {
    console.error("Error during user registration process:", error);
    throw new Error("UserCreationFailure");
  }
};


export async function getAllUsersServerAction(): Promise<MockUserType[]> {
  return getAllUsersFromMock();
}

export async function updateUserRoleServerAction(userId: string, newRole: 'student' | 'admin'): Promise<MockUserType | null> {
  try {
    const updatedUser = updateUserRoleInMock(userId, newRole);
    return updatedUser;
  } catch (error: any) {
    console.error(`Error updating role for user ${userId} via Server Action (mock):`, error.message);
    throw error; 
  }
}

