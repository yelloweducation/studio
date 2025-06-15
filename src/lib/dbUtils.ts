
import prisma from './prisma';
import type { Prisma } from '@prisma/client';
import {
  mockCoursesForSeeding,
  mockCategoriesForSeeding,
  mockLearningPathsForSeeding,
  initialPaymentSettings as mockDefaultPaymentSettingsData,
  mockVideosForSeeding,
} from '@/data/mockData';
import { QuizType as PrismaQuizTypeEnum, type SitePage, type Course, type Category, type LearningPath, type Module, type Lesson, type Quiz, type Question, type Option, type QuizType as PrismaQuizTypeTypeAlias, type PaymentSettings, type PaymentSubmission, type Enrollment, type User, type PaymentSubmissionStatus as PrismaPaymentStatus, type Video as PrismaVideoType, type Certificate as PrismaCertificate, type CourseQuiz } from '@prisma/client';
import { z } from 'zod';

console.log("[dbUtils-Prisma] Loading dbUtils.ts module. DATABASE_URL from env (initial check):", process.env.DATABASE_URL ? "Exists" : "NOT FOUND/EMPTY");
if (process.env.DATABASE_URL) {
  console.log("[dbUtils-Prisma] DATABASE_URL (first 30 chars for initial check):", process.env.DATABASE_URL.substring(0, 30) + "...");
}

export type {
    Category, Course, Module, Lesson, Quiz, Question, Option, SitePage, Video as PrismaVideo, CourseQuiz,
    LearningPath, User, PaymentSettings, PaymentSubmission, Enrollment, PrismaCertificate as Certificate,
    PrismaPaymentStatus as PaymentSubmissionStatus,
    PrismaQuizTypeTypeAlias as QuizType
};

// Video Type (mock for localStorage, matches PrismaVideoType structure as much as possible)
export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  embedUrl: string; // Keep as non-nullable for form consistency
  dataAiHint?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};


const CategoryInputSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  dataAiHint: z.string().max(100, "AI hint too long").optional().nullable(),
  iconName: z.string().optional().nullable(),
});

const OptionInputSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Option text is required"),
});

const QuestionInputSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Question text is required"),
  order: z.number().int().default(0),
  points: z.number().int().optional().nullable(),
  options: z.array(OptionInputSchema).min(1, "At least one option is required"),
  correctOptionId: z.string().optional().nullable(),
  correctOptionText: z.string().optional().nullable(),
});

const QuizInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Quiz title is required"),
  quizType: z.string().transform(val => val.toUpperCase()).pipe(z.nativeEnum(PrismaQuizTypeEnum)),
  passingScore: z.number().int().min(0).max(100).optional().nullable(),
  questions: z.array(QuestionInputSchema).optional(),
  courseIdsToConnect: z.array(z.string()).optional(), // For M2M linking
});

const LessonInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Lesson title is required"),
  duration: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  embedUrl: z.string().url("Invalid embed URL").optional().nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  order: z.number().int().default(0),
});

const ModuleInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Module title is required"),
  order: z.number().int().default(0),
  lessons: z.array(LessonInputSchema).optional(),
});

const CourseInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryName: z.string().min(1, "Category name is required"),
  instructor: z.string().min(1, "Instructor name is required"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  dataAiHint: z.string().max(100, "AI hint too long").optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  currency: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  learningObjectives: z.array(z.string()).optional(),
  targetAudience: z.string().optional().nullable(),
  prerequisites: z.array(z.string()).optional(),
  estimatedTimeToComplete: z.string().optional().nullable(),
  modules: z.array(ModuleInputSchema).optional(),
  quizIdsToConnect: z.array(z.string()).optional(), // Replaced quizzes array
});

const VideoInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional().nullable(),
  embedUrl: z.string().min(1, "Embed URL is required").url("Invalid embed URL").refine(val => val.includes("youtube.com") || val.includes("tiktok.com") || val.includes("drive.google.com"), {
    message: "Embed URL must be a valid YouTube, TikTok, or Google Drive URL."
  }),
  dataAiHint: z.string().max(100, "AI hint too long").optional().nullable(),
});


const LearningPathInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().optional().nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  dataAiHint: z.string().max(100, "AI hint too long").optional().nullable(),
  courseIdsToConnect: z.array(z.string()).optional(),
});

const PaymentSubmissionInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  screenshotUrl: z.string().url("Screenshot URL must be a valid URL.").refine(val => val.startsWith('data:image/') || val.startsWith('http') || val.startsWith('https'), {
    message: "Screenshot must be a valid data URI image or an HTTP(S) URL.",
  }),
});

const PaymentSettingsInputSchema = z.object({
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  accountHolderName: z.string().optional().nullable(),
  additionalInstructions: z.string().optional().nullable(),
});

const SitePageInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.any(),
});

const CertificateInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  certificateUrl: z.string().url("Invalid URL for certificate").optional().nullable(),
});


// --- Helper for localStorage (for entities still using localStorage) ---
const getStoredData = <T>(key: string, fallbackData: T[]): T[] => {
  if (typeof window === 'undefined') return [...fallbackData];
  const storedJson = localStorage.getItem(key);
  if (storedJson) {
    try { return JSON.parse(storedJson); } catch (e) { console.error(`Error parsing ${key}`, e); localStorage.setItem(key, JSON.stringify(fallbackData)); return [...fallbackData]; }
  } else { localStorage.setItem(key, JSON.stringify(fallbackData)); return [...fallbackData]; }
};
const saveStoredData = <T>(key: string, data: T[]) => {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(data));
};


// --- Category Functions (Using Prisma) ---
export const getCategoriesFromDb = async (): Promise<Category[]> => {
  console.log("[dbUtils-Prisma] getCategoriesFromDb: Fetching categories...");
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    console.log("[dbUtils-Prisma] getCategoriesFromDb: Found categories:", categories.length);
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("[dbUtils-Prisma] getCategoriesFromDb: Error fetching categories:", error);
    throw error;
  }
};
export const addCategoryToDb = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>): Promise<Category> => {
  console.log("[dbUtils-Prisma] addCategoryToDb: Attempting to add category. Data:", JSON.stringify(categoryData, null, 1));
  const validation = CategoryInputSchema.safeParse(categoryData);
  if (!validation.success) {
    console.error("[dbUtils-Prisma] addCategoryToDb: Category validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data.");
  }
  console.log("[dbUtils-Prisma] addCategoryToDb: Validation successful. Data for Prisma:", JSON.stringify(validation.data, null, 1));
  try {
    const newCategory = await prisma.category.create({ data: validation.data });
    console.log("[dbUtils-Prisma] addCategoryToDb: Category created successfully in DB:", JSON.stringify(newCategory, null, 1));
    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    console.error("[dbUtils-Prisma] addCategoryToDb: Error creating category in DB:", error);
    throw error;
  }
};
export const updateCategoryInDb = async (categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>>): Promise<Category> => {
  console.log(`[dbUtils-Prisma] updateCategoryInDb: Attempting to update category ID ${categoryId}. Data:`, JSON.stringify(categoryData, null, 1));
  const validation = CategoryInputSchema.partial().safeParse(categoryData);
  if (!validation.success) {
    console.error("[dbUtils-Prisma] updateCategoryInDb: Category validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data for update.");
  }
  console.log("[dbUtils-Prisma] updateCategoryInDb: Validation successful. Data for Prisma:", JSON.stringify(validation.data, null, 1));
  try {
    const updatedCategory = await prisma.category.update({ where: { id: categoryId }, data: validation.data });
    console.log("[dbUtils-Prisma] updateCategoryInDb: Category updated successfully in DB:", JSON.stringify(updatedCategory, null, 1));
    return JSON.parse(JSON.stringify(updatedCategory));
  } catch (error) {
    console.error(`[dbUtils-Prisma] updateCategoryInDb: Error updating category ID ${categoryId} in DB:`, error);
    throw error;
  }
};
export const deleteCategoryFromDb = async (categoryId: string): Promise<void> => {
  console.log(`[dbUtils-Prisma] deleteCategoryFromDb: Attempting to delete category ID ${categoryId}.`);
  try {
    await prisma.category.delete({ where: { id: categoryId } });
    console.log(`[dbUtils-Prisma] deleteCategoryFromDb: Category ID ${categoryId} deleted successfully from DB.`);
  } catch (error) {
    console.error(`[dbUtils-Prisma] deleteCategoryFromDb: Error deleting category ID ${categoryId} from DB:`, error);
    throw error;
  }
};

