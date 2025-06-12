
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
  type Enrollment, // Added
  type PaymentSubmission, // Added
  type PaymentSubmissionStatus, // Added
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
  getEnrollmentForUserAndCourseFromDb, // Added
  getPaymentSubmissionsFromDb, // This will be updated to fetch all, then filter if needed, or direct fetch
  createEnrollmentInDb as createEnrollmentDbUtil, // Added
  // Video and PaymentSettings still use client-side utils, actions for them will be added when they are migrated to DB
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
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }> }>
  }
): Promise<Course> {
  // @ts-ignore
  return addCourseToDb(courseData);
}

export async function serverUpdateCourse(
  courseId: string, 
  courseData: Partial<Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'|'enrollments'|'paymentSubmissions'>> & { 
    categoryName?: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { id?: string, lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>> & {id?: string}> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { id?: string, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { id?: string, options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>> & {id?:string}>, correctOptionText?: string }> }>
  }
): Promise<Course> {
  // @ts-ignore
  return updateCourseInDb(courseId, courseData);
}

export async function serverDeleteCourse(courseId: string): Promise<void> {
  return deleteCourseFromDb(courseId);
}

export async function serverSaveQuizWithQuestions(
    courseIdForQuiz: string,
    quizData: MockQuizType & { questionsToUpsert?: any[], questionIdsToDelete?: string[] }
): Promise<Quiz> { 
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

// --- User-Specific Data Fetching for Course Display ---
export async function serverGetEnrollmentForCourse(userId: string, courseId: string): Promise<Enrollment | null> {
  return getEnrollmentForUserAndCourseFromDb(userId, courseId);
}

export async function serverGetPaymentSubmissionForCourse(userId: string, courseId: string): Promise<PaymentSubmission | null> {
  // getPaymentSubmissionsFromDb will now use Prisma.
  // For a single course, we might want a more targeted query in dbUtils if performance becomes an issue.
  const allUserSubmissions = await getPaymentSubmissionsFromDb({ userId: userId }); // Assuming getPaymentSubmissionsFromDb can filter
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
    return getEnrollmentsByUserIdFromDb(userId);
}

// --- Checkout Page Actions ---
export async function serverAddPaymentSubmission(
    submissionData: Omit<PaymentSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes' | 'user' | 'course'> & { userId: string, courseId: string }
): Promise<PaymentSubmission | null> {
    try {
        // @ts-ignore // dbUtils.addPaymentSubmissionToDb expects Prisma compatible type now
        return await addPaymentSubmissionToDb(submissionData);
    } catch (error) {
        console.error("[ServerAction] Error adding payment submission:", error);
        return null;
    }
}
