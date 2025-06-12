
import prisma from './prisma'; // Import Prisma client
import { 
  // Still need mock data for seeding and for entities not yet migrated to Prisma
  mockUsersForSeeding, // Renamed from mockUsers
  mockCoursesForSeeding,
  mockCategoriesForSeeding,
  mockVideosForSeeding, // For Video entity which is still on localStorage
  mockLearningPathsForSeeding,
  initialPaymentSettings as mockDefaultPaymentSettings, // For PaymentSettings entity
  paymentSubmissions_DEPRECATED_USE_FIRESTORE as mockPaymentSubmissions, // For PaymentSubmissions
  enrollments_DEPRECATED_USE_FIRESTORE as mockEnrollments, // For Enrollments
  // types
  type Course as MockCourseType, 
  type Category as MockCategoryType,
  type Video as MockVideoType,
  type LearningPath as MockLearningPathType,
  type PaymentSettings as MockPaymentSettingsType,
  type PaymentSubmission as MockPaymentSubmissionType,
  type Enrollment as MockEnrollmentType,
  type Module as MockModuleType,
  type Lesson as MockLessonType,
  type Quiz as MockQuizType,
  type Question as MockQuestionType,
  type Option as MockOptionType,
  // User type from Prisma will be used when users are migrated
} from '@/data/mockData';
import type { Course, Category, LearningPath, Module, Lesson, Quiz, Question, Option, QuizType, Video, PaymentSettings, PaymentSubmission, Enrollment, User } from '@prisma/client';
import { z } from 'zod';

console.log("[dbUtils] Loading dbUtils.ts module. DATABASE_URL from env:", process.env.DATABASE_URL ? "Loaded" : "NOT FOUND/EMPTY");
if (process.env.DATABASE_URL) {
  console.log("[dbUtils] DATABASE_URL (first 30 chars):", process.env.DATABASE_URL.substring(0, 30) + "...");
}


// Re-export Prisma types for convenience in components
export type { 
    Category, Course, Module, Lesson, Quiz, Question, Option, 
    LearningPath, User, // User from Prisma
    Video, PaymentSettings, PaymentSubmission, Enrollment, // These are still mock types for now
    PaymentSubmissionStatus, QuizType // These are enum-like types from mockData
};


// Zod Schemas for Input Validation (remain largely the same, but ensure they match Prisma schema where applicable)
const CategoryInputSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  dataAiHint: z.string().max(100, "AI hint too long").optional().nullable(), // Increased limit
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
  quizType: z.string(), 
  passingScore: z.number().int().min(0).max(100).optional().nullable(),
  questions: z.array(QuestionInputSchema).optional(), 
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
  quizzes: z.array(QuizInputSchema).optional(),   
});

const VideoInputSchema = z.object({ // For videos still on localStorage
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional().nullable(),
  embedUrl: z.string().min(1, "Embed URL is required").url("Invalid embed URL").refine(val => val.includes("youtube.com") || val.includes("tiktok.com"), {
    message: "Embed URL must be a valid YouTube or TikTok URL."
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

// --- Helper for localStorage (for entities not yet migrated to Prisma) ---
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
  console.log("[dbUtils] getCategoriesFromDb: Fetching categories...");
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    console.log("[dbUtils] getCategoriesFromDb: Found categories:", categories.length);
    return categories;
  } catch (error) {
    console.error("[dbUtils] getCategoriesFromDb: Error fetching categories:", error);
    throw error;
  }
};

export const addCategoryToDb = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>): Promise<Category> => {
  console.log("[dbUtils] addCategoryToDb: Attempting to add category. Data received:", JSON.stringify(categoryData, null, 2));
  const validation = CategoryInputSchema.safeParse(categoryData);
  if (!validation.success) {
    console.error("[dbUtils] addCategoryToDb: Category validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data.");
  }
  console.log("[dbUtils] addCategoryToDb: Validation successful. Data for Prisma:", JSON.stringify(validation.data, null, 2));
  try {
    const newCategory = await prisma.category.create({ data: validation.data });
    console.log("[dbUtils] addCategoryToDb: Category created successfully in DB:", JSON.stringify(newCategory, null, 2));
    return newCategory;
  } catch (error) {
    console.error("[dbUtils] addCategoryToDb: Error creating category in DB:", error);
    throw error;
  }
};

export const updateCategoryInDb = async (categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>>): Promise<Category> => {
  console.log(`[dbUtils] updateCategoryInDb: Attempting to update category ID ${categoryId}. Data received:`, JSON.stringify(categoryData, null, 2));
  const validation = CategoryInputSchema.partial().safeParse(categoryData);
  if (!validation.success) {
    console.error("[dbUtils] updateCategoryInDb: Category validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data for update.");
  }
  console.log("[dbUtils] updateCategoryInDb: Validation successful. Data for Prisma:", JSON.stringify(validation.data, null, 2));
  try {
    const updatedCategory = await prisma.category.update({ where: { id: categoryId }, data: validation.data });
    console.log("[dbUtils] updateCategoryInDb: Category updated successfully in DB:", JSON.stringify(updatedCategory, null, 2));
    return updatedCategory;
  } catch (error) {
    console.error(`[dbUtils] updateCategoryInDb: Error updating category ID ${categoryId} in DB:`, error);
    throw error;
  }
};

export const deleteCategoryFromDb = async (categoryId: string): Promise<void> => {
  console.log(`[dbUtils] deleteCategoryFromDb: Attempting to delete category ID ${categoryId}`);
  try {
    await prisma.category.delete({ where: { id: categoryId } });
    console.log(`[dbUtils] deleteCategoryFromDb: Category ID ${categoryId} deleted successfully from DB.`);
  } catch (error) {
    console.error(`[dbUtils] deleteCategoryFromDb: Error deleting category ID ${categoryId} from DB:`, error);
    throw error;
  }
};

// --- Course Functions (Using Prisma) ---
export const getCoursesFromDb = async (): Promise<Course[]> => {
  console.log("[dbUtils] getCoursesFromDb: Fetching courses...");
  try {
    const courses = await prisma.course.findMany({
      include: { 
        category: true, 
        modules: { include: { lessons: true }, orderBy: { order: 'asc' } },
        quizzes: { include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } } }
      },
      orderBy: { title: 'asc' }
    });
    console.log("[dbUtils] getCoursesFromDb: Found courses:", courses.length);
    return courses;
  } catch (error) {
    console.error("[dbUtils] getCoursesFromDb: Error fetching courses:", error);
    throw error;
  }
};

