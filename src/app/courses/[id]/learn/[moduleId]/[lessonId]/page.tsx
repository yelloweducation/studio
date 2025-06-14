
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Course, type Module, type Lesson, type Enrollment } from '@/lib/dbUtils'; 
// Removed direct dbUtils imports for functions, will use server actions
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle, ListChecks, AlertTriangle, Home, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getEmbedUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
// Import server actions
import { 
  serverGetCourseById, 
  serverGetEnrollmentForCourse, 
  serverUpdateEnrollmentProgress, 
  serverCreateEnrollment 
} from '@/actions/adminDataActions';

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
    finishModule: "Finish Module",
    finishCourse: "Finish Course & Mark as Complete", 
    enrollmentCreated: "Enrollment started!",
    progressUpdated: "Progress updated!"
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
    finishModule: "အခန်းပြီးပါပြီ",
    finishCourse: "သင်တန်းပြီးဆုံးကြောင်း မှတ်သားပါ", 
    enrollmentCreated: "စာရင်းသွင်းခြင်း စတင်ပါပြီ!",
    progressUpdated: "တိုးတက်မှု အပ်ဒိတ်လုပ်ပြီးပါပြီ!"
  }
};

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth(); 
  const { language } = useLanguage();
  const t = lessonViewerTranslations[language];
  const { toast } = useToast();

  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentEnrollment, setCurrentEnrollment] = useState<Enrollment | null>(null);
  
  const currentModule = useMemo(() => currentCourse?.modules?.find(m => m.id === moduleId), [currentCourse, moduleId]);
  const currentLesson = useMemo(() => currentModule?.lessons?.find(l => l.id === lessonId), [currentModule, lessonId]);

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
    const fetchData = async () => {
      setIsLoading(true);
      if (!courseId) {
        setIsLoading(false);
        return;
      }
      try {
        const courseData = await serverGetCourseById(courseId); // Use server action
        setCurrentCourse(courseData);

        if (user && courseData) {
          let enrollment = await serverGetEnrollmentForCourse(user.id, courseId); // Use server action
          if (!enrollment) {
            if (courseData.price === 0 || courseData.price === null) { 
               enrollment = await serverCreateEnrollment(user.id, courseId); // Use server action
               if (enrollment) toast({ title: t.enrollmentCreated });
            }
          }
          setCurrentEnrollment(enrollment);
        }
      } catch (error) {
        console.error("Error fetching lesson viewer data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load lesson content." });
        setCurrentCourse(null);
        setCurrentEnrollment(null);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [courseId, user?.id, toast, t.enrollmentCreated]); // Added user.id to dependencies


  const markLessonCompleted = async () => {
    if (!user || !currentEnrollment || !currentCourse || !currentModule || !currentLesson) return;

    const totalLessonsInCourse = currentCourse.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
    if (totalLessonsInCourse === 0) return; 

    let globalLessonIndex = 0;
    let lessonFound = false;
    for (const mod of currentCourse.modules || []) {
        for (const les of mod.lessons || []) {
            if (les.id === currentLesson.id) {
                lessonFound = true;
                break;
            }
            globalLessonIndex++;
        }
        if (lessonFound) break;
    }
    
    let newProgress = 0;
    if (globalLessonIndex >= totalLessonsInCourse -1) { 
        newProgress = 100;
    } else {
        newProgress = Math.round(((globalLessonIndex + 1) / totalLessonsInCourse) * 100);
    }
    newProgress = Math.min(newProgress, 100); 

    if (newProgress > (currentEnrollment.progress || 0)) {
        try {
            const updatedEnrollment = await serverUpdateEnrollmentProgress(currentEnrollment.id, newProgress); // Use server action
            if (updatedEnrollment) {
              setCurrentEnrollment(updatedEnrollment);
              if (newProgress < 100) {
                  // toast({ title: t.progressUpdated, description: `Progress: ${newProgress}%` });
              }
            } else {
              throw new Error("Server action returned null for enrollment update.");
            }
        } catch (error) {
            console.error("Failed to update progress:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not update progress." });
        }
    }
  };

 useEffect(() => {
    if (isAuthenticated && currentLesson && currentEnrollment) { // Ensure enrollment is present before marking complete
      markLessonCompleted();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson, isAuthenticated, currentEnrollment]); // Added currentEnrollment


  const handleFinishCourse = async () => {
    if (!user || !currentEnrollment || !currentCourse) {
      router.push(`/courses/${courseId}`);
      return;
    }
    try {
        if (currentEnrollment.progress < 100) {
            const updatedEnrollment = await serverUpdateEnrollmentProgress(currentEnrollment.id, 100); // Use server action
            if (updatedEnrollment) {
              setCurrentEnrollment(updatedEnrollment);
            } else {
              throw new Error("Server action returned null for final progress update.");
            }
        }
        toast({ title: "Course Completed!", description: "Congratulations on finishing the course." });
        router.push(`/courses/${courseId}`);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not mark course as complete." });
    }
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
                          currentEnrollment && currentEnrollment.progress >= (((moduleLessons.slice(0, idx + 1).length) / totalLessonsInModule) * 100) ?
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
                          :
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
           <Button onClick={handleFinishCourse} variant="default">
              {t.finishCourse} <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

