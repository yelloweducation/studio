
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courses as defaultMockCourses, enrollments as initialEnrollments, type Course, type Module, type Lesson, type Enrollment } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle, ListChecks, AlertTriangle, Home } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getEmbedUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useLanguage, type Language } from '@/contexts/LanguageContext'; // Added

const USER_ENROLLMENTS_KEY = 'userEnrollmentsData';

const lessonViewerTranslations = {
  en: {
    backToCourse: "Back to {title}",
    moduleLabel: "Module: {title}",
    lessonProgress: "Lesson {current} of {total}",
    contentNotFound: "Content Not Found",
    contentNotFoundDesc: "This lesson or course content could not be loaded.",
    contentNotFoundDetails: "The lesson you are trying to access (ID: {lessonId}) within module (ID: {moduleId}) of course (ID: {courseId}) may not exist or might have been moved.",
    backToCourseDetails: "Back to Course Details",
    goToHomepage: "Go to Homepage",
    noVideoOrImage: "No video or image preview available.",
    previous: "Previous",
    next: "Next",
    finishModule: "Finish Module"
  },
  my: {
    backToCourse: "{title} သို့ ပြန်သွားရန်",
    moduleLabel: "အခန်း: {title}",
    lessonProgress: "သင်ခန်းစာ {current} / {total}",
    contentNotFound: "အကြောင်းအရာ မတွေ့ပါ",
    contentNotFoundDesc: "ဤသင်ခန်းစာ သို့မဟုတ် အတန်းအကြောင်းအရာကို တင်၍မရပါ။",
    contentNotFoundDetails: "သင်ဝင်ရောက်ရန်ကြိုးစားနေသော သင်ခန်းစာ (ID: {lessonId})၊ အခန်း (ID: {moduleId})၊ အတန်း (ID: {courseId}) သည် မရှိတော့ခြင်း သို့မဟုတ် ရွှေ့ပြောင်းခြင်း ဖြစ်နိုင်သည်။",
    backToCourseDetails: "အတန်းအသေးစိတ်သို့ ပြန်သွားရန်",
    goToHomepage: "ပင်မစာမျက်နှာသို့ သွားရန်",
    noVideoOrImage: "ဗီဒီယို သို့မဟုတ် ပုံ အကြိုကြည့်ရှုရန် မရှိပါ။",
    previous: "ယခင်",
    next: "နောက်တစ်ခု",
    finishModule: "အခန်းပြီးပါပြီ"
  }
};

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth(); 
  const { language } = useLanguage(); // Added
  const t = lessonViewerTranslations[language]; // Added

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
  }, []);

  const handleFinishModule = () => {
    if (!user || !courseId) {
      router.push(`/courses/${courseId}`);
      return;
    }

    let currentEnrollments: Enrollment[] = [];
    try {
      const storedEnrollments = localStorage.getItem(USER_ENROLLMENTS_KEY);
      if (storedEnrollments) {
        currentEnrollments = JSON.parse(storedEnrollments) as Enrollment[];
        if (!Array.isArray(currentEnrollments)) {
            currentEnrollments = JSON.parse(JSON.stringify(initialEnrollments)); 
        }
      } else {
        currentEnrollments = JSON.parse(JSON.stringify(initialEnrollments)); 
      }
    } catch (error) {
      console.error("Error reading enrollments from localStorage:", error);
      currentEnrollments = JSON.parse(JSON.stringify(initialEnrollments)); 
    }

    const existingEnrollmentIndex = currentEnrollments.findIndex(
      (e) => e.userId === user.id && e.courseId === courseId
    );

    if (existingEnrollmentIndex > -1) {
      currentEnrollments[existingEnrollmentIndex].progress = 100;
    } else {
      currentEnrollments.push({
        id: `enroll${Date.now()}`,
        userId: user.id,
        courseId: courseId,
        progress: 100,
        enrolledDate: new Date().toISOString().split('T')[0],
      });
    }

    try {
      localStorage.setItem(USER_ENROLLMENTS_KEY, JSON.stringify(currentEnrollments));
    } catch (error) {
        console.error("Error saving enrollments to localStorage:", error);
    }
    
    router.push(`/courses/${courseId}`);
  };


  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-1/4 mb-4" /> 
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" /> 
            <Skeleton className="w-full aspect-video" /> 
            <Skeleton className="h-5 w-full" /> 
            <Skeleton className="h-5 w-full" /> 
            <Skeleton className="h-5 w-2/3" /> 
          </div>
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-8 w-1/2 mb-2" /> 
            <Skeleton className="h-6 w-full mb-1" /> 
            <Skeleton className="h-6 w-full mb-1" /> 
            <Skeleton className="h-6 w-full" /> 
          </div>
        </div>
        <div className="mt-8 flex justify-between">
          <Skeleton className="h-10 w-24" /> 
          <Skeleton className="h-10 w-24" /> 
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
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> {t.contentNotFound}
            </CardTitle>
            <CardDescription className="text-lg">
              {t.contentNotFoundDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              {t.contentNotFoundDetails
                .replace('{lessonId}', lessonId)
                .replace('{moduleId}', moduleId)
                .replace('{courseId}', courseId)}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {courseId && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={`/courses/${courseId}`}>{t.backToCourseDetails}</Link>
                </Button>
              )}
              <Button asChild className="w-full sm:w-auto">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> {t.goToHomepage}
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
        <ChevronLeft className="mr-1.5 h-4 w-4" /> {t.backToCourse.replace('{title}', currentCourse.title)}
      </Button>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-headline">{lessonIndex + 1}. {currentLesson.title}</CardTitle>
              <CardDescription>{t.moduleLabel.replace('{title}', currentModule.title)}</CardDescription>
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
                  <AlertTriangle className="h-10 w-10 mr-2" /> {t.noVideoOrImage}
                </div>
              )}
              {currentLesson.description && (
                <p className="mt-4 text-sm sm:text-base text-foreground/90 whitespace-pre-line">{currentLesson.description}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-primary" /> {currentModule.title}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {t.lessonProgress.replace('{current}', (lessonIndex + 1).toString()).replace('{total}', totalLessonsInModule.toString())}
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

      <div className="mt-8 flex justify-between items-center">
        {previousLesson ? (
          <Button asChild variant="outline">
            <Link href={`/courses/${courseId}/learn/${moduleId}/${previousLesson.id}`}>
              <ChevronLeft className="mr-2 h-4 w-4" /> {t.previous}
            </Link>
          </Button>
        ) : (
          <div /> 
        )}
        {nextLesson ? (
          <Button asChild>
            <Link href={`/courses/${courseId}/learn/${moduleId}/${nextLesson.id}`}>
              {t.next} <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
           <Button onClick={handleFinishModule} variant="default">
              {t.finishModule} <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