export const getCourseByIdFromDb = async (courseId: string): Promise<Course | null> => {
  console.log(`[dbUtils] getCourseByIdFromDb: Fetching course ID ${courseId}...`);
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        modules: { include: { lessons: {orderBy: {order: 'asc'}} }, orderBy: { order: 'asc' } },
        quizzes: { include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } } }
      }
    });
    console.log(`[dbUtils] getCourseByIdFromDb: Course ${courseId} ${course ? 'found' : 'not found'}.`);
    return course;
  } catch (error) {
    console.error(`[dbUtils] getCourseByIdFromDb: Error fetching course ID ${courseId}:`, error);
    throw error;
  }
};

export const addCourseToDb = async (
  courseData: Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'> & { 
    categoryName: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>>> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }> }>
  }
): Promise<Course> => {
  console.log("[dbUtils] addCourseToDb: Attempting to add course. Data received:", JSON.stringify(courseData, null, 2));
  const validation = CourseInputSchema.safeParse(courseData);
  if (!validation.success) {
    console.error("[dbUtils] addCourseToDb: Course validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data.");
  }
  const { categoryName, modules, quizzes, ...mainCourseData } = validation.data;
  console.log("[dbUtils] addCourseToDb: Validation successful. Main course data:", JSON.stringify(mainCourseData, null, 2));
  console.log("[dbUtils] addCourseToDb: Modules to create:", JSON.stringify(modules, null, 2));
  console.log("[dbUtils] addCourseToDb: Quizzes to create:", JSON.stringify(quizzes, null, 2));

  try {
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      console.log(`[dbUtils] addCourseToDb: Category "${categoryName}" not found, creating it.`);
      category = await prisma.category.create({ data: { name: categoryName, iconName: 'Shapes' } }); // Default icon
      console.log(`[dbUtils] addCourseToDb: Category "${categoryName}" created with ID ${category.id}.`);
    } else {
      console.log(`[dbUtils] addCourseToDb: Found existing category "${categoryName}" with ID ${category.id}.`);
    }

    const prismaCourseData = {
      ...mainCourseData,
      categoryId: category.id,
      categoryNameCache: category.name, 
      learningObjectives: mainCourseData.learningObjectives || [],
      prerequisites: mainCourseData.prerequisites || [],
      modules: modules ? {
        create: modules.map((mod, modIdx) => ({
          title: mod.title!,
          order: mod.order || modIdx,
          lessons: mod.lessons ? {
            create: mod.lessons.map((les, lesIdx) => ({
              title: les.title!,
              duration: les.duration,
              description: les.description,
              embedUrl: les.embedUrl,
              imageUrl: les.imageUrl,
              order: les.order || lesIdx,
            })),
          } : undefined,
        })),
      } : undefined,
      quizzes: quizzes ? {
        create: quizzes.map((quizData) => {
          const questionsToCreate = quizData.questions?.map(q => {
            const optionsToCreate = q.options.map(opt => ({ text: opt.text! }));
            return {
              text: q.text!,
              order: q.order!,
              points: q.points,
              options: { create: optionsToCreate },
              // correctOptionId will be set after options are created if linking by text
              // For now, correctOptionId will be determined by `correctOptionText` if present.
            };
          }) || [];
          
          return {
            title: quizData.title!,
            quizType: quizData.quizType!,
            passingScore: quizData.passingScore,
            questions: { create: questionsToCreate.map(q => ({
              text: q.text, 
              order: q.order, 
              points: q.points, 
              options: q.options,
              // We need to manually set correctOptionId in a second step if using `correctOptionText`
            })) },
          };
        })
      } : undefined,
    };
    console.log("[dbUtils] addCourseToDb: Data prepared for Prisma create:", JSON.stringify(prismaCourseData, null, 2));
    const createdCourse = await prisma.course.create({
      data: prismaCourseData,
      include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } }
    });
    console.log("[dbUtils] addCourseToDb: Course created successfully in DB:", JSON.stringify(createdCourse, null, 2));

    // Post-creation step to link correct options for quizzes if correctOptionText was used
    if (createdCourse.quizzes && quizzes) {
        for (let i = 0; i < createdCourse.quizzes.length; i++) {
            const dbQuiz = createdCourse.quizzes[i];
            const formQuiz = quizzes[i];
            if (dbQuiz.questions && formQuiz?.questions) {
                for (let j = 0; j < dbQuiz.questions.length; j++) {
                    const dbQuestion = dbQuiz.questions[j];
                    const formQuestion = formQuiz.questions[j];
                    if (formQuestion?.correctOptionText && dbQuestion.options.length > 0) {
                        const correctFormOption = formQuestion.options.find(opt => opt.text === formQuestion.correctOptionText);
                        // Find the corresponding option in the DB by text (assuming texts are unique within a question's options during creation)
                        const correctDbOption = dbQuestion.options.find(opt => opt.text === correctFormOption?.text);
                        if (correctDbOption && dbQuestion.correctOptionId !== correctDbOption.id) {
                            console.log(`[dbUtils] addCourseToDb: Updating correctOptionId for Q: ${dbQuestion.id} to Opt: ${correctDbOption.id}`);
                            await prisma.question.update({
                                where: { id: dbQuestion.id },
                                data: { correctOptionId: correctDbOption.id }
                            });
                        }
                    }
                }
            }
        }
    }
    // Re-fetch to get the potentially updated course
    const finalCourse = await getCourseByIdFromDb(createdCourse.id);
    return finalCourse!;

  } catch (error) {
    console.error("[dbUtils] addCourseToDb: Error creating course in DB:", error);
    throw error;
  }
};


