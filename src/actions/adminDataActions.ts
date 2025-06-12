
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
  type QuizType,
  // Mock types for forms or data structures if still needed by components
  type Course as MockCourseType,
  type Quiz as MockQuizType,
  type Question as MockQuestionType,
  type Option as MockOptionType,
  type QuizType as MockQuizEnumType,
} from '@/lib/dbUtils'; // Re-exporting from dbUtils which gets them from @prisma/client or mockData

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
  courseData: Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'> & { 
    categoryName: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>>> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }> }>
  }
): Promise<Course> {
  return addCourseToDb(courseData);
}

export async function serverUpdateCourse(
  courseId: string, 
  courseData: Partial<Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'>> & { 
    categoryName?: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { id?: string, lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>> & {id?: string}> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { id?: string, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { id?: string, options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>> & {id?:string}>, correctOptionText?: string }> }>
  }
): Promise<Course> {
  return updateCourseInDb(courseId, courseData);
}

export async function serverDeleteCourse(courseId: string): Promise<void> {
  return deleteCourseFromDb(courseId);
}

// This function expects MockQuizType for its quizData argument based on its usage in CourseManagement
// but dbUtils.saveQuizWithQuestionsToDb is typed to return Prisma Quiz. We need to ensure consistency or map.
// For now, keeping the MockQuizType input as CourseManagement uses it for form state.
export async function serverSaveQuizWithQuestions(
    courseIdForQuiz: string,
    quizData: MockQuizType & { questionsToUpsert?: any[], questionIdsToDelete?: string[] }
): Promise<Quiz> { // Returns Prisma Quiz type
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

// Note: Video, PaymentSettings, User seeding use localStorage or in-memory stores and their dbUtils functions
// are already client-side or server-side compatible respectively.
// If they were to be migrated to Prisma, similar server actions would be needed.
// For ImageManagement, some of its update functions (like updateCourseInDb) are covered above.
// updateVideoInDb is client-side (localStorage), so it doesn't need a server action unless videos move to DB.

