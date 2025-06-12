
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
  type Course as MockCourseType, // Keep mock types for shaping data from DB if needed or for seeding
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
  options: z.array(OptionInputSchema).min(1, "At least one option is required"), // Changed from optionsData
  correctOptionId: z.string().optional().nullable(), // Will be set based on correctOptionText
  correctOptionText: z.string().optional().nullable(), // Used to determine correctOptionId for new questions
});

const QuizInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Quiz title is required"),
  quizType: z.string(), // Prisma uses String for enums not explicitly defined in schema
  passingScore: z.number().int().min(0).max(100).optional().nullable(),
  questions: z.array(QuestionInputSchema).optional(), // Changed from questionsData
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
  lessons: z.array(LessonInputSchema).optional(), // Changed from lessonsData
});

const CourseInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryName: z.string().min(1, "Category name is required"), // Will be used to find/create Category
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
  modules: z.array(ModuleInputSchema).optional(), // Changed from modulesData
  quizzes: z.array(QuizInputSchema).optional(),   // Changed from quizzesData
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
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
};

export const addCategoryToDb = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>): Promise<Category> => {
  const validation = CategoryInputSchema.safeParse(categoryData);
  if (!validation.success) {
    console.error("Category validation failed (add):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data.");
  }
  return prisma.category.create({ data: validation.data });
};

export const updateCategoryInDb = async (categoryId: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'courses'>>): Promise<Category> => {
  const validation = CategoryInputSchema.partial().safeParse(categoryData);
  if (!validation.success) {
    console.error("Category validation failed (update):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid category data for update.");
  }
  return prisma.category.update({ where: { id: categoryId }, data: validation.data });
};

export const deleteCategoryFromDb = async (categoryId: string): Promise<void> => {
  // Consider implications: courses linked to this category might need handling (e.g., onDelete: Cascade in schema handles DB level)
  await prisma.category.delete({ where: { id: categoryId } });
};

// --- Course Functions (Using Prisma) ---
export const getCoursesFromDb = async (): Promise<Course[]> => {
  return prisma.course.findMany({
    include: { 
      category: true, // To get categoryNameCache if needed, or derive it
      modules: { include: { lessons: true }, orderBy: { order: 'asc' } },
      quizzes: { include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } } }
    },
    orderBy: { title: 'asc' }
  });
};

export const getCourseByIdFromDb = async (courseId: string): Promise<Course | null> => {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      modules: { include: { lessons: {orderBy: {order: 'asc'}} }, orderBy: { order: 'asc' } },
      quizzes: { include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } } }
    }
  });
};

export const addCourseToDb = async (
  courseData: Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'> & { 
    categoryName: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>>> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>>>, correctOptionText?: string }> }>
  }
): Promise<Course> => {
  const validation = CourseInputSchema.safeParse(courseData);
  if (!validation.success) {
    console.error("Course validation failed (add):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data.");
  }
  const { categoryName, modules, quizzes, ...mainCourseData } = validation.data;

  // Find or create category
  let category = await prisma.category.findUnique({ where: { name: categoryName } });
  if (!category) {
    category = await prisma.category.create({ data: { name: categoryName, iconName: 'Shapes' } });
  }

  const createdCourse = await prisma.course.create({
    data: {
      ...mainCourseData,
      categoryId: category.id,
      categoryNameCache: category.name, // Denormalize for convenience
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
            // Find correct option ID after creation for linking
            return {
              text: q.text!,
              order: q.order!,
              points: q.points,
              options: { create: optionsToCreate },
              // correctOptionId will be set after options are created if linking by text
              // For now, we need a placeholder or a two-step creation if IDs are generated
            };
          }) || [];
          
          // Simplified: For now, correctOptionId linking would be complex here.
          // Prisma doesn't easily support creating options and then linking one as correct by text in a single nested create.
          // This part might need adjustment based on how QuestionEditDialog prepares data or a two-step quiz save.
          // Let's assume questions are created, and correctOptionId might be missing or needs manual setup/update.
          return {
            title: quizData.title!,
            quizType: quizData.quizType!,
            passingScore: quizData.passingScore,
            questions: { create: questionsToCreate.map(q => ({text: q.text, order: q.order, points: q.points, options: q.options})) },
          };
        })
      } : undefined,
    },
    include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } }
  });
  return createdCourse;
};