// --- Course Functions (Using Prisma) ---
export const getCoursesFromDb = async (): Promise<Course[]> => {
  console.log("[dbUtils-Prisma] getCoursesFromDb: Fetching courses...");
  try {
    const courses = await prisma.course.findMany({
      include: {
        category: true,
        modules: { include: { lessons: true }, orderBy: { order: 'asc' } },
        courseQuizzes: { // Updated to fetch quizzes via join table
          include: {
            quiz: {
              include: {
                questions: {
                  include: { options: true },
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { title: 'asc' }
    });
    console.log("[dbUtils-Prisma] getCoursesFromDb: Found courses:", courses.length);
    return JSON.parse(JSON.stringify(courses));
  } catch (error: any) {
    console.error("[dbUtils-Prisma] getCoursesFromDb: Error fetching courses:", error);
    if (error.code) { console.error("[dbUtils-Prisma] getCoursesFromDb: Prisma Error Code:", error.code); }
    if (error.meta) { console.error("[dbUtils-Prisma] getCoursesFromDb: Prisma Error Meta:", JSON.stringify(error.meta, null, 2)); }
    throw error;
  }
};

export const getCourseByIdFromDb = async (courseId: string): Promise<Course | null> => {
  console.log(`[dbUtils-Prisma] getCourseByIdFromDb: Fetching course ID ${courseId}.`);
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        modules: { include: { lessons: {orderBy: {order: 'asc'}} }, orderBy: { order: 'asc' } },
        courseQuizzes: { // Updated to fetch quizzes via join table
          include: {
            quiz: {
              include: {
                questions: {
                  include: { options: true },
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    console.log(`[dbUtils-Prisma] getCourseByIdFromDb: Course ${courseId} ${course ? 'found' : 'not found'}.`);
    if (course) {
      return JSON.parse(JSON.stringify(course));
    }
    return null;
  } catch (error: any) {
    console.error(`[dbUtils-Prisma] getCourseByIdFromDb: Error fetching course ID ${courseId}.`);
    console.error("[dbUtils-Prisma] getCourseByIdFromDb: Full Error Object:", error);
    if (error.code) { console.error("[dbUtils-Prisma] getCourseByIdFromDb: Prisma Error Code:", error.code); }
    if (error.meta) { console.error("[dbUtils-Prisma] getCourseByIdFromDb: Prisma Error Meta:", JSON.stringify(error.meta, null, 2)); }
    if (error.message) { console.error("[dbUtils-Prisma] getCourseByIdFromDb: Error Message:", error.message); }
    throw error;
  }
};

export const addCourseToDb = async (
  courseData: Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'courseQuizzes'|'category'|'enrollments'|'paymentSubmissions'|'certificates'> & {
    categoryName: string,
    instructor: string,
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>>> }>,
    quizIdsToConnect?: string[],
  }
): Promise<Course> => {
  console.log("[dbUtils-Prisma] addCourseToDb: STARTING. Data:", JSON.stringify(courseData, null, 1));
  const validation = CourseInputSchema.safeParse(courseData);
  if (!validation.success) {
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data.");
  }
  const { categoryName, instructor: instructorName, modules, quizIdsToConnect, ...mainCourseData } = validation.data;

  try {
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) category = await prisma.category.create({ data: { name: categoryName, iconName: 'Shapes' } });

    const prismaCourseData: Prisma.CourseCreateInput = {
      ...mainCourseData,
      instructor: instructorName,
      category: { connect: { id: category.id } },
      categoryNameCache: category.name,
      learningObjectives: mainCourseData.learningObjectives || [],
      prerequisites: mainCourseData.prerequisites || [],
      modules: modules ? {
        create: modules.map((mod, modIdx) => ({
          title: mod.title!,
          order: mod.order ?? modIdx,
          lessons: mod.lessons ? { create: mod.lessons.map((les, lesIdx) => ({ ...les, order: les.order ?? lesIdx })) } : undefined,
        })),
      } : undefined,
      courseQuizzes: quizIdsToConnect ? { // Link existing quizzes
        create: quizIdsToConnect.map((quizId, index) => ({
          quiz: { connect: { id: quizId } },
          order: index
        }))
      } : undefined,
    };

    const createdCourse = await prisma.course.create({
      data: prismaCourseData,
      include: { category: true, modules: { include: { lessons: true } }, courseQuizzes: { include: { quiz: { include: { questions: { include: { options: true }}}}}}}
    });
    return JSON.parse(JSON.stringify(createdCourse));
  } catch (error: any) {
    console.error("[dbUtils-Prisma] addCourseToDb: ERROR:", error);
    throw error;
  }
};

export const updateCourseInDb = async (
  courseId: string,
  courseData: Partial<Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'courseQuizzes'|'category'|'enrollments'|'paymentSubmissions'|'certificates'>> & {
    categoryName?: string,
    instructor?: string,
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { id?: string, lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>> & {id?: string}> }>,
    quizIdsToConnect?: string[],
  }
): Promise<Course> => {
  console.log(`[dbUtils-Prisma] updateCourseInDb: STARTING for ID ${courseId}. Data:`, JSON.stringify(courseData, null, 1));
  const validation = CourseInputSchema.partial().safeParse(courseData);
  if (!validation.success) {
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data for update.");
  }
  const { categoryName, instructor: instructorName, modules, quizIdsToConnect, ...mainCourseData } = validation.data;

  try {
    let categoryIdToLink: string | undefined = undefined;
    let categoryNameToCache: string | undefined = undefined;

    if (categoryName) {
      let category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) category = await prisma.category.create({ data: { name: categoryName, iconName: 'Shapes' } });
      categoryIdToLink = category.id;
      categoryNameToCache = category.name;
    }

    await prisma.module.deleteMany({ where: { courseId: courseId } });
    await prisma.courseQuiz.deleteMany({ where: { courseId: courseId } });

    const prismaCourseUpdateData: Prisma.CourseUpdateInput = {
      ...mainCourseData,
      instructor: instructorName,
      learningObjectives: mainCourseData.learningObjectives || [],
      prerequisites: mainCourseData.prerequisites || [],
    };
    if (categoryIdToLink && categoryNameToCache) {
      prismaCourseUpdateData.category = { connect: { id: categoryIdToLink } };
      prismaCourseUpdateData.categoryNameCache = categoryNameToCache;
    }

    if (modules) {
      prismaCourseUpdateData.modules = {
        create: modules.map((mod, modIdx) => ({
          title: mod.title!,
          order: mod.order ?? modIdx,
          lessons: mod.lessons ? { create: mod.lessons.map((les, lesIdx) => ({ ...les, order: les.order ?? lesIdx })) } : undefined,
        })),
      };
    }

    if (quizIdsToConnect) {
      prismaCourseUpdateData.courseQuizzes = {
        create: quizIdsToConnect.map((quizId, index) => ({
          quiz: { connect: { id: quizId } },
          order: index
        }))
      };
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: prismaCourseUpdateData,
      include: { category: true, modules: { include: { lessons: true } }, courseQuizzes: { include: { quiz: { include: { questions: { include: { options: true }}}}}}}
    });
    return JSON.parse(JSON.stringify(updatedCourse));
  } catch (error: any) {
    console.error(`[dbUtils-Prisma] updateCourseInDb: ERROR for ID ${courseId}:`, error);
    throw error;
  }
};

export const deleteCourseFromDb = async (courseId: string): Promise<void> => {
  console.log(`[dbUtils-Prisma] deleteCourseFromDb: Attempting to delete course ID ${courseId}.`);
  try {
    await prisma.course.delete({ where: { id: courseId } }); // Cascading deletes related modules, lessons, courseQuizzes
  } catch (error) {
    console.error(`[dbUtils-Prisma] deleteCourseFromDb: Error deleting course ID ${courseId} from DB:`, error);
    throw error;
  }
};

// --- New Standalone Quiz CRUD Functions ---
export const getQuizzesFromDb = async (): Promise<Quiz[]> => {
  console.log("[dbUtils-Prisma] getQuizzesFromDb: Fetching all quizzes.");
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: { include: { options: true }, orderBy: { order: 'asc' } },
        courseQuizzes: { include: { course: { select: {id: true, title: true }} } } // Include courses linked to this quiz
      },
      orderBy: { title: 'asc' }
    });
    return JSON.parse(JSON.stringify(quizzes));
  } catch (error) {
    console.error("[dbUtils-Prisma] getQuizzesFromDb: Error fetching quizzes:", error);
    throw error;
  }
};

export const getQuizByIdFromDb = async (quizId: string): Promise<Quiz | null> => {
  console.log(`[dbUtils-Prisma] getQuizByIdFromDb: Fetching quiz ID ${quizId}.`);
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { include: { options: true }, orderBy: { order: 'asc' } },
        courseQuizzes: { include: { course: { select: {id: true, title: true }} } }
      }
    });
    return quiz ? JSON.parse(JSON.stringify(quiz)) : null;
  } catch (error) {
    console.error(`[dbUtils-Prisma] getQuizByIdFromDb: Error fetching quiz ID ${quizId}:`, error);
    throw error;
  }
};

