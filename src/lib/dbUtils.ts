
import prisma from './prisma'; // Import Prisma client
import { 
  // Still need mock data for seeding and for entities not yet migrated to Prisma
  mockUsersForSeeding, 
  mockCoursesForSeeding,
  mockCategoriesForSeeding,
  mockVideosForSeeding, 
  mockLearningPathsForSeeding,
  initialPaymentSettings as mockDefaultPaymentSettings, 
  paymentSubmissions_DEPRECATED_USE_FIRESTORE as mockPaymentSubmissionsSeed, // Renamed for clarity
  enrollments_DEPRECATED_USE_FIRESTORE as mockEnrollmentsSeed, // Renamed for clarity
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
} from '@/data/mockData';
import { QuizType as PrismaQuizTypeEnum, type Course, type Category, type LearningPath, type Module, type Lesson, type Quiz, type Question, type Option, type QuizType as PrismaQuizTypeTypeAlias, type Video, type PaymentSettings, type PaymentSubmission, type Enrollment, type User, type PaymentSubmissionStatus as PrismaPaymentStatus } from '@prisma/client'; // Correctly import QuizType enum object
import { z } from 'zod';

console.log("[dbUtils] Loading dbUtils.ts module. DATABASE_URL from env (initial check):", process.env.DATABASE_URL ? "Exists" : "NOT FOUND/EMPTY");
if (process.env.DATABASE_URL) {
  console.log("[dbUtils] DATABASE_URL (first 30 chars for initial check):", process.env.DATABASE_URL.substring(0, 30) + "...");
}

// Re-export Prisma types for convenience in components
export type { 
    Category, Course, Module, Lesson, Quiz, Question, Option, 
    LearningPath, User, Video, PaymentSettings, PaymentSubmission, Enrollment,
    PrismaPaymentStatus as PaymentSubmissionStatus, // Use Prisma enum type
    PrismaQuizTypeTypeAlias as QuizType // Exporting the Prisma Type for QuizType
};


// Zod Schemas for Input Validation
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
  quizType: z.nativeEnum(PrismaQuizTypeEnum), // Use imported Prisma enum object
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

const VideoInputSchema = z.object({ 
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

const PaymentSubmissionInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  screenshotUrl: z.string().url("Screenshot URL must be a valid URL.").refine(val => val.startsWith('data:image/') || val.startsWith('http'), {
    message: "Screenshot must be a valid data URI image or an HTTP(S) URL.",
  }),
});


