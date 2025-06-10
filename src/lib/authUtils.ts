
import type { User } from '@/data/mockData';
import { users as initialMockUsers } from '@/data/mockData';
import { db } from './firebase'; // Import Firestore instance
import { collection, query, where, getDocs, addDoc, doc, setDoc, updateDoc } from 'firebase/firestore';

const AUTH_STORAGE_KEY = 'luminaLearnAuth';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: 'student' | 'admin' | null;
}

// Helper to fetch a user by email from Firestore
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

// Helper to fetch a user by ID from Firestore
const getUserByIdFromFirestore = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    // Correct way to get a document by ID if you have the ID:
    const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
     if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
    }
  } catch (error) {
    console.error("Error fetching user by ID from Firestore:", error);
  }
  return null;
};

// Function to get all users from Firestore
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

// Function to update a user's role in Firestore
export const updateUserRoleInFirestore = async (userId: string, newRole: 'admin' | 'student'): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      role: newRole
    });
  } catch (error) {
    console.error(`Error updating role for user ${userId} in Firestore:`, error);
    throw error; // Re-throw to be caught by the calling component
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
      // Re-verify user existence and role if using Firestore as the source of truth
      // For this example, we'll trust the stored user object if it exists.
      // A robust solution would involve checking against Firebase Auth's current user
      // and fetching fresh role data from Firestore upon app load.
      if (parsedState.isAuthenticated && parsedState.user) {
        // Attempt to use the user data directly from the auth token for role resilience
        // if the main user list (previously from localStorage, now Firestore) might be out of sync.
        // This is a heuristic for the described Netlify logout issue.
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

  if (user && user.passwordHash === password_raw) {
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

  const newUserOmitId: Omit<User, 'id'> = {
    name,
    email,
    role: 'student',
    passwordHash: password_raw,
  };

  try {
    const usersCol = collection(db, 'users');
    const docRef = await addDoc(usersCol, newUserOmitId);
    const createdUser: User = { id: docRef.id, ...newUserOmitId };
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

export const seedInitialUsers = async () => {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  if (snapshot.empty) {
    console.log("Users collection is empty. Seeding initial mock users to Firestore...");
    for (const user of initialMockUsers) {
      const existing = await getUserByEmailFromFirestore(user.email);
      if (!existing) {
        try {
          const userRef = doc(db, 'users', user.id);
          await setDoc(userRef, {
            name: user.name,
            email: user.email,
            role: user.role,
            passwordHash: user.passwordHash
          });
        } catch (error) {
          console.error("Error seeding user:", user.email, error);
        }
      }
    }
    console.log("Initial user seeding complete (if any were missing).");
  } else {
    // console.log("Users collection already contains data. No seeding needed.");
  }
};

// Ensure initial users are seeded (call this cautiously, e.g., on app init or manually)
// Removed automatic call from here to avoid multiple executions.
// Call this from a higher-level component or setup script if needed.
// seedInitialUsers();
