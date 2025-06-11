
import { 
  users as mockUsers,
  courses_DEPRECATED_USE_FIRESTORE as mockCourses, // Use the deprecated name as it was used before
  initialCategoriesData as mockCategories,
  videos_DEPRECATED_USE_FIRESTORE as mockVideos, // Use the deprecated name
  initialLearningPaths_DEPRECATED_USE_FIRESTORE as mockLearningPaths,
  initialPaymentSettings as mockDefaultPaymentSettings,
  paymentSubmissions_DEPRECATED_USE_FIRESTORE as mockPaymentSubmissions,
  enrollments_DEPRECATED_USE_FIRESTORE as mockEnrollments,

  mockCoursesForSeeding,
  mockCategoriesForSeeding,
  mockVideosForSeeding,
  mockLearningPathsForSeeding,
  // types
  type Course,
  type Category,
  type Video,
  type LearningPath,
  type PaymentSettings,
  type PaymentSubmission,
  type Enrollment,
  type PaymentSubmissionStatus,
  type QuizType,
  type User,
  type Module,
  type Lesson,
  type Quiz,
  type Question,
  type Option
} from '@/data/mockData';
import { seedInitialUsersToLocalStorage } from './authUtils'; // For seeding users

// Re-export types for convenience in components
export type { 
    Category, Course, Module, Lesson, Quiz, Question, Option, 
    Video, LearningPath, PaymentSettings, PaymentSubmission, Enrollment, User,
    PaymentSubmissionStatus, QuizType
};


// Helper to get data from localStorage or fallback to mock
const getStoredData = <T>(key: string, fallbackData: T[]): T[] => {
  if (typeof window === 'undefined') return [...fallbackData]; // Return copy for server
  const storedJson = localStorage.getItem(key);
  if (storedJson) {
    try {
      return JSON.parse(storedJson);
    } catch (e) {
      console.error(`Error parsing ${key} from localStorage`, e);
      localStorage.setItem(key, JSON.stringify(fallbackData)); // Reset with fallback
      return [...fallbackData]; // Return copy
    }
  } else {
    localStorage.setItem(key, JSON.stringify(fallbackData));
    return [...fallbackData]; // Return copy
  }
};

