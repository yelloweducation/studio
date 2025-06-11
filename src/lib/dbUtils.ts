
import prisma from '@/lib/prisma';
import type { 
    Category as PrismaCategory, 
    Course as PrismaCourse, 
    Module as PrismaModule,
    Lesson as PrismaLesson,
    Quiz as PrismaQuiz,
    Question as PrismaQuestion,
    Option as PrismaOption,
    Video as PrismaVideo, 
    LearningPath as PrismaLearningPath, 
    PaymentSettings as PrismaPaymentSettings,
    PaymentSubmission as PrismaPaymentSubmission, 
    Enrollment as PrismaEnrollment,
    User as PrismaUser,
    Role as PrismaRole,
    QuizType as PrismaQuizType,
    PaymentSubmissionStatus as PrismaPaymentSubmissionStatus
} from '@prisma/client';

import {
  mockCoursesForSeeding,
  mockCategoriesForSeeding,
  mockVideosForSeeding,
  mockLearningPathsForSeeding,
  initialPaymentSettings as mockPaymentSettings
} from '@/data/mockData'; // For seeding

// Re-export Prisma types for easier use in components
export type { 
    PrismaCategory as Category, 
    PrismaCourse as Course,
    PrismaModule as Module,
    PrismaLesson as Lesson,
    PrismaQuiz as Quiz,
    PrismaQuestion as Question,
    PrismaOption as Option,
    PrismaVideo as Video, 
    PrismaLearningPath as LearningPath, 
    PrismaPaymentSettings as PaymentSettings,
    PrismaPaymentSubmission as PaymentSubmission, 
    PrismaEnrollment as Enrollment,
    PrismaUser as User,
    PrismaRole as Role,
    PrismaQuizType as QuizType,
    PrismaPaymentSubmissionStatus as PaymentSubmissionStatus
};


// --- Category Functions ---
export const getCategoriesFromDb = async (): Promise<PrismaCategory[]> => {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } });
  } catch (error) {
    console.error("Error fetching categories from DB:", error);
    return [];
  }
};

export const addCategoryToDb = async (categoryData: Omit<PrismaCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<PrismaCategory> => {
  try {
    return await prisma.category.create({ data: categoryData });
  } catch (error) {
    console.error("Error adding category to DB:", error);
    throw error;
  }
};

export const updateCategoryInDb = async (categoryId: string, categoryData: Partial<Omit<PrismaCategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PrismaCategory> => {
  try {
    return await prisma.category.update({
      where: { id: categoryId },
      data: categoryData,
    });
  } catch (error) {
    console.error(`Error updating category ${categoryId} in DB:`, error);
    throw error;
  }
};

export const deleteCategoryFromDb = async (categoryId: string): Promise<void> => {
  try {
    // Consider handling related courses (e.g., set categoryId to null or prevent deletion if courses exist)
    await prisma.category.delete({ where: { id: categoryId } });
  } catch (error) {
    console.error(`Error deleting category ${categoryId} from DB:`, error);
    throw error;
  }
};


// --- Course Functions ---
export const getCoursesFromDb = async (): Promise<PrismaCourse[]> => {
  try {
    return await prisma.course.findMany({
      orderBy: { title: 'asc' },
      include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } } // Example includes
    });
  } catch (error) {
    console.error("Error fetching courses from DB:", error);
    return [];
  }
};

export const getCourseByIdFromDb = async (courseId: string): Promise<PrismaCourse | null> => {
  try {
    return await prisma.course.findUnique({
      where: { id: courseId },
      include: { category: true, modules: { include: { lessons: true } }, quizzes: { include: { questions: { include: { options: true } } } } }
    });
  } catch (error) {
    console.error(`Error fetching course ${courseId} from DB:`, error);
    return null;
  }
};

// Add, Update, Delete for Course, Video, LearningPath, PaymentSettings, PaymentSubmissions, Enrollment will follow similar patterns.
// I will implement them as needed by components or in a subsequent step.

