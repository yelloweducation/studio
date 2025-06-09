
"use client";
import { useParams } from 'next/navigation';
import { courses as allCourses, type Course, type Lesson, type Module } from '@/data/mockData';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlayCircle, BookOpen, Video, FileText, Loader2, ListChecks, FileVideo, ExternalLink, CheckCircle2 } from 'lucide-react';
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

  const [course, setCourse] = useState<Course | null>(null);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstLessonPath, setFirstLessonPath] = useState<string | null>(null);
  const [completionInfo, setCompletionInfo] = useState<{ date: string; isCompleted: boolean } | null>(null);


  useEffect(() => {
    let coursesToUse = allCourses;
    const storedCourses = localStorage.getItem('adminCourses');
    if (storedCourses) {
      try {
        const parsedCourses = JSON.parse(storedCourses) as Course[];
        if (Array.isArray(parsedCourses) && parsedCourses.length > 0) {
          coursesToUse = parsedCourses;
        }
      } catch (e) {
        console.error("Failed to parse courses from localStorage on detail page", e);
      }
    }
    setActiveCourses(coursesToUse);
  }, []);

  useEffect(() => {
    if (!courseId) {
      setCourse(null);
      setIsLoading(false);
      return;
    }
    
    if (activeCourses.length > 0) {
        const foundCourse = activeCourses.find(c => c.id === courseId);
        setCourse(foundCourse || null);
        if (foundCourse && foundCourse.modules && foundCourse.modules.length > 0) {
          const firstModuleWithLessons = foundCourse.modules.find(m => m.lessons && m.lessons.length > 0);
          if (firstModuleWithLessons && firstModuleWithLessons.lessons && firstModuleWithLessons.lessons.length > 0) {
            setFirstLessonPath(`/courses/${foundCourse.id}/learn/${firstModuleWithLessons.id}/${firstModuleWithLessons.lessons[0].id}`);
          } else {
            setFirstLessonPath(null); // No lessons in any module
          }
        } else {
          setFirstLessonPath(null); // No modules
        }
    } else {
        setCourse(null);
        setFirstLessonPath(null);
    }
    setIsLoading(false);
    
  }, [courseId, activeCourses]);

  useEffect(() => {
    if (user && course) {
      const completionKey = `user_${user.id}_completions`;
      try {
        const storedCompletions = localStorage.getItem(completionKey);
        if (storedCompletions) {
          const completions = JSON.parse(storedCompletions);
          if (completions[course.id]) {
            setCompletionInfo({ date: completions[course.id], isCompleted: true });
          } else {
            setCompletionInfo({ date: '', isCompleted: false });
          }
        } else {
          setCompletionInfo({ date: '', isCompleted: false });
        }
      } catch (e) {
        console.error("Error parsing completions from localStorage", e);
        setCompletionInfo({ date: '', isCompleted: false });
      }
    } else {
      setCompletionInfo(null); // Reset if no user or course, or user logs out
    }
  }, [user, course]); // Re-check when user or course changes


  if (isLoading) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold text-foreground">Loading course details...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Course not found</h1>
        <p className="text-muted-foreground">The course you are looking for does not exist or has been moved.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Go back to Homepage</Link>
        </Button>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;

  const renderCTAButton = () => {
    if (completionInfo?.isCompleted && completionInfo.date) {
      // Ensure date is valid before formatting
      let formattedDate = 'a previous date';
      try {
        formattedDate = format(new Date(completionInfo.date), 'PPP'); // e.g., Jul 28th, 2024
      } catch (error) {
        console.error("Error formatting completion date:", error);
        // Use the raw date if formatting fails, or a generic message
        formattedDate = completionInfo.date;
      }
      return (
        <div className="w-full p-3 text-center bg-green-100 dark:bg-green-900 border border-green-500 text-green-700 dark:text-green-300 rounded-md shadow-sm flex items-center justify-center">
          <CheckCircle2 className="mr-2 h-6 w-6 text-green-600 dark:text-green-400" />
          You finished this course on {formattedDate}.
          {firstLessonPath && (
             <Button size="sm" variant="outline" asChild className="ml-4 border-green-600 text-green-700 hover:bg-green-200 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-800">
              <Link href={firstLessonPath}>Review Course</Link>
            </Button>
          )}
        </div>
      );
    }
    if (firstLessonPath) {
      return (
        <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150" asChild>
          <Link href={firstLessonPath}>
            <PlayCircle className="mr-2 h-6 w-6"/> Start Learning
          </Link>
        </Button>
      );
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
            <CardDescription className="text-md">By {course.instructor}</CardDescription>
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
                              return (
                                <li key={lesson.id} className="p-3 border rounded-md bg-card hover:shadow-md transition-shadow">
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
                                  {lesson.embedUrl && embeddableUrl && (
                                    <Link href={`/courses/${course.id}/learn/${module.id}/${lesson.id}`} className="text-xs text-primary hover:underline flex items-center">
                                      Watch Lesson <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
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

