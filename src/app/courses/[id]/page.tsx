
"use client";
import { useParams, useRouter } from 'next/navigation';
import { courses as allCourses, type Course, type Lesson, type Module, getPaymentSubmissions, type PaymentSubmission } from '@/data/mockData';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlayCircle, BookOpen, Video, FileText, Loader2, ListChecks, FileVideo, ExternalLink, CheckCircle2, ShoppingCart, Clock, AlertOctagon } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getEmbedUrl } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';


export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [initialCoursesLoaded, setInitialCoursesLoaded] = useState(false); // New state
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstLessonPath, setFirstLessonPath] = useState<string | null>(null);
  const [completionInfo, setCompletionInfo] = useState<{ date: string; isCompleted: boolean } | null>(null);
  const [userPaymentSubmission, setUserPaymentSubmission] = useState<PaymentSubmission | null>(null);

  // Effect 1: Load all available courses (from localStorage or fallback to mock)
  useEffect(() => {
    let coursesToUse = allCourses;
    const storedCourses = localStorage.getItem('adminCourses');
    if (storedCourses) {
      try {
        const parsedCourses = JSON.parse(storedCourses) as Course[];
        if (Array.isArray(parsedCourses)) { 
          coursesToUse = parsedCourses;
        }
      } catch (e) {
        console.error("Failed to parse courses from localStorage on detail page", e);
      }
    }
    setActiveCourses(coursesToUse);
    setInitialCoursesLoaded(true); // Signal that activeCourses loading attempt is complete
  }, []); 

  // Effect 2: Determine the specific course and its first lesson path
  useEffect(() => {
    if (!initialCoursesLoaded) {
      // Wait for activeCourses to be loaded by the first effect.
      // Ensure isLoading is true during this wait.
      if (!isLoading) setIsLoading(true);
      return;
    }

    setIsLoading(true); 
    setCourse(null); // Reset previous course data
    setFirstLessonPath(null);

    if (!courseId) {
      // If courseId is not available (e.g., router params not ready), stop loading.
      setIsLoading(false);
      return; 
    }
    
    let determinedCourse: Course | null = null;
    let determinedPath: string | null = null;

    if (activeCourses.length > 0) {
      const found = activeCourses.find(c => c.id === courseId);
      if (found) {
        determinedCourse = found;
        if (found.modules && found.modules.length > 0) {
          const firstModuleWithLessons = found.modules.find(m => m.lessons && m.lessons.length > 0);
          if (firstModuleWithLessons && firstModuleWithLessons.lessons && firstModuleWithLessons.lessons.length > 0) {
            determinedPath = `/courses/${found.id}/learn/${firstModuleWithLessons.id}/${firstModuleWithLessons.lessons[0].id}`;
          }
        }
      }
    }
    
    setCourse(determinedCourse);
    setFirstLessonPath(determinedPath);
    setIsLoading(false); 

  }, [courseId, activeCourses, initialCoursesLoaded]); // Depend on initialCoursesLoaded

  // Effect 3: Determine completion status and payment submission status
  useEffect(() => {
    // Only proceed if initial courses are loaded, not currently loading main course data, and user/course are available
    if (!initialCoursesLoaded || isLoading || !course || !user) { 
      setCompletionInfo(null);
      setUserPaymentSubmission(null);
      return;
    }
    
    // Check for course completion
    const completionKey = `user_${user.id}_completions`;
    let isCourseCompleted = false;
    let completionDate = '';
    try {
      const storedCompletions = localStorage.getItem(completionKey);
      if (storedCompletions) {
        const completions = JSON.parse(storedCompletions);
        if (completions[course.id]) {
          isCourseCompleted = true;
          completionDate = completions[course.id];
        }
      }
    } catch (e) {
      console.error("Error parsing completions from localStorage", e);
    }
    setCompletionInfo({ date: completionDate, isCompleted: isCourseCompleted });

    const isPaidCourse = course.price && course.price > 0;
    if (isPaidCourse && !isCourseCompleted) { 
      const allSubmissions = getPaymentSubmissions();
      const userCourseSubmissions = allSubmissions
        .filter(sub => sub.userId === user.id && sub.courseId === course.id)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      setUserPaymentSubmission(userCourseSubmissions.length > 0 ? userCourseSubmissions[0] : null);
    } else {
      setUserPaymentSubmission(null); 
    }
  }, [user, course, isLoading, initialCoursesLoaded]); // Added initialCoursesLoaded and isLoading


  if (isLoading || !initialCoursesLoaded) { // Show loader if main loading or initial courses not yet processed
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold text-foreground">Loading course details...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-10 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
        <AlertOctagon className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive">Course Not Found</h1>
        <p className="text-muted-foreground">The course you are looking for (ID: {courseId}) does not exist or is not available.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Go back to Homepage</Link>
        </Button>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
  

  const renderCTAButton = () => {
    const isPaidCourse = course.price && course.price > 0;

    if (completionInfo?.isCompleted && completionInfo.date) {
      let formattedDate = 'a previous date';
      try {
        formattedDate = format(new Date(completionInfo.date), 'PPP');
      } catch (error) {
        formattedDate = completionInfo.date; 
      }
      return (
        <div className="w-full p-3 text-center bg-green-100 dark:bg-green-900 border border-green-500 text-green-700 dark:text-green-300 rounded-md shadow-sm flex flex-col sm:flex-row items-center justify-center gap-2">
          <CheckCircle2 className="mr-2 h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
          <span>You finished this course on {formattedDate}.</span>
          {firstLessonPath && (
             <Button size="sm" variant="outline" asChild className="ml-auto border-green-600 text-green-700 hover:bg-green-200 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-800 shrink-0">
              <Link href={firstLessonPath}>Review Course</Link>
            </Button>
          )}
        </div>
      );
    }
    
    if (firstLessonPath) {
      if (isPaidCourse) {
        if (user && userPaymentSubmission) {
          if (userPaymentSubmission.status === 'verified') {
            return (
              <div className="w-full p-3 text-center bg-green-100 dark:bg-green-900 border border-green-500 text-green-700 dark:text-green-300 rounded-md shadow-sm flex flex-col sm:flex-row items-center justify-center gap-2">
                 <CheckCircle2 className="mr-2 h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
                 <div className="flex-grow text-center sm:text-left">
                  <span className="font-semibold">Payment Verified!</span>
                  <p className="text-sm">You can now start learning this course.</p>
                 </div>
                <Button size="lg" asChild className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={firstLessonPath}>
                    <PlayCircle className="mr-2 h-6 w-6"/> Start Learning
                  </Link>
                </Button>
              </div>
            );
          } else if (userPaymentSubmission.status === 'pending') {
            return (
              <div className="w-full p-4 text-center bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-500 text-yellow-700 dark:text-yellow-300 rounded-md shadow-sm flex flex-col items-center gap-2">
                <Clock className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-lg">Payment Submitted</span>
                <p className="text-sm">Your payment proof is pending verification by an admin. Please check back later.</p>
                <p className="text-xs mt-1">Submitted on: {format(new Date(userPaymentSubmission.submittedAt), 'PPpp')}</p>
                 <Button size="sm" variant="outline" asChild className="mt-2 border-yellow-600 text-yellow-700 hover:bg-yellow-200 dark:border-yellow-500 dark:text-yellow-300 dark:hover:bg-yellow-800/70">
                    <Link href={`/courses/${course.id}/checkout`}>View/Update Submission</Link>
                 </Button>
              </div>
            );
          } else if (userPaymentSubmission.status === 'rejected') {
            return (
              <div className="w-full p-4 text-center bg-red-100 dark:bg-red-900/50 border border-red-500 text-red-700 dark:text-red-300 rounded-md shadow-sm flex flex-col items-center gap-2">
                <AlertOctagon className="h-7 w-7 text-red-600 dark:text-red-400" />
                <span className="font-semibold text-lg">Payment Rejected</span>
                <p className="text-sm">Your previous payment submission was rejected. Please ensure your details are correct and try again.</p>
                <Button size="lg" asChild className="mt-3 w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  <Link href={`/courses/${course.id}/checkout`}>
                    <ShoppingCart className="mr-2 h-6 w-6"/> Re-submit Payment
                  </Link>
                </Button>
              </div>
            );
          }
        }
        return (
          <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150" asChild>
            <Link href={`/courses/${course.id}/checkout`}>
              <ShoppingCart className="mr-2 h-6 w-6"/> Enroll & Pay ({course.price?.toLocaleString()} {course.currency})
            </Link>
          </Button>
        );
      } else { 
        return (
          <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150" asChild>
            <Link href={firstLessonPath}>
              <PlayCircle className="mr-2 h-6 w-6"/> Start Learning (Free)
            </Link>
          </Button>
        );
      }
    }

    return (
      <Button size="lg" className="w-full" disabled>
        <PlayCircle className="mr-2 h-6 w-6"/> Course Content Coming Soon
      </Button>
    );
  };


  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Link>
        </Button>

        <Card className="overflow-hidden shadow-xl">
          {course.imageUrl && (
            <div className="relative w-full h-64 md:h-80">
              <Image
                src={course.imageUrl}
                alt={course.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={course.dataAiHint || 'education banner'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">{course.title}</h1>
                <p className="text-lg text-primary-foreground/80">{course.category}</p>
              </div>
            </div>
          )}
          <CardHeader className={!course.imageUrl ? "pt-6" : "pt-2 pb-4 px-6"}>
            {!course.imageUrl && <CardTitle className="text-3xl font-headline">{course.title}</CardTitle>}
            <div className="flex justify-between items-start">
                <CardDescription className="text-md">By {course.instructor}</CardDescription>
                {course.price && course.price > 0 ? (
                    <span className="text-xl font-semibold text-primary">
                        {course.price?.toLocaleString()} {course.currency}
                    </span>
                ) : (
                    <span className="text-xl font-semibold text-green-600">Free</span>
                )}
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-6">
            <p className="text-lg text-foreground/90">{course.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 border rounded-lg bg-muted/50 shadow-sm">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                  <ListChecks className="mr-2 h-5 w-5 text-primary" /> Modules
                </h3>
                <p className="text-xl font-semibold text-foreground">{course.modules?.length || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                  <FileVideo className="mr-2 h-5 w-5 text-primary" /> Lessons
                </h3>
                <p className="text-xl font-semibold text-foreground">{totalLessons}</p>
              </div>
            </div>
            
            <div className="mt-6 mb-4">
             {renderCTAButton()}
            </div>

            <div>
              <h2 className="text-2xl font-headline font-semibold mb-3 flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-primary" /> Course Modules & Lessons
              </h2>
              {course.modules && course.modules.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {course.modules.map(module => (
                    <AccordionItem value={`module-${module.id}`} key={module.id} className="border-b">
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                        {module.title}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-0">
                        {module.lessons && module.lessons.length > 0 ? (
                          <ul className="space-y-3 pl-2">
                            {module.lessons.map(lesson => {
                              const embeddableUrl = getEmbedUrl(lesson.embedUrl);
                              const isPaidAndNotVerified = (course.price && course.price > 0) && (!userPaymentSubmission || userPaymentSubmission.status !== 'verified');
                              const lessonIsAccessible = (!isPaidAndNotVerified || completionInfo?.isCompleted || (course.price === 0 || !course.price)); 
                              const lessonLink = `/courses/${course.id}/learn/${module.id}/${lesson.id}`;

                              return (
                                <li key={lesson.id} className={`p-3 border rounded-md bg-card ${lessonIsAccessible ? 'hover:shadow-md transition-shadow' : 'opacity-70'}`}>
                                  <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-medium text-md flex items-center">
                                      {embeddableUrl ? <Video className="mr-2 h-5 w-5 text-accent shrink-0"/> : <FileText className="mr-2 h-5 w-5 text-accent shrink-0"/>}
                                      {lesson.title}
                                    </h4>
                                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full shrink-0">{lesson.duration}</span>
                                  </div>
                                  {lesson.description && (
                                    <p className="text-sm text-muted-foreground mb-2">{lesson.description}</p>
                                  )}
                                  {lessonIsAccessible && firstLessonPath && (
                                    <Link href={lessonLink} className="text-xs text-primary hover:underline flex items-center">
                                      Watch Lesson <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                  )}
                                   {!lessonIsAccessible && (course.price && course.price > 0) && (
                                    <span className="text-xs text-muted-foreground flex items-center">
                                        Enrollment or verified payment required.
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                           <p className="text-sm text-muted-foreground px-4 py-2">No lessons in this module yet.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">Modules for this course will be available soon.</p>
              )}
            </div>
            
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
    

    