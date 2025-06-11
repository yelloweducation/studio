
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
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

// --- Course Functions ---
export const getCoursesFromFirestore = async (): Promise<Course[]> => {
  try {
    const coursesCol = collection(db, 'courses');
    // Consider adding orderBy('title') or orderBy('createdAt', 'desc') if needed
    const q = query(coursesCol, orderBy('title')); 
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  } catch (error) {
    console.error("Error fetching courses from Firestore:", error);
    return [];
  }
};

export const getCourseByIdFromFirestore = async (courseId: string): Promise<Course | null> => {
  try {
    const courseDocRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(courseDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Course;
    }
    console.log(`No course found with ID: ${courseId}`);
    return null;
  } catch (error) {
    console.error(`Error fetching course ${courseId} from Firestore:`, error);
    return null;
  }
};

export const addCourseToFirestore = async (courseData: Omit<Course, 'id'>): Promise<Course> => {
  try {
    const coursesCol = collection(db, 'courses');
    // Firestore automatically generates an ID if you use addDoc
    const docRef = await addDoc(coursesCol, {
      ...courseData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...courseData };
  } catch (error) {
    console.error("Error adding course to Firestore:", error);
    throw error;
  }
};

export const updateCourseInFirestore = async (courseId: string, courseData: Partial<Omit<Course, 'id'>>): Promise<void> => {
  try {
    const courseDocRef = doc(db, 'courses', courseId);
    await updateDoc(courseDocRef, {
      ...courseData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating course ${courseId} in Firestore:`, error);
    throw error;
  }
};

export const deleteCourseFromFirestore = async (courseId: string): Promise<void> => {
  try {
    const courseDocRef = doc(db, 'courses', courseId);
    await deleteDoc(courseDocRef);
  } catch (error) {
    console.error(`Error deleting course ${courseId} from Firestore:`, error);
    throw error;
  }
};


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