// --- Video Functions ---
export const getVideosFromDb = async (): Promise<PrismaVideo[]> => {
  try {
    return await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    console.error("Error fetching videos from DB:", error);
    return [];
  }
};
export const addVideoToDb = async (videoData: Omit<PrismaVideo, 'id' | 'createdAt' | 'updatedAt'>): Promise<PrismaVideo> => {
    return prisma.video.create({ data: videoData });
};
export const updateVideoInDb = async (videoId: string, videoData: Partial<Omit<PrismaVideo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PrismaVideo> => {
    return prisma.video.update({ where: { id: videoId }, data: videoData });
};
export const deleteVideoFromDb = async (videoId: string): Promise<void> => {
    await prisma.video.delete({ where: { id: videoId } });
};

// --- LearningPath Functions ---
export const getLearningPathsFromDb = async (): Promise<PrismaLearningPath[]> => {
  try {
    return await prisma.learningPath.findMany({ 
        orderBy: { title: 'asc' },
        include: { courses: { include: { course: true } } } // To get course details
    });
  } catch (error) {
    console.error("Error fetching learning paths from DB:", error);
    return [];
  }
};
export const addLearningPathToDb = async (pathData: Omit<PrismaLearningPath, 'id' | 'createdAt' | 'updatedAt'> & { courseIdsToConnect?: string[] }): Promise<PrismaLearningPath> => {
    const { courseIdsToConnect, ...restData } = pathData;
    const createdPath = await prisma.learningPath.create({ data: restData });
    if (courseIdsToConnect && courseIdsToConnect.length > 0) {
        await prisma.learningPathCourse.createMany({
            data: courseIdsToConnect.map(courseId => ({
                learningPathId: createdPath.id,
                courseId: courseId,
            })),
            skipDuplicates: true,
        });
    }
    return prisma.learningPath.findUniqueOrThrow({ where: {id: createdPath.id}, include: { courses: { include: { course: true } } }});
};
export const updateLearningPathInDb = async (pathId: string, pathData: Partial<Omit<PrismaLearningPath, 'id' | 'createdAt' | 'updatedAt'>> & { courseIdsToConnect?: string[] }): Promise<PrismaLearningPath> => {
    const { courseIdsToConnect, ...restData } = pathData;
    const updatedPath =  await prisma.learningPath.update({ 
        where: { id: pathId }, 
        data: restData 
    });
     if (courseIdsToConnect) { // If courseIdsToConnect is provided, we replace all existing connections
        await prisma.learningPathCourse.deleteMany({ where: { learningPathId: pathId } });
        if (courseIdsToConnect.length > 0) {
            await prisma.learningPathCourse.createMany({
                data: courseIdsToConnect.map(courseId => ({
                    learningPathId: pathId,
                    courseId: courseId,
                })),
                skipDuplicates: true,
            });
        }
    }
    return prisma.learningPath.findUniqueOrThrow({ where: {id: updatedPath.id}, include: { courses: { include: { course: true } } }});
};
export const deleteLearningPathFromDb = async (pathId: string): Promise<void> => {
    // Relations handled by onDelete: Cascade in schema
    await prisma.learningPath.delete({ where: { id: pathId } });
};


// --- PaymentSettings ---
export const getPaymentSettingsFromDb = async (): Promise<PrismaPaymentSettings | null> => {
    try {
        return await prisma.paymentSettings.findUnique({ where: { id: 'global' } });
    } catch (error) {
        console.error("Error fetching payment settings from DB:", error);
        return null;
    }
};
export const savePaymentSettingsToDb = async (settingsData: Omit<PrismaPaymentSettings, 'id' | 'updatedAt'>): Promise<PrismaPaymentSettings> => {
    return prisma.paymentSettings.upsert({
        where: { id: 'global' },
        update: settingsData,
        create: { id: 'global', ...settingsData },
    });
};

// --- PaymentSubmission ---
export const getPaymentSubmissionsFromDb = async (): Promise<PrismaPaymentSubmission[]> => {
    try {
        return await prisma.paymentSubmission.findMany({ 
            orderBy: { submittedAt: 'desc' },
            include: { user: true, course: true } // Include related user and course data
        });
    } catch (error) {
        console.error("Error fetching payment submissions from DB:", error);
        return [];
    }
};

export const addPaymentSubmissionToDb = async (submissionData: Omit<PrismaPaymentSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes'> & { userId: string, courseId: string }): Promise<PrismaPaymentSubmission> => {
    return prisma.paymentSubmission.create({
        data: {
            ...submissionData,
            status: 'PENDING',
            submittedAt: new Date(),
        }
    });
};

export const updatePaymentSubmissionInDb = async (submissionId: string, dataToUpdate: { status: PrismaPaymentSubmissionStatus, adminNotes?: string, reviewedAt?: Date }): Promise<PrismaPaymentSubmission> => {
    return prisma.paymentSubmission.update({
        where: { id: submissionId },
        data: {
            ...dataToUpdate,
            reviewedAt: dataToUpdate.reviewedAt || new Date(),
        }
    });
};

// --- Enrollment ---
export const getEnrollmentForUserAndCourseFromDb = async (userId: string, courseId: string): Promise<PrismaEnrollment | null> => {
    try {
        return await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
    } catch (error) {
        console.error(`Error fetching enrollment for user ${userId}, course ${courseId} from DB:`, error);
        return null;
    }
};

export const createEnrollmentInDb = async (userId: string, courseId: string): Promise<PrismaEnrollment> => {
    return prisma.enrollment.create({
        data: {
            userId,
            courseId,
            progress: 0,
            enrolledDate: new Date(),
        }
    });
};

export const updateEnrollmentProgressInDb = async (enrollmentId: string, progress: number): Promise<PrismaEnrollment> => {
    return prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { progress, updatedAt: new Date() },
    });
};

