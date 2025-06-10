
"use client";
import React, { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { courses as mockDataCourses, enrollments as initialEnrollments, type Course, type Module, type Lesson, type User, type Enrollment } from '@/data/mockData'; // enrollments renamed to initialEnrollments
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, BookOpenText, PlayCircle, Lock, CheckCircle, AlertTriangle, Clock, ExternalLink, ArrowRight, Home } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CompletionInfo {
  isCompleted: boolean;
  progress: number;
}
const USER_ENROLLMENTS_KEY = 'userEnrollmentsData';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [allAppCourses, setAllAppCourses] = useState<Course[]>([]);
  const [areAppCoursesLoaded, setAreAppCoursesLoaded] = useState(false);
  
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [firstLessonPath, setFirstLessonPath] = useState<string | null>(null);
  const [completionInfo, setCompletionInfo] = useState<CompletionInfo | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true); 

  // Effect 1: Load allAppCourses (prioritizing localStorage for admin-managed courses)
  useEffect(() => {
    let coursesToUse: Course[] = [];
    try {
      const storedCoursesString = localStorage.getItem('adminCourses');
      if (storedCoursesString) {
        const parsedCourses = JSON.parse(storedCoursesString) as Course[];
        // Use parsedCourses directly if it's a valid array, even if empty
        if (Array.isArray(parsedCourses)) {
            coursesToUse = parsedCourses;
        } else {
            // Fallback if not an array (malformed data)
            console.warn("adminCourses in localStorage was not an array, using default mock courses.");
            coursesToUse = mockDataCourses;
        }
      } else {
        // Fallback if item doesn't exist in localStorage
        coursesToUse = mockDataCourses;
      }
    } catch (error) {
      console.error("Error loading courses from localStorage for CourseDetail:", error);
      coursesToUse = mockDataCourses; // Fallback to mock data on error
    }
    setAllAppCourses(coursesToUse);
    setAreAppCoursesLoaded(true);
  }, []);


  // Effect 2: Determine currentCourse and firstLessonPath
  useEffect(() => {
    setIsLoadingPage(true); // Start loading whenever courseId or loaded courses change
    setCurrentCourse(null); 
    setFirstLessonPath(null);

    if (!areAppCoursesLoaded) {
      return; 
    }

    if (!courseId) {
      setIsLoadingPage(false);
      return; 
    }
    
    const foundCourse = allAppCourses.find(c => c.id === courseId);
    setCurrentCourse(foundCourse || null);

    if (foundCourse && foundCourse.modules && foundCourse.modules.length > 0 &&
        foundCourse.modules[0].lessons && foundCourse.modules[0].lessons.length > 0) {
      setFirstLessonPath(`/courses/${foundCourse.id}/learn/${foundCourse.modules[0].id}/${foundCourse.modules[0].lessons[0].id}`);
    } else {
      setFirstLessonPath(null);
    }
    // isLoadingPage will be set to false in Effect 3 after user-specific data is processed
  }, [courseId, allAppCourses, areAppCoursesLoaded]);


  // Effect 3: Load user-specific data (completion) and manage final isLoadingPage state
  useEffect(() => {
    // This effect relies on currentCourse being set by Effect 2.
    // It also depends on areAppCoursesLoaded to ensure Effect 1 & 2 have had a chance to run.
    
    setIsLoadingPage(true); 
    setCompletionInfo(null); 

    if (!areAppCoursesLoaded) {
      return;
    }
    
    if (!courseId) {
      setIsLoadingPage(false);
      return;
    }
        
    // If Effect 2 determined course is not found, currentCourse will be null.
    if (courseId && !currentCourse && areAppCoursesLoaded) { 
      setIsLoadingPage(false); 
      return;
    }
    
    if (currentCourse) {
        if (isAuthenticated && user) {
            let userEnrollments: Enrollment[] = [];
            try {
                const storedEnrollments = localStorage.getItem(USER_ENROLLMENTS_KEY);
                if (storedEnrollments) {
                    userEnrollments = JSON.parse(storedEnrollments) as Enrollment[];
                    if(!Array.isArray(userEnrollments)){
                        userEnrollments = JSON.parse(JSON.stringify(initialEnrollments));
                    }
                } else {
                    userEnrollments = JSON.parse(JSON.stringify(initialEnrollments));
                    localStorage.setItem(USER_ENROLLMENTS_KEY, JSON.stringify(userEnrollments)); // Initialize if not present
                }
            } catch (error) {
                console.error("Error handling enrollments in localStorage:", error);
                userEnrollments = JSON.parse(JSON.stringify(initialEnrollments));
            }

            const enrollment = userEnrollments.find(e => e.userId === user.id && e.courseId === currentCourse.id);
            if (enrollment) {
                setCompletionInfo({ isCompleted: enrollment.progress === 100, progress: enrollment.progress });
            } else {
                setCompletionInfo({ isCompleted: false, progress: 0 });
            }
        } else {
            // User not authenticated, no specific completion info.
             setCompletionInfo({ isCompleted: false, progress: 0 });
        }
    }
    
    setIsLoadingPage(false);

  }, [user, isAuthenticated, currentCourse, courseId, areAppCoursesLoaded]);


  const renderCTAButton = () => {
    if (!currentCourse) return null; 

    if (completionInfo?.isCompleted) {
      return (
        <div className="flex flex-col items-center text-center p-4 bg-green-100 dark:bg-green-900/50 rounded-lg shadow">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mb-2" />
          <p className="font-semibold text-green-700 dark:text-green-300">You finished this course!</p>
          <p className="text-sm text-green-600 dark:text-green-400">Progress: {completionInfo.progress}%</p>
          {firstLessonPath && (
            <Button asChild className="mt-3">
              <Link href={firstLessonPath}>Review Course</Link>
            </Button>
          )}
        </div>
      );
    }
    
    if (!firstLessonPath) {
         return (
            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg shadow">
                <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
                <p className="font-semibold text-foreground">Course Content Coming Soon</p>
                <p className="text-sm text-muted-foreground">Lessons are being prepared. Check back later!</p>
            </div>
        );
    }

    return (
      <Button asChild size="lg" className="w-full shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150">
        <Link href={firstLessonPath}>
          Start Learning (Free) <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    );
  };


  if (isLoadingPage) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-1/4" /> {/* Back button */}
        <Skeleton className="h-12 w-3/4" /> {/* Title */}
        <Skeleton className="h-6 w-1/2 mb-4" /> {/* Instructor/Category */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="w-full h-56" /> {/* Image */}
            <Skeleton className="h-5 w-full" /> {/* Description line 1 */}
            <Skeleton className="h-5 w-full" /> {/* Description line 2 */}
            <Skeleton className="h-5 w-3/4" /> {/* Description line 3 */}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" /> {/* CTA card */}
            <Skeleton className="h-10 w-full" /> {/* Accordion item */}
            <Skeleton className="h-10 w-full" /> {/* Accordion item */}
            <Skeleton className="h-10 w-full" /> {/* Accordion item */}
          </div>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center font-headline">
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> Course Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Sorry, we couldn&apos;t find the course you were looking for (ID: {courseId}). It might have been moved or removed.
            </p>
            <Button asChild>
              <Link href="/courses/search">Explore Other Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { title, description, category, instructor, modules, imageUrl, dataAiHint } = currentCourse;

  return (
    <div className="max-w-4xl mx-auto py-2 md:py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 md:mb-6 text-sm">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Courses
      </Button>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column / Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg overflow-hidden">
            {imageUrl && (
              <div className="relative w-full aspect-video bg-muted">
                <Image
                  src={imageUrl}
                  alt={title}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={dataAiHint || 'course education'}
                  priority
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground">{title}</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Taught by {instructor} &bull; Category: {category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 whitespace-pre-line">{description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column / CTA and Modules */}
        <div className="md:col-span-1 space-y-6 md:sticky md:top-24">
          <Card className="shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-headline">Course Access</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCTAButton()}
            </CardContent>
            {completionInfo && completionInfo.progress > 0 && completionInfo.progress < 100 && (
                 <CardFooter className="text-sm text-muted-foreground pt-0 pb-4">
                    Progress: {completionInfo.progress}% completed
                </CardFooter>
            )}
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <BookOpenText className="mr-2 h-6 w-6 text-primary" /> Course Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modules && modules.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {modules.map((module: Module, moduleIndex: number) => (
                    <AccordionItem value={`module-${module.id}`} key={module.id}>
                      <AccordionTrigger className="text-md font-semibold hover:no-underline">
                        {`Module ${moduleIndex + 1}: ${module.title}`}
                      </AccordionTrigger>
                      <AccordionContent>
                        {module.lessons && module.lessons.length > 0 ? (
                          <ul className="space-y-2 pl-2 border-l-2 border-primary/20 ml-2">
                            {module.lessons.map((lesson: Lesson, lessonIndex: number) => {
                              const lessonPath = `/courses/${courseId}/learn/${module.id}/${lesson.id}`;
                              const isLessonAccessible = true; 

                              return (
                                <li key={lesson.id}>
                                  {isLessonAccessible ? (
                                    <Link href={lessonPath} className="group flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                                      <span className="flex items-center">
                                        <PlayCircle className="mr-2 h-4 w-4 text-primary group-hover:text-accent-foreground transition-colors" />
                                        {`${lessonIndex + 1}. ${lesson.title}`}
                                      </span>
                                      <span className="text-xs text-muted-foreground group-hover:text-accent-foreground transition-colors">{lesson.duration}</span>
                                    </Link>
                                  ) : (
                                    <div className="group flex items-center justify-between text-sm py-1.5 px-2 rounded-md text-muted-foreground cursor-not-allowed">
                                      <span className="flex items-center">
                                        <Lock className="mr-2 h-4 w-4" />
                                        {`${lessonIndex + 1}. ${lesson.title}`}
                                      </span>
                                      <span className="text-xs">{lesson.duration}</span>
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground pl-4 py-2">No lessons in this module yet.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-center py-4">No modules available for this course yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
