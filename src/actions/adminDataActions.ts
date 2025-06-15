
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
  type Certificate, // Added Certificate type
} from '@/lib/dbUtils';

import {
  getCategoriesFromDb, addCategoryToDb, updateCategoryInDb, deleteCategoryFromDb,
  getCoursesFromDb, getCourseByIdFromDb, addCourseToDb, updateCourseInDb, deleteCourseFromDb,
  saveQuizWithQuestionsToDb,
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
  getCertificatesFromDb, issueCertificateToDb, deleteCertificateFromDb, // Added Certificate actions
} from '@/lib/dbUtils';
import type { Prisma } from '@prisma/client';


// --- Category Actions ---
export async function serverGetCategories(): Promise<Category[]> { return getCategoriesFromDb(); }
export async function serverAddCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>): Promise<Category> { return addCategoryToDb(categoryData); }
export async function serverUpdateCategory(categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>>): Promise<Category> { return updateCategoryInDb(categoryId, categoryData); }
export async function serverDeleteCategory(categoryId: string): Promise<void> { return deleteCategoryFromDb(categoryId); }

// --- Course Actions ---
export async function serverGetCourses(): Promise<Course[]> { return getCoursesFromDb(); }

export async function serverGetCourseById(courseId: string): Promise<Course | null> {
  console.log(`[ServerAction serverGetCourseById] ACTION CALLED for course ID: ${courseId}`);
  try {
    const course = await getCourseByIdFromDb(courseId);
    console.log(`[ServerAction serverGetCourseById] getCourseByIdFromDb successful for course ID ${courseId}. Course found: ${!!course}`);
    return course;
  } catch (error: any) {
    console.error("============================================================");
    console.error(`[ServerAction serverGetCourseById] Error calling getCourseByIdFromDb for course ID ${courseId}. Full error details below.`);
    if (error instanceof Error) {
        console.error(`[ServerAction serverGetCourseById] Error Name:`, error.name);
        console.error(`[ServerAction serverGetCourseById] Error Message:`, error.message);
        console.error(`[ServerAction serverGetCourseById] Error Stack:`, error.stack);
    } else {
        console.error(`[ServerAction serverGetCourseById] Non-Error object thrown for course ID ${courseId}:`, error);
    }

    let detailedErrorMessage = error instanceof Error ? error.message : String(error);
    if (error.code) {
        console.error("[ServerAction serverGetCourseById] Prisma Error Code (from caught error):", error.code);
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverGetCourseById] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    if (error.clientVersion) { console.error("[ServerAction serverGetCourseById] Prisma Client Version (from caught error):", error.clientVersion); }
    if (error.digest) { console.error("[ServerAction serverGetCourseById] Error Digest:", error.digest); }

    console.error("============================================================");
    const newError = new Error(`ServerAction serverGetCourseById failed for ID ${courseId}: ${detailedErrorMessage}`);
    // @ts-ignore
    newError.digest = error.digest || error.code || `serverGetCourseById-error-${Date.now()}`;
    throw newError;
  }
}

