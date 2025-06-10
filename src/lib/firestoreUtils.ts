
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { Category, Course, Video, LearningPath, PaymentSettings, PaymentSubmission } from '@/data/mockData';

// --- Category Functions ---

export const getCategoriesFromFirestore = async (): Promise<Category[]> => {
  try {
    const categoriesCol = collection(db, 'categories');
    const q = query(categoriesCol, orderBy('name')); // Optional: order by name
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    console.error("Error fetching categories from Firestore:", error);
    return [];
  }
};

export const addCategoryToFirestore = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
  try {
    const categoriesCol = collection(db, 'categories');
    const docRef = await addDoc(categoriesCol, {
      ...categoryData,
      createdAt: serverTimestamp(), // Optional: add a timestamp
    });
    return { id: docRef.id, ...categoryData };
  } catch (error) {
    console.error("Error adding category to Firestore:", error);
    throw error;
  }
};

export const updateCategoryInFirestore = async (categoryId: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<void> => {
  try {
    const categoryDocRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryDocRef, {
        ...categoryData,
        updatedAt: serverTimestamp(), // Optional: add a timestamp
    });
  } catch (error) {
    console.error(`Error updating category ${categoryId} in Firestore:`, error);
    throw error;
  }
};

export const deleteCategoryFromFirestore = async (categoryId: string): Promise<void> => {
  try {
    const categoryDocRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryDocRef);
  } catch (error) {
    console.error(`Error deleting category ${categoryId} from Firestore:`, error);
    throw error;
  }
};

// --- Course Functions (Placeholders - to be implemented) ---
export const getCoursesFromFirestore = async (): Promise<Course[]> => {
    // Placeholder: Implement Firestore logic
    console.warn("getCoursesFromFirestore not yet implemented for Firestore");
    return [];
};
// ... other course CRUD functions

// --- Video Functions (Placeholders) ---
export const getVideosFromFirestore = async (): Promise<Video[]> => {
    // Placeholder
    console.warn("getVideosFromFirestore not yet implemented for Firestore");
    return [];
}
// ... other video CRUD functions

// --- LearningPath Functions (Placeholders) ---
export const getLearningPathsFromFirestore = async (): Promise<LearningPath[]> => {
    // Placeholder
    console.warn("getLearningPathsFromFirestore not yet implemented for Firestore");
    return [];
}
// ... other learning path CRUD functions

// --- PaymentSettings Functions (Placeholders) ---
export const getPaymentSettingsFromFirestore = async (): Promise<PaymentSettings | null> => {
    // Placeholder
    console.warn("getPaymentSettingsFromFirestore not yet implemented for Firestore");
    return null;
}
// ... other payment settings CRUD functions

// --- PaymentSubmission Functions (Placeholders) ---
export const getPaymentSubmissionsFromFirestore = async (): Promise<PaymentSubmission[]> => {
    // Placeholder
    console.warn("getPaymentSubmissionsFromFirestore not yet implemented for Firestore");
    return [];
}
// ... other payment submission CRUD functions
