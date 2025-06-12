
import prisma from './prisma'; 
import type { Prisma } from '@prisma/client'; // Import Prisma for Json types
import { 
  mockCoursesForSeeding,
  mockCategoriesForSeeding,
  mockVideosForSeeding as mockVideosForSeedingData,
  mockLearningPathsForSeeding,
  initialPaymentSettings as mockDefaultPaymentSettingsData,
  // We will now use Prisma for these, but mock data can still be a source for seeding
  // paymentSubmissions_DEPRECATED_USE_FIRESTORE, 
  // enrollments_DEPRECATED_USE_FIRESTORE,
} from '@/data/mockData';
import { QuizType as PrismaQuizTypeEnum, type SitePage, type Course, type Category, type LearningPath, type Module, type Lesson, type Quiz, type Question, type Option, type QuizType as PrismaQuizTypeTypeAlias, type Video, type PaymentSettings, type PaymentSubmission, type Enrollment, type User, type PaymentSubmissionStatus as PrismaPaymentStatus } from '@prisma/client';
import { z } from 'zod';

console.log("[dbUtils-Prisma] Loading dbUtils.ts module. DATABASE_URL from env (initial check):", process.env.DATABASE_URL ? "Exists" : "NOT FOUND/EMPTY");
if (process.env.DATABASE_URL) {
  console.log("[dbUtils-Prisma] DATABASE_URL (first 30 chars for initial check):", process.env.DATABASE_URL.substring(0, 30) + "...");
}

