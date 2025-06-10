
"use client";
import React, { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { courses as mockDataCourses, enrollments as initialEnrollments, paymentSubmissions as initialPaymentSubmissions, type Course, type Module, type Lesson, type User, type Enrollment, type PaymentSubmission, type PaymentSubmissionStatus } from '@/data/mockData'; 
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, BookOpenText, PlayCircle, Lock, CheckCircle, AlertTriangle, Clock, ExternalLink, ArrowRight, Home, ShoppingCart, BadgeDollarSign, Hourglass } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CompletionInfo {
  isCompleted: boolean;
  progress: number;
}
interface PaymentInfo {
  status: PaymentSubmissionStatus | null; // null if no submission found
  submission?: PaymentSubmission;
}

const USER_ENROLLMENTS_KEY = 'userEnrollmentsData';
const USER_PAYMENT_SUBMISSIONS_KEY = 'adminPaymentSubmissions'; // Admin manages these

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [allAppCourses, setAllAppCourses] = useState<Course[]>([]);
  const [areAppCoursesLoaded, setAreAppCoursesLoaded] = useState(false);
  
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [firstLessonPath, setFirstLessonPath] = useState<string | null>(null);
  const [completionInfo, setCompletionInfo] = useState<CompletionInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true); 

  useEffect(() => {
    let coursesToUse: Course[] = [];
    try {
      const storedCoursesString = localStorage.getItem('adminCourses');
      if (storedCoursesString) {
        const parsedCourses = JSON.parse(storedCoursesString) as Course[];
        if (Array.isArray(parsedCourses)) {
            coursesToUse = parsedCourses;
        } else {
            console.warn("adminCourses in localStorage was not an array, using default mock courses.");
            coursesToUse = mockDataCourses;
        }
      } else {
        coursesToUse = mockDataCourses;
      }
    } catch (error) {
      console.error("Error loading courses from localStorage for CourseDetail:", error);
      coursesToUse = mockDataCourses; 
    }
    setAllAppCourses(coursesToUse);
    setAreAppCoursesLoaded(true);
  }, []);

  useEffect(() => {
    setIsLoadingPage(true); 
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

    if (foundCourse?.modules?.[0]?.lessons?.[0]) {
      setFirstLessonPath(`/courses/${foundCourse.id}/learn/${foundCourse.modules[0].id}/${foundCourse.modules[0].lessons[0].id}`);
    } else {
      setFirstLessonPath(null);
    }
  }, [courseId, allAppCourses, areAppCoursesLoaded]);

  useEffect(() => {
    setIsLoadingPage(true); 
    setCompletionInfo(null); 
    setPaymentInfo(null);

    if (authLoading || !areAppCoursesLoaded) { // Wait for auth and courses
      return;
    }
    
    if (!courseId) {
      setIsLoadingPage(false);
      return;
    }
        
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
                    const parsedEnrollments = JSON.parse(storedEnrollments); 
                    if(Array.isArray(parsedEnrollments)){
                        userEnrollments = parsedEnrollments as Enrollment[];
                    } else { 
                        console.warn(`${USER_ENROLLMENTS_KEY} in localStorage was not an array. Falling back and re-initializing.`);
                        localStorage.setItem(USER_ENROLLMENTS_KEY, JSON.stringify(initialEnrollments)); 
                        userEnrollments = JSON.parse(JSON.stringify(initialEnrollments)); 
                    }
                } else { 
                    localStorage.setItem(USER_ENROLLMENTS_KEY, JSON.stringify(initialEnrollments)); 
                    userEnrollments = JSON.parse(JSON.stringify(initialEnrollments)); 
                }
            } catch (error) { 
                console.error(`Error parsing ${USER_ENROLLMENTS_KEY} from localStorage:`, error);
                localStorage.setItem(USER_ENROLLMENTS_KEY, JSON.stringify(initialEnrollments)); 
                userEnrollments = JSON.parse(JSON.stringify(initialEnrollments)); 
            }

            const enrollment = userEnrollments.find(e => e.userId === user.id && e.courseId === currentCourse.id);
            if (enrollment) {
                setCompletionInfo({ isCompleted: enrollment.progress === 100, progress: enrollment.progress });
            } else {
                setCompletionInfo({ isCompleted: false, progress: 0 });
            }

            // Load payment submissions
            if (currentCourse.price && currentCourse.price > 0) {
                let allSubmissions: PaymentSubmission[] = [];
                try {
                    const storedSubmissions = localStorage.getItem(USER_PAYMENT_SUBMISSIONS_KEY);
                    if (storedSubmissions) {
                         const parsedSubmissions = JSON.parse(storedSubmissions);
                         if (Array.isArray(parsedSubmissions)) {
                            allSubmissions = parsedSubmissions as PaymentSubmission[];
                         } else {
                            localStorage.setItem(USER_PAYMENT_SUBMISSIONS_KEY, JSON.stringify(initialPaymentSubmissions));
                            allSubmissions = JSON.parse(JSON.stringify(initialPaymentSubmissions));
                         }
                    } else {
                        localStorage.setItem(USER_PAYMENT_SUBMISSIONS_KEY, JSON.stringify(initialPaymentSubmissions));
                        allSubmissions = JSON.parse(JSON.stringify(initialPaymentSubmissions));
                    }
                } catch (error) {
                    console.error("Error loading payment submissions from localStorage:", error);
                     localStorage.setItem(USER_PAYMENT_SUBMISSIONS_KEY, JSON.stringify(initialPaymentSubmissions));
                    allSubmissions = JSON.parse(JSON.stringify(initialPaymentSubmissions));
                }
                const userSubmission = allSubmissions.find(s => s.userId === user.id && s.courseId === currentCourse.id);
                setPaymentInfo({ status: userSubmission?.status || null, submission: userSubmission });
            } else {
                setPaymentInfo({ status: null }); // Free course
            }

        } else { // Not authenticated
             setCompletionInfo({ isCompleted: false, progress: 0 });
             setPaymentInfo({ status: null });
        }
    }
    
    setIsLoadingPage(false);

  }, [user, isAuthenticated, authLoading, currentCourse, courseId, areAppCoursesLoaded]);


  const renderCTAButton = () => {
    if (!currentCourse) return null; 

    // Handle paid courses
    if (currentCourse.price && currentCourse.price > 0) {
        if (!isAuthenticated) {
            return (
                 <Button asChild size="lg" className="w-full shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150 whitespace-normal h-auto">
                    <Link href={`/login?redirect=/courses/${courseId}`}>
                        <BadgeDollarSign className="mr-2 h-5 w-5" /> Login to Purchase for {currentCourse.price.toFixed(2)} {currentCourse.currency}
                    </Link>
                </Button>
            );
        }
        // Authenticated user, check payment status
        if (paymentInfo?.status === 'approved') {
            if (completionInfo?.isCompleted) {
                return (
                    <div className="flex flex-col items-center text-center p-4 bg-green-100 dark:bg-green-900/50 rounded-lg shadow">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mb-2" />
                        <p className="font-semibold text-green-700 dark:text-green-300">You finished this course!</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Progress: {completionInfo.progress}%</p>
                        {firstLessonPath && (
                            <Button asChild className="mt-3 whitespace-normal h-auto">
                            <Link href={firstLessonPath}>Review Course</Link>
                            </Button>
                        )}
                    </div>
                );
            }
             if (!firstLessonPath) { // Paid & Approved, but no lessons
                 return (
                    <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg shadow">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
                        <p className="font-semibold text-foreground">Course Content Coming Soon</p>
                        <p className="text-sm text-muted-foreground">Lessons are being prepared. Check back later!</p>
                    </div>
                );
            }
            return ( // Approved, not yet completed
                <Button asChild size="lg" className="w-full shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150 whitespace-normal h-auto">
                    <Link href={firstLessonPath}>
                    Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            );
        } else if (paymentInfo?.status === 'pending') {
            return (
                <div className="flex flex-col items-center text-center p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg shadow">
                    <Hourglass className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="font-semibold text-blue-700 dark:text-blue-300">Payment Submitted</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Your payment is currently under review.</p>
                </div>
            );
        } else { // No submission, or rejected
             if (!firstLessonPath && !(currentCourse.modules && currentCourse.modules.length > 0)) { // No content to purchase
                return (
                    <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg shadow">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
                        <p className="font-semibold text-foreground">Course Content Coming Soon</p>
                        <p className="text-sm text-muted-foreground">This course is priced but lessons are not yet available. Check back later!</p>
                    </div>
                );
            }
            return ( // Needs purchase
                <Button asChild size="lg" className="w-full shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150 whitespace-normal h-auto">
                    <Link href={`/courses/${courseId}/checkout`}>
                        <ShoppingCart className="mr-2 h-5 w-5" /> Purchase for {currentCourse.price.toFixed(2)} {currentCourse.currency}
                    </Link>
                </Button>
            );
        }
    }

    // Handle free courses (original logic)
    if (completionInfo?.isCompleted) {
      return (
        <div className="flex flex-col items-center text-center p-4 bg-green-100 dark:bg-green-900/50 rounded-lg shadow">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mb-2" />
          <p className="font-semibold text-green-700 dark:text-green-300">You finished this course!</p>
          <p className="text-sm text-green-600 dark:text-green-400">Progress: {completionInfo.progress}%</p>
          {firstLessonPath && (
            <Button asChild className="mt-3 whitespace-normal h-auto">
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
      <Button asChild size="lg" className="w-full shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150 whitespace-normal h-auto">
        <Link href={firstLessonPath}>
          Start Learning (Free) <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    );
  };


  if (isLoadingPage || authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-1/4" /> 
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="w-full h-56 rounded-lg" /> 
            <Card>
                <CardHeader>
                    <Skeleton className="h-10 w-3/4 mb-2" /> 
                    <Skeleton className="h-6 w-1/2" /> 
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-5 w-full mb-2" /> 
                    <Skeleton className="h-5 w-full mb-2" /> 
                    <Skeleton className="h-5 w-3/4" /> 
                </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1 space-y-6 md:sticky md:top-24">
            <Card>
                <CardHeader><Skeleton className="h-8 w-3/4" /> </CardHeader>
                <CardContent><Skeleton className="h-12 w-full" /></CardContent>
                 <CardFooter><Skeleton className="h-4 w-1/2 mx-auto" /></CardFooter>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-10 w-full" /> 
                    <Skeleton className="h-10 w-full" /> 
                    <Skeleton className="h-10 w-full" /> 
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="max-w-lg mx-auto py-6 sm:py-12 text-center">
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

  const { title, description, category, instructor, modules, imageUrl, dataAiHint, price, currency } = currentCourse;

  return (
    <div className="max-w-4xl mx-auto py-2 md:py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 md:mb-6 text-sm">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Courses
      </Button>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
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
                {price && price > 0 && currency && (
                    <span className="block mt-1 font-semibold text-primary">
                        Price: {price.toFixed(2)} {currency}
                    </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 whitespace-pre-line">{description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6 md:sticky md:top-24">
          <Card className="shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-headline">Course Access</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCTAButton()}
            </CardContent>
            {isAuthenticated && completionInfo && completionInfo.progress > 0 && completionInfo.progress < 100 && (!price || price <=0 || paymentInfo?.status === 'approved') && (
                 <CardFooter className="text-sm text-muted-foreground pt-0 pb-4 text-center justify-center">
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
                <Accordion type="single" collapsible className="w-full" defaultValue={modules?.[0]?.id}>
                  {modules.map((module: Module, moduleIndex: number) => (
                    <AccordionItem value={module.id} key={module.id}>
                      <AccordionTrigger className="text-md font-semibold hover:no-underline">
                        {`Module ${moduleIndex + 1}: ${module.title}`}
                      </AccordionTrigger>
                      <AccordionContent>
                        {module.lessons && module.lessons.length > 0 ? (
                          <ul className="space-y-2 pl-2 border-l-2 border-primary/20 ml-2">
                            {module.lessons.map((lesson: Lesson, lessonIndex: number) => {
                              const lessonPath = `/courses/${courseId}/learn/${module.id}/${lesson.id}`;
                              // Simplified access: if course is free or payment is approved, lesson is accessible
                              const isLessonAccessible = (!price || price <= 0) || (isAuthenticated && paymentInfo?.status === 'approved');
                              
                              return (
                                <li key={lesson.id}>
                                  {isLessonAccessible ? (
                                    <Link href={lessonPath} className="group flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                                      <span className="flex items-center flex-grow min-w-0 mr-2">
                                        <PlayCircle className="mr-2 h-4 w-4 text-primary group-hover:text-accent-foreground transition-colors flex-shrink-0" />
                                        <span className="whitespace-normal">{`${lessonIndex + 1}. ${lesson.title}`}</span>
                                      </span>
                                      <span className="text-xs text-muted-foreground group-hover:text-accent-foreground transition-colors flex-shrink-0">{lesson.duration}</span>
                                    </Link>
                                  ) : (
                                    <div className="group flex items-center justify-between text-sm py-1.5 px-2 rounded-md text-muted-foreground cursor-not-allowed">
                                      <span className="flex items-center flex-grow min-w-0 mr-2">
                                        <Lock className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="whitespace-normal">{`${lessonIndex + 1}. ${lesson.title}`}</span>
                                      </span>
                                      <span className="text-xs flex-shrink-0">{lesson.duration}</span>
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


    
