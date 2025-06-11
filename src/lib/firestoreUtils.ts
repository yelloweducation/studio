
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, getDoc, where, writeBatch, Timestamp } from 'firebase/firestore';
import type { Category, Course, Video, LearningPath, PaymentSettings, PaymentSubmission, Enrollment } from '@/data/mockData';

// --- Category Functions ---
export const getCategoriesFromFirestore = async (): Promise<Category[]> => {
  try {
    const categoriesCol = collection(db, 'categories');
    const q = query(categoriesCol, orderBy('name'));
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
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...categoryData, createdAt: new Date() }; // Return with approximate timestamp
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
        updatedAt: serverTimestamp(),
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
    const docRef = await addDoc(coursesCol, {
      ...courseData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...courseData, createdAt: new Date() };
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

// --- Video Functions ---
export const getVideosFromFirestore = async (): Promise<Video[]> => {
  try {
    const videosCol = collection(db, 'videos');
    const q = query(videosCol, orderBy('createdAt', 'desc')); // Example: order by creation date
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
  } catch (error) {
    console.error("Error fetching videos from Firestore:", error);
    return [];
  }
};

export const addVideoToFirestore = async (videoData: Omit<Video, 'id'>): Promise<Video> => {
  try {
    const videosCol = collection(db, 'videos');
    const docRef = await addDoc(videosCol, {
      ...videoData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...videoData, createdAt: new Date() };
  } catch (error) {
    console.error("Error adding video to Firestore:", error);
    throw error;
  }
};

export const updateVideoInFirestore = async (videoId: string, videoData: Partial<Omit<Video, 'id'>>): Promise<void> => {
  try {
    const videoDocRef = doc(db, 'videos', videoId);
    await updateDoc(videoDocRef, {
      ...videoData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating video ${videoId} in Firestore:`, error);
    throw error;
  }
};

export const deleteVideoFromFirestore = async (videoId: string): Promise<void> => {
  try {
    const videoDocRef = doc(db, 'videos', videoId);
    await deleteDoc(videoDocRef);
  } catch (error) {
    console.error(`Error deleting video ${videoId} from Firestore:`, error);
    throw error;
  }
};

// --- LearningPath Functions ---
export const getLearningPathsFromFirestore = async (): Promise<LearningPath[]> => {
  try {
    const pathsCol = collection(db, 'learningPaths');
    const q = query(pathsCol, orderBy('title'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningPath));
  } catch (error) {
    console.error("Error fetching learning paths from Firestore:", error);
    return [];
  }
};

export const addLearningPathToFirestore = async (pathData: Omit<LearningPath, 'id'>): Promise<LearningPath> => {
  try {
    const pathsCol = collection(db, 'learningPaths');
    const docRef = await addDoc(pathsCol, {
      ...pathData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...pathData, createdAt: new Date() };
  } catch (error) {
    console.error("Error adding learning path to Firestore:", error);
    throw error;
  }
};

export const updateLearningPathInFirestore = async (pathId: string, pathData: Partial<Omit<LearningPath, 'id'>>): Promise<void> => {
  try {
    const pathDocRef = doc(db, 'learningPaths', pathId);
    await updateDoc(pathDocRef, {
      ...pathData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating learning path ${pathId} in Firestore:`, error);
    throw error;
  }
};

export const deleteLearningPathFromFirestore = async (pathId: string): Promise<void> => {
  try {
    const pathDocRef = doc(db, 'learningPaths', pathId);
    await deleteDoc(pathDocRef);
  } catch (error) {
    console.error(`Error deleting learning path ${pathId} from Firestore:`, error);
    throw error;
  }
};

// --- PaymentSettings Functions ---
const PAYMENT_SETTINGS_DOC_ID = 'globalPaymentSettings'; // Use a fixed ID for the single settings document

export const getPaymentSettingsFromFirestore = async (): Promise<PaymentSettings | null> => {
  try {
    const settingsDocRef = doc(db, 'paymentSettings', PAYMENT_SETTINGS_DOC_ID);
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as PaymentSettings;
    }
    return null; // Or return initialPaymentSettings from mockData if preferred as a default
  } catch (error) {
    console.error("Error fetching payment settings from Firestore:", error);
    return null;
  }
};

export const savePaymentSettingsToFirestore = async (settingsData: PaymentSettings): Promise<void> => {
  try {
    const settingsDocRef = doc(db, 'paymentSettings', PAYMENT_SETTINGS_DOC_ID);
    await setDoc(settingsDocRef, { // Use setDoc with merge:true or just update if sure it exists
      ...settingsData,
      updatedAt: serverTimestamp(),
    }, { merge: true }); // merge:true creates the doc if it doesn't exist, or updates if it does
  } catch (error) {
    console.error("Error saving payment settings to Firestore:", error);
    throw error;
  }
};

// --- PaymentSubmission Functions ---
export const getPaymentSubmissionsFromFirestore = async (): Promise<PaymentSubmission[]> => {
  try {
    const submissionsCol = collection(db, 'paymentSubmissions');
    const q = query(submissionsCol, orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamps to ISO strings if they are stored as Timestamps
        submittedAt: (doc.data().submittedAt as Timestamp)?.toDate ? (doc.data().submittedAt as Timestamp).toDate().toISOString() : doc.data().submittedAt,
        reviewedAt: (doc.data().reviewedAt as Timestamp)?.toDate ? (doc.data().reviewedAt as Timestamp).toDate().toISOString() : doc.data().reviewedAt,
      } as PaymentSubmission));
  } catch (error) {
    console.error("Error fetching payment submissions from Firestore:", error);
    return [];
  }
};

export const addPaymentSubmissionToFirestore = async (submissionData: Omit<PaymentSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt'> & { userId: string }): Promise<PaymentSubmission> => {
  try {
    const submissionsCol = collection(db, 'paymentSubmissions');
    const fullSubmissionData = {
      ...submissionData,
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(submissionsCol, fullSubmissionData);
    return { 
        id: docRef.id, 
        ...submissionData, 
        status: 'pending', 
        submittedAt: fullSubmissionData.submittedAt, 
        createdAt: new Date(), 
        updatedAt: new Date() 
    };
  } catch (error) {
    console.error("Error adding payment submission to Firestore:", error);
    throw error;
  }
};

export const updatePaymentSubmissionInFirestore = async (submissionId: string, dataToUpdate: Partial<Pick<PaymentSubmission, 'status' | 'adminNotes' | 'reviewedAt'>>): Promise<void> => {
  try {
    const submissionDocRef = doc(db, 'paymentSubmissions', submissionId);
    await updateDoc(submissionDocRef, {
      ...dataToUpdate,
      reviewedAt: dataToUpdate.reviewedAt || new Date().toISOString(), // Ensure reviewedAt is set/updated
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating payment submission ${submissionId} in Firestore:`, error);
    throw error;
  }
};


// --- Enrollment Functions ---
export const getEnrollmentForUserAndCourse = async (userId: string, courseId: string): Promise<Enrollment | null> => {
  try {
    const enrollmentsCol = collection(db, 'enrollments');
    const q = query(enrollmentsCol, where('userId', '==', userId), where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Enrollment;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching enrollment for user ${userId}, course ${courseId}:`, error);
    return null;
  }
};

export const createEnrollmentInFirestore = async (userId: string, courseId: string): Promise<Enrollment> => {
  try {
    const enrollmentsCol = collection(db, 'enrollments');
    const enrollmentData = {
      userId,
      courseId,
      progress: 0,
      enrolledDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(enrollmentsCol, enrollmentData);
    return { id: docRef.id, ...enrollmentData, createdAt: new Date(), updatedAt: new Date() };
  } catch (error) {
    console.error(`Error creating enrollment for user ${userId}, course ${courseId}:`, error);
    throw error;
  }
};

export const updateEnrollmentProgressInFirestore = async (enrollmentId: string, progress: number): Promise<void> => {
  try {
    const enrollmentDocRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(enrollmentDocRef, {
      progress,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating progress for enrollment ${enrollmentId}:`, error);
    throw error;
  }
};

export const getEnrollmentsByUserId = async (userId: string): Promise<Enrollment[]> => {
  try {
    const enrollmentsCol = collection(db, 'enrollments');
    const q = query(enrollmentsCol, where('userId', '==', userId), orderBy('enrolledDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
  } catch (error) {
    console.error(`Error fetching enrollments for user ${userId}:`, error);
    return [];
  }
};