export type { 
    Category, Course, Module, Lesson, Quiz, Question, Option, SitePage,
    LearningPath, User, Video, PaymentSettings, PaymentSubmission, Enrollment,
    PrismaPaymentStatus as PaymentSubmissionStatus, 
    PrismaQuizTypeTypeAlias as QuizType 
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


// --- Category Functions (Using Prisma) ---
export const getCategoriesFromDb = async (): Promise<Category[]> => {
  console.log("[dbUtils-Prisma] getCategoriesFromDb: Fetching categories...");
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    console.log("[dbUtils-Prisma] getCategoriesFromDb: Found categories:", categories.length);
    return categories;
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
    return newCategory;
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
    return updatedCategory;
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
        quizzes: { include: { questions: { include: { options: true, correctOption: true }, orderBy: {order: 'asc'} } } }
      },
      orderBy: { title: 'asc' }
    });
    console.log("[dbUtils-Prisma] getCoursesFromDb: Found courses:", courses.length);
    return courses;
  } catch (error) {
    console.error("[dbUtils-Prisma] getCoursesFromDb: Error fetching courses:", error);
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
        quizzes: { include: { questions: { include: { options: true, correctOption: true }, orderBy: {order: 'asc'} } } }
      }
    });
    console.log(`[dbUtils-Prisma] getCourseByIdFromDb: Course ${courseId} ${course ? 'found' : 'not found'}.`);
    return course;
  } catch (error) {
    console.error(`[dbUtils-Prisma] getCourseByIdFromDb: Error fetching course ID ${courseId}:`, error);
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
  console.log("[dbUtils-Prisma] addCourseToDb: Function called.");
  console.log("[dbUtils-Prisma] addCourseToDb: Attempting to add course. Data (first 500 chars):", JSON.stringify(courseData).substring(0, 500) + "...");
  
  const validation = CourseInputSchema.safeParse(courseData);
  if (!validation.success) {
    console.error("[dbUtils-Prisma] addCourseToDb: Course validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data.");
  }
  console.log("[dbUtils-Prisma] addCourseToDb: Zod validation successful. Validated data (first 500 chars):", JSON.stringify(validation.data).substring(0,500) + "...");
  const { categoryName, modules, quizzes, ...mainCourseData } = validation.data;

  try {
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      console.log(`[dbUtils-Prisma] addCourseToDb: Category "${categoryName}" not found, creating it.`);
      category = await prisma.category.create({ data: { name: categoryName, iconName: 'Shapes' } });
      console.log(`[dbUtils-Prisma] addCourseToDb: Category "${categoryName}" created with ID: ${category.id}`);
    } else {
      console.log(`[dbUtils-Prisma] addCourseToDb: Found existing category "${categoryName}" with ID: ${category.id}`);
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
      } : undefined,
    };
    
    console.log("[dbUtils-Prisma] addCourseToDb: Prepared prismaCourseData (first 500 chars):", JSON.stringify(prismaCourseData).substring(0,500) + "...");
    console.log("[dbUtils-Prisma] addCourseToDb: Attempting prisma.course.create...");
    const createdCourse = await prisma.course.create({
      data: prismaCourseData,
      include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } }
    });
    console.log("[dbUtils-Prisma] addCourseToDb: Course created with ID:", createdCourse.id);

    if (createdCourse.quizzes && quizzes) { 
      console.log("[dbUtils-Prisma] addCourseToDb: Starting correctOptionId update loop for new quizzes.");
      for (let i = 0; i < createdCourse.quizzes.length; i++) {
          const dbQuiz = createdCourse.quizzes[i];
          const formQuiz = quizzes[i]; 
          console.log(`[dbUtils-Prisma] addCourseToDb: Processing quiz index ${i}, DB Quiz ID: ${dbQuiz.id}, Form Quiz Title: ${formQuiz?.title}`);
          if (dbQuiz.questions && formQuiz?.questions) {
              for (let j = 0; j < dbQuiz.questions.length; j++) {
                  const dbQuestion = dbQuiz.questions[j];
                  const formQuestion = formQuiz.questions[j];
                  console.log(`[dbUtils-Prisma] addCourseToDb:   Processing question index ${j}, DB Question ID: ${dbQuestion.id}, Form Question Text: ${formQuestion?.text}`);
                  if (formQuestion?.correctOptionText && dbQuestion.options.length > 0) {
                      const correctDbOption = dbQuestion.options.find(opt => opt.text === formQuestion.correctOptionText);
                      if (correctDbOption) {
                          console.log(`[dbUtils-Prisma] addCourseToDb:     Found correct option for question ${dbQuestion.id} by text "${formQuestion.correctOptionText}", DB Option ID: ${correctDbOption.id}`);
                          if (dbQuestion.correctOptionId !== correctDbOption.id) {
                            await prisma.question.update({
                                where: { id: dbQuestion.id },
                                data: { correctOptionId: correctDbOption.id }
                            });
                            console.log(`[dbUtils-Prisma] addCourseToDb:       Updated correctOptionId for question ${dbQuestion.id} to ${correctDbOption.id}`);
                          } else {
                            console.log(`[dbUtils-Prisma] addCourseToDb:       correctOptionId for question ${dbQuestion.id} is already set correctly.`);
                          }
                      } else {
                        console.warn(`[dbUtils-Prisma] addCourseToDb:     Could not find correct option by text "${formQuestion.correctOptionText}" for question ${dbQuestion.id}`);
                      }
                  } else {
                    console.log(`[dbUtils-Prisma] addCourseToDb:     No correctOptionText provided or no options for question ${dbQuestion.id}`);
                  }
              }
          }
      }
      console.log("[dbUtils-Prisma] addCourseToDb: Finished correctOptionId update loop.");
    }
    
    console.log("[dbUtils-Prisma] addCourseToDb: Fetching final course details for ID:", createdCourse.id);
    const finalCourse = await getCourseByIdFromDb(createdCourse.id);
    if (!finalCourse) {
        console.error("[dbUtils-Prisma] addCourseToDb: CRITICAL - Course just created but not found by getCourseByIdFromDb. ID:", createdCourse.id);
        throw new Error("Failed to retrieve newly created course details.");
    }
    console.log("[dbUtils-Prisma] addCourseToDb: Successfully added and retrieved course:", finalCourse.id);
    return finalCourse;

  } catch (error) {
    console.error("[dbUtils-Prisma] addCourseToDb: CAUGHT ERROR DURING PRISMA OPERATION OR SUBSEQUENT LOGIC:", error);
    if (error instanceof Error) {
        console.error("[dbUtils-Prisma] addCourseToDb: Error Name:", error.name);
        console.error("[dbUtils-Prisma] addCourseToDb: Error Message:", error.message);
        console.error("[dbUtils-Prisma] addCourseToDb: Error Stack:", error.stack);
    }
    // @ts-ignore
    if (error.code) {  console.error("[dbUtils-Prisma] addCourseToDb: Prisma Error Code:", error.code); }
    // @ts-ignore
    if (error.meta) { console.error("[dbUtils-Prisma] addCourseToDb: Prisma Error Meta:", JSON.stringify(error.meta, null, 1)); }
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
  console.log(`[dbUtils-Prisma] updateCourseInDb: Attempting to update course ID ${courseId}. Data (first 500 chars):`, JSON.stringify(courseData).substring(0,500)+"...");
  const validation = CourseInputSchema.partial().safeParse(courseData);
  if (!validation.success) {
    console.error("[dbUtils-Prisma] updateCourseInDb: Course validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data for update.");
  }
  console.log("[dbUtils-Prisma] updateCourseInDb: Zod validation successful. Validated data (first 500 chars):", JSON.stringify(validation.data).substring(0,500) + "...");
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
    
    console.log(`[dbUtils-Prisma] updateCourseInDb: Deleting existing modules and quizzes for course ID ${courseId}.`);
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
    
    console.log(`[dbUtils-Prisma] updateCourseInDb: Prepared prismaCourseUpdateData for course ${courseId} (first 500 chars):`, JSON.stringify(prismaCourseUpdateData).substring(0,500)+"...");
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: prismaCourseUpdateData,
      include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } }
    });
    console.log(`[dbUtils-Prisma] updateCourseInDb: Course ${courseId} updated. Starting correctOptionId update loop for its quizzes.`);
    
    if (updatedCourse.quizzes && quizzes) { 
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
                            console.log(`[dbUtils-Prisma] updateCourseInDb:   Updated correctOptionId for question ${dbQuestion.id} to ${correctDbOption.id}`);
                        }
                    }
                }
            }
        }
    }
    console.log(`[dbUtils-Prisma] updateCourseInDb: Finished correctOptionId update loop for course ${courseId}. Fetching final details.`);
    const finalCourse = await getCourseByIdFromDb(updatedCourse.id);
    if (!finalCourse) {
        console.error("[dbUtils-Prisma] updateCourseInDb: CRITICAL - Course just updated but not found by getCourseByIdFromDb. ID:", updatedCourse.id);
        throw new Error("Failed to retrieve newly updated course details.");
    }
    console.log(`[dbUtils-Prisma] updateCourseInDb: Successfully updated and retrieved course ${courseId}.`);
    return finalCourse;

  } catch (error) {
    console.error(`[dbUtils-Prisma] updateCourseInDb: CAUGHT ERROR updating course ID ${courseId} in DB:`, error);
     if (error instanceof Error) {
        console.error("[dbUtils-Prisma] updateCourseInDb: Error Name:", error.name);
        console.error("[dbUtils-Prisma] updateCourseInDb: Error Message:", error.message);
        console.error("[dbUtils-Prisma] updateCourseInDb: Error Stack:", error.stack);
    }
    // @ts-ignore
    if (error.code) {  console.error("[dbUtils-Prisma] updateCourseInDb: Prisma Error Code:", error.code); }
    // @ts-ignore
    if (error.meta) { console.error("[dbUtils-Prisma] updateCourseInDb: Prisma Error Meta:", JSON.stringify(error.meta, null, 1)); }
    throw error;
  }
};
export const deleteCourseFromDb = async (courseId: string): Promise<void> => {
  console.log(`[dbUtils-Prisma] deleteCourseFromDb: Attempting to delete course ID ${courseId}.`);
  try {
    await prisma.course.delete({ where: { id: courseId } });
    console.log(`[dbUtils-Prisma] deleteCourseFromDb: Course ID ${courseId} deleted successfully from DB.`);
  } catch (error) {
    console.error(`[dbUtils-Prisma] deleteCourseFromDb: Error deleting course ID ${courseId} from DB:`, error);
    throw error;
  }
};