export const addQuizToDb = async (
  quizData: Omit<Quiz, 'id'|'createdAt'|'updatedAt'|'questions'|'courseQuizzes'> & {
    questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }>,
    courseIdsToConnect?: string[]
  }
): Promise<Quiz> => {
  console.log("[dbUtils-Prisma] addQuizToDb: Adding new quiz. Data:", JSON.stringify(quizData, null, 1));
  const validation = QuizInputSchema.omit({id: true}).safeParse(quizData); // Omit ID for creation
  if (!validation.success) {
    console.error("[dbUtils-Prisma] addQuizToDb: Zod validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid quiz data.");
  }
  const { questions, courseIdsToConnect, ...mainQuizData } = validation.data;

  try {
    const createdQuiz = await prisma.quiz.create({
      data: {
        ...mainQuizData,
        questions: questions ? {
          create: questions.map(q => ({
            text: q.text!,
            order: q.order!,
            points: q.points,
            options: { create: q.options.map(opt => ({ text: opt.text! })) },
          }))
        } : undefined,
        courseQuizzes: courseIdsToConnect ? {
          create: courseIdsToConnect.map((courseId, index) => ({
            course: { connect: { id: courseId } },
            order: index
          }))
        } : undefined,
      },
      include: { questions: { include: { options: true } }, courseQuizzes: { include: { course: true } } }
    });

    // Post-creation: Link correctOptionId for newly created questions
    if (createdQuiz.questions && questions) {
      for (let i = 0; i < createdQuiz.questions.length; i++) {
        const dbQuestion = createdQuiz.questions[i];
        const formQuestion = questions[i];
        if (formQuestion?.correctOptionText && dbQuestion.options.length > 0) {
          const correctDbOption = dbQuestion.options.find(opt => opt.text === formQuestion.correctOptionText);
          if (correctDbOption && dbQuestion.correctOptionId !== correctDbOption.id) {
            await prisma.question.update({
              where: { id: dbQuestion.id },
              data: { correctOptionId: correctDbOption.id }
            });
          }
        }
      }
    }
    const finalQuiz = await getQuizByIdFromDb(createdQuiz.id);
    if (!finalQuiz) throw new Error("Failed to retrieve newly created quiz.");
    return JSON.parse(JSON.stringify(finalQuiz));
  } catch (error) {
    console.error("[dbUtils-Prisma] addQuizToDb: Error creating quiz:", error);
    throw error;
  }
};