export const getEnrollmentsByUserIdFromDb = async (userId: string): Promise<PrismaEnrollment[]> => {
  try {
    return await prisma.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledDate: 'desc' },
      include: { course: true }, // Include course data
    });
  } catch (error) {
    console.error(`Error fetching enrollments for user ${userId} from DB:`, error);
    return [];
  }
};

// --- Seeding Functions ---
const seedData = async <T extends { id: string }, U>(
  modelName: keyof PrismaClient,
  mockData: T[],
  transform?: (item: T) => U
): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  // @ts-ignore
  const prismaModel = prisma[modelName];

  for (const item of mockData) {
    try {
      const existingItem = await prismaModel.findUnique({ where: { id: item.id } });
      if (existingItem) {
        skippedCount++;
        continue;
      }
      const dataToCreate = transform ? transform(item) : { ...item };
      // Prisma expects relations to be connect objects if not using nested writes
      // For simplicity in seeding, we'll assume direct data matches schema for now
      // or relations are handled by creating dependent data first.
      await prismaModel.create({ data: dataToCreate });
      successCount++;
    } catch (e) {
      console.error(`Error seeding ${modelName} item ${item.id}:`, e);
      errorCount++;
    }
  }
  return { successCount, errorCount, skippedCount };
};

export const seedCoursesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
    // This simplified seedCoursesToDb needs more sophisticated handling for relations
    // like category, modules, lessons, quizzes. For now, it seeds basic course data.
    // A full seeding would involve creating related entities or connecting them.
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const course of mockCoursesForSeeding) {
        try {
            const existing = await prisma.course.findUnique({ where: { id: course.id } });
            if (existing) {
                skippedCount++;
                continue;
            }
            // Create/connect category
            let categoryIdToLink: string | undefined = undefined;
            if (course.category) {
                let dbCategory = await prisma.category.findUnique({ where: { name: course.category }});
                if (!dbCategory) {
                     // Find category in mock data to get icon etc.
                    const mockCat = mockCategoriesForSeeding.find(mc => mc.name === course.category);
                    dbCategory = await prisma.category.create({
                        data: {
                            name: course.category,
                            iconName: mockCat?.iconName,
                            imageUrl: mockCat?.imageUrl,
                            dataAiHint: mockCat?.dataAiHint
                        }
                    });
                }
                categoryIdToLink = dbCategory.id;
            }

            const { modules, quizzes, category, ...courseData } = course; // Exclude relational data for direct create

            await prisma.course.create({
                data: {
                    ...courseData,
                    categoryId: categoryIdToLink,
                    categoryNameCache: course.category || "General", // Store category name
                    // Modules, lessons, quizzes would need to be created in separate, nested transactions
                    // For now, this simple seed will not create them.
                },
            });
            successCount++;
        } catch (e) {
            console.error(`Error seeding course ${course.title}:`, e);
            errorCount++;
        }
    }
    return { successCount, errorCount, skippedCount };
};