// --- Category Functions (Using Prisma) ---
export const getCategoriesFromDb = async (): Promise<Category[]> => {
  console.log("[dbUtils] getCategoriesFromDb: Fetching categories... DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
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
  console.log("[dbUtils] addCategoryToDb: Attempting to add category. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING", "Data:", JSON.stringify(categoryData, null, 1));
  const validation = CategoryInputSchema.safeParse(categoryData);
  if (!validation.success) {
    console.error("[dbUtils] addCategoryToDb: Category validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data.");
  }
  console.log("[dbUtils] addCategoryToDb: Validation successful. Data for Prisma:", JSON.stringify(validation.data, null, 1));
  try {
    const newCategory = await prisma.category.create({ data: validation.data });
    console.log("[dbUtils] addCategoryToDb: Category created successfully in DB:", JSON.stringify(newCategory, null, 1));
    return newCategory;
  } catch (error) {
    console.error("[dbUtils] addCategoryToDb: Error creating category in DB:", error);
    throw error;
  }
};
export const updateCategoryInDb = async (categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>>): Promise<Category> => {
  console.log(`[dbUtils] updateCategoryInDb: Attempting to update category ID ${categoryId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING", "Data:", JSON.stringify(categoryData, null, 1));
  const validation = CategoryInputSchema.partial().safeParse(categoryData);
  if (!validation.success) {
    console.error("[dbUtils] updateCategoryInDb: Category validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data for update.");
  }
  console.log("[dbUtils] updateCategoryInDb: Validation successful. Data for Prisma:", JSON.stringify(validation.data, null, 1));
  try {
    const updatedCategory = await prisma.category.update({ where: { id: categoryId }, data: validation.data });
    console.log("[dbUtils] updateCategoryInDb: Category updated successfully in DB:", JSON.stringify(updatedCategory, null, 1));
    return updatedCategory;
  } catch (error) {
    console.error(`[dbUtils] updateCategoryInDb: Error updating category ID ${categoryId} in DB:`, error);
    throw error;
  }
};
export const deleteCategoryFromDb = async (categoryId: string): Promise<void> => {
  console.log(`[dbUtils] deleteCategoryFromDb: Attempting to delete category ID ${categoryId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING");
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
  console.log("[dbUtils] getCoursesFromDb: Fetching courses... DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
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
  console.log(`[dbUtils] getCourseByIdFromDb: Fetching course ID ${courseId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING");
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
  courseData: Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'|'enrollments'|'paymentSubmissions'> & { 
    categoryName: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>>> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { quizType: PrismaQuizTypeEnum, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }> }>
  }
): Promise<Course> => {
  console.log("[dbUtils] addCourseToDb: Function called. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
  console.log("[dbUtils] addCourseToDb: Attempting to add course. Data (first 500 chars):", JSON.stringify(courseData).substring(0, 500) + "...");
  
  const validation = CourseInputSchema.safeParse(courseData);
  if (!validation.success) {
    console.error("[dbUtils] addCourseToDb: Course validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data.");
  }
  console.log("[dbUtils] addCourseToDb: Zod validation successful.");
  const { categoryName, modules, quizzes, ...mainCourseData } = validation.data;

  try {
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      console.log(`[dbUtils] addCourseToDb: Category "${categoryName}" not found, creating it.`);
      category = await prisma.category.create({ data: { name: categoryName, iconName: 'Shapes' } });
      console.log(`[dbUtils] addCourseToDb: Category "${categoryName}" created with ID: ${category.id}`);
    } else {
      console.log(`[dbUtils] addCourseToDb: Found existing category "${categoryName}" with ID: ${category.id}`);
    }

    const prismaCourseData: any = {
      ...mainCourseData,
      categoryId: category.id,
      categoryNameCache: category.name, 
      learningObjectives: mainCourseData.learningObjectives || [],
      prerequisites: mainCourseData.prerequisites || [],
      modules: modules ? {
        create: modules.map((mod, modIdx) => ({
          title: mod.title!,
          order: mod.order ?? modIdx,
          lessons: mod.lessons ? {
            create: mod.lessons.map((les, lesIdx) => ({
              title: les.title!,
              duration: les.duration,
              description: les.description,
              embedUrl: les.embedUrl,
              imageUrl: les.imageUrl,
              order: les.order ?? lesIdx,
            })),
          } : undefined,
        })),
      } : undefined,
      quizzes: quizzes ? {
        create: quizzes.map((quizData) => ({
          title: quizData.title!,
          quizType: quizData.quizType!, // Already validated by Zod to be Prisma enum
          passingScore: quizData.passingScore,
          questions: quizData.questions ? {
            create: quizData.questions.map(q => ({
              text: q.text!,
              order: q.order!,
              points: q.points,
              options: { create: q.options.map(opt => ({ text: opt.text! })) },
            }))
          } : undefined,
        })),
      } : undefined,
    };
    
    console.log("[dbUtils] addCourseToDb: Prepared prismaCourseData (first 500 chars):", JSON.stringify(prismaCourseData).substring(0,500) + "...");
    console.log("[dbUtils] addCourseToDb: Attempting prisma.course.create...");
    const createdCourse = await prisma.course.create({
      data: prismaCourseData,
      include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } }
    });
    console.log("[dbUtils] addCourseToDb: Course created with ID:", createdCourse.id);

    if (createdCourse.quizzes && quizzes) { // `quizzes` here is from validation.data
      console.log("[dbUtils] addCourseToDb: Starting correctOptionId update loop for new quizzes.");
      for (let i = 0; i < createdCourse.quizzes.length; i++) {
          const dbQuiz = createdCourse.quizzes[i];
          const formQuiz = quizzes[i]; // Original input quiz data (after Zod validation)
          console.log(`[dbUtils] addCourseToDb: Processing quiz index ${i}, DB Quiz ID: ${dbQuiz.id}, Form Quiz Title: ${formQuiz?.title}`);
          if (dbQuiz.questions && formQuiz?.questions) {
              for (let j = 0; j < dbQuiz.questions.length; j++) {
                  const dbQuestion = dbQuiz.questions[j];
                  const formQuestion = formQuiz.questions[j];
                  console.log(`[dbUtils] addCourseToDb:   Processing question index ${j}, DB Question ID: ${dbQuestion.id}, Form Question Text: ${formQuestion?.text}`);
                  if (formQuestion?.correctOptionText && dbQuestion.options.length > 0) {
                      const correctDbOption = dbQuestion.options.find(opt => opt.text === formQuestion.correctOptionText);
                      if (correctDbOption) {
                          console.log(`[dbUtils] addCourseToDb:     Found correct option for question ${dbQuestion.id} by text "${formQuestion.correctOptionText}", DB Option ID: ${correctDbOption.id}`);
                          if (dbQuestion.correctOptionId !== correctDbOption.id) {
                            await prisma.question.update({
                                where: { id: dbQuestion.id },
                                data: { correctOptionId: correctDbOption.id }
                            });
                            console.log(`[dbUtils] addCourseToDb:       Updated correctOptionId for question ${dbQuestion.id} to ${correctDbOption.id}`);
                          } else {
                            console.log(`[dbUtils] addCourseToDb:       correctOptionId for question ${dbQuestion.id} is already set correctly.`);
                          }
                      } else {
                        console.warn(`[dbUtils] addCourseToDb:     Could not find correct option by text "${formQuestion.correctOptionText}" for question ${dbQuestion.id}`);
                      }
                  } else {
                    console.log(`[dbUtils] addCourseToDb:     No correctOptionText provided or no options for question ${dbQuestion.id}`);
                  }
              }
          }
      }
      console.log("[dbUtils] addCourseToDb: Finished correctOptionId update loop.");
    }
    
    console.log("[dbUtils] addCourseToDb: Fetching final course details for ID:", createdCourse.id);
    const finalCourse = await getCourseByIdFromDb(createdCourse.id);
    if (!finalCourse) {
        console.error("[dbUtils] addCourseToDb: CRITICAL - Course just created but not found by getCourseByIdFromDb. ID:", createdCourse.id);
        throw new Error("Failed to retrieve newly created course details.");
    }
    console.log("[dbUtils] addCourseToDb: Successfully added and retrieved course:", finalCourse.id);
    return finalCourse;

  } catch (error) {
    console.error("[dbUtils] addCourseToDb: CAUGHT ERROR DURING PRISMA OPERATION OR SUBSEQUENT LOGIC:", error);
    if (error instanceof Error) {
        console.error("[dbUtils] addCourseToDb: Error Name:", error.name);
        console.error("[dbUtils] addCourseToDb: Error Message:", error.message);
        console.error("[dbUtils] addCourseToDb: Error Stack:", error.stack);
    }
    // @ts-ignore
    if (error.code) {  console.error("[dbUtils] addCourseToDb: Prisma Error Code:", error.code); }
    // @ts-ignore
    if (error.meta) { console.error("[dbUtils] addCourseToDb: Prisma Error Meta:", JSON.stringify(error.meta, null, 1)); }
    throw error; 
  }
};
export const updateCourseInDb = async (
  courseId: string, 
  courseData: Partial<Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'|'enrollments'|'paymentSubmissions'>> & { 
    categoryName?: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { id?: string, lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>> & {id?: string}> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { id?: string, quizType: PrismaQuizTypeEnum, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { id?: string, options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>> & {id?:string}>, correctOptionText?: string }> }>
  }
): Promise<Course> => {
  console.log(`[dbUtils] updateCourseInDb: Attempting to update course ID ${courseId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING", "Data (first 500 chars):", JSON.stringify(courseData).substring(0,500)+"...");
  const validation = CourseInputSchema.partial().safeParse(courseData);
  if (!validation.success) {
    console.error("[dbUtils] updateCourseInDb: Course validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data for update.");
  }
  console.log("[dbUtils] updateCourseInDb: Zod validation successful.");
  const { categoryName, modules, quizzes, ...mainCourseData } = validation.data;
  
  try {
    let categoryIdToLink: string | undefined = undefined;
    let categoryNameToCache: string | undefined = undefined;

    if (categoryName) {
      let category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) {
        category = await prisma.category.create({ data: { name: categoryName, iconName: 'Shapes' } });
      }
      categoryIdToLink = category.id;
      categoryNameToCache = category.name;
    }
    
    console.log(`[dbUtils] updateCourseInDb: Deleting existing modules and quizzes for course ID ${courseId}.`);
    await prisma.module.deleteMany({ where: { courseId: courseId } }); 
    await prisma.quiz.deleteMany({where: {courseId: courseId }}); 

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
          order: mod.order ?? modIdx,
          lessons: mod.lessons ? {
            create: mod.lessons.map((les, lesIdx) => ({
              title: les.title!,
              duration: les.duration,
              description: les.description,
              embedUrl: les.embedUrl,
              imageUrl: les.imageUrl,
              order: les.order ?? lesIdx,
            })),
          } : undefined,
        })),
      };
    }

    if (quizzes) {
      prismaCourseUpdateData.quizzes = {
        create: quizzes.map((quizData) => ({
            title: quizData.title!,
            quizType: quizData.quizType!,
            passingScore: quizData.passingScore,
            questions: quizData.questions ? {
              create: quizData.questions.map(q => ({
                text: q.text!,
                order: q.order!,
                points: q.points,
                options: { create: q.options.map(opt => ({ text: opt.text! })) },
              }))
            } : undefined,
          })),
      };
    }
    
    console.log(`[dbUtils] updateCourseInDb: Prepared prismaCourseUpdateData for course ${courseId} (first 500 chars):`, JSON.stringify(prismaCourseUpdateData).substring(0,500)+"...");
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: prismaCourseUpdateData,
      include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } }
    });
    console.log(`[dbUtils] updateCourseInDb: Course ${courseId} updated. Starting correctOptionId update loop for its quizzes.`);
    
    if (updatedCourse.quizzes && quizzes) { // `quizzes` is from validation.data
        for (let i = 0; i < updatedCourse.quizzes.length; i++) {
            const dbQuiz = updatedCourse.quizzes[i];
            const formQuiz = quizzes[i]; 
            if (dbQuiz.questions && formQuiz?.questions) {
                for (let j = 0; j < dbQuiz.questions.length; j++) {
                    const dbQuestion = dbQuiz.questions[j];
                    const formQuestion = formQuiz.questions[j];
                    if (formQuestion?.correctOptionText && dbQuestion.options.length > 0) {
                        const correctDbOption = dbQuestion.options.find(opt => opt.text === formQuestion.correctOptionText);
                        if (correctDbOption && dbQuestion.correctOptionId !== correctDbOption.id) {
                            await prisma.question.update({
                                where: { id: dbQuestion.id },
                                data: { correctOptionId: correctDbOption.id }
                            });
                            console.log(`[dbUtils] updateCourseInDb:   Updated correctOptionId for question ${dbQuestion.id} to ${correctDbOption.id}`);
                        }
                    }
                }
            }
        }
    }
    console.log(`[dbUtils] updateCourseInDb: Finished correctOptionId update loop for course ${courseId}. Fetching final details.`);
    const finalCourse = await getCourseByIdFromDb(updatedCourse.id);
    if (!finalCourse) {
        console.error("[dbUtils] updateCourseInDb: CRITICAL - Course just updated but not found by getCourseByIdFromDb. ID:", updatedCourse.id);
        throw new Error("Failed to retrieve newly updated course details.");
    }
    console.log(`[dbUtils] updateCourseInDb: Successfully updated and retrieved course ${courseId}.`);
    return finalCourse;

  } catch (error) {
    console.error(`[dbUtils] updateCourseInDb: CAUGHT ERROR updating course ID ${courseId} in DB:`, error);
     if (error instanceof Error) {
        console.error("[dbUtils] updateCourseInDb: Error Name:", error.name);
        console.error("[dbUtils] updateCourseInDb: Error Message:", error.message);
        console.error("[dbUtils] updateCourseInDb: Error Stack:", error.stack);
    }
    // @ts-ignore
    if (error.code) {  console.error("[dbUtils] updateCourseInDb: Prisma Error Code:", error.code); }
    // @ts-ignore
    if (error.meta) { console.error("[dbUtils] updateCourseInDb: Prisma Error Meta:", JSON.stringify(error.meta, null, 1)); }
    throw error;
  }
};
export const deleteCourseFromDb = async (courseId: string): Promise<void> => {
  console.log(`[dbUtils] deleteCourseFromDb: Attempting to delete course ID ${courseId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING");
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
  console.log("[dbUtils] getLearningPathsFromDb: Fetching learning paths... DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
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
  console.log("[dbUtils] addLearningPathToDb: Attempting to add learning path. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING", "Data:", JSON.stringify(pathData, null, 1));
  const validation = LearningPathInputSchema.safeParse(pathData);
  if (!validation.success) {
    console.error("[dbUtils] addLearningPathToDb: Learning Path validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid learning path data.");
  }
  const { courseIdsToConnect, ...restData } = validation.data;
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
  console.log(`[dbUtils] updateLearningPathInDb: Attempting to update LP ID ${pathId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING", "Data:", JSON.stringify(pathData, null, 1));
  const validation = LearningPathInputSchema.partial().safeParse(pathData);
  if (!validation.success) {
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid learning path data for update.");
  }
  const { courseIdsToConnect, ...restData } = validation.data;
  try {
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
    return updatedPath;
  } catch (error) {
    console.error(`[dbUtils] updateLearningPathInDb: Error updating learning path ID ${pathId} in DB:`, error);
    throw error;
  }
};
export const deleteLearningPathFromDb = async (pathId: string): Promise<void> => {
  console.log(`[dbUtils] deleteLearningPathFromDb: Attempting to delete LP ID ${pathId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING");
  try {
    await prisma.learningPath.delete({ where: { id: pathId } });
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
    console.log(`[dbUtils] saveQuizWithQuestionsToDb: Saving quiz for course ${courseIdForQuiz}. Quiz Title: ${quizData.title}`);
    try {
        let existingQuiz = quizData.id && !quizData.id.startsWith('quiz-new-') 
            ? await prisma.quiz.findUnique({ where: { id: quizData.id }, include: { questions: { include: { options: true } } } }) 
            : null;

        if (existingQuiz) {
            console.log(`[dbUtils] saveQuizWithQuestionsToDb: Updating existing quiz ID ${existingQuiz.id}`);
            if (quizData.questionIdsToDelete && quizData.questionIdsToDelete.length > 0) {
                const validIdsToDelete = quizData.questionIdsToDelete.filter(id => !id.startsWith('q-new-'));
                if (validIdsToDelete.length > 0) {
                   console.log(`[dbUtils] saveQuizWithQuestionsToDb: Deleting questions for quiz ${existingQuiz.id}:`, validIdsToDelete);
                   await prisma.question.deleteMany({ where: { id: { in: validIdsToDelete }, quizId: existingQuiz.id } });
                }
            }

            const upsertPromises = quizData.questionsToUpsert?.map(async qData => {
                const optionsPayload = qData.optionsToCreate.map((opt: any) => ({ text: opt.text! }));
                const questionPayload: any = { text: qData.text, order: qData.order ?? 0, points: qData.points };
                let savedQuestion: Question & { options: Option[] };

                if (qData.id && !qData.id.startsWith('q-new-')) { 
                    console.log(`[dbUtils] saveQuizWithQuestionsToDb: Updating question ID ${qData.id}`);
                    await prisma.option.deleteMany({where: {questionId: qData.id}});
                    savedQuestion = await prisma.question.update({
                        where: { id: qData.id },
                        data: { ...questionPayload, options: { create: optionsPayload } },
                        include: { options: true }
                    });
                } else { 
                    console.log(`[dbUtils] saveQuizWithQuestionsToDb: Creating new question for quiz ${existingQuiz!.id}`);
                    savedQuestion = await prisma.question.create({
                        data: { ...questionPayload, quizId: existingQuiz!.id, options: { create: optionsPayload } },
                        include: { options: true }
                    });
                }
                if (qData.correctOptionTextForNew && savedQuestion.options.length > 0) {
                    const correctOpt = savedQuestion.options.find(opt => opt.text === qData.correctOptionTextForNew);
                    if(correctOpt && savedQuestion.correctOptionId !== correctOpt.id){
                        await prisma.question.update({where: {id: savedQuestion.id}, data: {correctOptionId: correctOpt.id}});
                         console.log(`[dbUtils] saveQuizWithQuestionsToDb:   Updated correctOptionId for question ${savedQuestion.id} to ${correctOpt.id}`);
                    }
                }
                return savedQuestion;
            }) || [];
            await Promise.all(upsertPromises);
            
            const updatedQuiz = await prisma.quiz.update({
                where: { id: existingQuiz.id },
                data: { title: quizData.title, quizType: quizData.quizType as PrismaQuizTypeEnum, passingScore: quizData.passingScore },
                include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } }
            });
            console.log(`[dbUtils] saveQuizWithQuestionsToDb: Quiz ID ${existingQuiz.id} updated successfully.`);
            return updatedQuiz;
        } else {
            console.log(`[dbUtils] saveQuizWithQuestionsToDb: Creating new quiz for course ${courseIdForQuiz}`);
            const createdQuiz = await prisma.quiz.create({
                data: {
                    courseId: courseIdForQuiz,
                    title: quizData.title,
                    quizType: quizData.quizType as PrismaQuizTypeEnum,
                    passingScore: quizData.passingScore,
                    questions: quizData.questionsToUpsert ? {
                        create: quizData.questionsToUpsert.map(qData => {
                            const optionsToCreate = qData.optionsToCreate.map((opt: any) => ({ text: opt.text! }));
                            return { text: qData.text, order: qData.order ?? 0, points: qData.points, options: { create: optionsToCreate } };
                        })
                    } : undefined
                },
                include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } }
            });
             if (createdQuiz.questions && quizData.questionsToUpsert) {
                for (let i = 0; i < createdQuiz.questions.length; i++) {
                    const dbQuestion = createdQuiz.questions[i];
                    const formQuestion = quizData.questionsToUpsert[i];
                    if (formQuestion?.correctOptionTextForNew && dbQuestion.options.length > 0) {
                        const correctOpt = dbQuestion.options.find(opt => opt.text === formQuestion.correctOptionTextForNew);
                        if(correctOpt && dbQuestion.correctOptionId !== correctOpt.id){
                            await prisma.question.update({where: {id: dbQuestion.id}, data: {correctOptionId: correctOpt.id}});
                            console.log(`[dbUtils] saveQuizWithQuestionsToDb:   Updated correctOptionId for new question ${dbQuestion.id} to ${correctOpt.id}`);
                        }
                    }
                }
            }
            const finalQuiz = await prisma.quiz.findUniqueOrThrow({where: {id: createdQuiz.id}, include: {questions: {include: {options: true}}}});
            console.log(`[dbUtils] saveQuizWithQuestionsToDb: New quiz created with ID ${finalQuiz.id}.`);
            return finalQuiz;
        }
    } catch (error) {
        console.error("[dbUtils] saveQuizWithQuestionsToDb: CAUGHT ERROR saving quiz to DB:", error);
        if (error instanceof Error) {
            console.error("[dbUtils] saveQuizWithQuestionsToDb: Error Name:", error.name);
            console.error("[dbUtils] saveQuizWithQuestionsToDb: Error Message:", error.message);
            console.error("[dbUtils] saveQuizWithQuestionsToDb: Error Stack:", error.stack);
        }
        // @ts-ignore
        if (error.code) {  console.error("[dbUtils] saveQuizWithQuestionsToDb: Prisma Error Code:", error.code); }
        // @ts-ignore
        if (error.meta) { console.error("[dbUtils] saveQuizWithQuestionsToDb: Prisma Error Meta:", JSON.stringify(error.meta, null, 1)); }
        throw error;
    }
};

// --- Video Functions (Using Prisma) ---
export const getVideosFromDb = async (): Promise<Video[]> => {
  console.log("[dbUtils] getVideosFromDb: Fetching videos... DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
  return prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
};
export const addVideoToDb = async (videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> => {
  console.log("[dbUtils] addVideoToDb: Adding video. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING", "Data:", JSON.stringify(videoData, null, 1));
  const validation = VideoInputSchema.safeParse(videoData);
  if (!validation.success) {
    console.error("[dbUtils] addVideoToDb: Video validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid video data.");
  }
  return prisma.video.create({ data: validation.data });
};
export const updateVideoInDb = async (videoId: string, videoData: Partial<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Video> => {
  console.log(`[dbUtils] updateVideoInDb: Updating video ID ${videoId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING", "Data:", JSON.stringify(videoData, null, 1));
  const validation = VideoInputSchema.partial().safeParse(videoData);
  if (!validation.success) {
     console.error("[dbUtils] updateVideoInDb: Video validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid video data for update.");
  }
  return prisma.video.update({ where: { id: videoId }, data: validation.data });
};
export const deleteVideoFromDb = async (videoId: string): Promise<void> => {
  console.log(`[dbUtils] deleteVideoFromDb: Deleting video ID ${videoId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING");
  await prisma.video.delete({ where: { id: videoId } });
};

// --- PaymentSettings (Using Prisma) ---
export const getPaymentSettingsFromDb = async (): Promise<PaymentSettings | null> => {
  console.log("[dbUtils] getPaymentSettingsFromDb: Fetching payment settings. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
  return prisma.paymentSettings.findUnique({ where: { id: 'global' } });
};
export const savePaymentSettingsToDb = async (settingsData: Omit<PaymentSettings, 'id'| 'updatedAt'>): Promise<PaymentSettings> => {
  console.log("[dbUtils] savePaymentSettingsToDb: Saving payment settings. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING", "Data:", JSON.stringify(settingsData, null, 1));
  return prisma.paymentSettings.upsert({
    where: { id: 'global' },
    update: settingsData,
    create: { id: 'global', ...settingsData },
  });
};

// --- PaymentSubmission (Using Prisma) ---
export const getPaymentSubmissionsFromDb = async (filter?: { userId?: string }): Promise<PaymentSubmission[]> => {
  console.log("[dbUtils] getPaymentSubmissionsFromDb: Fetching payment submissions. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING", "Filter:", filter);
  return prisma.paymentSubmission.findMany({
    where: filter,
    include: { user: {select: {name:true, email:true}}, course: {select: {title: true}} }, 
    orderBy: { submittedAt: 'desc' }
  });
};
export const addPaymentSubmissionToDb = async (
  submissionData: Omit<PaymentSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes' | 'user' | 'course'> & { userId: string, courseId: string }
): Promise<PaymentSubmission> => {
  console.log("[dbUtils] addPaymentSubmissionToDb: Adding payment submission. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING", "Data:", JSON.stringify(submissionData, null, 1));
  const validation = PaymentSubmissionInputSchema.safeParse(submissionData);
  if (!validation.success) {
     console.error("[dbUtils] addPaymentSubmissionToDb: Validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid payment submission data.");
  }
  return prisma.paymentSubmission.create({
    data: {
      ...validation.data,
      status: 'PENDING', 
      submittedAt: new Date(),
    },
    include: { user: {select: {name:true, email:true}}, course: {select: {title: true}} }
  });
};
export const updatePaymentSubmissionInDb = async (
  submissionId: string, 
  dataToUpdate: { status: PrismaPaymentStatus, adminNotes?: string | null, reviewedAt?: Date }
): Promise<PaymentSubmission> => {
  console.log(`[dbUtils] updatePaymentSubmissionInDb: Updating submission ID ${submissionId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING", "Data:", JSON.stringify(dataToUpdate, null, 1));
  return prisma.paymentSubmission.update({
    where: { id: submissionId },
    data: {
      status: dataToUpdate.status,
      adminNotes: dataToUpdate.adminNotes,
      reviewedAt: dataToUpdate.reviewedAt || new Date(),
    },
    include: { user: {select: {name:true, email:true}}, course: {select: {title: true}} }
  });
};

// --- Enrollment (Using Prisma) ---
export const getEnrollmentForUserAndCourseFromDb = async (userId: string, courseId: string): Promise<Enrollment | null> => {
  console.log(`[dbUtils] getEnrollmentForUserAndCourseFromDb: Fetching for user ${userId}, course ${courseId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING");
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: { course: true } 
  });
};
export const createEnrollmentInDb = async (userId: string, courseId: string): Promise<Enrollment> => {
  console.log(`[dbUtils] createEnrollmentInDb: Creating for user ${userId}, course ${courseId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING");
  return prisma.enrollment.create({
    data: {
      userId,
      courseId,
      progress: 0,
      enrolledDate: new Date(),
    },
    include: { course: true }
  });
};
export const updateEnrollmentProgressInDb = async (enrollmentId: string, progress: number): Promise<Enrollment> => {
  console.log(`[dbUtils] updateEnrollmentProgressInDb: Updating enrollment ${enrollmentId} to progress ${progress}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING");
  return prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { progress },
    include: { course: true }
  });
};
export const getEnrollmentsByUserIdFromDb = async (userId: string): Promise<Enrollment[]> => {
  console.log(`[dbUtils] getEnrollmentsByUserIdFromDb: Fetching for user ${userId}. DATABASE_URL:`, process.env.DATABASE_URL ? "Exists" : "MISSING");
  return prisma.enrollment.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { enrolledDate: 'desc' }
  });
};


// --- Seeding Functions (Updated for Prisma) ---
export const seedCategoriesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils] seedCategoriesToDb: Seeding categories to DB. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
  let successCount = 0, errorCount = 0, skippedCount = 0;
  for (const catData of mockCategoriesForSeeding) {
    try {
      const existing = await prisma.category.findUnique({ where: { name: catData.name } });
      if (existing) { skippedCount++; continue; }
      await prisma.category.create({ data: { name: catData.name, imageUrl: catData.imageUrl, dataAiHint: catData.dataAiHint, iconName: catData.iconName } });
      successCount++;
    } catch (error) { console.error(`Error seeding category ${catData.name}:`, error); errorCount++; }
  }
  console.log(`[dbUtils] seedCategoriesToDb: Done. Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`);
  return { successCount, errorCount, skippedCount };
};

export const seedCoursesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils] seedCoursesToDb: Seeding courses to DB. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
  let s=0,e=0,sk=0;
  for(const cd of mockCoursesForSeeding){
    try{
      if(await prisma.course.findUnique({where:{id:cd.id}})){sk++;continue;}
      let cat=await prisma.category.findUnique({where:{name:cd.category}});
      if(!cat)cat=await prisma.category.create({data:{name:cd.category,iconName:'Shapes'}});
      const pcd:any={...cd,categoryId:cat.id,categoryNameCache:cat.name,quizzes:cd.quizzes?{create:cd.quizzes.map(q=>({...q,quizType: q.quizType.toUpperCase() as PrismaQuizTypeEnum, questions:q.questions?{create:q.questions.map(qs=>({...qs,options:{create:qs.options}}))}:undefined}))}:undefined,modules:cd.modules?{create:cd.modules.map(m=>({...m,lessons:m.lessons?{create:m.lessons}:undefined}))}:undefined};
      delete pcd.category; // Remove the string 'category' field before Prisma create
      await prisma.course.create({data:pcd});s++;
    }catch(err){console.error(`Err seed course ${cd.title}:`,err);e++;}
  }
  console.log(`[dbUtils] seedCoursesToDb: Done. Success: ${s}, Errors: ${e}, Skipped: ${sk}`);
  return {successCount:s,errorCount:e,skippedCount:sk};
};

export const seedLearningPathsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils] seedLearningPathsToDb: Seeding learning paths to DB. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
  let s=0,e=0,sk=0;
  for(const lpd of mockLearningPathsForSeeding){
    try{
      if(await prisma.learningPath.findUnique({where:{id:lpd.id}})){sk++;continue;}
      const { courseIds, ...restOfLpData } = lpd; // Separate courseIds
      await prisma.learningPath.create({data:{...restOfLpData,id:lpd.id,learningPathCourses:{create:courseIds.map((ci,i)=>({courseId:ci,order:i}))}}});s++;
    }catch(err){console.error(`Err seed LP ${lpd.title}:`,err);e++;}
  }
  console.log(`[dbUtils] seedLearningPathsToDb: Done. Success: ${s}, Errors: ${e}, Skipped: ${sk}`);
  return {successCount:s,errorCount:e,skippedCount:sk};
};

export const seedVideosToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils] seedVideosToDb: Seeding videos to DB. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
  let s=0,e=0,sk=0;
  for(const vd of mockVideosForSeeding){
    try{
      if(await prisma.video.findUnique({where:{id:vd.id}})){sk++;continue;}
      const {createdAt,updatedAt,videoUrl, ...restOfVd} = vd; // videoUrl not in schema, createdAt/updatedAt managed by Prisma
      await prisma.video.create({data:{...restOfVd,id:vd.id}});s++;
    }catch(err){console.error(`Err seed Video ${vd.title}:`,err);e++;}
  }
  console.log(`[dbUtils] seedVideosToDb: Done. Success: ${s}, Errors: ${e}, Skipped: ${sk}`);
  return {successCount:s,errorCount:e,skippedCount:sk};
};

export const seedPaymentSettingsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils] seedPaymentSettingsToDb: Seeding payment settings to DB. DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
  try{
    const {updatedAt, ...restOfSettings} = mockDefaultPaymentSettings; // updatedAt managed by Prisma
    await prisma.paymentSettings.upsert({where:{id:'global'},update:restOfSettings,create:{id:'global',...restOfSettings}});
    console.log(`[dbUtils] seedPaymentSettingsToDb: Done. Success: 1`);
    return{successCount:1,errorCount:0,skippedCount:0};
  }catch(err){console.error('Err seed PaymentSettings:',err);return{successCount:0,errorCount:1,skippedCount:0};}
};
    
    