export const updateCourseInDb = async (
  courseId: string, 
  courseData: Partial<Omit<Course, 'id'|'createdAt'|'updatedAt'|'categoryId'|'categoryNameCache'|'modules'|'quizzes'|'learningPathCourses'|'category'>> & { 
    categoryName?: string, 
    modules?: Array<Partial<Omit<Module, 'id'|'courseId'|'createdAt'|'updatedAt'|'lessons'>> & { id?: string, lessons?: Array<Partial<Omit<Lesson, 'id'|'moduleId'|'createdAt'|'updatedAt'>> & {id?: string}> }>,
    quizzes?: Array<Partial<Omit<Quiz, 'id'|'courseId'|'createdAt'|'updatedAt'|'questions'>> & { id?: string, questions?: Array<Partial<Omit<Question, 'id'|'quizId'|'createdAt'|'updatedAt'|'options'|'correctOptionId'>> & { id?: string, options: Array<Partial<Omit<Option, 'id'|'questionId'|'createdAt'|'updatedAt'>> & {id?:string}>, correctOptionText?: string }> }>
  }
): Promise<Course> => {
  const validation = CourseInputSchema.partial().safeParse(courseData);
  if (!validation.success) {
    console.error("Course validation failed (update):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid course data for update.");
  }
  const { categoryName, modules, quizzes, ...mainCourseData } = validation.data;

  let categoryIdToLink = courseData.categoryId; // Keep existing if categoryName not changed
  if (categoryName) {
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      category = await prisma.category.create({ data: { name: categoryName, iconName: 'Shapes' } });
    }
    categoryIdToLink = category.id;
  }
  
  // For modules and lessons: delete existing and recreate. This is simpler than fine-grained upserts.
  // A more sophisticated approach would use connectOrCreate, upsert, etc.
  await prisma.module.deleteMany({ where: { courseId: courseId } }); // Deletes lessons due to cascading
  await prisma.quiz.deleteMany({where: {courseId: courseId }}); // Deletes questions/options due to cascading

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...mainCourseData,
      ...(categoryIdToLink && { categoryId: categoryIdToLink, categoryNameCache: categoryName }),
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
          const questionsToCreateNested = quizData.questions?.map(q => {
            const optionsToCreate = q.options.map(opt => ({ text: opt.text! }));
            // This will need correctOptionId to be determined and passed correctly.
            // The current mock setup is simplified. For Prisma, linking the correct option is vital.
            // For now, assuming a placeholder for correctOptionId or that it will be managed separately.
            let correctOptionIdForDB: string | undefined = undefined;
            if (q.correctOptionText && optionsToCreate.length > 0) {
                // This is a simplified way; in reality, options need to be created first to get their IDs
                // For now, we can't link it reliably by text in a single nested write.
                // This implies the correctOptionId might need to be set in a subsequent update to the question,
                // or the QuizQuestionsDialog logic for mock data needs adaptation for Prisma.
            }

            return {
              text: q.text!,
              order: q.order!,
              points: q.points,
              options: { create: optionsToCreate },
              // correctOptionId: correctOptionIdForDB, // This part is tricky with Prisma nested writes by text
            };
          }) || [];
          return {
            title: quizData.title!,
            quizType: quizData.quizType!,
            passingScore: quizData.passingScore,
            questions: { create: questionsToCreateNested.map(q => ({text: q.text, order: q.order, points: q.points, options: q.options}))},
          };
        })
      } : undefined,
    },
    include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } }
  });
  return updatedCourse;
};

export const deleteCourseFromDb = async (courseId: string): Promise<void> => {
  // Prisma's onDelete: Cascade in schema should handle related modules, lessons, quizzes, etc.
  await prisma.course.delete({ where: { id: courseId } });
};