export const seedCategoriesToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  return seedData('category', mockCategoriesForSeeding, item => ({...item}));
};

export const seedVideosToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  return seedData('video', mockVideosForSeeding, item => ({
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(), // Ensure date conversion
  }));
};

export const seedLearningPathsToDb = async (): Promise<{ successCount: number; errorCount: number; skippedCount: number }> => {
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const path of mockLearningPathsForSeeding) {
    try {
      const existingPath = await prisma.learningPath.findUnique({ where: { id: path.id } });
      if (existingPath) {
        skippedCount++;
        continue;
      }
      const { courseIds, ...pathData } = path;
      const createdPath = await prisma.learningPath.create({ data: pathData });

      if (courseIds && courseIds.length > 0) {
        await prisma.learningPathCourse.createMany({
          data: courseIds.map(courseId => ({
            learningPathId: createdPath.id,
            courseId: courseId, // Assumes these course IDs exist from course seeding
          })),
          skipDuplicates: true, // In case of re-run with partial success
        });
      }
      successCount++;
    } catch (e) {
      console.error(`Error seeding learning path ${path.title}:`, e);
      errorCount++;
    }
  }
  return { successCount, errorCount, skippedCount };
};

// Seed payment settings (global singleton)
export const seedPaymentSettingsToDb = async () => {
    try {
        await prisma.paymentSettings.upsert({
            where: { id: 'global' },
            update: {
                bankName: mockPaymentSettings.bankName,
                accountNumber: mockPaymentSettings.accountNumber,
                accountHolderName: mockPaymentSettings.accountHolderName,
                additionalInstructions: mockPaymentSettings.additionalInstructions,
            },
            create: {
                id: 'global',
                bankName: mockPaymentSettings.bankName,
                accountNumber: mockPaymentSettings.accountNumber,
                accountHolderName: mockPaymentSettings.accountHolderName,
                additionalInstructions: mockPaymentSettings.additionalInstructions,
            },
        });
        return { successCount: 1, errorCount: 0, skippedCount: 0}; // Or check if it was an update vs create
    } catch (e) {
        console.error("Error seeding payment settings:", e);
        return { successCount: 0, errorCount: 1, skippedCount: 0};
    }
};