export const updateCourseInDb = async (
  courseId: string, 
  courseData: Partial<Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'>> & { 
    categoryName?: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { id?: string, lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>> & {id?: string}> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { id?: string, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { id?: string, options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>> & {id?:string}>, correctOptionText?: string }> }>
  }
): Promise<Course> => {
  console.log(`[dbUtils] updateCourseInDb: Attempting to update course ID ${courseId}. Data received:`, JSON.stringify(courseData, null, 2));
  const validation = CourseInputSchema.partial().safeParse(courseData);
  if (!validation.success) {
    console.error("[dbUtils] updateCourseInDb: Course validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data for update.");
  }
  const { categoryName, modules, quizzes, ...mainCourseData } = validation.data;
  console.log("[dbUtils] updateCourseInDb: Validation successful. Main course data:", JSON.stringify(mainCourseData, null, 2));
  console.log("[dbUtils] updateCourseInDb: Modules for update:", JSON.stringify(modules, null, 2));
  console.log("[dbUtils] updateCourseInDb: Quizzes for update:", JSON.stringify(quizzes, null, 2));
  
  try {
    let categoryIdToLink: string | undefined = undefined;
    let categoryNameToCache: string | undefined = undefined;

    if (categoryName) {
      let category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) {
        console.log(`[dbUtils] updateCourseInDb: Category "${categoryName}" not found, creating it.`);
        category = await prisma.category.create({ data: { name: categoryName, iconName: 'Shapes' } });
        console.log(`[dbUtils] updateCourseInDb: Category "${categoryName}" created with ID ${category.id}.`);
      } else {
        console.log(`[dbUtils] updateCourseInDb: Found existing category "${categoryName}" with ID ${category.id}.`);
      }
      categoryIdToLink = category.id;
      categoryNameToCache = category.name;
    }
    
    // Simpler update: delete existing related items and recreate.
    // More complex logic would be needed for fine-grained upserts/connectOrCreate.
    console.log(`[dbUtils] updateCourseInDb: Deleting existing modules for course ID ${courseId}`);
    await prisma.module.deleteMany({ where: { courseId: courseId } }); // Deletes lessons due to cascading
    console.log(`[dbUtils] updateCourseInDb: Deleting existing quizzes for course ID ${courseId}`);
    await prisma.quiz.deleteMany({where: {courseId: courseId }}); // Deletes questions/options due to cascading

    const prismaCourseUpdateData: any = {
      ...mainCourseData,
      learningObjectives: mainCourseData.learningObjectives || [],
      prerequisites: mainCourseData.prerequisites || [],
    };
    if (categoryIdToLink && categoryNameToCache) {
      prismaCourseUpdateData.categoryId = categoryIdToLink;
      prismaCourseUpdateData.categoryNameCache = categoryNameToCache;
    }

    if (modules) {
      prismaCourseUpdateData.modules = {
        create: modules.map((mod, modIdx) => ({
          title: mod.title!,
          order: mod.order || modIdx,
          lessons: mod.lessons ? {
            create: mod.lessons.map((les, lesIdx) => ({
              title: les.title!,
              duration: les.duration,
              description: les.description,
              embedUrl: les.embedUrl,
              imageUrl: les.imageUrl,
              order: les.order || lesIdx,
            })),
          } : undefined,
        })),
      };
    }

    if (quizzes) {
      prismaCourseUpdateData.quizzes = {
        create: quizzes.map((quizData) => {
          const questionsToCreateNested = quizData.questions?.map(q => {
            const optionsToCreate = q.options.map(opt => ({ text: opt.text! }));
            return {
              text: q.text!,
              order: q.order!,
              points: q.points,
              options: { create: optionsToCreate },
            };
          }) || [];
          return {
            title: quizData.title!,
            quizType: quizData.quizType!,
            passingScore: quizData.passingScore,
            questions: { create: questionsToCreateNested.map(q => ({text: q.text, order: q.order, points: q.points, options: q.options}))},
          };
        })
      };
    }
    console.log("[dbUtils] updateCourseInDb: Data prepared for Prisma update:", JSON.stringify(prismaCourseUpdateData, null, 2));
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: prismaCourseUpdateData,
      include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } }
    });
    console.log("[dbUtils] updateCourseInDb: Course updated successfully in DB:", JSON.stringify(updatedCourse, null, 2));
    
    // Post-update step to link correct options for quizzes if correctOptionText was used
    if (updatedCourse.quizzes && quizzes) {
        for (let i = 0; i < updatedCourse.quizzes.length; i++) {
            const dbQuiz = updatedCourse.quizzes[i];
            const formQuiz = quizzes[i]; // Assuming order is preserved
            if (dbQuiz.questions && formQuiz?.questions) {
                for (let j = 0; j < dbQuiz.questions.length; j++) {
                    const dbQuestion = dbQuiz.questions[j];
                    const formQuestion = formQuiz.questions[j];
                    if (formQuestion?.correctOptionText && dbQuestion.options.length > 0) {
                        const correctFormOption = formQuestion.options.find(opt => opt.text === formQuestion.correctOptionText);
                        const correctDbOption = dbQuestion.options.find(opt => opt.text === correctFormOption?.text);
                        if (correctDbOption && dbQuestion.correctOptionId !== correctDbOption.id) {
                             console.log(`[dbUtils] updateCourseInDb: Updating correctOptionId for Q: ${dbQuestion.id} to Opt: ${correctDbOption.id}`);
                            await prisma.question.update({
                                where: { id: dbQuestion.id },
                                data: { correctOptionId: correctDbOption.id }
                            });
                        }
                    }
                }
            }
        }
    }
    const finalCourse = await getCourseByIdFromDb(updatedCourse.id);
    return finalCourse!;

  } catch (error) {
    console.error(`[dbUtils] updateCourseInDb: Error updating course ID ${courseId} in DB:`, error);
    throw error;
  }
};

