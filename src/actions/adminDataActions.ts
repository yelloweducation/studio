
'use server';

import {
  // Prisma types
  type Category,
  type Course,
  type Module,
  type Lesson,
  type Quiz,
  type Question,
  type Option,
  type LearningPath,
  type Enrollment, 
  type PaymentSubmission, 
  type PaymentSubmissionStatus, 
  type QuizType as PrismaQuizType, // Explicitly import Prisma's QuizType
  // Mock types for forms or data structures if still needed by components
  type Course as MockCourseType,
  type Quiz as MockQuizType,
} from '@/lib/dbUtils'; 

import {
  getCategoriesFromDb,
  addCategoryToDb,
  updateCategoryInDb,
  deleteCategoryFromDb,
  getCoursesFromDb,
  getCourseByIdFromDb,
  addCourseToDb,
  updateCourseInDb,
  deleteCourseFromDb,
  saveQuizWithQuestionsToDb,
  getLearningPathsFromDb,
  addLearningPathToDb,
  updateLearningPathInDb,
  deleteLearningPathFromDb,
  seedCategoriesToDb as seedCategoriesDbUtil,
  seedCoursesToDb as seedCoursesDbUtil,
  seedLearningPathsToDb as seedLearningPathsDbUtil,
  getEnrollmentForUserAndCourseFromDb, 
  getPaymentSubmissionsFromDb, 
  createEnrollmentInDb as createEnrollmentDbUtil, 
  addPaymentSubmissionToDb as addPaymentSubmissionDbUtil,
  updatePaymentSubmissionInDb as updatePaymentSubmissionDbUtil,
  getEnrollmentsByUserIdFromDb as getEnrollmentsByUserIdDbUtil,
  // Video and PaymentSettings actions (if needed for server-side logic not directly tied to UI component state)
  getVideosFromDb, 
  addVideoToDb, 
  updateVideoInDb, 
  deleteVideoFromDb,
  getPaymentSettingsFromDb, 
  savePaymentSettingsToDb,
  seedVideosToDb as seedVideosDbUtil,
  seedPaymentSettingsToDb as seedPaymentSettingsDbUtil,
} from '@/lib/dbUtils';

// --- Category Actions ---
export async function serverGetCategories(): Promise<Category[]> {
  return getCategoriesFromDb();
}

export async function serverAddCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>): Promise<Category> {
  return addCategoryToDb(categoryData);
}

export async function serverUpdateCategory(categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>>): Promise<Category> {
  return updateCategoryInDb(categoryId, categoryData);
}

export async function serverDeleteCategory(categoryId: string): Promise<void> {
  return deleteCategoryFromDb(categoryId);
}

// --- Course Actions ---
export async function serverGetCourses(): Promise<Course[]> {
  return getCoursesFromDb();
}

export async function serverGetCourseById(courseId: string): Promise<Course | null> {
  return getCourseByIdFromDb(courseId);
}

export async function serverAddCourse(
  courseData: Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'|'enrollments'|'paymentSubmissions'> & { 
    categoryName: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>>> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { quizType: PrismaQuizType, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }> }>
  }
): Promise<Course> {
  console.log("[ServerAction serverAddCourse] Action called. Received data (first 200 chars):", JSON.stringify(courseData).substring(0,200) + "...");
  try {
    // @ts-ignore - The input type for addCourseToDb is specific and derived from Zod schema in dbUtils.
    // This server action's input type is a simplified representation for external calls.
    // The actual validation happens within addCourseToDb.
    const newCourse = await addCourseToDb(courseData);
    console.log("[ServerAction serverAddCourse] addCourseToDb successful, returning course ID:", newCourse.id);
    return newCourse;
  } catch (error) {
    console.error("[ServerAction serverAddCourse] Error calling addCourseToDb. Full error:", error);
    if (error instanceof Error) {
        console.error("[ServerAction serverAddCourse] Error name:", error.name);
        console.error("[ServerAction serverAddCourse] Error message:", error.message);
    }
    throw new Error(`Failed to add course. Server log may have details. Message: ${error instanceof Error ? error.message : 'Unknown server error'}`);
  }
}


export async function serverUpdateCourse(
  courseId: string, 
  courseData: Partial<Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'|'enrollments'|'paymentSubmissions'>> & { 
    categoryName?: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { id?: string, lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>> & {id?: string}> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { id?: string, quizType: PrismaQuizType, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { id?: string, options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>> & {id?:string}>, correctOptionText?: string }> }>
  }
): Promise<Course> {
  // @ts-ignore - Similar to serverAddCourse, detailed validation is in updateCourseInDb.
  return updateCourseInDb(courseId, courseData);
}

export async function serverDeleteCourse(courseId: string): Promise<void> {
  return deleteCourseFromDb(courseId);
}

