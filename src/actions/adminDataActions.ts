
'use server';

import {
  type SitePage,
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
  type QuizType as PrismaQuizType,
  type PaymentSettings,
  type Video,
  type Certificate,
} from '@/lib/dbUtils';

import {
  getCategoriesFromDb, addCategoryToDb, updateCategoryInDb, deleteCategoryFromDb,
  getCoursesFromDb, getCourseByIdFromDb, addCourseToDb, updateCourseInDb, deleteCourseFromDb,
  getQuizzesFromDb, getQuizByIdFromDb, addQuizToDb, updateQuizInDb, deleteQuizFromDb, // New Quiz actions
  getLearningPathsFromDb, addLearningPathToDb, updateLearningPathInDb, deleteLearningPathFromDb,
  seedCategoriesToDb as seedCategoriesDbUtil,
  seedCoursesToDb as seedCoursesDbUtil,
  seedLearningPathsToDb as seedLearningPathsDbUtil,
  getEnrollmentForUserAndCourseFromDb,
  getPaymentSubmissionsFromDb,
  createEnrollmentInDb as createEnrollmentDbUtil,
  addPaymentSubmissionToDb as addPaymentSubmissionDbUtil,
  updatePaymentSubmissionInDb as updatePaymentSubmissionDbUtil,
  getEnrollmentsByUserIdFromDb as getEnrollmentsByUserIdDbUtil,
  updateEnrollmentProgressInDb,
  getPaymentSettingsFromDb, savePaymentSettingsToDb,
  seedPaymentSettingsToDb as seedPaymentSettingsDbUtil,
  getSitePageBySlug as getSitePageBySlugDbUtil,
  upsertSitePage as upsertSitePageDbUtil,
  getVideosFromDb, addVideoToDb, updateVideoInDb, deleteVideoFromDb, seedVideosToDb as seedVideosDbUtil,
  getCertificatesFromDb, issueCertificateToDb, deleteCertificateFromDb,
} from '@/lib/dbUtils';
import type { Prisma } from '@prisma/client';


// --- Category Actions ---
export async function serverGetCategories(): Promise<Category[]> { return getCategoriesFromDb(); }
export async function serverAddCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>): Promise<Category> { return addCategoryToDb(categoryData); }
export async function serverUpdateCategory(categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>>): Promise<Category> { return updateCategoryInDb(categoryId, categoryData); }
export async function serverDeleteCategory(categoryId: string): Promise<void> { return deleteCategoryFromDb(categoryId); }

// --- Course Actions ---
export async function serverGetCourses(): Promise<Course[]> { return getCoursesFromDb(); }
export async function serverGetCourseById(courseId: string): Promise<Course | null> { /* ... */ return getCourseByIdFromDb(courseId); }

export async function serverAddCourse(
  courseData: Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'courseQuizzes'|'category'|'enrollments'|'paymentSubmissions'|'certificates'> & {
    categoryName: string,
    instructor: string,
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>>> }>,
    quizIdsToConnect?: string[],
  }
): Promise<Course> {
  console.log("[ServerAction serverAddCourse] ACTION CALLED. Received data:", JSON.stringify(courseData, null, 2));
  try {
    const newCourse = await addCourseToDb(courseData);
    return newCourse;
  } catch (error: any) {
    console.error("[ServerAction serverAddCourse] Error calling addCourseToDb.", error);
    throw error;
  }
}
export async function serverUpdateCourse(
  courseId: string,
  courseData: Partial<Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'courseQuizzes'|'category'|'enrollments'|'paymentSubmissions'|'certificates'>> & {
    categoryName?: string,
    instructor?: string,
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { id?: string, lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>> & {id?: string}> }>,
    quizIdsToConnect?: string[],
  }
): Promise<Course> {
  console.log(`[ServerAction serverUpdateCourse] ACTION CALLED for course ID ${courseId}. Data:`, JSON.stringify(courseData, null, 2));
  try {
    const updatedCourse = await updateCourseInDb(courseId, courseData);
    return updatedCourse;
  } catch (error: any) {
    console.error(`[ServerAction serverUpdateCourse] Error calling updateCourseInDb for course ID ${courseId}.`, error);
    throw error;
  }
}
export async function serverDeleteCourse(courseId: string): Promise<void> { return deleteCourseFromDb(courseId); }


// --- Quiz Actions (New Standalone) ---
export async function serverGetQuizzes(): Promise<Quiz[]> {
  return getQuizzesFromDb();
}
export async function serverGetQuizById(quizId: string): Promise<Quiz | null> {
  return getQuizByIdFromDb(quizId);
}
export async function serverAddQuiz(
  quizData: Omit<Quiz, 'id'|'createdAt'|'updatedAt'|'questions'|'courseQuizzes'> & {
    questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }>,
    courseIdsToConnect?: string[]
  }
): Promise<Quiz> {
  return addQuizToDb(quizData);
}
export async function serverUpdateQuiz(
  quizId: string,
  quizData: Partial<Omit<Quiz, 'id'|'createdAt'|'updatedAt'|'questions'|'courseQuizzes'>> & {
    questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { id?: string, options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>> & {id?:string}>, correctOptionText?: string }>,
    questionIdsToDelete?: string[],
    courseIdsToConnect?: string[]
  }
): Promise<Quiz> {
  return updateQuizInDb(quizId, quizData);
}
export async function serverDeleteQuiz(quizId: string): Promise<void> {
  return deleteQuizFromDb(quizId);
}