export const deleteCourseFromDb = async (courseId: string): Promise<void> => {
  console.log(`[dbUtils] deleteCourseFromDb: Attempting to delete course ID ${courseId}`);
  try {
    await prisma.course.delete({ where: { id: courseId } });
    console.log(`[dbUtils] deleteCourseFromDb: Course ID ${courseId} deleted successfully from DB.`);
  } catch (error) {
    console.error(`[dbUtils] deleteCourseFromDb: Error deleting course ID ${courseId} from DB:`, error);
    throw error;
  }
};


// --- LearningPath Functions (Using Prisma) ---
export const getLearningPathsFromDb = async (): Promise<LearningPath[]> => {
  console.log("[dbUtils] getLearningPathsFromDb: Fetching learning paths...");
  try {
    const paths = await prisma.learningPath.findMany({
      include: {
        learningPathCourses: {
          include: { course: {select: {id: true, title: true, imageUrl:true, categoryNameCache:true, instructor:true }} }, 
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { title: 'asc' }
    });
    console.log("[dbUtils] getLearningPathsFromDb: Found learning paths:", paths.length);
    return paths;
  } catch (error) {
    console.error("[dbUtils] getLearningPathsFromDb: Error fetching learning paths:", error);
    throw error;
  }
};

export const addLearningPathToDb = async (
  pathData: Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'> & { courseIdsToConnect?: string[] }
): Promise<LearningPath> => {
  console.log("[dbUtils] addLearningPathToDb: Attempting to add learning path. Data received:", JSON.stringify(pathData, null, 2));
  const validation = LearningPathInputSchema.safeParse(pathData);
  if (!validation.success) {
    console.error("[dbUtils] addLearningPathToDb: Learning Path validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid learning path data.");
  }
  const { courseIdsToConnect, ...restData } = validation.data;
  console.log("[dbUtils] addLearningPathToDb: Validation successful. Data for Prisma:", JSON.stringify(restData, null, 2), "Courses to connect:", courseIdsToConnect);
  try {
    const newPath = await prisma.learningPath.create({
      data: {
        ...restData,
        learningPathCourses: courseIdsToConnect ? {
          create: courseIdsToConnect.map((courseId, index) => ({
            courseId: courseId,
            order: index
          }))
        } : undefined
      },
      include: { learningPathCourses: { include: { course: true }, orderBy: {order: 'asc'} } }
    });
    console.log("[dbUtils] addLearningPathToDb: Learning Path created successfully in DB:", JSON.stringify(newPath, null, 2));
    return newPath;
  } catch (error) {
    console.error("[dbUtils] addLearningPathToDb: Error creating learning path in DB:", error);
    throw error;
  }
};

export const updateLearningPathInDb = async (
  pathId: string, 
  pathData: Partial<Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'>> & { courseIdsToConnect?: string[] }
): Promise<LearningPath> => {
  console.log(`[dbUtils] updateLearningPathInDb: Attempting to update path ID ${pathId}. Data received:`, JSON.stringify(pathData, null, 2));
  const validation = LearningPathInputSchema.partial().safeParse(pathData);
  if (!validation.success) {
    console.error("[dbUtils] updateLearningPathInDb: Learning Path validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid learning path data for update.");
  }
  const { courseIdsToConnect, ...restData } = validation.data;
  console.log("[dbUtils] updateLearningPathInDb: Validation successful. Data for Prisma:", JSON.stringify(restData, null, 2), "Courses to connect:", courseIdsToConnect);
  try {
    console.log(`[dbUtils] updateLearningPathInDb: Deleting existing course connections for path ID ${pathId}.`);
    await prisma.learningPathCourse.deleteMany({ where: { learningPathId: pathId }});

    const updatedPath = await prisma.learningPath.update({
      where: { id: pathId },
      data: {
        ...restData,
        learningPathCourses: courseIdsToConnect ? {
          create: courseIdsToConnect.map((courseId, index) => ({
            courseId: courseId,
            order: index
          }))
        } : undefined
      },
      include: { learningPathCourses: { include: { course: true }, orderBy: {order: 'asc'} } }
    });
    console.log("[dbUtils] updateLearningPathInDb: Learning Path updated successfully in DB:", JSON.stringify(updatedPath, null, 2));
    return updatedPath;
  } catch (error) {
    console.error(`[dbUtils] updateLearningPathInDb: Error updating learning path ID ${pathId} in DB:`, error);
    throw error;
  }
};

export const deleteLearningPathFromDb = async (pathId: string): Promise<void> => {
  console.log(`[dbUtils] deleteLearningPathFromDb: Attempting to delete learning path ID ${pathId}`);
  try {
    await prisma.learningPath.delete({ where: { id: pathId } });
    console.log(`[dbUtils] deleteLearningPathFromDb: Learning Path ID ${pathId} deleted successfully from DB.`);
  } catch (error) {
    console.error(`[dbUtils] deleteLearningPathFromDb: Error deleting learning path ID ${pathId} from DB:`, error);
    throw error;
  }
};


// --- Quiz Data Persistence (Example for CourseForm - saveQuizWithQuestionsToDb) ---
export const saveQuizWithQuestionsToDb = async (
    courseIdForQuiz: string, 
    quizData: MockQuizType & { questionsToUpsert?: any[], questionIdsToDelete?: string[] } 
): Promise<Quiz> => { 
    console.log(`[dbUtils] saveQuizWithQuestionsToDb: Saving quiz for course ID ${courseIdForQuiz}. Quiz data:`, JSON.stringify(quizData, null, 2));
    
    try {
        let existingQuiz = quizData.id && !quizData.id.startsWith('quiz-new-') 
            ? await prisma.quiz.findUnique({ where: { id: quizData.id }, include: { questions: { include: { options: true } } } }) 
            : null;

        if (existingQuiz) {
            console.log(`[dbUtils] saveQuizWithQuestionsToDb: Updating existing quiz ID ${existingQuiz.id}`);
            // Delete questions marked for deletion
            if (quizData.questionIdsToDelete && quizData.questionIdsToDelete.length > 0) {
                const validIdsToDelete = quizData.questionIdsToDelete.filter(id => !id.startsWith('q-new-'));
                if (validIdsToDelete.length > 0) {
                   console.log(`[dbUtils] saveQuizWithQuestionsToDb: Deleting questions for quiz ID ${existingQuiz.id}:`, validIdsToDelete);
                   await prisma.question.deleteMany({ where: { id: { in: validIdsToDelete }, quizId: existingQuiz.id } });
                }
            }

            const upsertPromises = quizData.questionsToUpsert?.map(async qData => {
                const optionsPayload = qData.optionsToCreate.map((opt: any) => ({ text: opt.text! }));
                
                const questionPayload: any = {
                    text: qData.text,
                    order: qData.order || 0,
                    points: qData.points,
                };

                let savedQuestion: Question & { options: Option[] };

                if (qData.id && !qData.id.startsWith('q-new-')) { // Existing question
                    console.log(`[dbUtils] saveQuizWithQuestionsToDb: Updating question ID ${qData.id}`);
                    await prisma.option.deleteMany({where: {questionId: qData.id}}); // Clear old options
                    savedQuestion = await prisma.question.update({
                        where: { id: qData.id },
                        data: { ...questionPayload, options: { create: optionsPayload } },
                        include: { options: true }
                    });
                } else { // New question
                    console.log(`[dbUtils] saveQuizWithQuestionsToDb: Creating new question for quiz ID ${existingQuiz!.id}`);
                    savedQuestion = await prisma.question.create({
                        data: { ...questionPayload, quizId: existingQuiz!.id, options: { create: optionsPayload } },
                        include: { options: true }
                    });
                }
                // Link correct option
                if (qData.correctOptionTextForNew && savedQuestion.options.length > 0) {
                    const correctOpt = savedQuestion.options.find(opt => opt.text === qData.correctOptionTextForNew);
                    if(correctOpt && savedQuestion.correctOptionId !== correctOpt.id){
                        console.log(`[dbUtils] saveQuizWithQuestionsToDb: Linking correct option for question ID ${savedQuestion.id} to option ID ${correctOpt.id}`);
                        await prisma.question.update({where: {id: savedQuestion.id}, data: {correctOptionId: correctOpt.id}});
                    }
                }
                return savedQuestion;
            }) || [];
            
            await Promise.all(upsertPromises);
            
            const updatedQuiz = await prisma.quiz.update({
                where: { id: existingQuiz.id },
                data: {
                    title: quizData.title,
                    quizType: quizData.quizType as QuizType,
                    passingScore: quizData.passingScore,
                },
                include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } }
            });
            console.log("[dbUtils] saveQuizWithQuestionsToDb: Quiz updated successfully:", JSON.stringify(updatedQuiz, null, 2));
            return updatedQuiz;

        } else {
            console.log(`[dbUtils] saveQuizWithQuestionsToDb: Creating new quiz for course ID ${courseIdForQuiz}`);
            const createdQuiz = await prisma.quiz.create({
                data: {
                    courseId: courseIdForQuiz,
                    title: quizData.title,
                    quizType: quizData.quizType as QuizType,
                    passingScore: quizData.passingScore,
                    questions: quizData.questionsToUpsert ? {
                        create: quizData.questionsToUpsert.map(qData => {
                            const optionsToCreate = qData.optionsToCreate.map((opt: any) => ({ text: opt.text! }));
                            return {
                                text: qData.text,
                                order: qData.order || 0,
                                points: qData.points,
                                options: { create: optionsToCreate },
                                // correctOptionId determined after creation
                            };
                        })
                    } : undefined
                },
                include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } }
            });
            console.log("[dbUtils] saveQuizWithQuestionsToDb: New quiz created:", JSON.stringify(createdQuiz, null, 2));
            // Post-creation step to link correct options
             if (createdQuiz.questions && quizData.questionsToUpsert) {
                for (let i = 0; i < createdQuiz.questions.length; i++) {
                    const dbQuestion = createdQuiz.questions[i];
                    const formQuestion = quizData.questionsToUpsert[i];
                    if (formQuestion?.correctOptionTextForNew && dbQuestion.options.length > 0) {
                        const correctOpt = dbQuestion.options.find(opt => opt.text === formQuestion.correctOptionTextForNew);
                        if(correctOpt && dbQuestion.correctOptionId !== correctOpt.id){
                            console.log(`[dbUtils] saveQuizWithQuestionsToDb: Linking correct option for new question ID ${dbQuestion.id} to option ID ${correctOpt.id}`);
                            await prisma.question.update({where: {id: dbQuestion.id}, data: {correctOptionId: correctOpt.id}});
                        }
                    }
                }
            }
            const finalQuiz = await prisma.quiz.findUniqueOrThrow({where: {id: createdQuiz.id}, include: {questions: {include: {options: true}}}});
            return finalQuiz;
        }
    } catch (error) {
        console.error("[dbUtils] saveQuizWithQuestionsToDb: Error saving quiz to DB:", error);
        throw error;
    }
};