export async function serverAddCourse(
  courseData: Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'|'enrollments'|'paymentSubmissions'|'certificates'> & {
    categoryName: string,
    instructor: string,
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>>> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { quizType: PrismaQuizType, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }> }>
  }
): Promise<Course> {
  console.log("============================================================");
  console.log("[ServerAction serverAddCourse] ACTION CALLED. Received data:", JSON.stringify(courseData, null, 2));
  try {
    const newCourse = await addCourseToDb(courseData);
    console.log("[ServerAction serverAddCourse] addCourseToDb successful, returning course ID:", newCourse.id);
    console.log("============================================================");
    return newCourse;
  } catch (error: any) {
    console.error("============================================================");
    console.error("[ServerAction serverAddCourse] Error calling addCourseToDb. Full error details below.");
    if (error instanceof Error) {
        console.error("[ServerAction serverAddCourse] Error Name:", error.name);
        console.error("[ServerAction serverAddCourse] Error Message:", error.message);
        console.error("[ServerAction serverAddCourse] Error Stack:", error.stack);
    } else {
        console.error("[ServerAction serverAddCourse] Non-Error object thrown:", error);
    }

    let detailedErrorMessage = error instanceof Error ? error.message : String(error);
    if (error.code) {
        console.error("[ServerAction serverAddCourse] Prisma Error Code (from caught error):", error.code);
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverAddCourse] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    if (error.clientVersion) { console.error("[ServerAction serverAddCourse] Prisma Client Version (from caught error):", error.clientVersion); }
    if (error.digest) { console.error("[ServerAction serverAddCourse] Error Digest:", error.digest); }

    console.error("============================================================");
    const newError = new Error(`ServerAction serverAddCourse failed: ${detailedErrorMessage}`);
    // @ts-ignore
    newError.digest = error.digest || error.code || `serverAddCourse-error-${Date.now()}`;
    throw newError;
  }
}
export async function serverUpdateCourse(
  courseId: string,
  courseData: Partial<Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'|'enrollments'|'paymentSubmissions'|'certificates'>> & {
    categoryName?: string,
    instructor?: string,
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { id?: string, lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>> & {id?: string}> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { id?: string, quizType: PrismaQuizType, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { id?: string, options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>> & {id?:string}>, correctOptionText?: string }> }>
  }
): Promise<Course> {
  console.log("============================================================");
  console.log(`[ServerAction serverUpdateCourse] ACTION CALLED for course ID ${courseId}. Received data:`, JSON.stringify(courseData, null, 2));
  try {
    const updatedCourse = await updateCourseInDb(courseId, courseData);
    console.log(`[ServerAction serverUpdateCourse] updateCourseInDb successful for course ID ${courseId}, returning course ID:`, updatedCourse.id);
    console.log("============================================================");
    return updatedCourse;
  } catch (error: any) {
    console.error("============================================================");
    console.error(`[ServerAction serverUpdateCourse] Error calling updateCourseInDb for course ID ${courseId}. Full error details below.`);
    if (error instanceof Error) {
        console.error(`[ServerAction serverUpdateCourse] Error name:`, error.name);
        console.error(`[ServerAction serverUpdateCourse] Error message:`, error.message);
        console.error(`[ServerAction serverUpdateCourse] Error Stack:`, error.stack);
    } else {
         console.error(`[ServerAction serverUpdateCourse] Non-Error object thrown for course ID ${courseId}:`, error);
    }

    let detailedErrorMessage = error instanceof Error ? error.message : String(error);
    if (error.code) {
        console.error("[ServerAction serverUpdateCourse] Prisma Error Code (from caught error):", error.code);
        detailedErrorMessage += ` (Prisma Code: ${error.code}`;
        if (error.meta) {
            console.error("[ServerAction serverUpdateCourse] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
            detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
        }
        detailedErrorMessage += `)`;
    }
    if (error.clientVersion) { console.error("[ServerAction serverUpdateCourse] Prisma Client Version (from caught error):", error.clientVersion); }
    if (error.digest) { console.error("[ServerAction serverUpdateCourse] Error Digest:", error.digest); }
    console.error("============================================================");
    const newError = new Error(`ServerAction serverUpdateCourse failed for ID ${courseId}: ${detailedErrorMessage}`);
    // @ts-ignore
    newError.digest = error.digest || error.code || `serverUpdateCourse-error-${Date.now()}`;
    throw newError;
  }
}
export async function serverDeleteCourse(courseId: string): Promise<void> { return deleteCourseFromDb(courseId); }
export async function serverSaveQuizWithQuestions(
    courseIdForQuiz: string,
    quizData: Pick<Quiz, 'id'|'title'|'quizType'|'passingScore'> & { questionsToUpsert?: any[], questionIdsToDelete?: string[] }
): Promise<Quiz> {
    console.log(`[ServerAction serverSaveQuizWithQuestions] Action called for course ID ${courseIdForQuiz}, quiz title: ${quizData.title}`);
    try {
        const savedQuiz = await saveQuizWithQuestionsToDb(courseIdForQuiz, quizData);
        console.log(`[ServerAction serverSaveQuizWithQuestions] saveQuizWithQuestionsToDb successful, returning quiz ID:`, savedQuiz.id);
        return savedQuiz;
    } catch (error: any) {
        console.error(`[ServerAction serverSaveQuizWithQuestions] Error calling saveQuizWithQuestionsToDb. Full error:`, error);
        if (error instanceof Error) {
            console.error(`[ServerAction serverSaveQuizWithQuestions] Error name:`, error.name);
            console.error(`[ServerAction serverSaveQuizWithQuestions] Error message:`, error.message);
            console.error(`[ServerAction serverSaveQuizWithQuestions] Error stack:`, error.stack);
        }
        let detailedErrorMessage = error instanceof Error ? error.message : String(error);
        if (error.code && error.meta) {
            detailedErrorMessage += ` (Prisma Code: ${error.code}, Meta: ${JSON.stringify(error.meta)})`;
        }
        const newError = new Error(`ServerAction serverSaveQuizWithQuestions failed: ${detailedErrorMessage}`);
        // @ts-ignore
        newError.digest = error.digest || error.code || `serverSaveQuiz-error-${Date.now()}`;
        throw newError;
    }
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
): Promise<PaymentSubmission> {
    console.log("============================================================");
    console.log("[ServerAction serverAddPaymentSubmission] ACTION CALLED. Received data:", JSON.stringify(submissionData, null, 2));
    try {
        const result = await addPaymentSubmissionDbUtil(submissionData);
        console.log("[ServerAction serverAddPaymentSubmission] addPaymentSubmissionDbUtil successful. Result:", JSON.stringify(result));
        if (!result) { throw new Error("addPaymentSubmissionDbUtil returned null or undefined"); }
        return result;
    } catch (error: any) {
        console.error("============================================================");
        console.error("[ServerAction serverAddPaymentSubmission] Error calling addPaymentSubmissionDbUtil. Full error details below.");
        if (error instanceof Error) {
          console.error("[ServerAction serverAddPaymentSubmission] Error name:", error.name);
          console.error("[ServerAction serverAddPaymentSubmission] Error message:", error.message);
          console.error("[ServerAction serverAddPaymentSubmission] Error stack:", error.stack);
        } else {
          console.error("[ServerAction serverAddPaymentSubmission] Non-Error object thrown:", error);
        }
        let detailedErrorMessage = error instanceof Error ? error.message : String(error);
        if (error.code) {
            console.error("[ServerAction serverAddPaymentSubmission] Prisma Error Code (from caught error):", error.code);
            detailedErrorMessage += ` (Prisma Code: ${error.code}`;
            if (error.meta) {
                console.error("[ServerAction serverAddPaymentSubmission] Prisma Error Meta (from caught error):", JSON.stringify(error.meta, null, 2));
                detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
            }
            detailedErrorMessage += `)`;
        }
        if (error.clientVersion) { console.error("[ServerAction serverAddPaymentSubmission] Prisma Client Version (from caught error):", error.clientVersion); }
        if (error.digest) { console.error("[ServerAction serverAddPaymentSubmission] Error Digest:", error.digest); }

        console.error("============================================================");
        const newError = new Error(`ServerAction serverAddPaymentSubmission failed: ${detailedErrorMessage}`);
        // @ts-ignore
        newError.digest = error.digest || error.code || `serverAddPaymentSubmission-error-${Date.now()}`;
        throw newError;
    }
}

// --- Admin Panel Payment Submission Review Actions ---
export async function serverGetAllPaymentSubmissions(filter?: { userId?: string }): Promise<PaymentSubmission[]> { return getPaymentSubmissionsFromDb(filter); }
export async function serverUpdatePaymentSubmissionStatus(
    submissionId: string,
    newStatus: PaymentSubmissionStatus,
    adminNotes?: string | null
): Promise<PaymentSubmission> {
    console.log(`[ServerAction serverUpdatePaymentSubmissionStatus] Updating submission ${submissionId} to ${newStatus}`);
    try {
        const result = await updatePaymentSubmissionDbUtil(submissionId, {
            status: newStatus,
            adminNotes: adminNotes === null ? undefined : adminNotes,
            reviewedAt: new Date()
        });
        console.log(`[ServerAction serverUpdatePaymentSubmissionStatus] Update successful for ${submissionId}. Result:`, JSON.stringify(result));
        return result;
    } catch (error: any) {
        console.error(`[ServerAction serverUpdatePaymentSubmissionStatus] Error updating payment submission status for ${submissionId}:`, error);
        if (error instanceof Error) {
          console.error(`[ServerAction serverUpdatePaymentSubmissionStatus] Error name:`, error.name);
          console.error(`[ServerAction serverUpdatePaymentSubmissionStatus] Error message:`, error.message);
          console.error(`[ServerAction serverUpdatePaymentSubmissionStatus] Error stack:`, error.stack);
        }
        let detailedErrorMessage = error instanceof Error ? error.message : String(error);
        if (error.code) {
            console.error(`[ServerAction serverUpdatePaymentSubmissionStatus] Prisma Error Code for ${submissionId}:`, error.code);
            detailedErrorMessage += ` (Prisma Code: ${error.code}`;
            if (error.meta) {
                console.error(`[ServerAction serverUpdatePaymentSubmissionStatus] Prisma Error Meta for ${submissionId}:`, JSON.stringify(error.meta, null, 2));
                detailedErrorMessage += `, Meta: ${JSON.stringify(error.meta)}`;
            }
            detailedErrorMessage += `)`;
        }
        const newError = new Error(`ServerAction serverUpdatePaymentSubmissionStatus failed for ${submissionId}: ${detailedErrorMessage}`);
        // @ts-ignore
        newError.digest = error.digest || error.code || `serverUpdatePaymentStatus-error-${Date.now()}`;
        throw newError;
    }
}

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