// TODO: Add more specific 'add', 'update', 'delete' functions for each model as needed.
// Course creation, for example, will need to handle module and lesson creation,
// possibly within a transaction.
export const addCourseToDb = async (
  courseData: Omit<PrismaCourse, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'modules' | 'quizzes' | 'enrollments' | 'paymentSubmissions' | 'learningPaths'> & {
    categoryName?: string;
    modulesData?: Array<Omit<PrismaModule, 'id' | 'courseId' | 'createdAt' | 'updatedAt'> & {
      lessonsData?: Array<Omit<PrismaLesson, 'id' | 'moduleId' | 'createdAt' | 'updatedAt'>>;
    }>;
    quizzesData?: Array<Omit<PrismaQuiz, 'id' | 'courseId' | 'createdAt' | 'updatedAt'> & {
        questionsData?: Array<Omit<PrismaQuestion, 'id' | 'quizId' | 'createdAt' | 'updatedAt'> & {
            optionsData?: Array<Omit<PrismaOption, 'id' | 'questionId' | 'createdAt' | 'updatedAt'>>;
            correctOptionText?: string; // To find/create the correct option
        }>;
    }>;
  }
): Promise<PrismaCourse> => {
  const { categoryName, modulesData, quizzesData, ...mainCourseData } = courseData;

  return prisma.course.create({
    data: {
      ...mainCourseData,
      categoryNameCache: categoryName || "General",
      category: categoryName ? { connectOrCreate: { where: { name: categoryName }, create: { name: categoryName } } } : undefined,
      modules: modulesData ? {
        create: modulesData.map(mod => ({
          title: mod.title,
          order: mod.order,
          lessons: mod.lessonsData ? {
            create: mod.lessonsData.map(les => ({
              title: les.title,
              duration: les.duration,
              description: les.description,
              embedUrl: les.embedUrl,
              imageUrl: les.imageUrl,
              order: les.order,
            })),
          } : undefined,
        })),
      } : undefined,
      quizzes: quizzesData ? {
          create: quizzesData.map(quiz => ({
              title: quiz.title,
              quizType: quiz.quizType,
              passingScore: quiz.passingScore,
              questions: quiz.questionsData ? {
                  create: quiz.questionsData.map(q => ({
                      text: q.text,
                      points: q.points,
                      order: q.order,
                      options: q.optionsData ? {
                          create: q.optionsData.map(opt => ({ text: opt.text })),
                      } : undefined,
                      // This part is tricky with nested create; correctOptionId needs to be set after options are created.
                      // Simpler: set correctOptionId manually after quiz creation or adjust model.
                      // For now, we'll omit complex correctOptionId linking in direct create.
                  })),
              } : undefined,
          })),
      } : undefined,
    },
    include: {
        modules: { include: { lessons: true }},
        quizzes: { include: { questions: { include: { options: true }}}}
    }
  });
};


