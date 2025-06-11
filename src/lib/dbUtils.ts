
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
import { z } from 'zod';

// Re-export types for convenience in components
export type { 
    Category, Course, Module, Lesson, Quiz, Question, Option, 
    Video, LearningPath, PaymentSettings, PaymentSubmission, Enrollment, User,
    PaymentSubmissionStatus, QuizType
};

// Zod Schemas for Input Validation
const CategoryInputSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  dataAiHint: z.string().max(50, "AI hint too long").optional().nullable(),
  iconName: z.string().optional().nullable(),
});

const OptionInputSchema = z.object({
  id: z.string().optional(), // Optional for new options
  text: z.string().min(1, "Option text is required"),
});

const QuestionInputSchema = z.object({
  id: z.string().optional(), // Optional for new questions
  text: z.string().min(1, "Question text is required"),
  optionsData: z.array(OptionInputSchema).min(2, "At least two options are required"),
  correctOptionText: z.string().min(1, "Correct option text is required"),
  points: z.number().int().optional(),
  order: z.number().int().optional(),
});

const QuizInputSchema = z.object({
  id: z.string().optional(), // Optional for new quizzes
  title: z.string().min(1, "Quiz title is required"),
  quizType: z.enum(['practice', 'graded']),
  passingScore: z.number().int().min(0).max(100).optional(),
  questionsData: z.array(QuestionInputSchema).optional(),
});

const LessonInputSchema = z.object({
  id: z.string().optional(), // Optional for new lessons
  title: z.string().min(1, "Lesson title is required"),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().optional().nullable(),
  embedUrl: z.string().url("Invalid embed URL").optional().nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  order: z.number().int().optional(),
});

const ModuleInputSchema = z.object({
  id: z.string().optional(), // Optional for new modules
  title: z.string().min(1, "Module title is required"),
  order: z.number().int().optional(),
  lessonsData: z.array(LessonInputSchema).optional(),
});

const CourseInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryName: z.string().min(1, "Category name is required"),
  instructor: z.string().min(1, "Instructor name is required"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  dataAiHint: z.string().max(50, "AI hint too long").optional().nullable(),
  price: z.number().min(0).optional(),
  currency: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  learningObjectives: z.array(z.string()).optional(),
  targetAudience: z.string().optional().nullable(),
  prerequisites: z.array(z.string()).optional(),
  estimatedTimeToComplete: z.string().optional().nullable(),
  modulesData: z.array(ModuleInputSchema).optional(),
  quizzesData: z.array(QuizInputSchema).optional(),
});

const AddPaymentSubmissionInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  screenshotUrl: z.string().refine(val => val.startsWith('data:image/'), {
    message: "Screenshot must be a valid data URI image (e.g., starts with 'data:image/').",
  }),
});

const VideoInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional().nullable(),
  embedUrl: z.string().min(1, "Embed URL is required").url("Invalid embed URL").refine(val => val.includes("youtube.com") || val.includes("tiktok.com"), {
    message: "Embed URL must be a valid YouTube or TikTok URL."
  }),
  dataAiHint: z.string().max(50, "AI hint too long").optional().nullable(),
});

const LearningPathInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().optional().nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  dataAiHint: z.string().max(50, "AI hint too long").optional().nullable(),
  courseIdsToConnect: z.array(z.string()).optional(),
});