// --- Functions for entities still using localStorage (Videos, Payments, Enrollments, etc.) ---

// --- Video Functions (localStorage) ---
export const getVideosFromDb = async (): Promise<MockVideoType[]> => {
  return Promise.resolve(getStoredData('adminVideos', mockVideosForSeeding));
};
export const addVideoToDb = async (videoData: Omit<MockVideoType, 'id' | 'createdAt' | 'updatedAt'>): Promise<MockVideoType> => {
  const validation = VideoInputSchema.safeParse(videoData);
  if (!validation.success) {
    console.error("Video validation failed (add):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid video data.");
  }
  const newVideo: MockVideoType = { 
    id: `vid-${Date.now()}`, 
    ...validation.data, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  const videos = getStoredData('adminVideos', mockVideosForSeeding);
  videos.unshift(newVideo);
  saveStoredData('adminVideos', videos);
  return Promise.resolve(newVideo);
};
export const updateVideoInDb = async (videoId: string, videoData: Partial<Omit<MockVideoType, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MockVideoType> => {
  const validation = VideoInputSchema.partial().safeParse(videoData);
  if (!validation.success) {
    console.error("Video validation failed (update):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid video data for update.");
  }
  let videos = getStoredData('adminVideos', mockVideosForSeeding);
  const index = videos.findIndex(v => v.id === videoId);
  if (index === -1) throw new Error("Video not found");
  videos[index] = { ...videos[index], ...validation.data, updatedAt: new Date().toISOString() };
  saveStoredData('adminVideos', videos);
  return Promise.resolve(videos[index]);
};
export const deleteVideoFromDb = async (videoId: string): Promise<void> => {
  let videos = getStoredData('adminVideos', mockVideosForSeeding);
  videos = videos.filter(v => v.id !== videoId);
  saveStoredData('adminVideos', videos);
  return Promise.resolve();
};

// --- PaymentSettings (localStorage) ---
export const getPaymentSettingsFromDb = async (): Promise<MockPaymentSettingsType | null> => {
  const settingsArray = getStoredData('paymentSettingsGlobal', [mockDefaultPaymentSettings]);
  return Promise.resolve(settingsArray[0] || null);
};
export const savePaymentSettingsToDb = async (settingsData: Omit<MockPaymentSettingsType, 'id'| 'updatedAt'>): Promise<MockPaymentSettingsType> => {
  const updatedSettings = { ...settingsData, id:'global', updatedAt: new Date().toISOString() };
  saveStoredData('paymentSettingsGlobal', [updatedSettings as MockPaymentSettingsType]);
  return Promise.resolve(updatedSettings as MockPaymentSettingsType);
};

// --- PaymentSubmission (localStorage) ---
const AddPaymentSubmissionInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  screenshotUrl: z.string().refine(val => val.startsWith('data:image/'), {
    message: "Screenshot must be a valid data URI image (e.g., starts with 'data:image/').",
  }),
});
export const getPaymentSubmissionsFromDb = async (): Promise<MockPaymentSubmissionType[]> => {
  const submissions = getStoredData('paymentSubmissions', mockPaymentSubmissions);
  const allUsers = getStoredData('managedUsers_hashed', mockUsersForSeeding); // Managed users are in-memory, this might need adjustment if users migrate fully to DB
  const allCourses = await getCoursesFromDb(); // Use Prisma version now

  return Promise.resolve(submissions.map(sub => ({
    ...sub,
    // @ts-ignore
    user: allUsers.find(u => u.id === sub.userId), 
    course: allCourses.find(c => c.id === sub.courseId),
  })).sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
};
export const addPaymentSubmissionToDb = async (submissionData: Omit<MockPaymentSubmissionType, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes' | 'user' | 'course'> & { userId: string, courseId: string }): Promise<MockPaymentSubmissionType> => {
  const validation = AddPaymentSubmissionInputSchema.safeParse(submissionData);
  if (!validation.success) {
    console.error("Payment submission validation failed:", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid payment submission data.");
  }
  const newSubmission: MockPaymentSubmissionType = {
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
export const updatePaymentSubmissionInDb = async (submissionId: string, dataToUpdate: { status: PaymentSubmissionStatus, adminNotes?: string, reviewedAt?: Date }): Promise<MockPaymentSubmissionType> => {
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

// --- Enrollment (localStorage) ---
export const getEnrollmentForUserAndCourseFromDb = async (userId: string, courseId: string): Promise<MockEnrollmentType | null> => {
  const enrollments = getStoredData('userEnrollments', mockEnrollments);
  return Promise.resolve(enrollments.find(e => e.userId === userId && e.courseId === courseId) || null);
};
export const createEnrollmentInDb = async (userId: string, courseId: string): Promise<MockEnrollmentType> => {
  const newEnrollment: MockEnrollmentType = {
    id: `enr-${Date.now()}`, userId, courseId, progress: 0, enrolledDate: new Date().toISOString(),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  const enrollments = getStoredData('userEnrollments', mockEnrollments);
  enrollments.push(newEnrollment);
  saveStoredData('userEnrollments', enrollments);
  return Promise.resolve(newEnrollment);
};
export const updateEnrollmentProgressInDb = async (enrollmentId: string, progress: number): Promise<MockEnrollmentType> => {
  let enrollments = getStoredData('userEnrollments', mockEnrollments);
  const index = enrollments.findIndex(e => e.id === enrollmentId);
  if (index === -1) throw new Error("Enrollment not found");
  enrollments[index] = { ...enrollments[index], progress, updatedAt: new Date().toISOString() };
  saveStoredData('userEnrollments', enrollments);
  return Promise.resolve(enrollments[index]);
};
export const getEnrollmentsByUserIdFromDb = async (userId: string): Promise<MockEnrollmentType[]> => {
  const enrollments = getStoredData('userEnrollments', mockEnrollments);
  const userEnrollments = enrollments.filter(e => e.userId === userId);
  const allCourses = await getCoursesFromDb(); // Uses Prisma version

  return Promise.resolve(userEnrollments.map(e => ({
    ...e,
    // @ts-ignore // course could be null if not found, but mock setup assumes it exists.
    course: allCourses.find(c => c.id === e.courseId) 
  })).sort((a,b) => new Date(b.enrolledDate).getTime() - new Date(a.enrolledDate).getTime() ));
};


// --- Seeding Functions ---
export const seedCategoriesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils] seedCategoriesToDb: Starting category seeding...");
  let successCount = 0, errorCount = 0, skippedCount = 0;
  for (const catData of mockCategoriesForSeeding) {
    try {
      const existing = await prisma.category.findUnique({ where: { name: catData.name } });
      if (existing) {
        console.log(`[dbUtils] seedCategoriesToDb: Category "${catData.name}" already exists, skipping.`);
        skippedCount++;
        continue;
      }
      await prisma.category.create({
        data: {
          name: catData.name,
          imageUrl: catData.imageUrl,
          dataAiHint: catData.dataAiHint,
          iconName: catData.iconName,
        }
      });
      console.log(`[dbUtils] seedCategoriesToDb: Category "${catData.name}" seeded successfully.`);
      successCount++;
    } catch (error) {
      console.error(`[dbUtils] seedCategoriesToDb: Error seeding category ${catData.name}:`, error);
      errorCount++;
    }
  }
  console.log(`[dbUtils] seedCategoriesToDb: Seeding complete. Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`);
  return { successCount, errorCount, skippedCount };
};

export const seedCoursesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils] seedCoursesToDb: Starting course seeding...");
  let successCount = 0, errorCount = 0, skippedCount = 0;
  for (const courseData of mockCoursesForSeeding) {
    try {
      const existing = await prisma.course.findUnique({ where: { id: courseData.id } });
      if (existing) {
        console.log(`[dbUtils] seedCoursesToDb: Course "${courseData.title}" (ID: ${courseData.id}) already exists, skipping.`);
        skippedCount++;
        continue;
      }

      let category = await prisma.category.findUnique({ where: { name: courseData.category } });
      if (!category) {
        console.log(`[dbUtils] seedCoursesToDb: Category "${courseData.category}" for course "${courseData.title}" not found, creating it.`);
        category = await prisma.category.create({ data: { name: courseData.category, iconName: 'Shapes' } });
      }

      const courseCreateData: any = { // Build this carefully matching Prisma schema
        id: courseData.id, // Use mock ID for seeding
        title: courseData.title,
        description: courseData.description,
        instructor: courseData.instructor,
        imageUrl: courseData.imageUrl,
        dataAiHint: courseData.dataAiHint,
        price: courseData.price,
        currency: courseData.currency,
        isFeatured: courseData.isFeatured,
        learningObjectives: courseData.learningObjectives || [],
        targetAudience: courseData.targetAudience,
        prerequisites: courseData.prerequisites || [],
        estimatedTimeToComplete: courseData.estimatedTimeToComplete,
        categoryId: category.id,
        categoryNameCache: category.name,
        modules: {
          create: courseData.modules.map((mod, modIdx) => ({
            id: mod.id, title: mod.title, order: modIdx,
            lessons: {
              create: mod.lessons.map((les, lesIdx) => ({
                id: les.id, title: les.title, duration: les.duration, description: les.description,
                embedUrl: les.embedUrl, imageUrl: les.imageUrl, order: lesIdx
              }))
            }
          }))
        },
        quizzes: {
          create: courseData.quizzes?.map(quiz => ({
            id: quiz.id, title: quiz.title, quizType: quiz.quizType as QuizType, passingScore: quiz.passingScore,
            questions: {
              create: quiz.questions.map(q => ({
                id: q.id, text: q.text, order: 0, // Assuming order 0 for simplicity in seed
                points: q.points,
                options: { create: q.options.map(opt => ({ id: opt.id, text: opt.text })) },
                correctOptionId: q.correctOptionId, // Relies on option IDs being stable in mock data
              }))
            }
          })) || []
        }
      };
      
      await prisma.course.create({ data: courseCreateData });
      console.log(`[dbUtils] seedCoursesToDb: Course "${courseData.title}" seeded successfully.`);
      successCount++;
    } catch (error) {
      console.error(`[dbUtils] seedCoursesToDb: Error seeding course ${courseData.title}:`, error);
      errorCount++;
    }
  }
  console.log(`[dbUtils] seedCoursesToDb: Seeding complete. Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`);
  return { successCount, errorCount, skippedCount };
};

export const seedLearningPathsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils] seedLearningPathsToDb: Starting learning path seeding...");
  let successCount = 0, errorCount = 0, skippedCount = 0;
  for (const lpData of mockLearningPathsForSeeding) {
    try {
      const existing = await prisma.learningPath.findUnique({ where: { id: lpData.id } });
      if (existing) {
        console.log(`[dbUtils] seedLearningPathsToDb: Learning Path "${lpData.title}" (ID: ${lpData.id}) already exists, skipping.`);
        skippedCount++;
        continue;
      }
      await prisma.learningPath.create({
        data: {
          id: lpData.id, // Use mock ID
          title: lpData.title,
          description: lpData.description,
          icon: lpData.icon,
          imageUrl: lpData.imageUrl,
          dataAiHint: lpData.dataAiHint,
          learningPathCourses: {
            create: lpData.courseIds.map((courseId, index) => ({
              courseId: courseId, // This assumes courses with these IDs exist from course seeding
              order: index
            }))
          }
        }
      });
      console.log(`[dbUtils] seedLearningPathsToDb: Learning Path "${lpData.title}" seeded successfully.`);
      successCount++;
    } catch (error) {
      console.error(`[dbUtils] seedLearningPathsToDb: Error seeding learning path ${lpData.title}:`, error);
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2003') { // Prisma foreign key constraint error
         console.warn(`[dbUtils] seedLearningPathsToDb: Skipping learning path "${lpData.title}" due to missing course(s) (Foreign Key Constraint). Ensure courses are seeded first and course IDs in mockLearningPathsForSeeding are valid.`);
      } else {
        errorCount++;
      }
    }
  }
  console.log(`[dbUtils] seedLearningPathsToDb: Seeding complete. Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`);
  return { successCount, errorCount, skippedCount };
};


// For Videos, PaymentSettings, Submissions, Enrollments - still use localStorage seeders
export const seedVideosToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  localStorage.setItem('adminVideos', JSON.stringify(mockVideosForSeeding));
  console.log("[dbUtils] seedVideosToDb: Videos seeded to localStorage.");
  return { successCount: mockVideosForSeeding.length, errorCount: 0, skippedCount: 0 };
};
export const seedPaymentSettingsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  localStorage.setItem('paymentSettingsGlobal', JSON.stringify([mockDefaultPaymentSettings]));
  console.log("[dbUtils] seedPaymentSettingsToDb: Payment Settings seeded to localStorage.");
  return { successCount: 1, errorCount: 0, skippedCount: 0 };
};
// seedInitialUsersToLocalStorage is handled in authUtils.ts as it needs access to hashing
    
