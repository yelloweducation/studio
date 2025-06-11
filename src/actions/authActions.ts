
'use server'; // Still server actions, but they operate on mock/session data principles

import { 
  findUserByEmailFromMock, 
  getAllUsersFromMock, 
  updateUserRoleInMock,
  SUPER_ADMIN_EMAIL
} from '@/lib/authUtils';
import type { User as MockUserType } from '@/data/mockData'; // Use mock data type

// Server actions will now simulate database interaction using functions from authUtils
// which operate on mock data (potentially localStorage-backed for persistence in a session).

export const serverLoginUser = async (email: string, password_raw: string): Promise<MockUserType | null> => {
  // This would be a server-side call in a real app.
  // For mock, we simulate this check using data from authUtils.
  const user = findUserByEmailFromMock(email);

  if (user && user.passwordHash === password_raw) { // Simplified password check
    return user;
  }
  return null;
};

export const serverRegisterUser = async (name: string, email: string, password_raw: string): Promise<MockUserType | null> => {
  // This is also a simulated server-side action.
  // It will check against the mock user list.
  // In a real app, this would interact with a database.
  // For this reversion, actual user persistence (beyond session) is not implemented here.
  // We will rely on client-side AuthContext to save auth state.

  // This is a simplified registration for mock purposes.
  // It doesn't actually add to a persistent user list here but simulates the check.
  // The actual addition to a "managedUsers" list might happen client-side via localStorage
  // or be omitted for full reversion to only session-based auth.
  // For now, let's assume registration means it's a new user not in the current `mockUsers` set for the login check.
  // The `AuthContext` will handle saving the auth state after successful registration.
  
  // Let's refine this: if using localStorage for managedUsers, this server action
  // should ideally interact with that. Since server actions can't directly access localStorage,
  // this becomes tricky for a full reversion.
  // For now, let's make it a simple check.
  const existingUser = findUserByEmailFromMock(email);
  if (existingUser) {
    console.error("User already exists with this email (serverRegisterUser).");
    // If using specific error messages: throw new Error("UserAlreadyExists");
    return null;
  }

  // Simulate creating a new user object. This user object won't be persisted
  // here in a way that `findUserByEmailFromMock` would immediately find it
  // unless `findUserByEmailFromMock` also uses localStorage and this action updates it.
  // For simplicity, let's return a new user structure. AuthContext will store it.
  const newUser: MockUserType = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash: password_raw, // Store raw for mock. NOT FOR PRODUCTION.
    role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student',
  };
  
  // To make it slightly more consistent, if admin users are managed in localStorage via getAllUsersFromMock etc.
  // we could try to add this new user to that localStorage store if running in an environment where that's possible,
  // but server actions run server-side.
  // For now, this function simulates the creation and returns the user for AuthContext to handle.
  // TODO: Revisit how new users are added to the "managedUsers" list if that's stored in localStorage.
  // This might mean that UserManagement needs to handle adding new users to its localStorage store.

  console.log("Simulating user registration for:", newUser.email);
  // This won't actually save to a persistent store accessible by `findUserByEmailFromMock` immediately.
  // The client (`AuthContext`) will receive this user and store it in its own state/localStorage.
  return newUser;
};


export async function getAllUsersServerAction(): Promise<MockUserType[]> {
  // This will now use the mock data utility
  return getAllUsersFromMock();
}

export async function updateUserRoleServerAction(userId: string, newRole: 'student' | 'admin'): Promise<MockUserType | null> {
  // This will now use the mock data utility
  // Note: updateUserRoleInMock might throw if SUPER_ADMIN role is changed,
  // so the client-side caller (UserManagement.tsx) should handle this.
  try {
    const updatedUser = updateUserRoleInMock(userId, newRole);
    return updatedUser;
  } catch (error: any) {
    console.error(`Error updating role for user ${userId} via Server Action (mock):`, error.message);
    throw error; // Re-throw to be handled by the caller in UserManagement.tsx
  }
}