export const updateCourseInDb = async (
  courseId: string,
  courseData: Partial<Omit<PrismaCourse, 'id' | 'createdAt' | 'updatedAt' | 'categoryId' | 'modules' | 'quizzes' | 'enrollments' | 'paymentSubmissions' | 'learningPaths'>> & {
    categoryName?: string;
    modulesData?: Array<Partial<Omit<PrismaModule, 'courseId' | 'createdAt' | 'updatedAt'>> & { id?: string, lessonsData?: Array<Partial<Omit<PrismaLesson, 'moduleId' | 'createdAt' | 'updatedAt'>> & {id?: string}>}>;
    quizzesData?: Array<Partial<Omit<PrismaQuiz, 'courseId' | 'createdAt' | 'updatedAt'>> & { 
        id?:string, 
        questionsData?: Array<Partial<Omit<PrismaQuestion, 'quizId'|'createdAt'|'updatedAt'>> & {
            id?:string, 
            optionsData?: Array<Partial<Omit<PrismaOption, 'questionId'|'createdAt'|'updatedAt'>> & {id?:string}>
        }>
    }>;
  }
): Promise<PrismaCourse> => {
  const { categoryName, modulesData, quizzesData, ...mainCourseData } = courseData;

  // Transaction is highly recommended here for complex updates
  return prisma.$transaction(async (tx) => {
    const updatedCourse = await tx.course.update({
      where: { id: courseId },
      data: {
        ...mainCourseData,
        categoryNameCache: categoryName || undefined, // Update if provided
        category: categoryName ? { connectOrCreate: { where: { name: categoryName }, create: { name: categoryName } } } : undefined,
        updatedAt: new Date(),
      },
    });

    // Handle Modules and Lessons (Complex: involves creates, updates, deletes)
    if (modulesData) {
      // Delete modules not in modulesData
      const moduleIdsToKeep = modulesData.map(m => m.id).filter(Boolean) as string[];
      await tx.module.deleteMany({
        where: { courseId: courseId, NOT: { id: { in: moduleIdsToKeep } } },
      });

      for (const modData of modulesData) {
        const { lessonsData, id: moduleId, ...restModData } = modData;
        const upsertedModule = await tx.module.upsert({
          where: { id: moduleId || 'new-module-never-match' }, // Dummy ID for create
          create: { ...restModData, courseId: courseId },
          update: restModData,
        });

        if (lessonsData) {
          const lessonIdsToKeep = lessonsData.map(l => l.id).filter(Boolean) as string[];
          await tx.lesson.deleteMany({
            where: { moduleId: upsertedModule.id, NOT: { id: { in: lessonIdsToKeep } } },
          });
          for (const lesData of lessonsData) {
            const { id: lessonId, ...restLesData } = lesData;
            await tx.lesson.upsert({
              where: { id: lessonId || 'new-lesson-never-match' },
              create: { ...restLesData, moduleId: upsertedModule.id },
              update: restLesData,
            });
          }
        }
      }
    }
    
    // Handle Quizzes, Questions, Options (Similarly complex)
    if (quizzesData) {
        // Delete quizzes not in quizzesData
        const quizIdsToKeep = quizzesData.map(q => q.id).filter(Boolean) as string[];
        await tx.quiz.deleteMany({
            where: { courseId: courseId, NOT: { id: { in: quizIdsToKeep }}},
        });

        for (const quizData of quizzesData) {
            const { questionsData, id: quizId, ...restQuizData } = quizData;
            const upsertedQuiz = await tx.quiz.upsert({
                where: { id: quizId || 'new-quiz-never-match' },
                create: { ...restQuizData, courseId: courseId },
                update: restQuizData,
            });

            if (questionsData) {
                const questionIdsToKeep = questionsData.map(q => q.id).filter(Boolean) as string[];
                await tx.question.deleteMany({
                    where: { quizId: upsertedQuiz.id, NOT: { id: { in: questionIdsToKeep }}},
                });

                for (const qData of questionsData) {
                    const { optionsData, id: questionId, ...restQData } = qData;
                    const upsertedQuestion = await tx.question.upsert({
                        where: { id: questionId || 'new-question-never-match' },
                        create: { ...restQData, quizId: upsertedQuiz.id },
                        update: restQData,
                    });

                    if (optionsData) {
                        const optionIdsToKeep = optionsData.map(o => o.id).filter(Boolean) as string[];
                         await tx.option.deleteMany({
                            where: { questionId: upsertedQuestion.id, NOT: {id: { in: optionIdsToKeep }}},
                         });
                        for (const optData of optionsData) {
                            const { id: optionId, ...restOptData } = optData;
                            await tx.option.upsert({
                                where: { id: optionId || 'new-option-never-match' },
                                create: { ...restOptData, questionId: upsertedQuestion.id },
                                update: restOptData,
                            });
                        }
                    }
                    // Update correctOptionId on question after options are created/updated
                    // This part needs refinement for how correct option is identified from optionsData
                    // For now, assuming correctOptionId is directly provided or managed manually
                }
            }
        }
    }


    return tx.course.findUniqueOrThrow({ 
        where: { id: courseId },
        include: {
            modules: { include: { lessons: true }},
            quizzes: { include: { questions: { include: { options: true }}}}
        }
    });
  });
};

export const deleteCourseFromDb = async (courseId: string): Promise<void> => {
    // Relations like Modules, Quizzes, Enrollments, etc. should have onDelete: Cascade in schema
    // or be handled manually in a transaction.
    await prisma.course.delete({ where: { id: courseId } });
};