const PaymentSettingsInputSchema = z.object({
  bankName: z.string().max(100, "Bank name too long").optional().nullable(),
  accountNumber: z.string().max(50, "Account number too long").optional().nullable(),
  accountHolderName: z.string().max(100, "Account holder name too long").optional().nullable(),
  additionalInstructions: z.string().max(500, "Instructions too long").optional().nullable(),
});


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
  const validation = CategoryInputSchema.safeParse(categoryData);
  if (!validation.success) {
    console.error("Category validation failed (add):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data.");
  }
  const newCategory: Category = { 
    id: `cat-${Date.now()}`, 
    ...validation.data, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  const categories = getStoredData('adminCategories', mockCategories);
  categories.push(newCategory);
  saveStoredData('adminCategories', categories);
  return Promise.resolve(newCategory);
};
export const updateCategoryInDb = async (categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category> => {
  const validation = CategoryInputSchema.partial().safeParse(categoryData);
   if (!validation.success) {
    console.error("Category validation failed (update):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data for update.");
  }
  let categories = getStoredData('adminCategories', mockCategories);
  const index = categories.findIndex(c => c.id === categoryId);
  if (index === -1) throw new Error("Category not found");
  categories[index] = { ...categories[index], ...validation.data, updatedAt: new Date().toISOString() };
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
  const validation = CourseInputSchema.safeParse(courseData);
  if (!validation.success) {
    console.error("Course validation failed (add):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data.");
  }
  const { categoryName, modulesData, quizzesData, ...mainCourseData } = validation.data;
  const newCourse: Course = {
    id: `course-${Date.now()}`,
    ...mainCourseData,
    category: categoryName || "General", // Store category name in 'category' field
    modules: modulesData?.map((mod: any, modIdx: number) => ({
      id: mod.id || `m${Date.now()}${modIdx}`,
      title: mod.title,
      // @ts-ignore // order not in mock Module, but present in CourseForm for structure
      order: mod.order,
      lessons: mod.lessonsData?.map((les: any, lesIdx: number) => ({
        id: les.id || `l${Date.now()}${modIdx}${lesIdx}`,
        title: les.title,
        duration: les.duration,
        description: les.description,
        embedUrl: les.embedUrl,
        imageUrl: les.imageUrl,
        // @ts-ignore // order not in mock Lesson, but present in CourseForm for structure
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
        // @ts-ignore // order not in mock Question, but present in CourseForm for structure
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
  const validation = CourseInputSchema.partial().safeParse(courseData);
  if (!validation.success) {
    console.error("Course validation failed (update):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data for update.");
  }
  let courses = getStoredData('adminCourses', mockCourses);
  const index = courses.findIndex(c => c.id === courseId);
  if (index === -1) throw new Error("Course not found");

  const { categoryName, modulesData, quizzesData, ...mainCourseData } = validation.data;
  
  const updatedCourseData: Course = { // Explicitly type this
    ...courses[index],
    ...mainCourseData,
    category: categoryName || courses[index].category,
    updatedAt: new Date().toISOString(),
    // Ensure modules and quizzes are at least empty arrays if not provided or empty in validation.data
    modules: [], 
    quizzes: [],
  };

  if (modulesData) {
    updatedCourseData.modules = modulesData.map((mod: any, modIdx: number) => ({
      id: mod.id || courses[index].modules?.[modIdx]?.id || `m${Date.now()}${modIdx}`,
      title: mod.title,
      // @ts-ignore
      order: mod.order,
      lessons: mod.lessonsData?.map((les: any, lesIdx: number) => ({
        id: les.id || courses[index].modules?.[modIdx]?.lessons?.[lesIdx]?.id || `l${Date.now()}${modIdx}${lesIdx}`,
        title: les.title,
        duration: les.duration,
        description: les.description,
        embedUrl: les.embedUrl,
        imageUrl: les.imageUrl,
        // @ts-ignore
        order: les.order,
      })) || [],
    }));
  } else if (courses[index].modules) { // Retain existing modules if not updated
    updatedCourseData.modules = courses[index].modules!;
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
        // @ts-ignore
        order: q.order,
        options: q.optionsData?.map((opt: any, optIdx: number) => ({
          id: opt.id || courses[index].quizzes?.[quizIdx]?.questions?.[qIdx]?.options?.[optIdx]?.id || `opt-${Date.now()}${quizIdx}${qIdx}${optIdx}`,
          text: opt.text,
        })) || [],
        correctOptionId: q.optionsData?.find((opt: any) => opt.text === q.correctOptionText)?.id || q.optionsData?.[0]?.id || '', // Simplified
      })) || [],
    }));
  } else if (courses[index].quizzes) { // Retain existing quizzes if not updated
    updatedCourseData.quizzes = courses[index].quizzes!;
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
  const validation = VideoInputSchema.safeParse(videoData);
  if (!validation.success) {
    console.error("Video validation failed (add):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid video data.");
  }
  const newVideo: Video = { 
    id: `vid-${Date.now()}`, 
    ...validation.data, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  const videos = getStoredData('adminVideos', mockVideos);
  videos.unshift(newVideo); // Add to the beginning
  saveStoredData('adminVideos', videos);
  return Promise.resolve(newVideo);
};
export const updateVideoInDb = async (videoId: string, videoData: Partial<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Video> => {
  const validation = VideoInputSchema.partial().safeParse(videoData);
  if (!validation.success) {
    console.error("Video validation failed (update):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid video data for update.");
  }
  let videos = getStoredData('adminVideos', mockVideos);
  const index = videos.findIndex(v => v.id === videoId);
  if (index === -1) throw new Error("Video not found");
  videos[index] = { ...videos[index], ...validation.data, updatedAt: new Date().toISOString() };
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
        return course ? { courseId: course.id, course } : null; // Ensure structure for form
    }).filter(Boolean)
  })));
};
export const addLearningPathToDb = async (pathData: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt' | 'courses'> & { courseIdsToConnect?: string[] }): Promise<LearningPath> => {
  const validation = LearningPathInputSchema.safeParse(pathData);
  if (!validation.success) {
    console.error("Learning Path validation failed (add):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid learning path data.");
  }
  const { courseIdsToConnect, ...restData } = validation.data;
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
export const updateLearningPathInDb = async (pathId: string, pathData: Partial<Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt' | 'courses'>> & { courseIdsToConnect?: string[] }): Promise<LearningPath> => {
  const validation = LearningPathInputSchema.partial().safeParse(pathData);
   if (!validation.success) {
    console.error("Learning Path validation failed (update):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid learning path data for update.");
  }
  let paths = getStoredData('adminLearningPaths', mockLearningPaths);
  const index = paths.findIndex(p => p.id === pathId);
  if (index === -1) throw new Error("Learning Path not found");
  const { courseIdsToConnect, ...restData } = validation.data;
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
export const savePaymentSettingsToDb = async (settingsData: Omit<PaymentSettings, 'id'| 'updatedAt'>): Promise<PaymentSettings> => {
  const validation = PaymentSettingsInputSchema.safeParse(settingsData);
  if (!validation.success) {
    console.error("Payment settings validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid payment settings data.");
  }
  const updatedSettings = { ...validation.data, id:'global', updatedAt: new Date().toISOString() };
  saveStoredData('paymentSettingsGlobal', [updatedSettings as PaymentSettings]); // Store as an array with one item
  return Promise.resolve(updatedSettings as PaymentSettings);
};

// --- PaymentSubmission ---
export const getPaymentSubmissionsFromDb = async (): Promise<PaymentSubmission[]> => {
  const submissions = getStoredData('paymentSubmissions', mockPaymentSubmissions);
  const allUsers = getStoredData('managedUsers_hashed', mockUsers); // Use the correct key for managed users
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
  const validation = AddPaymentSubmissionInputSchema.safeParse(submissionData);
  if (!validation.success) {
    console.error("Payment submission validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid payment submission data.");
  }
  const newSubmission: PaymentSubmission = {
    id: `ps-${Date.now()}`,
    ...validation.data,
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
  // Add Zod validation if needed for status and adminNotes
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
                // @ts-ignore
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

