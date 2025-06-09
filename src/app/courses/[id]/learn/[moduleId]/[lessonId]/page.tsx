
"use client";
import { useParams, useRouter } from 'next/navigation';
import { courses as allCourses, type Course, type Lesson, type Module } from '@/data/mockData';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, Home, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getEmbedUrl } from '@/lib/utils';

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  const currentModuleId = params.moduleId as string;
  const currentLessonId = params.lessonId as string;

  const [activeCourses, setActiveCourses] = useState<Course[]>(allCourses);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedCourses = localStorage.getItem('adminCourses');
    if (storedCourses) {
      try {
        const parsedCourses = JSON.parse(storedCourses) as Course[];
        setActiveCourses(parsedCourses.length > 0 ? parsedCourses : allCourses);
      } catch (e) {
        console.error("Failed to parse courses from localStorage", e);
        setActiveCourses(allCourses);
      }
    }
  }, []);
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    if (courseId && currentModuleId && currentLessonId && activeCourses.length > 0) {
      const foundCourse = activeCourses.find(c => c.id === courseId);
      if (!foundCourse) {
        setError("Course not found.");
        setIsLoading(false);
        return;
      }
      setCourse(foundCourse);

      const foundModule = foundCourse.modules?.find(m => m.id === currentModuleId);
      if (!foundModule) {
        setError("Module not found in this course.");
        setIsLoading(false);
        return;
      }
      setCurrentModule(foundModule);

      const foundLesson = foundModule.lessons?.find(l => l.id === currentLessonId);
      if (!foundLesson) {
        setError("Lesson not found in this module.");
        setIsLoading(false);
        return;
      }
      setCurrentLesson(foundLesson);
    }
    setIsLoading(false);
  }, [courseId, currentModuleId, currentLessonId, activeCourses]);

  const { prevLessonLink, nextLessonLink, isFirstLesson, isLastLesson } = useMemo(() => {
    if (!course || !currentModule || !currentLesson) {
      return { prevLessonLink: null, nextLessonLink: null, isFirstLesson: true, isLastLesson: true };
    }

    const allLessonsFlat: { moduleId: string; lessonId: string; moduleIndex: number, lessonIndex: number }[] = [];
    course.modules?.forEach((mod, modIdx) => {
      mod.lessons?.forEach((les, lesIdx) => {
        allLessonsFlat.push({ moduleId: mod.id, lessonId: les.id, moduleIndex: modIdx, lessonIndex: lesIdx });
      });
    });

    const currentIndex = allLessonsFlat.findIndex(
      l => l.moduleId === currentModuleId && l.lessonId === currentLessonId
    );

    if (currentIndex === -1) return { prevLessonLink: null, nextLessonLink: null, isFirstLesson: true, isLastLesson: true };

    const prev = currentIndex > 0 ? allLessonsFlat[currentIndex - 1] : null;
    const next = currentIndex < allLessonsFlat.length - 1 ? allLessonsFlat[currentIndex + 1] : null;

    return {
      prevLessonLink: prev ? `/courses/${course.id}/learn/${prev.moduleId}/${prev.lessonId}` : null,
      nextLessonLink: next ? `/courses/${course.id}/learn/${next.moduleId}/${next.lessonId}` : null,
      isFirstLesson: currentIndex === 0,
      isLastLesson: currentIndex === allLessonsFlat.length - 1,
    };
  }, [course, currentModule, currentLesson, currentModuleId, currentLessonId]);


  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Loading lesson...</h1>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-semibold text-destructive mb-2">Error Loading Lesson</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild variant="outline">
            <Link href={course ? `/courses/${course.id}` : "/"}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {course ? "Back to Course Overview" : "Back to Home"}
            </Link>
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course || !currentModule || !currentLesson) {
     return ( // Should be caught by error state, but as a fallback
      <ProtectedRoute>
        <div className="text-center py-10">
          <h1 className="text-2xl font-semibold">Lesson content not available.</h1>
           <Button asChild variant="link" className="mt-4">
            <Link href="/">Go back to Homepage</Link>
          </Button>
        </div>
      </ProtectedRoute>
    );
  }
  
  const embeddableUrl = getEmbedUrl(currentLesson.embedUrl);

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-headline font-semibold text-foreground">{currentLesson.title}</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/courses/${course.id}`}>
              <BookOpen className="mr-2 h-4 w-4" /> Back to Course Overview
            </Link>
          </Button>
        </div>

        <Card className="shadow-xl overflow-hidden">
          {embeddableUrl ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                src={embeddableUrl}
                title={currentLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>
          ) : currentLesson.imageUrl && ( // Fallback to image if no video, and image exists
            <div className="relative w-full aspect-video">
              <Image src={currentLesson.imageUrl} alt={currentLesson.title} layout="fill" objectFit="cover" data-ai-hint="lesson content image" />
            </div>
          )}
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Module: {currentModule.title}</span>
              <span>Duration: {currentLesson.duration}</span>
            </div>
            {currentLesson.description && (
              <div className="prose dark:prose-invert max-w-none">
                <p>{currentLesson.description}</p>
              </div>
            )}
            {!embeddableUrl && !currentLesson.imageUrl && !currentLesson.description && (
              <p className="text-muted-foreground text-center py-8">This lesson primarily consists of textual content or its specific media type is not embeddable here.</p>
            )}
          </CardContent>
          <CardFooter className="p-4 sm:p-6 bg-muted/50 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
            <Button variant="outline" disabled={isFirstLesson} onClick={() => prevLessonLink && router.push(prevLessonLink)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous Lesson
            </Button>
            {/* For now, "Next Lesson" can also be "Finish Course" - full completion logic later */}
            <Button 
              variant={isLastLesson ? "default" : "default"} 
              onClick={() => {
                if (nextLessonLink) {
                  router.push(nextLessonLink);
                } else if (isLastLesson) {
                  // Placeholder for "Finish Course" action
                  // For now, could navigate back to course overview or dashboard
                  router.push(`/courses/${course.id}`); 
                }
              }}
              className={isLastLesson ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary hover:bg-primary/90"}
            >
              {isLastLesson ? 'Finish Course' : 'Next Lesson'}
              {!isLastLesson && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