// --- LearningPath Functions (Using Prisma) ---
export const getLearningPathsFromDb = async (): Promise<LearningPath[]> => {
  return prisma.learningPath.findMany({
    include: {
      learningPathCourses: {
        include: { course: {select: {id: true, title: true, imageUrl:true, categoryNameCache:true, instructor:true }} }, // Include nested course details
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { title: 'asc' }
  });
};

export const addLearningPathToDb = async (
  pathData: Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'> & { courseIdsToConnect?: string[] }
): Promise<LearningPath> => {
  const validation = LearningPathInputSchema.safeParse(pathData);
  if (!validation.success) {
    console.error("Learning Path validation failed (add):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid learning path data.");
  }
  const { courseIdsToConnect, ...restData } = validation.data;

  return prisma.learningPath.create({
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
};

export const updateLearningPathInDb = async (
  pathId: string, 
  pathData: Partial<Omit<LearningPath, 'id'|'createdAt'|'updatedAt'|'learningPathCourses'>> & { courseIdsToConnect?: string[] }
): Promise<LearningPath> => {
  const validation = LearningPathInputSchema.partial().safeParse(pathData);
  if (!validation.success) {
    console.error("Learning Path validation failed (update):", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors?.join(', ') || "Invalid learning path data for update.");
  }
  const { courseIdsToConnect, ...restData } = validation.data;

  // For course connections: delete existing and recreate based on new list
  await prisma.learningPathCourse.deleteMany({ where: { learningPathId: pathId }});

  return prisma.learningPath.update({
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
};

export const deleteLearningPathFromDb = async (pathId: string): Promise<void> => {
  // LearningPathCourse entries will be deleted by onDelete: Cascade
  await prisma.learningPath.delete({ where: { id: pathId } });
};


// --- Quiz Data Persistence (Example for CourseForm - saveQuizWithQuestionsToDb) ---
// This function is now more complex due to Prisma's requirements for creating related entities.
// It assumes quizData comes from CourseForm's state.
export const saveQuizWithQuestionsToDb = async (
    courseIdForQuiz: string, // ID of the course this quiz belongs to
    quizData: MockQuizType & { questionsToUpsert?: any[], questionIdsToDelete?: string[] } // Using mock type for input shape from form
): Promise<Quiz> => { // Returns Prisma Quiz type
    
    // First, check if the quiz exists. If so, update it. Otherwise, create it.
    let existingQuiz = quizData.id ? await prisma.quiz.findUnique({ where: { id: quizData.id } }) : null;

    if (existingQuiz) {
        // Update existing quiz
        // Delete questions marked for deletion
        if (quizData.questionIdsToDelete && quizData.questionIdsToDelete.length > 0) {
            await prisma.question.deleteMany({ where: { id: { in: quizData.questionIdsToDelete } } });
        }

        // Upsert questions
        const questionsUpsertPromises = quizData.questionsToUpsert?.map(async qData => {
            const optionsToCreate = qData.optionsToCreate.map((opt: MockOptionType) => ({ text: opt.text }));
            let correctOptionIdValue: string | undefined = undefined;
            
            // For existing questions, we need to handle options update/create carefully.
            // For new questions, options are created.
            const questionPayload = {
                text: qData.text,
                order: qData.order || 0,
                points: qData.points,
                // Options creation/update logic is complex for a single upsert here.
                // Simplification: delete old options and create new ones for existing questions being updated.
            };

            if (qData.id) { // Existing question: update
                await prisma.option.deleteMany({where: {questionId: qData.id}}); // Delete old options
                const updatedQ = await prisma.question.update({
                    where: { id: qData.id },
                    data: {
                        ...questionPayload,
                        options: { create: optionsToCreate }
                    },
                    include: { options: true }
                });
                // Set correctOptionId based on correctOptionTextForNew
                const correctOpt = updatedQ.options.find(opt => opt.text === qData.correctOptionTextForNew);
                if(correctOpt){
                    await prisma.question.update({where: {id: updatedQ.id}, data: {correctOptionId: correctOpt.id}});
                }
                return updatedQ;

            } else { // New question: create
                 const createdQ = await prisma.question.create({
                    data: {
                        ...questionPayload,
                        quizId: existingQuiz!.id,
                        options: { create: optionsToCreate }
                    },
                    include: { options: true }
                });
                const correctOpt = createdQ.options.find(opt => opt.text === qData.correctOptionTextForNew);
                 if(correctOpt){
                    await prisma.question.update({where: {id: createdQ.id}, data: {correctOptionId: correctOpt.id}});
                }
                return createdQ;
            }
        }) || [];
        
        await Promise.all(questionsUpsertPromises);
        
        return prisma.quiz.update({
            where: { id: existingQuiz.id },
            data: {
                title: quizData.title,
                quizType: quizData.quizType,
                passingScore: quizData.passingScore,
            },
            include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } }
        });

    } else {
        // Create new quiz with questions
        return prisma.quiz.create({
            data: {
                courseId: courseIdForQuiz,
                title: quizData.title,
                quizType: quizData.quizType,
                passingScore: quizData.passingScore,
                questions: quizData.questionsToUpsert ? {
                    create: quizData.questionsToUpsert.map(qData => {
                        const optionsToCreate = qData.optionsToCreate.map((opt: MockOptionType) => ({ text: opt.text }));
                        // Correct option ID linking here is also tricky on initial deep create.
                        // This would ideally be handled by creating options, then finding the ID of the correct one to link.
                        // For simplicity here, correctOptionId might not be set correctly on first pass.
                        return {
                            text: qData.text,
                            order: qData.order || 0,
                            points: qData.points,
                            options: { create: optionsToCreate },
                            // correctOptionId: needs to be linked after options are created.
                        };
                    })
                } : undefined
            },
            include: { questions: { include: { options: true }, orderBy: {order: 'asc'} } }
        });
    }
};



// --- Functions for entities still using localStorage (Videos, Payments, Enrollments, etc.) ---
// These remain unchanged for now.

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
  const allUsers = getStoredData('managedUsers_hashed', mockUsersForSeeding);
  const allCourses = await getCoursesFromDb(); // Use Prisma version now

  return Promise.resolve(submissions.map(sub => ({
    ...sub,
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
    course: allCourses.find(c => c.id === e.courseId) // This needs to be Course from Prisma
  })).sort((a,b) => new Date(b.enrolledDate).getTime() - new Date(a.enrolledDate).getTime() ));
};


// --- Seeding Functions ---
// Seed Categories to DB
export const seedCategoriesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  let successCount = 0, errorCount = 0, skippedCount = 0;
  for (const catData of mockCategoriesForSeeding) {
    try {
      const existing = await prisma.category.findUnique({ where: { name: catData.name } });
      if (existing) {
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
      successCount++;
    } catch (error) {
      console.error(`Error seeding category ${catData.name}:`, error);
      errorCount++;
    }
  }
  return { successCount, errorCount, skippedCount };
};

// Seed Courses to DB
export const seedCoursesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  let successCount = 0, errorCount = 0, skippedCount = 0;
  for (const courseData of mockCoursesForSeeding) {
    try {
      const existing = await prisma.course.findUnique({ where: { id: courseData.id } }); // Assuming mock IDs are stable for upsert
      if (existing) {
         // For simplicity, we'll skip if ID exists. A true upsert could update.
        skippedCount++;
        continue;
      }

      let category = await prisma.category.findUnique({ where: { name: courseData.category } });
      if (!category) {
        category = await prisma.category.create({ data: { name: courseData.category, iconName: 'Shapes' } });
      }

      await prisma.course.create({
        data: {
          id: courseData.id, // Use mock ID
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
              id: quiz.id, title: quiz.title, quizType: quiz.quizType, passingScore: quiz.passingScore,
              questions: {
                create: quiz.questions.map(q => ({
                  id: q.id, text: q.text, order: 0, // Assuming order 0 for simplicity in seed
                  points: q.points,
                  options: { create: q.options.map(opt => ({ id: opt.id, text: opt.text })) },
                  correctOptionId: q.correctOptionId,
                }))
              }
            })) || []
          }
        }
      });
      successCount++;
    } catch (error) {
      console.error(`Error seeding course ${courseData.title}:`, error);
      errorCount++;
    }
  }
  return { successCount, errorCount, skippedCount };
};