// --- LearningPath Functions (Using Prisma) ---
export const getLearningPathsFromDb = async (): Promise<LearningPath[]> => {
  console.log("[dbUtils-Prisma] getLearningPathsFromDb: Fetching learning paths...");
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
    console.log("[dbUtils-Prisma] getLearningPathsFromDb: Found learning paths:", paths.length);
    return paths;
  } catch (error) {
    console.error("[dbUtils-Prisma] getLearningPathsFromDb: Error fetching learning paths:", error);
    throw error;
  }
};
export const addLearningPathToDb = async (
  pathData: Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'> & { courseIdsToConnect?: string[] }
): Promise<LearningPath> => {
  console.log("[dbUtils-Prisma] addLearningPathToDb: Attempting to add learning path. Data:", JSON.stringify(pathData, null, 1));
  const validation = LearningPathInputSchema.safeParse(pathData);
  if (!validation.success) {
    console.error("[dbUtils-Prisma] addLearningPathToDb: Learning Path validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
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
    console.error("[dbUtils-Prisma] addLearningPathToDb: Error creating learning path in DB:", error);
    throw error;
  }
};
export const updateLearningPathInDb = async (
  pathId: string, 
  pathData: Partial<Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'>> & { courseIdsToConnect?: string[] }
): Promise<LearningPath> => {
  console.log(`[dbUtils-Prisma] updateLearningPathInDb: Attempting to update LP ID ${pathId}. Data:`, JSON.stringify(pathData, null, 1));
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
    console.error(`[dbUtils-Prisma] updateLearningPathInDb: Error updating learning path ID ${pathId} in DB:`, error);
    throw error;
  }
};
export const deleteLearningPathFromDb = async (pathId: string): Promise<void> => {
  console.log(`[dbUtils-Prisma] deleteLearningPathFromDb: Attempting to delete LP ID ${pathId}.`);
  try {
    await prisma.learningPath.delete({ where: { id: pathId } });
  } catch (error) {
    console.error(`[dbUtils-Prisma] deleteLearningPathFromDb: Error deleting learning path ID ${pathId} from DB:`, error);
    throw error;
  }
};