// --- Learning Path Actions ---
export async function serverGetLearningPaths(): Promise<LearningPath[]> { return getLearningPathsFromDb(); }
export async function serverAddLearningPath(pathData: Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'> & { courseIdsToConnect?: string[] }): Promise<LearningPath> { return addLearningPathToDb(pathData); }
export async function serverUpdateLearningPath(pathId: string, pathData: Partial<Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'>> & { courseIdsToConnect?: string[] }): Promise<LearningPath> { return updateLearningPathInDb(pathId, pathData); }
export async function serverDeleteLearningPath(pathId: string): Promise<void> { return deleteLearningPathFromDb(pathId); }

// --- Video Actions ---
export async function serverGetVideos(): Promise<Video[]> { return getVideosFromDb(); }
export async function serverAddVideo(videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> { return addVideoToDb(videoData); }
export async function serverUpdateVideo(videoId: string, videoData: Partial<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Video> { return updateVideoInDb(videoId, videoData); }
export async function serverDeleteVideo(videoId: string): Promise<void> { return deleteVideoFromDb(videoId); }


// --- Seeding Actions ---
export async function serverSeedCategories(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> { return seedCategoriesDbUtil(); }
export async function serverSeedCourses(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> { return seedCoursesDbUtil(); }
export async function serverSeedLearningPaths(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> { return seedLearningPathsDbUtil(); }
export async function serverSeedPaymentSettings(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> { return seedPaymentSettingsDbUtil(); }
export async function serverSeedVideos(): Promise<{ successCount: number; errorCount: number; skippedCount: number }> { return seedVideosDbUtil(); }


// --- User-Specific Data Fetching for Course Display ---
export async function serverGetEnrollmentForCourse(userId: string, courseId: string): Promise<Enrollment | null> { return getEnrollmentForUserAndCourseFromDb(userId, courseId); }
export async function serverGetPaymentSubmissionForCourse(userId: string, courseId: string): Promise<PaymentSubmission | null> {
  const allUserSubmissions = await getPaymentSubmissionsFromDb({ userId: userId });
  return allUserSubmissions.find(s => s.courseId === courseId) || null;
}
export async function serverCreateEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
  try { return await createEnrollmentDbUtil(userId, courseId); }
  catch (error) { console.error("[ServerAction serverCreateEnrollment] Error creating enrollment:", error); throw error; }
}
export async function serverUpdateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment | null> {
    try { return await updateEnrollmentProgressInDb(enrollmentId, progress); }
    catch (error) { console.error("[ServerAction serverUpdateEnrollmentProgress] Error updating enrollment progress:", error); throw error; }
}

// --- Student Dashboard Actions ---
export async function serverGetEnrollmentsByUserId(userId: string): Promise<Enrollment[]> { return getEnrollmentsByUserIdDbUtil(userId); }

// --- Checkout Page Actions ---
export async function serverAddPaymentSubmission(
    submissionData: Omit<PaymentSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes' | 'user' | 'course'> & { userId: string, courseId: string }
): Promise<PaymentSubmission> { /* ... */ return addPaymentSubmissionDbUtil(submissionData); }

// --- Admin Panel Payment Submission Review Actions ---
export async function serverGetAllPaymentSubmissions(filter?: { userId?: string }): Promise<PaymentSubmission[]> { return getPaymentSubmissionsFromDb(filter); }
export async function serverUpdatePaymentSubmissionStatus(
    submissionId: string,
    newStatus: PaymentSubmissionStatus,
    adminNotes?: string | null
): Promise<PaymentSubmission> { /* ... */ return updatePaymentSubmissionDbUtil(submissionId, { status: newStatus, adminNotes: adminNotes === null ? undefined : adminNotes, reviewedAt: new Date() });}

// --- Payment Settings Actions (Admin Panel & Checkout) ---
export async function serverGetPaymentSettings(): Promise<PaymentSettings | null> { return getPaymentSettingsFromDb(); }
export async function serverSavePaymentSettings(settingsData: Omit<PaymentSettings, 'id'| 'updatedAt'>): Promise<PaymentSettings> { return savePaymentSettingsToDb(settingsData); }

// --- Site Page Content Actions ---
export async function serverGetSitePageBySlug(slug: string): Promise<SitePage | null> {
  return getSitePageBySlugDbUtil(slug);
}
export async function serverUpsertSitePage(
  slug: string,
  title: string,
  content: Prisma.JsonValue | string
): Promise<SitePage> {
  return upsertSitePageDbUtil(slug, title, content);
}

// --- Certificate Actions ---
export async function serverGetCertificates(): Promise<Certificate[]> {
  return getCertificatesFromDb();
}
export async function serverIssueCertificate(data: Pick<Certificate, 'userId' | 'courseId' | 'certificateUrl'>): Promise<Certificate> {
  return issueCertificateToDb(data);
}
export async function serverDeleteCertificate(certificateId: string): Promise<void> {
  return deleteCertificateFromDb(certificateId);
}