export async function serverSaveQuizWithQuestions(
    courseIdForQuiz: string,
    quizData: MockQuizType & { questionsToUpsert?: any[], questionIdsToDelete?: string[] } // MockQuizType uses string for quizType
): Promise<Quiz> { 
    // dbUtils.saveQuizWithQuestionsToDb expects Prisma's QuizType enum.
    // The quizData.quizType here will be a string like "practice" or "graded".
    // saveQuizWithQuestionsToDb in dbUtils now handles this by casting to Prisma's QuizType internally
    // after Zod validation which is not explicitly run here but should be added or ensured.
    // For now, @ts-ignore allows it to proceed, assuming dbUtils handles the string->enum.
    // @ts-ignore 
    return saveQuizWithQuestionsToDb(courseIdForQuiz, quizData);
}


// --- Learning Path Actions ---
export async function serverGetLearningPaths(): Promise<LearningPath[]> {
  return getLearningPathsFromDb();
}

export async function serverAddLearningPath(
  pathData: Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'> & { courseIdsToConnect?: string[] }
): Promise<LearningPath> {
  return addLearningPathToDb(pathData);
}

export async function serverUpdateLearningPath(
  pathId: string, 
  pathData: Partial<Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'>> & { courseIdsToConnect?: string[] }
): Promise<LearningPath> {
  return updateLearningPathInDb(pathId, pathData);
}

export async function serverDeleteLearningPath(pathId: string): Promise<void> {
  return deleteLearningPathFromDb(pathId);
}

// --- Seeding Actions ---
export async function serverSeedCategories(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> {
    return seedCategoriesDbUtil();
}
export async function serverSeedCourses(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> {
    return seedCoursesDbUtil();
}
export async function serverSeedLearningPaths(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> {
    return seedLearningPathsDbUtil();
}
export async function serverSeedVideos(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> {
    return seedVideosDbUtil();
}
export async function serverSeedPaymentSettings(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> {
    return seedPaymentSettingsDbUtil();
}


// --- User-Specific Data Fetching for Course Display ---
export async function serverGetEnrollmentForCourse(userId: string, courseId: string): Promise<Enrollment | null> {
  return getEnrollmentForUserAndCourseFromDb(userId, courseId);
}

export async function serverGetPaymentSubmissionForCourse(userId: string, courseId: string): Promise<PaymentSubmission | null> {
  const allUserSubmissions = await getPaymentSubmissionsFromDb({ userId: userId }); 
  return allUserSubmissions.find(s => s.courseId === courseId) || null;
}

export async function serverCreateEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
  try {
    return await createEnrollmentDbUtil(userId, courseId);
  } catch (error) {
    console.error("[ServerAction] Error creating enrollment:", error);
    return null;
  }
}

// --- Student Dashboard Actions ---
export async function serverGetEnrollmentsByUserId(userId: string): Promise<Enrollment[]> {
    return getEnrollmentsByUserIdDbUtil(userId);
}

// --- Checkout Page Actions ---
export async function serverAddPaymentSubmission(
    submissionData: Omit<PaymentSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes' | 'user' | 'course'> & { userId: string, courseId: string }
): Promise<PaymentSubmission | null> {
    try {
        // addPaymentSubmissionDbUtil expects data validated by PaymentSubmissionInputSchema
        return await addPaymentSubmissionDbUtil(submissionData);
    } catch (error) {
        console.error("[ServerAction] Error adding payment submission:", error);
        return null;
    }
}

// --- Admin Panel Payment Submission Review Actions ---
export async function serverGetAllPaymentSubmissions(): Promise<PaymentSubmission[]> {
    return getPaymentSubmissionsFromDb(); // Gets all by default
}

export async function serverUpdatePaymentSubmissionStatus(
    submissionId: string, 
    newStatus: PaymentSubmissionStatus, 
    adminNotes?: string | null
): Promise<PaymentSubmission | null> {
    try {
        return await updatePaymentSubmissionDbUtil(submissionId, { status: newStatus, adminNotes: adminNotes, reviewedAt: new Date() });
    } catch (error) {
        console.error("[ServerAction] Error updating payment submission status:", error);
        return null;
    }
}

// --- Video Actions (Admin Panel) ---
export async function serverGetVideos(): Promise<Video[]> {
    return getVideosFromDb();
}
export async function serverAddVideo(videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> {
    return addVideoToDb(videoData);
}
export async function serverUpdateVideo(videoId: string, videoData: Partial<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Video> {
    return updateVideoInDb(videoId, videoData);
}
export async function serverDeleteVideo(videoId: string): Promise<void> {
    return deleteVideoFromDb(videoId);
}

// --- Payment Settings Actions (Admin Panel) ---
export async function serverGetPaymentSettings(): Promise<PaymentSettings | null> {
    return getPaymentSettingsFromDb();
}
export async function serverSavePaymentSettings(settingsData: Omit<PaymentSettings, 'id'| 'updatedAt'>): Promise<PaymentSettings> {
    return savePaymentSettingsToDb(settingsData);
}