export const updateQuizInDb = async (
  quizId: string,
  quizData: Partial<Omit<Quiz, 'id'|'createdAt'|'updatedAt'|'questions'|'courseQuizzes'>> & {
    questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { id?: string, options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>> & {id?: string}>, correctOptionText?: string }>,
    questionIdsToDelete?: string[],
    courseIdsToConnect?: string[]
  }
): Promise<Quiz> => {
  console.log(`[dbUtils-Prisma] updateQuizInDb: Updating quiz ID ${quizId}. Data:`, JSON.stringify(quizData, null, 1));
  const validation = QuizInputSchema.partial().safeParse(quizData);
  if (!validation.success) {
    console.error("[dbUtils-Prisma] updateQuizInDb: Zod validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid quiz data for update.");
  }
  const { questions: questionsToUpsert, questionIdsToDelete, courseIdsToConnect, ...mainQuizData } = validation.data;

  try {
    // Handle question deletions first
    if (questionIdsToDelete && questionIdsToDelete.length > 0) {
      await prisma.question.deleteMany({ where: { id: { in: questionIdsToDelete }, quizId: quizId } });
    }

    // Update main quiz data
    const updatedQuizPartial = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...mainQuizData,
        courseQuizzes: courseIdsToConnect !== undefined ? { // If courseIdsToConnect is provided, manage links
          deleteMany: {}, // Remove all existing links
          create: courseIdsToConnect.map((courseId, index) => ({ // Add new links
            course: { connect: { id: courseId } },
            order: index
          }))
        } : undefined, // If not provided, don't touch courseQuizzes
      },
    });

    // Handle question upserts
    if (questionsToUpsert) {
      for (const qData of questionsToUpsert) {
        const optionsPayload = qData.options!.map(opt => ({ text: opt.text! }));
        const questionPayload: Prisma.QuestionUncheckedUpdateInput | Prisma.QuestionCreateWithoutQuizInput = {
          text: qData.text!, order: qData.order!, points: qData.points,
        };

        let savedQuestion: Question & { options: Option[] };
        if (qData.id && !qData.id.startsWith('q-new-')) { // Existing question
          await prisma.option.deleteMany({ where: { questionId: qData.id } });
          savedQuestion = await prisma.question.update({
            where: { id: qData.id },
            data: { ...questionPayload, options: { create: optionsPayload } },
            include: { options: true }
          });
        } else { // New question
          savedQuestion = await prisma.question.create({
            data: { ...questionPayload, quizId: quizId, options: { create: optionsPayload } },
            include: { options: true }
          });
        }
        // Link correct option
        if (qData.correctOptionText && savedQuestion.options.length > 0) {
          const correctOpt = savedQuestion.options.find(opt => opt.text === qData.correctOptionText);
          if (correctOpt && savedQuestion.correctOptionId !== correctOpt.id) {
            await prisma.question.update({ where: { id: savedQuestion.id }, data: { correctOptionId: correctOpt.id } });
          }
        }
      }
    }

    const finalQuiz = await getQuizByIdFromDb(quizId);
    if (!finalQuiz) throw new Error("Failed to retrieve updated quiz.");
    return JSON.parse(JSON.stringify(finalQuiz));
  } catch (error) {
    console.error(`[dbUtils-Prisma] updateQuizInDb: Error updating quiz ID ${quizId}:`, error);
    throw error;
  }
};

