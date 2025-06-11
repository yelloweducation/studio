
import type { User } from '@/data/mockData';
import { mockUsersForSeeding } from '@/data/mockData';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, doc, setDoc, updateDoc, serverTimestamp, writeBatch, getDoc } from 'firebase/firestore';

const AUTH_STORAGE_KEY = 'luminaLearnAuth';
export const SUPER_ADMIN_EMAIL = 'admin@example.com'; // Define Super Admin Email

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: 'student' | 'admin' | null;
}

const getUserByEmailFromFirestore = async (email: string): Promise<User | null> => {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
  } catch (error) {
    console.error("Error fetching user by email from Firestore:", error);
  }
  return null;
};

export const getAllUsersFromFirestore = async (): Promise<User[]> => {
  try {
    const usersCol = collection(db, 'users');
    const querySnapshot = await getDocs(usersCol);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error("Error fetching all users from Firestore:", error);
    return [];
  }
};

export const updateUserRoleInFirestore = async (userId: string, newRole: 'admin' | 'student'): Promise<void> => {
  try {
    // Prevent changing the role of the super admin
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data().email === SUPER_ADMIN_EMAIL) {
        console.warn("Attempted to change the role of the super admin. This action is not allowed.");
        throw new Error("Cannot change the role of the super admin.");
    }

    await updateDoc(userDocRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating role for user ${userId} in Firestore:`, error);
    throw error;
  }
};

export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, role: null };
  }
  const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState) as AuthState;
      if (parsedState.isAuthenticated && parsedState.user) {
        return parsedState;
      }
    } catch (e) {
      console.error("Failed to parse auth state from localStorage", e);
      clearAuthState();
    }
  }
  return { isAuthenticated: false, user: null, role: null };
};

export const saveAuthState = (authState: AuthState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  }
};

export const clearAuthState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

export const loginUser = async (email: string, password_raw: string): Promise<User | null> => {
  const user = await getUserByEmailFromFirestore(email);
  if (user && user.passwordHash === password_raw) { // Simplified password check
    saveAuthState({ isAuthenticated: true, user, role: user.role });
    return user;
  }
  clearAuthState();
  return null;
};

export const registerUser = async (name: string, email: string, password_raw: string): Promise<User | null> => {
  const existingUser = await getUserByEmailFromFirestore(email);
  if (existingUser) {
    console.error("User already exists with this email.");
    return null;
  }

  const newUserOmitId: Omit<User, 'id' | 'createdAt'> = {
    name,
    email,
    // New users cannot register as super admin or admin directly
    role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student',
    passwordHash: password_raw, // Simplified password storage
  };

  try {
    const usersCol = collection(db, 'users');
    const fullUserData = {
      ...newUserOmitId,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(usersCol, fullUserData);
    const createdUser: User = { id: docRef.id, ...newUserOmitId, createdAt: new Date() };
    saveAuthState({ isAuthenticated: true, user: createdUser, role: createdUser.role });
    return createdUser;
  } catch (error) {
    console.error("Error registering user in Firestore:", error);
    return null;
  }
};

export const logoutUser = () => {
  clearAuthState();
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await getUserByEmailFromFirestore(email);
};

// --- Seeding Function for Users ---
export const seedInitialUsersToFirestore = async (): Promise<{ successCount: number, errorCount: number, skippedCount: number }> => {
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  const batch = writeBatch(db);

  for (const user of mockUsersForSeeding) {
    try {
      const existingUserByEmail = await getUserByEmailFromFirestore(user.email);
      if (existingUserByEmail) {
        skippedCount++;
        // Optionally, ensure the super admin has the 'admin' role if they already exist
        if (user.email === SUPER_ADMIN_EMAIL && existingUserByEmail.role !== 'admin') {
            const userRef = doc(db, 'users', existingUserByEmail.id);
            batch.update(userRef, { role: 'admin', updatedAt: serverTimestamp() });
            console.log(`Super admin ${user.email} role updated to admin.`);
        }
        continue;
      }
      
      // Use specific ID from mock data for the super admin if provided, otherwise Firestore generates ID
      const userRef = user.id ? doc(db, 'users', user.id) : doc(collection(db, 'users'));
      const docSnap = await getDoc(userRef); // Check if doc with this specific ID exists if ID was provided

      if (!docSnap.exists()) {
        const userData = { 
            name: user.name,
            email: user.email,
            role: user.role, // Role from mock data
            passwordHash: user.passwordHash,
            createdAt: serverTimestamp() 
        };
        batch.set(userRef, userData);
        successCount++;
      } else {
        skippedCount++; 
      }
    } catch (e) {
      console.error(`Error preparing to seed user ${user.email} (ID: ${user.id}):`, e);
      errorCount++;
    }
  }

  try {
    await batch.commit();
  } catch (e) {
    console.error("Error committing user seed batch:", e);
    errorCount += successCount; 
    successCount = 0;
  }
  return { successCount, errorCount, skippedCount };
};