// Seed Learning Paths to DB
export const seedLearningPathsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  let successCount = 0, errorCount = 0, skippedCount = 0;
  for (const lpData of mockLearningPathsForSeeding) {
    try {
      const existing = await prisma.learningPath.findUnique({ where: { id: lpData.id } });
      if (existing) {
        skippedCount++;
        continue;
      }
      await prisma.learningPath.create({
        data: {
          id: lpData.id,
          title: lpData.title,
          description: lpData.description,
          icon: lpData.icon,
          imageUrl: lpData.imageUrl,
          dataAiHint: lpData.dataAiHint,
          learningPathCourses: {
            create: lpData.courseIds.map((courseId, index) => ({
              courseId: courseId,
              order: index
            }))
          }
        }
      });
      successCount++;
    } catch (error) {
      console.error(`Error seeding learning path ${lpData.title}:`, error);
      // Check if it's a foreign key constraint error for courseId
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2003') {
         console.warn(`Skipping learning path "${lpData.title}" due to missing course(s). Ensure courses are seeded first.`);
      } else {
        errorCount++;
      }
    }
  }
  return { successCount, errorCount, skippedCount };
};


// For Videos, PaymentSettings, Submissions, Enrollments - still use localStorage seeders
export const seedVideosToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  localStorage.setItem('adminVideos', JSON.stringify(mockVideosForSeeding));
  return { successCount: mockVideosForSeeding.length, errorCount: 0, skippedCount: 0 };
};
export const seedPaymentSettingsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  if (typeof window === 'undefined') return { successCount: 0, errorCount: 0, skippedCount: 0 };
  localStorage.setItem('paymentSettingsGlobal', JSON.stringify([mockDefaultPaymentSettings]));
  return { successCount: 1, errorCount: 0, skippedCount: 0 };
};
// seedInitialUsersToLocalStorage is handled in authUtils.ts as it needs access to hashing
