
"use client";
import { useParams, useRouter } from 'next/navigation';
import { courses as mockDataCourses, type Course, type Lesson, type Module } from '@/data/mockData';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlayCircle, BookOpen, Video, FileText, Loader2, ListChecks, FileVideo, ExternalLink, CheckCircle2, ShoppingCart, AlertOctagon } from 'lucide-react';
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

  const [allAppCourses, setAllAppCourses] = useState<Course[]>([]);
  const [areAppCoursesLoaded, setAreAppCoursesLoaded] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [firstLessonPath, setFirstLessonPath] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [completionInfo, setCompletionInfo] = useState<{ date: string; isCompleted: boolean } | null>(null);
  // userPaymentSubmission state is removed for this revert

  // Effect 1: Load all available courses from localStorage or mockData
  useEffect(() => {
    let coursesToUse = mockDataCourses;
    const storedCourses = localStorage.getItem('adminCourses');
    if (storedCourses) {
      try {
        const parsedCourses = JSON.parse(storedCourses) as Course[];
        if (Array.isArray(parsedCourses) && parsedCourses.length > 0) {
          coursesToUse = parsedCourses;
        } else if (Array.isArray(parsedCourses) && parsedCourses.length === 0) {
          // If admin saved an empty list, respect that.
          coursesToUse = [];
        }
      } catch (e) {
        console.error("Failed to parse courses from localStorage on detail page. Using mock data.", e);
        // coursesToUse remains mockDataCourses
      }
    }
    setAllAppCourses(coursesToUse);
    setAreAppCoursesLoaded(true); // Signal that courses are ready
  }, []);

  // Effect 2: Load specific course details and user completion status
  // This effect depends on courseId, user, and the loaded allAppCourses
  useEffect(() => {
    setIsLoadingPage(true); // Start loading
    setCurrentCourse(null); // Reset previous course data
    setFirstLessonPath(null);
    setCompletionInfo(null);

    if (!areAppCoursesLoaded) {
      // If allAppCourses are not loaded yet, wait. isLoadingPage remains true.
      return;
    }

    if (!courseId) {
      // If courseId is not available (e.g., initial render before params are set),
      // we can't load a specific course.
      setIsLoadingPage(false); // Stop loading, will show "not found" or similar
      return;
    }

    const foundCourse = allAppCourses.find(c => c.id === courseId);

    if (!foundCourse) {
      setCurrentCourse(null); // Ensure currentCourse is null if not found
      setIsLoadingPage(false); // Stop loading, course not found
      return;
    }

    setCurrentCourse(foundCourse);

    // Determine first lesson path for the found course
    if (foundCourse.modules && foundCourse.modules.length > 0) {
      const firstModuleWithLessons = foundCourse.modules.find(m => m.lessons && m.lessons.length > 0);
      if (firstModuleWithLessons && firstModuleWithLessons.lessons && firstModuleWithLessons.lessons.length > 0) {
        setFirstLessonPath(`/courses/${foundCourse.id}/learn/${firstModuleWithLessons.id}/${firstModuleWithLessons.lessons[0].id}`);
      } else {
        setFirstLessonPath(null); // No lessons in any module
      }
    } else {
      setFirstLessonPath(null); // No modules
    }

    // Load completion status if user is logged in
    if (user) {
      let isCourseCompleted = false;
      let completionDate = '';
      try {
        const completionKey = `user_${user.id}_completions`;
        const storedCompletions = localStorage.getItem(completionKey);
        if (storedCompletions) {
          const completionsData = JSON.parse(storedCompletions);
          if (completionsData[foundCourse.id]) {
            isCourseCompleted = true;
            completionDate = completionsData[foundCourse.id];
          }
        }
      } catch (e) {
        console.error("Error parsing completions from localStorage", e);
        // isCourseCompleted remains false, completionDate remains empty
      }
      setCompletionInfo({ date: completionDate, isCompleted: isCourseCompleted });
    }
    
    setIsLoadingPage(false); // All data for this course (or lack thereof) is determined

  }, [courseId, user, allAppCourses, areAppCoursesLoaded]);


  if (isLoadingPage) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold text-foreground">Loading course details...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="text-center py-10 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
        <AlertOctagon className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive">Course Not Found</h1>
        <p className="text-muted-foreground">The course you are looking for (ID: {courseId || 'N/A'}) could not be found or is not available.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Go back to Homepage</Link>
        </Button>
      </div>
    );
  }

  const totalLessons = currentCourse.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;

  const renderCTAButton = () => {
    const isPaidCourse = currentCourse.price && currentCourse.price > 0;

    if (completionInfo?.isCompleted && completionInfo.date) {
      let formattedDate = 'a previous date';
      try {
        formattedDate = format(new Date(completionInfo.date), 'PPP');
      } catch (error) { /* use default */ }
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

    // If not completed, and there's a first lesson:
    if (firstLessonPath) {
      if (isPaidCourse) {
        // Paid course, not completed: Link to checkout
        return (
          <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150" asChild>
            <Link href={`/courses/${currentCourse.id}/checkout`}>
              <ShoppingCart className="mr-2 h-6 w-6"/> Enroll & Pay ({currentCourse.price?.toLocaleString()} {currentCourse.currency})
            </Link>
          </Button>
        );
      } else { // Free course
        return (
          <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150" asChild>
            <Link href={firstLessonPath}>
              <PlayCircle className="mr-2 h-6 w-6"/> Start Learning (Free)
            </Link>
          </Button>
        );
      }
    }

    // No firstLessonPath means no content to start
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
          {currentCourse.imageUrl && (
            <div className="relative w-full h-64 md:h-80">
              <Image
                src={currentCourse.imageUrl}
                alt={currentCourse.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={currentCourse.dataAiHint || 'education banner'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">{currentCourse.title}</h1>
                <p className="text-lg text-primary-foreground/80">{currentCourse.category}</p>
              </div>
            </div>
          )}
          <CardHeader className={!currentCourse.imageUrl ? "pt-6" : "pt-2 pb-4 px-6"}>
            {!currentCourse.imageUrl && <CardTitle className="text-3xl font-headline">{currentCourse.title}</CardTitle>}
            <div className="flex justify-between items-start">
                <CardDescription className="text-md">By {currentCourse.instructor}</CardDescription>
                {currentCourse.price && currentCourse.price > 0 ? (
                    <span className="text-xl font-semibold text-primary">
                        {currentCourse.price?.toLocaleString()} {currentCourse.currency}
                    </span>
                ) : (
                    <span className="text-xl font-semibold text-green-600">Free</span>
                )}
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-6">
            <p className="text-lg text-foreground/90">{currentCourse.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 border rounded-lg bg-muted/50 shadow-sm">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                  <ListChecks className="mr-2 h-5 w-5 text-primary" /> Modules
                </h3>
                <p className="text-xl font-semibold text-foreground">{currentCourse.modules?.length || 0}</p>
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
              {currentCourse.modules && currentCourse.modules.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {currentCourse.modules.map(module => (
                    <AccordionItem value={`module-${module.id}`} key={module.id} className="border-b">
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                        {module.title}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-0">
                        {module.lessons && module.lessons.length > 0 ? (
                          <ul className="space-y-3 pl-2">
                            {module.lessons.map(lesson => {
                              const embeddableUrl = getEmbedUrl(lesson.embedUrl);
                              const isCourseFree = !currentCourse.price || currentCourse.price <= 0;
                              const isCourseAlreadyCompleted = completionInfo?.isCompleted;
                              // In this reverted state, access to paid course lessons is only granted if completed or free
                              const lessonIsAccessible = isCourseFree || isCourseAlreadyCompleted;
                              const lessonLink = `/courses/${currentCourse.id}/learn/${module.id}/${lesson.id}`;

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
                                   {!lessonIsAccessible && (currentCourse.price && currentCourse.price > 0) && (
                                    <span className="text-xs text-muted-foreground flex items-center">
                                        Enrollment required for paid course.
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