export const deleteQuizFromDb = async (quizId: string): Promise<void> => {
  console.log(`[dbUtils-Prisma] deleteQuizFromDb: Deleting quiz ID ${quizId}.`);
  try {
    await prisma.quiz.delete({ where: { id: quizId } }); // Cascading deletes questions, options, and CourseQuiz entries
  } catch (error) {
    console.error(`[dbUtils-Prisma] deleteQuizFromDb: Error deleting quiz ID ${quizId}:`, error);
    throw error;
  }
};


// --- LearningPath Functions (Using Prisma) --- (No changes needed here regarding quizzes)
export const getLearningPathsFromDb = async (): Promise<LearningPath[]> => { /* ... */ return JSON.parse(JSON.stringify(await prisma.learningPath.findMany(/* ... */))) };
export const addLearningPathToDb = async (pathData: Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'> & { courseIdsToConnect?: string[] }): Promise<LearningPath> => { /* ... */ return JSON.parse(JSON.stringify(await prisma.learningPath.create(/* ... */))) };
export const updateLearningPathInDb = async (pathId: string, pathData: Partial<Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'>> & { courseIdsToConnect?: string[] }): Promise<LearningPath> => { /* ... */ return JSON.parse(JSON.stringify(await prisma.learningPath.update(/* ... */))) };
export const deleteLearningPathFromDb = async (pathId: string): Promise<void> => { /* ... */ await prisma.learningPath.delete(/* ... */) };

// --- Video Functions (localStorage) --- (No changes needed)
export const getVideosFromDb = async (): Promise<Video[]> => Promise.resolve(getStoredData('adminVideos', mockVideosForSeeding));
export const addVideoToDb = async (videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> => { /* ... */ return Promise.resolve(newVideo) };
export const updateVideoInDb = async (videoId: string, videoData: Partial<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Video> => { /* ... */ return Promise.resolve(videos[index]) };
export const deleteVideoFromDb = async (videoId: string): Promise<void> => { /* ... */ return Promise.resolve() };

// --- PaymentSettings (Using Prisma) --- (No changes needed)
export const getPaymentSettingsFromDb = async (): Promise<PaymentSettings | null> => { /* ... */ return settings ? JSON.parse(JSON.stringify(settings)) : null };
export const savePaymentSettingsToDb = async (settingsData: Omit<PaymentSettings, 'id'| 'updatedAt'>): Promise<PaymentSettings> => { /* ... */ return JSON.parse(JSON.stringify(savedSettings)) };

// --- PaymentSubmission (Using Prisma) --- (No changes needed)
export const getPaymentSubmissionsFromDb = async (filter?: { userId?: string }): Promise<PaymentSubmission[]> => { /* ... */ return JSON.parse(JSON.stringify(submissions)) };
export const addPaymentSubmissionToDb = async (submissionData: Omit<PaymentSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes' | 'user' | 'course'> & { userId: string, courseId: string }): Promise<PaymentSubmission> => { /* ... */ return JSON.parse(JSON.stringify(newSubmission)) };
export const updatePaymentSubmissionInDb = async (submissionId: string, dataToUpdate: { status: PrismaPaymentStatus, adminNotes?: string | null, reviewedAt?: Date }): Promise<PaymentSubmission> => { /* ... */ return JSON.parse(JSON.stringify(updatedSubmission)) };

// --- Enrollment (Using Prisma) --- (No changes needed)
export const getEnrollmentForUserAndCourseFromDb = async (userId: string, courseId: string): Promise<Enrollment | null> => { /* ... */ return enrollment ? JSON.parse(JSON.stringify(enrollment)) : null };
export const createEnrollmentInDb = async (userId: string, courseId: string): Promise<Enrollment> => { /* ... */ return JSON.parse(JSON.stringify(enrollment)) };
export const updateEnrollmentProgressInDb = async (enrollmentId: string, progress: number): Promise<Enrollment> => { /* ... */ return JSON.parse(JSON.stringify(enrollment)) };
export const getEnrollmentsByUserIdFromDb = async (userId: string): Promise<Enrollment[]> => { /* ... */ return JSON.parse(JSON.stringify(enrollments)) };

// --- Site Page Content Functions (Using Prisma) --- (No changes needed)
export const getSitePageBySlug = async (slug: string): Promise<SitePage | null> => { /* ... */ return page ? JSON.parse(JSON.stringify(page)) : null };
export const upsertSitePage = async (slug: string, title: string, content: Prisma.JsonValue | string): Promise<SitePage> => { /* ... */ return JSON.parse(JSON.stringify(sitePage)) };

// --- Certificate Functions (Using Prisma) --- (No changes needed)
export const getCertificatesFromDb = async (): Promise<PrismaCertificate[]> => { /* ... */ return JSON.parse(JSON.stringify(certificates)) };
export const issueCertificateToDb = async (data: Pick<PrismaCertificate, 'userId' | 'courseId' | 'certificateUrl'>): Promise<PrismaCertificate> => { /* ... */ return JSON.parse(JSON.stringify(newCertificate)) };
export const deleteCertificateFromDb = async (certificateId: string): Promise<void> => { /* ... */ await prisma.certificate.delete({ where: { id: certificateId } }) };

// --- Seeding Functions (Updated for Prisma) ---
export const seedCategoriesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => { /* ... */ return { successCount, errorCount, skippedCount } };
export const seedCoursesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils-Prisma] seedCoursesToDb: Seeding courses to DB.");
  let s=0,e=0,sk=0;
  for(const cd of mockCoursesForSeeding){
    try{
      if(await prisma.course.findUnique({where:{id:cd.id}})){sk++;continue;}
      let cat=await prisma.category.findUnique({where:{name:cd.category}});
      if(!cat)cat=await prisma.category.create({data:{name:cd.category, iconName:'Shapes'}});

      // Quizzes are no longer directly part of course data for creation
      const courseCreateData: Prisma.CourseCreateInput = {
        id: cd.id,
        title: cd.title,
        description: cd.description,
        instructor: cd.instructor,
        imageUrl: cd.imageUrl,
        dataAiHint: cd.dataAiHint,
        price: cd.price,
        currency: cd.currency,
        isFeatured: cd.isFeatured,
        learningObjectives: cd.learningObjectives,
        targetAudience: cd.targetAudience,
        prerequisites: cd.prerequisites,
        estimatedTimeToComplete: cd.estimatedTimeToComplete,
        category: { connect: { id: cat.id } },
        categoryNameCache: cat.name,
        modules: cd.modules ? { create: cd.modules.map(m => ({...m, lessons: m.lessons ? { create: m.lessons } : undefined })) } : undefined,
        // courseQuizzes will be handled separately or if mockQuizIds are available
      };
      await prisma.course.create({data:courseCreateData});
      s++;
    }catch(err){console.error(`Err seed course ${cd.title}:`,err);e++;}
  }
  console.log(`[dbUtils-Prisma] seedCoursesToDb: Done. Success: ${s}, Errors: ${e}, Skipped: ${sk}`);
  return {successCount:s,errorCount:e,skippedCount:sk};
};
// TODO: Need a seedQuizzesToDb function and update seedCoursesToDb to link them.
// For now, quizzes will be seeded separately.

export const seedLearningPathsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => { /* ... */ return {successCount:s,errorCount:e,skippedCount:sk} };
export const seedPaymentSettingsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => { /* ... */ return{successCount:1,errorCount:0,skippedCount:0} };
export const seedVideosToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => { /* ... */ return { successCount: mockVideosForSeeding.length, errorCount: 0, skippedCount: 0 } };
    
