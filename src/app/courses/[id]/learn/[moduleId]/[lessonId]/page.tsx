
"use client";
import { useParams, useRouter } from 'next/navigation';
import { courses as allCourses, type Course, type Lesson, type Module } from '@/data/mockData';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // Removed CardDescription, CardHeader, CardTitle as they are not directly used in the new layout
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, Home, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getEmbedUrl } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const courseId = params.id as string;
  const currentModuleId = params.moduleId as string;
  const currentLessonId = params.lessonId as string;

  const [activeCourses, setActiveCourses] = useState<Course[]>([]); // Initialize as empty
  const [coursesReady, setCoursesReady] = useState(false); // New state to track if activeCourses are loaded

  const [course, setCourse] = useState<Course | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  // Effect 1: Load global/admin courses from localStorage
  useEffect(() => {
    const storedCoursesString = localStorage.getItem('adminCourses');
    let coursesToUse: Course[];
    if (storedCoursesString) {
      try {
        const parsedAdminCourses = JSON.parse(storedCoursesString);
        if (Array.isArray(parsedAdminCourses)) {
          coursesToUse = parsedAdminCourses; 
        } else {
          console.error("Stored adminCourses from localStorage is not an array, using default mock courses.");
          coursesToUse = allCourses; 
        }
      } catch (e) {
        console.error("Failed to parse adminCourses from localStorage, using default mock courses.", e);
        coursesToUse = allCourses; 
      }
    } else {
       coursesToUse = allCourses; 
    }
    setActiveCourses(coursesToUse);
    setCoursesReady(true); // Signal that activeCourses are now determined
  }, []); // Runs once on mount (or re-mount due to key change from pageContentKey)
  
  // Effect 2: Load specific lesson data, dependent on coursesReady
  useEffect(() => {
    // Always start by setting loading true and clearing errors/old data for the new lesson attempt
    setIsLoading(true);
    setError(null);
    setCourse(null);
    setCurrentModule(null);
    setCurrentLesson(null);

    if (!coursesReady) {
      // If global courses aren't ready, we remain in a loading state.
      // setIsLoading(true) was already called.
      return; 
    }

    if (!courseId || !currentModuleId || !currentLessonId) {
      setError("Invalid lesson parameters in URL."); 
      setIsLoading(false);
      return;
    }

    // coursesReady is true here, so activeCourses is determined (could be empty if admin saved an empty list)
    if (activeCourses.length === 0) {
      setError("No course data available to load from. Please try again or contact support.");
      setIsLoading(false);
      return;
    }

    const foundCourse = activeCourses.find(c => c.id === courseId);
    if (!foundCourse) {
      setError("Course not found.");
      setIsLoading(false);
      return;
    }

    const foundModule = foundCourse.modules?.find(m => m.id === currentModuleId);
    if (!foundModule) {
      setError(`Module not found in course "${foundCourse.title}".`);
      setIsLoading(false);
      return;
    }

    const foundLesson = foundModule.lessons?.find(l => l.id === currentLessonId);
    if (!foundLesson) {
      setError(`Lesson not found in module "${foundModule.title}".`);
      setIsLoading(false);
      return;
    }

    setCourse(foundCourse);
    setCurrentModule(foundModule);
    setCurrentLesson(foundLesson);
    setIsLoading(false); // Successfully loaded lesson data

  }, [courseId, currentModuleId, currentLessonId, activeCourses, coursesReady]); // Key dependencies

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

  const handleFinishCourse = () => {
    if (user && course) {
      const completionKey = `user_${user.id}_completions`;
      let completions: Record<string, string> = {};
      try {
        const storedCompletions = localStorage.getItem(completionKey);
        if (storedCompletions) {
          completions = JSON.parse(storedCompletions);
        }
      } catch (e) {
        console.error("Error parsing completions from localStorage", e);
      }

      completions[course.id] = new Date().toISOString().split('T')[0];
      localStorage.setItem(completionKey, JSON.stringify(completions));

      toast({
        title: "Course Finished!",
        description: `Congratulations, you've completed ${course.title}.`,
      });
      router.push(`/courses/${course.id}`);
    } else {
      router.push(course ? `/courses/${course.id}` : '/');
    }
  };

  const pageContentKey = `${courseId}-${currentModuleId}-${currentLessonId}`;

  const renderContent = () => {
    // Show loader if still loading specific lesson OR if global courses aren't ready yet.
    if (isLoading || !coursesReady) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Loading lesson...</h1>
        </div>
      );
    }
  
    // Only show error if not loading, global courses are ready, AND an error string exists.
    if (error) { // Error is already confirmed to be non-null if this block is reached
      return (
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
      );
    }
  
    // Only show "not found" if not loading, no error, but content objects are missing.
    if (!course || !currentModule || !currentLesson) {
       return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">Lesson Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested lesson content could not be found. It might be an invalid link or the content is not available.</p>
            <Button asChild variant="outline">
                <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Go to Homepage
                </Link>
            </Button>
        </div>
      );
    }
    
    const embeddableUrl = getEmbedUrl(currentLesson.embedUrl);
  
    return (
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
            ) : currentLesson.imageUrl && (
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
              <Button variant="outline" disabled={isFirstLesson || !prevLessonLink} onClick={() => prevLessonLink && router.push(prevLessonLink)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous Lesson
              </Button>
              <Button 
                variant={isLastLesson ? "default" : "default"} 
                onClick={() => {
                  if (nextLessonLink) {
                    router.push(nextLessonLink);
                  } else if (isLastLesson) {
                    handleFinishCourse();
                  }
                }}
                className={isLastLesson ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary hover:bg-primary/90"}
                disabled={!isLastLesson && !nextLessonLink && !isFirstLesson}
              >
                {isLastLesson ? 'Finish Course' : 'Next Lesson'}
                {!isLastLesson && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </div>
    );
  };


  return (
    <ProtectedRoute>
      <div key={pageContentKey}> {/* Key to force re-mount on navigation */}
        {renderContent()}
      </div>
    </ProtectedRoute>
  );
}