// --- Quiz Data Persistence (Example for CourseForm - saveQuizWithQuestionsToDb) ---
export const saveQuizWithQuestionsToDb = async (
    courseIdForQuiz: string, 
    quizData: Pick<Quiz, 'id'|'title'|'quizType'|'passingScore'> & { questionsToUpsert?: any[], questionIdsToDelete?: string[] } 
): Promise<Quiz> => { 
    console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb: Saving quiz for course ${courseIdForQuiz}. Quiz Title: ${quizData.title}`);
    try {
        let existingQuiz = quizData.id && !quizData.id.startsWith('quiz-new-') 
            ? await prisma.quiz.findUnique({ where: { id: quizData.id }, include: { questions: { include: { options: true } } } }) 
            : null;

        if (existingQuiz) {
            console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb: Updating existing quiz ID ${existingQuiz.id}`);
            if (quizData.questionIdsToDelete && quizData.questionIdsToDelete.length > 0) {
                const validIdsToDelete = quizData.questionIdsToDelete.filter(id => !id.startsWith('q-new-'));
                if (validIdsToDelete.length > 0) {
                   console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb: Deleting questions for quiz ${existingQuiz.id}:`, validIdsToDelete);
                   await prisma.question.deleteMany({ where: { id: { in: validIdsToDelete }, quizId: existingQuiz.id } });
                }
            }

            const upsertPromises = quizData.questionsToUpsert?.map(async qData => {
                const optionsPayload = qData.optionsToCreate.map((opt: any) => ({ text: opt.text! }));
                const questionPayload: any = { text: qData.text, order: qData.order ?? 0, points: qData.points };
                let savedQuestion: Question & { options: Option[] };

                if (qData.id && !qData.id.startsWith('q-new-')) { 
                    console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb: Updating question ID ${qData.id}`);
                    await prisma.option.deleteMany({where: {questionId: qData.id}});
                    savedQuestion = await prisma.question.update({
                        where: { id: qData.id },
                        data: { ...questionPayload, options: { create: optionsPayload } },
                        include: { options: true }
                    });
                } else { 
                    console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb: Creating new question for quiz ${existingQuiz!.id}`);
                    savedQuestion = await prisma.question.create({
                        data: { ...questionPayload, quizId: existingQuiz!.id, options: { create: optionsPayload } },
                        include: { options: true }
                    });
                }
                if (qData.correctOptionTextForNew && savedQuestion.options.length > 0) {
                    const correctOpt = savedQuestion.options.find(opt => opt.text === qData.correctOptionTextForNew);
                    if(correctOpt && savedQuestion.correctOptionId !== correctOpt.id){
                        await prisma.question.update({where: {id: savedQuestion.id}, data: {correctOptionId: correctOpt.id}});
                         console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb:   Updated correctOptionId for question ${savedQuestion.id} to ${correctOpt.id}`);
                    }
                }
                return savedQuestion;
            }) || [];
            await Promise.all(upsertPromises);
            
            const updatedQuiz = await prisma.quiz.update({
                where: { id: existingQuiz.id },
                data: { title: quizData.title, quizType: quizData.quizType as PrismaQuizTypeEnum, passingScore: quizData.passingScore },
                include: { questions: { include: { options: true, correctOption: true }, orderBy: {order: 'asc'} } }
            });
            console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb: Quiz ID ${existingQuiz.id} updated successfully.`);
            return updatedQuiz;
        } else {
            console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb: Creating new quiz for course ${courseIdForQuiz}`);
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
                include: { questions: { include: { options: true, correctOption: true }, orderBy: {order: 'asc'} } }
            });
             if (createdQuiz.questions && quizData.questionsToUpsert) {
                for (let i = 0; i < createdQuiz.questions.length; i++) {
                    const dbQuestion = createdQuiz.questions[i];
                    const formQuestion = quizData.questionsToUpsert[i];
                    if (formQuestion?.correctOptionTextForNew && dbQuestion.options.length > 0) {
                        const correctOpt = dbQuestion.options.find(opt => opt.text === formQuestion.correctOptionTextForNew);
                        if(correctOpt && dbQuestion.correctOptionId !== correctOpt.id){
                            await prisma.question.update({where: {id: dbQuestion.id}, data: {correctOptionId: correctOpt.id}});
                            console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb:   Updated correctOptionId for new question ${dbQuestion.id} to ${correctOpt.id}`);
                        }
                    }
                }
            }
            const finalQuiz = await prisma.quiz.findUniqueOrThrow({where: {id: createdQuiz.id}, include: {questions: {include: {options: true, correctOption: true}}}});
            console.log(`[dbUtils-Prisma] saveQuizWithQuestionsToDb: New quiz created with ID ${finalQuiz.id}.`);
            return finalQuiz;
        }
    } catch (error) {
        console.error("[dbUtils-Prisma] saveQuizWithQuestionsToDb: CAUGHT ERROR saving quiz to DB:", error);
        if (error instanceof Error) {
            console.error("[dbUtils-Prisma] saveQuizWithQuestionsToDb: Error Name:", error.name);
            console.error("[dbUtils-Prisma] saveQuizWithQuestionsToDb: Error Message:", error.message);
            console.error("[dbUtils-Prisma] saveQuizWithQuestionsToDb: Error Stack:", error.stack);
        }
        // @ts-ignore
        if (error.code) {  console.error("[dbUtils-Prisma] saveQuizWithQuestionsToDb: Prisma Error Code:", error.code); }
        // @ts-ignore
        if (error.meta) { console.error("[dbUtils-Prisma] saveQuizWithQuestionsToDb: Prisma Error Meta:", JSON.stringify(error.meta, null, 1)); }
        throw error;
    }
};

// --- Video Functions (Using Prisma) ---
export const getVideosFromDb = async (): Promise<Video[]> => {
  console.log("[dbUtils-Prisma] getVideosFromDb: Fetching videos from DB...");
  try {
    const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
    console.log("[dbUtils-Prisma] getVideosFromDb: Found videos:", videos.length);
    return videos;
  } catch (error) {
    console.error("[dbUtils-Prisma] getVideosFromDb: Error fetching videos:", error);
    throw error;
  }
};
export const addVideoToDb = async (videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> => {
  console.log("[dbUtils-Prisma] addVideoToDb: Adding video to DB. Data:", JSON.stringify(videoData, null, 1));
  const validation = VideoInputSchema.safeParse(videoData);
  if (!validation.success) {
    console.error("[dbUtils-Prisma] addVideoToDb: Video validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid video data.");
  }
  try {
    const newVideo = await prisma.video.create({ data: validation.data });
    console.log("[dbUtils-Prisma] addVideoToDb: Video created successfully in DB:", JSON.stringify(newVideo, null, 1));
    return newVideo;
  } catch (error) {
    console.error("[dbUtils-Prisma] addVideoToDb: Error creating video in DB:", error);
    throw error;
  }
};
export const updateVideoInDb = async (videoId: string, videoData: Partial<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Video> => {
  console.log(`[dbUtils-Prisma] updateVideoInDb: Updating video ID ${videoId}. Data:`, JSON.stringify(videoData, null, 1));
  const validation = VideoInputSchema.partial().safeParse(videoData);
  if (!validation.success) {
     console.error("[dbUtils-Prisma] updateVideoInDb: Video validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid video data for update.");
  }
  try {
    const updatedVideo = await prisma.video.update({ where: { id: videoId }, data: validation.data });
    console.log("[dbUtils-Prisma] updateVideoInDb: Video updated successfully in DB:", JSON.stringify(updatedVideo, null, 1));
    return updatedVideo;
  } catch (error) {
    console.error(`[dbUtils-Prisma] updateVideoInDb: Error updating video ID ${videoId} in DB:`, error);
    throw error;
  }
};
export const deleteVideoFromDb = async (videoId: string): Promise<void> => {
  console.log(`[dbUtils-Prisma] deleteVideoFromDb: Deleting video ID ${videoId} from DB.`);
  try {
    await prisma.video.delete({ where: { id: videoId } });
    console.log(`[dbUtils-Prisma] deleteVideoFromDb: Video ID ${videoId} deleted successfully from DB.`);
  } catch (error) {
    console.error(`[dbUtils-Prisma] deleteVideoFromDb: Error deleting video ID ${videoId} from DB:`, error);
    throw error;
  }
};

// --- PaymentSettings (Using Prisma) ---
export const getPaymentSettingsFromDb = async (): Promise<PaymentSettings | null> => {
  console.log("[dbUtils-Prisma] getPaymentSettingsFromDb: Fetching payment settings from DB.");
  try {
    const settings = await prisma.paymentSettings.findUnique({ where: { id: 'global' } });
    console.log("[dbUtils-Prisma] getPaymentSettingsFromDb: Payment settings found:", !!settings);
    return settings;
  } catch (error) {
    console.error("[dbUtils-Prisma] getPaymentSettingsFromDb: Error fetching payment settings:", error);
    throw error;
  }
};
export const savePaymentSettingsToDb = async (settingsData: Omit<PaymentSettings, 'id'| 'updatedAt'>): Promise<PaymentSettings> => {
  console.log("[dbUtils-Prisma] savePaymentSettingsToDb: Saving payment settings to DB. Data:", JSON.stringify(settingsData, null, 1));
  const validation = PaymentSettingsInputSchema.safeParse(settingsData);
  if (!validation.success) {
    console.error("[dbUtils-Prisma] savePaymentSettingsToDb: Validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid payment settings data.");
  }
  try {
    const savedSettings = await prisma.paymentSettings.upsert({
      where: { id: 'global' },
      update: validation.data,
      create: { id: 'global', ...validation.data },
    });
    console.log("[dbUtils-Prisma] savePaymentSettingsToDb: Payment settings saved successfully.");
    return savedSettings;
  } catch (error) {
    console.error("[dbUtils-Prisma] savePaymentSettingsToDb: Error saving payment settings:", error);
    throw error;
  }
};

// --- PaymentSubmission (Using Prisma) ---
export const getPaymentSubmissionsFromDb = async (filter?: { userId?: string }): Promise<PaymentSubmission[]> => {
  console.log("[dbUtils-Prisma] getPaymentSubmissionsFromDb: Fetching payment submissions from DB. Filter:", filter);
  try {
    const submissions = await prisma.paymentSubmission.findMany({
      where: filter,
      include: { user: {select: {id:true, name:true, email:true}}, course: {select: {id:true, title: true}} }, 
      orderBy: { submittedAt: 'desc' }
    });
    console.log("[dbUtils-Prisma] getPaymentSubmissionsFromDb: Found submissions:", submissions.length);
    return submissions;
  } catch (error) {
    console.error("[dbUtils-Prisma] getPaymentSubmissionsFromDb: Error fetching submissions:", error);
    throw error;
  }
};
export const addPaymentSubmissionToDb = async (
  submissionData: Omit<PaymentSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes' | 'user' | 'course'> & { userId: string, courseId: string }
): Promise<PaymentSubmission> => {
  console.log("[dbUtils-Prisma] addPaymentSubmissionToDb: Received data:", JSON.stringify(submissionData, null, 2));
  const validation = PaymentSubmissionInputSchema.safeParse(submissionData);
  if (!validation.success) {
    console.error("[dbUtils-Prisma] addPaymentSubmissionToDb: Zod validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid payment submission data. Zod validation failed.");
  }
  console.log("[dbUtils-Prisma] addPaymentSubmissionToDb: Zod validation successful. Data for Prisma:", JSON.stringify(validation.data, null, 2));
  try {
    const newSubmission = await prisma.paymentSubmission.create({
      data: {
        ...validation.data,
        status: 'PENDING', 
        submittedAt: new Date(),
      },
      include: { user: {select: {id:true, name:true, email:true}}, course: {select: {id:true, title: true}} }
    });
    console.log("[dbUtils-Prisma] addPaymentSubmissionToDb: Successfully created submission in DB:", JSON.stringify(newSubmission, null, 2));
    return newSubmission;
  } catch (error) {
    console.error("[dbUtils-Prisma] addPaymentSubmissionToDb: Prisma error creating submission:", error);
    // @ts-ignore
    if (error.code) {  console.error("[dbUtils-Prisma] addPaymentSubmissionToDb: Prisma Error Code:", error.code); }
    // @ts-ignore
    if (error.meta) { console.error("[dbUtils-Prisma] addPaymentSubmissionToDb: Prisma Error Meta:", JSON.stringify(error.meta, null, 2)); }
    if (error instanceof Error) {
      throw new Error(`Prisma error: ${error.message}`);
    }
    throw new Error("Failed to create payment submission in database.");
  }
};
export const updatePaymentSubmissionInDb = async (
  submissionId: string, 
  dataToUpdate: { status: PrismaPaymentStatus, adminNotes?: string | null, reviewedAt?: Date }
): Promise<PaymentSubmission> => {
  console.log(`[dbUtils-Prisma] updatePaymentSubmissionInDb: Updating submission ID ${submissionId}. Data:`, JSON.stringify(dataToUpdate, null, 1));
  try {
    const updatedSubmission = await prisma.paymentSubmission.update({
      where: { id: submissionId },
      data: {
        status: dataToUpdate.status,
        adminNotes: dataToUpdate.adminNotes === null ? undefined : dataToUpdate.adminNotes, 
        reviewedAt: dataToUpdate.reviewedAt || new Date(),
      },
      include: { user: {select: {id: true, name:true, email:true}}, course: {select: {id:true, title: true}} }
    });
    console.log(`[dbUtils-Prisma] updatePaymentSubmissionInDb: Successfully updated submission ID ${submissionId}.`);
    return updatedSubmission;
  } catch (error) {
    console.error(`[dbUtils-Prisma] updatePaymentSubmissionInDb: Error updating submission ID ${submissionId}:`, error);
    throw error;
  }
};

// --- Enrollment (Using Prisma) ---
export const getEnrollmentForUserAndCourseFromDb = async (userId: string, courseId: string): Promise<Enrollment | null> => {
  console.log(`[dbUtils-Prisma] getEnrollmentForUserAndCourseFromDb: Fetching for user ${userId}, course ${courseId}.`);
  try {
    return await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: { course: true } 
    });
  } catch (error) {
     console.error(`[dbUtils-Prisma] getEnrollmentForUserAndCourseFromDb: Error for user ${userId}, course ${courseId}:`, error);
     throw error;
  }
};
export const createEnrollmentInDb = async (userId: string, courseId: string): Promise<Enrollment> => {
  console.log(`[dbUtils-Prisma] createEnrollmentInDb: Creating for user ${userId}, course ${courseId}.`);
  try {
    return await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        progress: 0,
        enrolledDate: new Date(),
      },
      include: { course: true }
    });
  } catch (error) {
    console.error(`[dbUtils-Prisma] createEnrollmentInDb: Error for user ${userId}, course ${courseId}:`, error);
    throw error;
  }
};
export const updateEnrollmentProgressInDb = async (enrollmentId: string, progress: number): Promise<Enrollment> => {
  console.log(`[dbUtils-Prisma] updateEnrollmentProgressInDb: Updating enrollment ${enrollmentId} to progress ${progress}.`);
  try {
    return await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { progress },
      include: { course: true }
    });
  } catch (error) {
     console.error(`[dbUtils-Prisma] updateEnrollmentProgressInDb: Error updating enrollment ${enrollmentId}:`, error);
     throw error;
  }
};
export const getEnrollmentsByUserIdFromDb = async (userId: string): Promise<Enrollment[]> => {
  console.log(`[dbUtils-Prisma] getEnrollmentsByUserIdFromDb: Fetching for user ${userId}.`);
  try {
    return await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true }, // Ensure course data is included
      orderBy: { enrolledDate: 'desc' }
    });
  } catch (error) {
     console.error(`[dbUtils-Prisma] getEnrollmentsByUserIdFromDb: Error for user ${userId}:`, error);
     throw error;
  }
};

// --- Site Page Content Functions (Using Prisma) ---
export const getSitePageBySlug = async (slug: string): Promise<SitePage | null> => {
  console.log(`[dbUtils-Prisma] getSitePageBySlug: Fetching page with slug "${slug}".`);
  try {
    const page = await prisma.sitePage.findUnique({ where: { slug } });
    console.log(`[dbUtils-Prisma] getSitePageBySlug: Page "${slug}" ${page ? 'found' : 'not found'}.`);
    return page;
  } catch (error) {
    console.error(`[dbUtils-Prisma] getSitePageBySlug: Error fetching page "${slug}":`, error);
    throw error;
  }
};

export const upsertSitePage = async (
  slug: string,
  title: string,
  content: Prisma.JsonValue | string 
): Promise<SitePage> => {
  console.log(`[dbUtils-Prisma] upsertSitePage: Upserting page with slug "${slug}".`);
  const validation = SitePageInputSchema.safeParse({ title, content });
  if (!validation.success) {
    console.error("[dbUtils-Prisma] upsertSitePage: SitePage validation failed:", JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid site page data.");
  }
  
  const dataToUpsert = {
    slug,
    title: validation.data.title,
    content: validation.data.content as Prisma.JsonValue, 
  };

  try {
    const sitePage = await prisma.sitePage.upsert({
      where: { slug },
      update: dataToUpsert,
      create: dataToUpsert,
    });
    console.log(`[dbUtils-Prisma] upsertSitePage: Page "${slug}" upserted successfully.`);
    return sitePage;
  } catch (error) {
    console.error(`[dbUtils-Prisma] upsertSitePage: Error upserting page "${slug}":`, error);
    throw error;
  }
};

// --- Seeding Functions (Updated for Prisma) ---
export const seedCategoriesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils-Prisma] seedCategoriesToDb: Seeding categories to DB.");
  let successCount = 0, errorCount = 0, skippedCount = 0;
  for (const catData of mockCategoriesForSeeding) {
    try {
      const existing = await prisma.category.findUnique({ where: { name: catData.name } });
      if (existing) { skippedCount++; continue; }
      await prisma.category.create({ data: { id:catData.id, name: catData.name, imageUrl: catData.imageUrl, dataAiHint: catData.dataAiHint, iconName: catData.iconName } });
      successCount++;
    } catch (error) { console.error(`Error seeding category ${catData.name}:`, error); errorCount++; }
  }
  console.log(`[dbUtils-Prisma] seedCategoriesToDb: Done. Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`);
  return { successCount, errorCount, skippedCount };
};

export const seedCoursesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils-Prisma] seedCoursesToDb: Seeding courses to DB.");
  let s=0,e=0,sk=0;
  for(const cd of mockCoursesForSeeding){
    try{
      if(await prisma.course.findUnique({where:{id:cd.id}})){sk++;continue;}
      let cat=await prisma.category.findUnique({where:{name:cd.category}});
      if(!cat)cat=await prisma.category.create({data:{name:cd.category, iconName:'Shapes'}});
      
      const quizzesToCreate = cd.quizzes?.map(q => {
        const questionsToCreate = q.questions.map(qs => {
            const optionsToCreate = qs.options.map(o => ({ id: o.id, text: o.text }));
            return { 
                id: qs.id, 
                text: qs.text, 
                points: qs.points, 
                order: 0, // Set default order
                options: { create: optionsToCreate },
                // correctOptionId will be linked after creation if necessary
            };
        });
        return { 
            id: q.id, 
            title: q.title, 
            quizType: q.quizType.toUpperCase() as PrismaQuizTypeEnum, 
            passingScore: q.passingScore,
            questions: { create: questionsToCreate }
        };
      });

      const courseCreateData: any = {
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
        categoryId: cat.id,
        categoryNameCache: cat.name,
        modules: cd.modules ? { create: cd.modules.map(m => ({...m, lessons: m.lessons ? { create: m.lessons } : undefined })) } : undefined,
        quizzes: quizzesToCreate ? { create: quizzesToCreate } : undefined
      };
      
      const createdCourse = await prisma.course.create({data:courseCreateData, include: { quizzes: { include: {questions: { include: {options:true}}}}}});
      
      // Link correctOptionId for quizzes
      if (createdCourse.quizzes && cd.quizzes) {
          for (let i=0; i < createdCourse.quizzes.length; i++) {
              const dbQuiz = createdCourse.quizzes[i];
              const mockQuiz = cd.quizzes[i];
              if (dbQuiz.questions && mockQuiz.questions) {
                  for (let j=0; j < dbQuiz.questions.length; j++) {
                      const dbQuestion = dbQuiz.questions[j];
                      const mockQuestion = mockQuiz.questions[j];
                      const correctMockOption = mockQuestion.options.find(o => o.id === mockQuestion.correctOptionId);
                      if (correctMockOption) {
                          const correctDbOption = dbQuestion.options.find(o => o.text === correctMockOption.text); // Match by text as IDs might change if not preset
                          if (correctDbOption && dbQuestion.correctOptionId !== correctDbOption.id) {
                              await prisma.question.update({
                                  where: {id: dbQuestion.id},
                                  data: {correctOptionId: correctDbOption.id}
                              });
                          }
                      }
                  }
              }
          }
      }
      s++;
    }catch(err){console.error(`Err seed course ${cd.title}:`,err);e++;}
  }
  console.log(`[dbUtils-Prisma] seedCoursesToDb: Done. Success: ${s}, Errors: ${e}, Skipped: ${sk}`);
  return {successCount:s,errorCount:e,skippedCount:sk};
};

export const seedLearningPathsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils-Prisma] seedLearningPathsToDb: Seeding learning paths to DB.");
  let s=0,e=0,sk=0;
  for(const lpd of mockLearningPathsForSeeding){
    try{
      if(await prisma.learningPath.findUnique({where:{id:lpd.id}})){sk++;continue;}
      const { courseIds, ...restOfLpData } = lpd; 
      await prisma.learningPath.create({data:{...restOfLpData,id:lpd.id,learningPathCourses:{create:courseIds.map((ci,i)=>({courseId:ci,order:i}))}}});s++;
    }catch(err){console.error(`Err seed LP ${lpd.title}:`,err);e++;}
  }
  console.log(`[dbUtils-Prisma] seedLearningPathsToDb: Done. Success: ${s}, Errors: ${e}, Skipped: ${sk}`);
  return {successCount:s,errorCount:e,skippedCount:sk};
};

export const seedVideosToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils-Prisma] seedVideosToDb: Seeding videos to DB.");
  let s=0,e=0,sk=0;
  for(const vd of mockVideosForSeedingData){ 
    try{
      const existing = await prisma.video.findUnique({where:{id:vd.id}});
      if(existing){sk++;continue;}
      // Ensure only fields present in the Prisma Video model are passed
      const { createdAt, updatedAt, videoUrl, ...prismaVideoData } = vd; 
      await prisma.video.create({data:{...prismaVideoData, id:vd.id}});s++; // Use the mock ID for consistency
    }catch(err){console.error(`Err seed Video ${vd.title}:`,err);e++;}
  }
  console.log(`[dbUtils-Prisma] seedVideosToDb: Done. Success: ${s}, Errors: ${e}, Skipped: ${sk}`);
  return {successCount:s,errorCount:e,skippedCount:sk};
};

export const seedPaymentSettingsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  console.log("[dbUtils-Prisma] seedPaymentSettingsToDb: Seeding payment settings to DB.");
  try{
    const {updatedAt, ...restOfSettings} = mockDefaultPaymentSettingsData;
    await prisma.paymentSettings.upsert({
        where:{id:'global'},
        update:restOfSettings,
        create:{id:'global',...restOfSettings}
    });
    console.log(`[dbUtils-Prisma] seedPaymentSettingsToDb: Done. Success: 1`);
    return{successCount:1,errorCount:0,skippedCount:0};
  }catch(err){
      console.error('Err seed PaymentSettings:',err);
      return{successCount:0,errorCount:1,skippedCount:0};
    }
};
 
    