// Helper to save data to localStorage
const saveStoredData = <T>(key: string, data: T[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// --- Category Functions ---
export const getCategoriesFromDb = async (): Promise<Category[]> => {
  return Promise.resolve(getStoredData('adminCategories', mockCategories));
};
export const addCategoryToDb = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
  const newCategory: Category = { 
    id: `cat-${Date.now()}`, 
    ...categoryData, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  const categories = getStoredData('adminCategories', mockCategories);
  categories.push(newCategory);
  saveStoredData('adminCategories', categories);
  return Promise.resolve(newCategory);
};
export const updateCategoryInDb = async (categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category> => {
  let categories = getStoredData('adminCategories', mockCategories);
  const index = categories.findIndex(c => c.id === categoryId);
  if (index === -1) throw new Error("Category not found");
  categories[index] = { ...categories[index], ...categoryData, updatedAt: new Date().toISOString() };
  saveStoredData('adminCategories', categories);
  return Promise.resolve(categories[index]);
};
export const deleteCategoryFromDb = async (categoryId: string): Promise<void> => {
  let categories = getStoredData('adminCategories', mockCategories);
  categories = categories.filter(c => c.id !== categoryId);
  saveStoredData('adminCategories', categories);
  return Promise.resolve();
};

// --- Course Functions ---
export const getCoursesFromDb = async (): Promise<Course[]> => {
  // Add categoryNameCache if missing, for compatibility with previous Prisma structure
  const courses = getStoredData('adminCourses', mockCourses).map(course => ({
      ...course,
      categoryNameCache: course.category, // Assuming 'category' field holds the name
  }));
  return Promise.resolve(courses);
};

export const getCourseByIdFromDb = async (courseId: string): Promise<Course | null> => {
  const courses = await getCoursesFromDb();
  const course = courses.find(c => c.id === courseId) || null;
  return Promise.resolve(course ? { ...course, categoryNameCache: course.category } : null);
};

export const addCourseToDb = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'categoryNameCache'> & { categoryName?: string, modulesData?: any[], quizzesData?: any[] }): Promise<Course> => {
  const { categoryName, modulesData, quizzesData, ...mainCourseData } = courseData;
  const newCourse: Course = {
    id: `course-${Date.now()}`,
    ...mainCourseData,
    category: categoryName || "General", // Store category name in 'category' field
    // Modules and quizzes need to be structured according to mockData types
    modules: modulesData?.map((mod: any, modIdx: number) => ({
      id: mod.id || `m${Date.now()}${modIdx}`,
      title: mod.title,
      order: mod.order,
      lessons: mod.lessonsData?.map((les: any, lesIdx: number) => ({
        id: les.id || `l${Date.now()}${modIdx}${lesIdx}`,
        title: les.title,
        duration: les.duration,
        description: les.description,
        embedUrl: les.embedUrl,
        imageUrl: les.imageUrl,
        order: les.order,
      })) || [],
    })) || [],
    quizzes: quizzesData?.map((quiz: any, quizIdx: number) => ({
      id: quiz.id || `quiz-${Date.now()}${quizIdx}`,
      title: quiz.title,
      quizType: quiz.quizType as 'practice' | 'graded',
      passingScore: quiz.passingScore,
      questions: quiz.questionsData?.map((q: any, qIdx: number) => ({
        id: q.id || `q-${Date.now()}${quizIdx}${qIdx}`,
        text: q.text,
        points: q.points,
        order: q.order,
        options: q.optionsData?.map((opt: any, optIdx: number) => ({
          id: opt.id || `opt-${Date.now()}${quizIdx}${qIdx}${optIdx}`,
          text: opt.text,
        })) || [],
        correctOptionId: q.optionsData?.find((opt: any) => opt.text === q.correctOptionText)?.id || q.optionsData?.[0]?.id || '', // Simplified
      })) || [],
    })) || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const courses = getStoredData('adminCourses', mockCourses);
  courses.push(newCourse);
  saveStoredData('adminCourses', courses);
  return Promise.resolve(newCourse);
};

export const updateCourseInDb = async (courseId: string, courseData: Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'categoryNameCache'>> & { categoryName?: string, modulesData?: any[], quizzesData?: any[] }): Promise<Course> => {
  let courses = getStoredData('adminCourses', mockCourses);
  const index = courses.findIndex(c => c.id === courseId);
  if (index === -1) throw new Error("Course not found");

  const { categoryName, modulesData, quizzesData, ...mainCourseData } = courseData;
  
  const updatedCourseData = {
    ...courses[index],
    ...mainCourseData,
    category: categoryName || courses[index].category,
    updatedAt: new Date().toISOString(),
  };

  if (modulesData) {
    updatedCourseData.modules = modulesData.map((mod: any, modIdx: number) => ({
      id: mod.id || courses[index].modules?.[modIdx]?.id || `m${Date.now()}${modIdx}`,
      title: mod.title,
      order: mod.order,
      lessons: mod.lessonsData?.map((les: any, lesIdx: number) => ({
        id: les.id || courses[index].modules?.[modIdx]?.lessons?.[lesIdx]?.id || `l${Date.now()}${modIdx}${lesIdx}`,
        title: les.title,
        duration: les.duration,
        description: les.description,
        embedUrl: les.embedUrl,
        imageUrl: les.imageUrl,
        order: les.order,
      })) || [],
    }));
  }
  if (quizzesData) {
     updatedCourseData.quizzes = quizzesData.map((quiz: any, quizIdx: number) => ({
      id: quiz.id || courses[index].quizzes?.[quizIdx]?.id || `quiz-${Date.now()}${quizIdx}`,
      title: quiz.title,
      quizType: quiz.quizType as 'practice' | 'graded',
      passingScore: quiz.passingScore,
      questions: quiz.questionsData?.map((q: any, qIdx: number) => ({
        id: q.id || courses[index].quizzes?.[quizIdx]?.questions?.[qIdx]?.id || `q-${Date.now()}${quizIdx}${qIdx}`,
        text: q.text,
        points: q.points,
        order: q.order,
        options: q.optionsData?.map((opt: any, optIdx: number) => ({
          id: opt.id || courses[index].quizzes?.[quizIdx]?.questions?.[qIdx]?.options?.[optIdx]?.id || `opt-${Date.now()}${quizIdx}${qIdx}${optIdx}`,
          text: opt.text,
        })) || [],
        correctOptionId: q.optionsData?.find((opt: any) => opt.text === q.correctOptionText)?.id || q.optionsData?.[0]?.id || '', // Simplified
      })) || [],
    }));
  }

  courses[index] = updatedCourseData;
  saveStoredData('adminCourses', courses);
  return Promise.resolve(courses[index]);
};

export const deleteCourseFromDb = async (courseId: string): Promise<void> => {
  let courses = getStoredData('adminCourses', mockCourses);
  courses = courses.filter(c => c.id !== courseId);
  saveStoredData('adminCourses', courses);
  // Also remove enrollments and payment submissions for this course
  let enrollments = getStoredData('userEnrollments', mockEnrollments);
  enrollments = enrollments.filter(e => e.courseId !== courseId);
  saveStoredData('userEnrollments', enrollments);
  let payments = getStoredData('paymentSubmissions', mockPaymentSubmissions);
  payments = payments.filter(p => p.courseId !== courseId);
  saveStoredData('paymentSubmissions', payments);
  return Promise.resolve();
};

// --- Video Functions ---
export const getVideosFromDb = async (): Promise<Video[]> => {
  return Promise.resolve(getStoredData('adminVideos', mockVideos));
};
export const addVideoToDb = async (videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> => {
  const newVideo: Video = { 
    id: `vid-${Date.now()}`, 
    ...videoData, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  const videos = getStoredData('adminVideos', mockVideos);
  videos.unshift(newVideo); // Add to the beginning
  saveStoredData('adminVideos', videos);
  return Promise.resolve(newVideo);
};
export const updateVideoInDb = async (videoId: string, videoData: Partial<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Video> => {
  let videos = getStoredData('adminVideos', mockVideos);
  const index = videos.findIndex(v => v.id === videoId);
  if (index === -1) throw new Error("Video not found");
  videos[index] = { ...videos[index], ...videoData, updatedAt: new Date().toISOString() };
  saveStoredData('adminVideos', videos);
  return Promise.resolve(videos[index]);
};
export const deleteVideoFromDb = async (videoId: string): Promise<void> => {
  let videos = getStoredData('adminVideos', mockVideos);
  videos = videos.filter(v => v.id !== videoId);
  saveStoredData('adminVideos', videos);
  return Promise.resolve();
};

// --- LearningPath Functions ---
export const getLearningPathsFromDb = async (): Promise<LearningPath[]> => {
  const paths = getStoredData('adminLearningPaths', mockLearningPaths);
  // Simulate populating course details for display (not true relational join)
  const allCourses = await getCoursesFromDb();
  return Promise.resolve(paths.map(p => ({
    ...p,
    // @ts-ignore // Simulate the nested structure Prisma provided
    courses: p.courseIds.map(cid => {
        const course = allCourses.find(c => c.id === cid);
        return course ? { course } : null;
    }).filter(Boolean)
  })));
};
export const addLearningPathToDb = async (pathData: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt'> & { courseIdsToConnect?: string[] }): Promise<LearningPath> => {
  const { courseIdsToConnect, ...restData } = pathData;
  const newPath: LearningPath = { 
    id: `lp-${Date.now()}`, 
    ...restData, 
    courseIds: courseIdsToConnect || [], 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  const paths = getStoredData('adminLearningPaths', mockLearningPaths);
  paths.push(newPath);
  saveStoredData('adminLearningPaths', paths);
  return Promise.resolve(newPath);
};
export const updateLearningPathInDb = async (pathId: string, pathData: Partial<Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt'>> & { courseIdsToConnect?: string[] }): Promise<LearningPath> => {
  let paths = getStoredData('adminLearningPaths', mockLearningPaths);
  const index = paths.findIndex(p => p.id === pathId);
  if (index === -1) throw new Error("Learning Path not found");
  const { courseIdsToConnect, ...restData } = pathData;
  paths[index] = { 
    ...paths[index], 
    ...restData, 
    courseIds: courseIdsToConnect !== undefined ? courseIdsToConnect : paths[index].courseIds, 
    updatedAt: new Date().toISOString() 
  };
  saveStoredData('adminLearningPaths', paths);
  return Promise.resolve(paths[index]);
};
export const deleteLearningPathFromDb = async (pathId: string): Promise<void> => {
  let paths = getStoredData('adminLearningPaths', mockLearningPaths);
  paths = paths.filter(p => p.id !== pathId);
  saveStoredData('adminLearningPaths', paths);
  return Promise.resolve();
};

// --- PaymentSettings ---
export const getPaymentSettingsFromDb = async (): Promise<PaymentSettings | null> => {
  const settingsArray = getStoredData('paymentSettingsGlobal', [mockDefaultPaymentSettings]);
  return Promise.resolve(settingsArray[0] || null);
};
export const savePaymentSettingsToDb = async (settingsData: Omit<PaymentSettings, 'updatedAt'>): Promise<PaymentSettings> => {
  const updatedSettings = { ...settingsData, updatedAt: new Date().toISOString() };
  saveStoredData('paymentSettingsGlobal', [updatedSettings]); // Store as an array with one item
  return Promise.resolve(updatedSettings);
};

// --- PaymentSubmission ---
export const getPaymentSubmissionsFromDb = async (): Promise<PaymentSubmission[]> => {
  const submissions = getStoredData('paymentSubmissions', mockPaymentSubmissions);
  const allUsers = getStoredData('managedUsers', mockUsers); // Assuming users are in localStorage too
  const allCourses = getStoredData('adminCourses', mockCourses);

  return Promise.resolve(submissions.map(sub => ({
    ...sub,
    // @ts-ignore
    user: allUsers.find(u => u.id === sub.userId),
    // @ts-ignore
    course: allCourses.find(c => c.id === sub.courseId),
  })).sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
};

export const addPaymentSubmissionToDb = async (submissionData: Omit<PaymentSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes'> & { userId: string, courseId: string }): Promise<PaymentSubmission> => {
  const newSubmission: PaymentSubmission = {
    id: `ps-${Date.now()}`,
    ...submissionData,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const submissions = getStoredData('paymentSubmissions', mockPaymentSubmissions);
  submissions.push(newSubmission);
  saveStoredData('paymentSubmissions', submissions);
  return Promise.resolve(newSubmission);
};
export const updatePaymentSubmissionInDb = async (submissionId: string, dataToUpdate: { status: PaymentSubmissionStatus, adminNotes?: string, reviewedAt?: Date }): Promise<PaymentSubmission> => {
  let submissions = getStoredData('paymentSubmissions', mockPaymentSubmissions);
  const index = submissions.findIndex(s => s.id === submissionId);
  if (index === -1) throw new Error("Payment Submission not found");
  submissions[index] = { 
    ...submissions[index], 
    status: dataToUpdate.status,
    adminNotes: dataToUpdate.adminNotes || submissions[index].adminNotes,
    reviewedAt: dataToUpdate.reviewedAt?.toISOString() || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveStoredData('paymentSubmissions', submissions);
  return Promise.resolve(submissions[index]);
};

// --- Enrollment ---
export const getEnrollmentForUserAndCourseFromDb = async (userId: string, courseId: string): Promise<Enrollment | null> => {
  const enrollments = getStoredData('userEnrollments', mockEnrollments);
  return Promise.resolve(enrollments.find(e => e.userId === userId && e.courseId === courseId) || null);
};
export const createEnrollmentInDb = async (userId: string, courseId: string): Promise<Enrollment> => {
  const newEnrollment: Enrollment = {
    id: `enr-${Date.now()}`,
    userId,
    courseId,
    progress: 0,
    enrolledDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const enrollments = getStoredData('userEnrollments', mockEnrollments);
  enrollments.push(newEnrollment);
  saveStoredData('userEnrollments', enrollments);
  return Promise.resolve(newEnrollment);
};
export const updateEnrollmentProgressInDb = async (enrollmentId: string, progress: number): Promise<Enrollment> => {
  let enrollments = getStoredData('userEnrollments', mockEnrollments);
  const index = enrollments.findIndex(e => e.id === enrollmentId);
  if (index === -1) throw new Error("Enrollment not found");
  enrollments[index] = { ...enrollments[index], progress, updatedAt: new Date().toISOString() };
  saveStoredData('userEnrollments', enrollments);
  return Promise.resolve(enrollments[index]);
};
export const getEnrollmentsByUserIdFromDb = async (userId: string): Promise<Enrollment[]> => {
  const enrollments = getStoredData('userEnrollments', mockEnrollments);
  const userEnrollments = enrollments.filter(e => e.userId === userId);
  const allCourses = await getCoursesFromDb(); // To "join" course data
  return Promise.resolve(userEnrollments.map(e => ({
    ...e,
    // @ts-ignore
    course: allCourses.find(c => c.id === e.courseId)
  })).sort((a,b) => new Date(b.enrolledDate).getTime() - new Date(a.enrolledDate).getTime() ));
};

// Quiz Data Persistence (Example for CourseForm - saveQuizWithQuestionsToDb)
// This is complex to fully replicate without a DB. We'll store quizzes as part of the course in localStorage.
export const saveQuizWithQuestionsToDb = async (
    courseId: string, 
    quizData: Quiz & { questionsToUpsert?: any[], questionIdsToDelete?: string[] }
): Promise<Quiz> => {
    let courses = getStoredData('adminCourses', mockCourses);
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) throw new Error("Course not found to save quiz");

    const course = courses[courseIndex];
    if (!course.quizzes) course.quizzes = [];

    const quizIndex = course.quizzes.findIndex(q => q.id === quizData.id);
    
    const newQuizStructure: Quiz = {
        id: quizData.id || `quiz-${Date.now()}`,
        title: quizData.title,
        quizType: quizData.quizType,
        passingScore: quizData.passingScore,
        questions: (quizData.questionsToUpsert || []).map((qData: any, qIdx: number) => {
            const correctOptText = qData.correctOptionTextForNew;
            const options: Option[] = (qData.optionsToCreate || []).map((optData: any, optIdx: number) => ({
                id: optData.id || `opt-${Date.now()}${qIdx}${optIdx}`,
                text: optData.text,
            }));
            const correctOption = options.find(o => o.text === correctOptText);
            return {
                id: qData.id || `q-${Date.now()}${qIdx}`,
                text: qData.text,
                order: qData.order,
                points: qData.points,
                options: options,
                correctOptionId: correctOption?.id || options[0]?.id || '', // Fallback
            };
        })
    };

    if (quizIndex > -1) {
        course.quizzes[quizIndex] = newQuizStructure;
    } else {
        course.quizzes.push(newQuizStructure);
    }
    
    courses[courseIndex] = course;
    saveStoredData('adminCourses', courses);
    return Promise.resolve(newQuizStructure);
};


// --- Seeding Functions for localStorage ---
export const seedCoursesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  localStorage.setItem('adminCourses', JSON.stringify(mockCoursesForSeeding));
  return { successCount: mockCoursesForSeeding.length, errorCount: 0, skippedCount: 0 };
};
export const seedCategoriesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  localStorage.setItem('adminCategories', JSON.stringify(mockCategoriesForSeeding));
  return { successCount: mockCategoriesForSeeding.length, errorCount: 0, skippedCount: 0 };
};
export const seedVideosToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  localStorage.setItem('adminVideos', JSON.stringify(mockVideosForSeeding));
  return { successCount: mockVideosForSeeding.length, errorCount: 0, skippedCount: 0 };
};
export const seedLearningPathsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  localStorage.setItem('adminLearningPaths', JSON.stringify(mockLearningPathsForSeeding));
  return { successCount: mockLearningPathsForSeeding.length, errorCount: 0, skippedCount: 0 };
};
export const seedPaymentSettingsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  localStorage.setItem('paymentSettingsGlobal', JSON.stringify([mockDefaultPaymentSettings]));
  return { successCount: 1, errorCount: 0, skippedCount: 0 };
};

// Also ensure managedUsers are seeded via authUtils's seedInitialUsersToLocalStorage
// which is called by DataSeeding.tsx
