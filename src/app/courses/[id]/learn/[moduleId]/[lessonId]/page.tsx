
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courses as defaultMockCourses, type Course, type Module, type Lesson } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle, ListChecks, AlertTriangle, Home } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getEmbedUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image'; // Added for lesson image display

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  
  const currentCourse = useMemo(() => activeCourses.find(c => c.id === courseId), [activeCourses, courseId]);
  const currentModule = useMemo(() => currentCourse?.modules.find(m => m.id === moduleId), [currentCourse, moduleId]);
  const currentLesson = useMemo(() => currentModule?.lessons.find(l => l.id === lessonId), [currentModule, lessonId]);

  const { previousLesson, nextLesson, moduleLessons, lessonIndex, totalLessonsInModule } = useMemo(() => {
    if (!currentModule || !currentLesson) return { moduleLessons: [], lessonIndex: -1, totalLessonsInModule: 0 };

    const lessons = currentModule.lessons || [];
    const currentIndex = lessons.findIndex(l => l.id === lessonId);

    return {
      previousLesson: currentIndex > 0 ? lessons[currentIndex - 1] : null,
      nextLesson: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null,
      moduleLessons: lessons,
      lessonIndex: currentIndex,
      totalLessonsInModule: lessons.length,
    };
  }, [currentModule, lessonId, currentLesson]);

  useEffect(() => {
    setIsLoading(true);
    let coursesToUse: Course[] = [];
    try {
      const storedCoursesString = localStorage.getItem('adminCourses');
      if (storedCoursesString) {
        const parsedCourses = JSON.parse(storedCoursesString) as Course[];
        if (Array.isArray(parsedCourses)) {
          coursesToUse = parsedCourses;
        } else {
          console.warn("adminCourses in localStorage was not an array for LessonViewer, using default mock courses.");
          coursesToUse = defaultMockCourses;
        }
      } else {
        coursesToUse = defaultMockCourses;
      }
    } catch (error) {
      console.error("Error loading courses from localStorage for LessonViewer:", error);
      coursesToUse = defaultMockCourses;
    }
    setActiveCourses(coursesToUse);
    setIsLoading(false);
  }, []); // Runs once on mount

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-1/4 mb-4" /> {/* Back to course */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" /> {/* Lesson Title */}
            <Skeleton className="w-full aspect-video" /> {/* Video Embed */}
            <Skeleton className="h-5 w-full" /> {/* Description Line 1 */}
            <Skeleton className="h-5 w-full" /> {/* Description Line 2 */}
            <Skeleton className="h-5 w-2/3" /> {/* Description Line 3 */}
          </div>
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-8 w-1/2 mb-2" /> {/* Module Title */}
            <Skeleton className="h-6 w-full mb-1" /> {/* Lesson Item */}
            <Skeleton className="h-6 w-full mb-1" /> {/* Lesson Item */}
            <Skeleton className="h-6 w-full" /> {/* Lesson Item */}
          </div>
        </div>
        <div className="mt-8 flex justify-between">
          <Skeleton className="h-10 w-24" /> {/* Prev Button */}
          <Skeleton className="h-10 w-24" /> {/* Next Button */}
        </div>
      </div>
    );
  }

  if (!currentCourse || !currentModule || !currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-10">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground flex items-center justify-center">
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> Content Not Found
            </CardTitle>
            <CardDescription className="text-lg">
              This lesson or course content could not be loaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              The lesson you are trying to access (ID: {lessonId}) within module (ID: {moduleId}) of course (ID: {courseId}) may not exist or might have been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {courseId && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={`/courses/${courseId}`}>Back to Course Details</Link>
                </Button>
              )}
              <Button asChild className="w-full sm:w-auto">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> Go to Homepage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(currentLesson.embedUrl);
  const progressPercentage = totalLessonsInModule > 0 ? ((lessonIndex + 1) / totalLessonsInModule) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto py-4 md:py-8 px-2 sm:px-4">
      <Button variant="outline" size="sm" onClick={() => router.push(`/courses/${courseId}`)} className="mb-4 text-xs sm:text-sm">
        <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to {currentCourse.title}
      </Button>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-headline">{lessonIndex + 1}. {currentLesson.title}</CardTitle>
              <CardDescription>Module: {currentModule.title}</CardDescription>
            </CardHeader>
            <CardContent>
              {embedUrl ? (
                <div className="aspect-video bg-black rounded-md overflow-hidden shadow-inner">
                  <iframe
                    src={embedUrl}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  ></iframe>
                </div>
              ) : currentLesson.imageUrl ? (
                 <div className="aspect-video bg-muted rounded-md overflow-hidden shadow-inner relative">
                    <Image src={currentLesson.imageUrl} alt={currentLesson.title} layout="fill" objectFit="cover" />
                 </div>
              ) : (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mr-2" /> No video or image preview available.
                </div>
              )}
              {currentLesson.description && (
                <p className="mt-4 text-sm sm:text-base text-foreground/90 whitespace-pre-line">{currentLesson.description}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Lesson List */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-primary" /> {currentModule.title}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                Lesson {lessonIndex + 1} of {totalLessonsInModule}
              </div>
              <Progress value={progressPercentage} className="h-2 mt-1" />
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
              <ul className="space-y-1.5">
                {moduleLessons.map((lesson, idx) => (
                  <li key={lesson.id}>
                    <Link href={`/courses/${courseId}/learn/${moduleId}/${lesson.id}`}>
                      <Button
                        variant={lesson.id === lessonId ? "secondary" : "ghost"}
                        className={`w-full justify-start text-left h-auto py-2 px-3 ${lesson.id === lessonId ? 'font-semibold text-primary' : 'text-foreground/80 hover:text-foreground'}`}
                      >
                        {lesson.id === lessonId ? (
                          <CheckCircle className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-muted-foreground/50 rounded-full mr-2 flex-shrink-0"></div>
                        )}
                        <span className="truncate">{idx + 1}. {lesson.title}</span>
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between items-center">
        {previousLesson ? (
          <Button asChild variant="outline">
            <Link href={`/courses/${courseId}/learn/${moduleId}/${previousLesson.id}`}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Link>
          </Button>
        ) : (
          <div /> 
        )}
        {nextLesson ? (
          <Button asChild>
            <Link href={`/courses/${courseId}/learn/${moduleId}/${nextLesson.id}`}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
           <Button asChild variant="default">
            <Link href={`/courses/${courseId}`}>
              Finish Module <CheckCircle className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}


      