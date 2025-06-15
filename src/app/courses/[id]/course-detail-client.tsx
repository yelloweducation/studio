
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { type Course, type Module, type Lesson, type User, type Enrollment, type PaymentSubmission, type PaymentSubmissionStatus, type Quiz, type QuizType } from '@/lib/dbUtils';
// Removed direct dbUtils imports, will use server actions
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, BookOpenText, PlayCircle, Lock, CheckCircle, AlertTriangle, Clock, ExternalLink, ArrowRight, Home as HomeIcon, ShoppingCart, BadgeDollarSign, Hourglass, ListChecks, Users as TargetAudienceIcon, ShieldCheck, Timer, FileQuestion, Edit3 as PracticeQuizIcon, CheckSquare as GradedQuizIcon, Loader2, LayoutDashboard } from 'lucide-react'; // Added HomeIcon, LayoutDashboard
import { getEmbedUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { serverGetEnrollmentForCourse, serverGetPaymentSubmissionForCourse } from '@/actions/adminDataActions'; // Using existing file for now

interface CompletionInfo {
  isCompleted: boolean;
  progress: number;
}
interface PaymentInfo {
  status: PaymentSubmissionStatus | null;
  submission?: PaymentSubmission;
}

const courseDetailTranslations = {
  en: {
    backToCourses: "Back to Courses",
    navToHome: "Go to Homepage", // New
    navToDashboard: "Go to Dashboard", // New
    taughtBy: "Taught by {instructor}",
    categoryLabel: "Category: {category}",
    priceLabel: "Price: {price} {currency}",
    courseAccess: "Course Information",
    loginToPurchase: "{price} {currency} Login to Purchase",
    purchaseFor: "{price} {currency}",
    paymentSubmitted: "Payment Submitted",
    paymentSubmittedDesc: "Your payment is currently under review.",
    startLearning: "Start Learning",
    courseContentComingSoon: "Course Content Coming Soon",
    lessonsBeingPrepared: "Lessons are being prepared. Check back later!",
    pricedNoLessons: "This course is priced but lessons are not yet available. Check back later!",
    startLearningFree: "Start Learning (Free)",
    reviewCourse: "Review Course",
    finishedCourse: "You finished this course!",
    progressLabel: "Progress: {progress}%",
    progressCompleted: "Progress: {progress}% completed",
    courseContent: "Course Content",
    moduleLabel: "Module {index}: {title}",
    noLessonsInModule: "No lessons in this module yet.",
    noModulesAvailable: "No modules available for this course yet.",
    courseNotFound: "Course Not Found",
    courseNotFoundDesc: "Sorry, we couldn't find the course you were looking for (ID: {courseId}). It might have been moved or removed.",
    exploreOtherCourses: "Explore Other Courses",
    backToHome: "Back to Home", // Note: This key is used by the larger button on error page, distinct from navToHome
    whatYouWillLearn: "What You'll Learn",
    targetAudience: "Who This Course Is For",
    prerequisites: "Prerequisites",
    estimatedTime: "Estimated Time to Complete",
    noLearningObjectives: "Learning objectives will be listed here soon.",
    noTargetAudience: "Information about the target audience will be available soon.",
    noPrerequisites: "No specific prerequisites, or they will be listed soon.",
    noEstimatedTime: "Estimated completion time will be provided soon.",
    assessmentsTitle: "Assessments & Quizzes",
    practiceQuiz: "Practice Quiz",
    gradedQuiz: "Graded Quiz",
    startQuiz: "Start Quiz",
    noQuizzesAvailable: "No quizzes available for this course yet.",
    completedNoLessons: "Course Completed (No lessons available for review)" 
  },
  my: {
    backToCourses: "အတန်းများသို့ ပြန်သွားရန်",
    navToHome: "ပင်မစာမျက်နှာသို့ သွားရန်", // New
    navToDashboard: "ဒက်ရှ်ဘုတ်သို့ သွားရန်", // New
    taughtBy: "သင်ကြားသူ: {instructor}",
    categoryLabel: "အမျိုးအစား: {category}",
    priceLabel: "စျေးနှုန်း: {price} {currency}",
    courseAccess: "သင်တန်းအချက်အလက်",
    loginToPurchase: "{price} {currency} လော့ဂ်အင်ဝင်ပါ",
    purchaseFor: "{price} {currency}",
    paymentSubmitted: "ငွေပေးချေမှု တင်သွင်းပြီးပါပြီ",
    paymentSubmittedDesc: "သင်၏ ငွေပေးချေမှုကို လက်ရှိ ပြန်လည်သုံးသပ်နေပါသည်။",
    startLearning: "စတင်လေ့လာပါ",
    courseContentComingSoon: "အတန်းအကြောင်းအရာ မကြာမီလာမည်",
    lessonsBeingPrepared: "သင်ခန်းစာများ ပြင်ဆင်နေပါသည်။ နောက်မှ ပြန်စစ်ဆေးပါ။",
    pricedNoLessons: "ဤအတန်းသည် စျေးနှုန်းသတ်မှတ်ထားသော်လည်း သင်ခန်းစာများ မရရှိနိုင်သေးပါ။ နောက်မှ ပြန်စစ်ဆေးပါ။",
    startLearningFree: "အခမဲ့ စတင်လေ့လာပါ",
    reviewCourse: "အတန်း ပြန်လည်သုံးသပ်ရန်",
    finishedCourse: "သင် ဤအတန်းကို ပြီးဆုံးသွားပါပြီ!",
    progressLabel: "တိုးတက်မှု: {progress}%",
    progressCompleted: "တိုးတက်မှု: {progress}% ပြီးဆုံး",
    courseContent: "အတန်းမာတိကာ",
    moduleLabel: "အခန်း {index}: {title}",
    noLessonsInModule: "ဤအခန်းတွင် သင်ခန်းစာများ မရှိသေးပါ။",
    noModulesAvailable: "ဤအတန်းအတွက် အခန်းများ မရှိသေးပါ။",
    courseNotFound: "အတန်း မတွေ့ပါ",
    courseNotFoundDesc: "တောင်းပန်ပါသည်၊ သင်ရှာဖွေနေသော အတန်း (ID: {courseId}) ကို ရှာမတွေ့ပါ။ ၎င်းကို ရွှေ့ပြောင်းခြင်း သို့မဟုတ် ဖယ်ရှားခြင်း ဖြစ်နိုင်ပါသည်။",
    exploreOtherCourses: "အခြားအတန်းများ ရှာဖွေရန်",
    backToHome: "ပင်မစာမျက်နှာသို့ ပြန်သွားရန်",
    whatYouWillLearn: "သင်ဘာတွေလေ့လာရမလဲ",
    targetAudience: "ဒီအတန်းက ဘယ်သူတွေအတွက်လဲ",
    prerequisites: "ကြိုတင်လိုအပ်ချက်များ",
    estimatedTime: "ပြီးဆုံးရန် ခန့်မှန်းအချိန်",
    noLearningObjectives: "သင်ယူရမည့်အချက်များ မကြာမီ ဒီမှာ ဖော်ပြပါမည်။",
    noTargetAudience: "ဤအတန်းအတွက် ရည်ရွယ်ထားသော ကျောင်းသားများအချက်အလက် မကြာမီ ရရှိပါမည်။",
    noPrerequisites: "သီးခြားကြိုတင်လိုအပ်ချက်များ မရှိပါ သို့မဟုတ် မကြာမီ ဒီမှာ ဖော်ပြပါမည်။",
    noEstimatedTime: "ပြီးဆုံးရန် ခန့်မှန်းအချိန် မကြာမီ ဖော်ပြပါမည်။",
    assessmentsTitle: "အကဲဖြတ်ချက်များ နှင့် စာမေးပွဲငယ်များ",
    practiceQuiz: "လေ့ကျင့်ရန် စာမေးပွဲငယ်",
    gradedQuiz: "အဆင့်သတ်မှတ် စာမေးပွဲငယ်",
    startQuiz: "စာမေးပွဲငယ် စတင်ရန်",
    noQuizzesAvailable: "ဤသင်တန်းအတွက် စာမေးပွဲငယ်များ မရှိသေးပါ။",
    completedNoLessons: "သင်တန်း ပြီးဆုံးသွားပါပြီ (ပြန်လည်သုံးသပ်ရန် သင်ခန်းစာများ မရှိပါ)"
  }
};

interface CourseDetailClientProps {
  initialCourse: Course | null;
  courseId: string;
}

export default function CourseDetailClient({ initialCourse, courseId }: CourseDetailClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = courseDetailTranslations[language];

  const [currentCourse, setCurrentCourse] = useState<Course | null>(initialCourse);
  const [firstLessonPath, setFirstLessonPath] = useState<string | null>(null);
  const [completionInfo, setCompletionInfo] = useState<CompletionInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoadingUserSpecificData, setIsLoadingUserSpecificData] = useState(true);

  useEffect(() => {
    setCurrentCourse(initialCourse);
    if (initialCourse?.modules?.[0]?.lessons?.[0]) {
      setFirstLessonPath(`/courses/${initialCourse.id}/learn/${initialCourse.modules[0].id}/${initialCourse.modules[0].lessons[0].id}`);
    } else {
      setFirstLessonPath(null);
    }
  }, [initialCourse]);

  useEffect(() => {
    const fetchUserSpecificData = async () => {
      if (authLoading) {
        return;
      }
      if (!currentCourse) {
        setIsLoadingUserSpecificData(false);
        return;
      }

      setIsLoadingUserSpecificData(true);
      try {
        if (isAuthenticated && user) {
          const enrollment = await serverGetEnrollmentForCourse(user.id, currentCourse.id);
          if (enrollment) {
            setCompletionInfo({ isCompleted: enrollment.progress === 100, progress: enrollment.progress });
          } else {
            setCompletionInfo({ isCompleted: false, progress: 0 });
          }

          if (currentCourse.price && currentCourse.price > 0) {
            const userSubmission = await serverGetPaymentSubmissionForCourse(user.id, currentCourse.id);
            setPaymentInfo({ status: userSubmission?.status || null, submission: userSubmission || undefined });
          } else {
            setPaymentInfo({ status: null });
          }
        } else {
          setCompletionInfo({ isCompleted: false, progress: 0 });
          setPaymentInfo({ status: null });
        }
      } catch (error) {
        console.error("Error fetching user-specific course data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load your course progress or payment status." });
        setCompletionInfo({ isCompleted: false, progress: 0 });
        setPaymentInfo({ status: null });
      } finally {
        setIsLoadingUserSpecificData(false);
      }
    };

    fetchUserSpecificData();
  }, [user, isAuthenticated, authLoading, currentCourse, toast, language]);

  const getDashboardPath = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'student') return '/dashboard/student';
    return '/login'; // Default fallback
  };

  const renderCTAButton = () => {
    if (!currentCourse) return null;

    const canAccessContent = (paymentInfo?.status === 'APPROVED') || (!currentCourse.price || currentCourse.price <= 0);
    const coursePriceDisplay = (currentCourse.price ?? 0).toFixed(2);
    const courseCurrencyDisplay = currentCourse.currency || 'USD';

    if (currentCourse.price && currentCourse.price > 0) { // Priced course
        if (!isAuthenticated) {
            return (
                 <Button asChild size="lg" className="w-full shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150 whitespace-normal h-auto py-3">
                    <Link href={`/login?redirect=/courses/${courseId}`}>
                        <BadgeDollarSign className="mr-2 h-5 w-5" />
                        {t.loginToPurchase.replace('{price}', coursePriceDisplay).replace('{currency}', courseCurrencyDisplay)}
                    </Link>
                </Button>
            );
        }
        if (paymentInfo?.status === 'APPROVED') { // User has paid and approved
            if (completionInfo?.isCompleted) {
                return (
                    <div className="flex flex-col items-center text-center p-4 bg-green-100 dark:bg-green-900/50 rounded-lg shadow">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mb-2" />
                        <p className="font-semibold text-green-700 dark:text-green-300">{t.finishedCourse}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{t.progressLabel.replace('{progress}', (completionInfo.progress || 0).toString())}</p>
                        {firstLessonPath ? (
                            <Button asChild size="lg" className="mt-3 whitespace-normal h-auto py-3">
                            <Link href={firstLessonPath}>{t.reviewCourse}</Link>
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-2">{t.completedNoLessons}</p>
                        )}
                    </div>
                );
            }
             if (!firstLessonPath) { // Not completed, paid, but no lessons
                 return (
                    <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg shadow">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
                        <p className="font-semibold text-foreground">{t.courseContentComingSoon}</p>
                        <p className="text-sm text-muted-foreground">{t.lessonsBeingPrepared}</p>
                    </div>
                );
            }
            return ( // Not completed, paid, has lessons
                <Button asChild size="lg" className="w-full shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150 whitespace-normal h-auto py-3">
                    <Link href={firstLessonPath}>
                    {t.startLearning} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            );
        } else if (paymentInfo?.status === 'PENDING') { // Payment submitted, pending review
            return (
                <div className="flex flex-col items-center text-center p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg shadow">
                    <Hourglass className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="font-semibold text-blue-700 dark:text-blue-300">{t.paymentSubmitted}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{t.paymentSubmittedDesc}</p>
                </div>
            );
        } else { // Not paid or payment rejected
             if (!currentCourse.modules || currentCourse.modules.length === 0 || !firstLessonPath) { // Priced course with no lessons
                return (
                    <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg shadow">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
                        <p className="font-semibold text-foreground">{t.courseContentComingSoon}</p>
                        <p className="text-sm text-muted-foreground">{t.pricedNoLessons}</p>
                    </div>
                );
            }
            return ( // Priced course with lessons, user needs to purchase
                <Button asChild size="lg" className="w-full shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150 whitespace-normal h-auto py-3">
                    <Link href={`/courses/${courseId}/checkout`}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {t.purchaseFor.replace('{price}', coursePriceDisplay).replace('{currency}', courseCurrencyDisplay)}
                    </Link>
                </Button>
            );
        }
    }

    // Free course logic
    if (completionInfo?.isCompleted) {
      return (
        <div className="flex flex-col items-center text-center p-4 bg-green-100 dark:bg-green-900/50 rounded-lg shadow">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mb-2" />
          <p className="font-semibold text-green-700 dark:text-green-300">{t.finishedCourse}</p>
          <p className="text-sm text-green-600 dark:text-green-400">{t.progressLabel.replace('{progress}', (completionInfo.progress || 0).toString())}</p>
           {firstLessonPath ? (
                <Button asChild size="lg" className="mt-3 whitespace-normal h-auto py-3">
                <Link href={firstLessonPath}>{t.reviewCourse}</Link>
                </Button>
            ) : (
                <p className="text-sm text-muted-foreground mt-2">{t.completedNoLessons}</p>
            )}
        </div>
      );
    }

    if (!firstLessonPath) { // Free course, not completed, but no lessons
         return (
            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg shadow">
                <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
                <p className="font-semibold text-foreground">{t.courseContentComingSoon}</p>
                <p className="text-sm text-muted-foreground">{t.lessonsBeingPrepared}</p>
            </div>
        );
    }

    return ( // Free course, not completed, has lessons
      <Button asChild size="lg" className="w-full shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150 whitespace-normal h-auto py-3">
        <Link href={firstLessonPath}>
          {t.startLearningFree} <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    );
  };

  if (authLoading || (currentCourse && isLoadingUserSpecificData)) {
    return (
      <div className="max-w-4xl mx-auto py-4 md:py-8 space-y-6">
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
            <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            <Card><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            <Card><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          </div>
          <div className="md:col-span-1 space-y-6 md:sticky md:top-24">
            <Card>
                <CardHeader><Skeleton className="h-8 w-3/4" /> </CardHeader>
                <CardContent><Skeleton className="h-12 w-full py-3" /></CardContent>
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
        <div className="flex items-center gap-2 mb-4 md:mb-6"> {/* Moved here to be visible on not found page too */}
            <Button variant="outline" size="icon" asChild title={t.navToHome}>
                <Link href="/">
                <HomeIcon className="h-4 w-4" />
                <span className="sr-only">{t.navToHome}</span>
                </Link>
            </Button>
            {(!authLoading && isAuthenticated) && (
                <Button variant="outline" size="icon" asChild title={t.navToDashboard}>
                <Link href={getDashboardPath()}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="sr-only">{t.navToDashboard}</span>
                </Link>
                </Button>
            )}
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center font-headline">
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> {t.courseNotFound}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {t.courseNotFoundDesc.replace('{courseId}', courseId)}
            </p>
            <Button asChild>
              <Link href="/courses/search">{t.exploreOtherCourses}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { title, description, categoryNameCache, instructor, modules, imageUrl, dataAiHint, price, currency, learningObjectives, targetAudience, prerequisites, estimatedTimeToComplete, quizzes } = currentCourse;
  const canAccessContent = (paymentInfo?.status === 'APPROVED') || (!price || price <= 0);

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Button variant="outline" size="icon" asChild title={t.navToHome}>
            <Link href="/">
            <HomeIcon className="h-4 w-4" />
            <span className="sr-only">{t.navToHome}</span>
            </Link>
        </Button>
        {(!authLoading && isAuthenticated) && (
            <Button variant="outline" size="icon" asChild title={t.navToDashboard}>
            <Link href={getDashboardPath()}>
                <LayoutDashboard className="h-4 w-4" />
                <span className="sr-only">{t.navToDashboard}</span>
            </Link>
            </Button>
        )}
        <Button variant="outline" onClick={() => router.back()} className="text-sm">
            <ChevronLeft className="mr-2 h-4 w-4" /> {t.backToCourses}
        </Button>
      </div>


      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg overflow-hidden">
            {imageUrl && (
              <div className="relative w-full aspect-video bg-muted">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  style={{objectFit:"cover"}}
                  data-ai-hint={dataAiHint || 'course education'}
                  priority
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground">{title}</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                {t.taughtBy.replace('{instructor}', instructor || '')} &bull; {t.categoryLabel.replace('{category}', categoryNameCache || '')}
                {price && price > 0 && currency && (
                    <span className="block mt-1 font-semibold text-primary">
                        {t.priceLabel.replace('{price}', (price ?? 0).toFixed(2)).replace('{currency}', currency)}
                    </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 whitespace-pre-line">{description}</p>
            </CardContent>
          </Card>


          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center"><ListChecks className="mr-2 h-6 w-6 text-primary" /> {t.whatYouWillLearn}</CardTitle>
            </CardHeader>
            <CardContent>
              {learningObjectives && learningObjectives.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-2">
                  {learningObjectives.map((obj, index) => <li key={index}>{obj}</li>)}
                </ul>
              ) : (
                <p className="text-muted-foreground">{t.noLearningObjectives}</p>
              )}
            </CardContent>
          </Card>


          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center"><TargetAudienceIcon className="mr-2 h-6 w-6 text-primary" /> {t.targetAudience}</CardTitle>
            </CardHeader>
            <CardContent>
              {targetAudience ? (
                <p className="text-foreground/90">{targetAudience}</p>
              ) : (
                <p className="text-muted-foreground">{t.noTargetAudience}</p>
              )}
            </CardContent>
          </Card>


          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center"><ShieldCheck className="mr-2 h-6 w-6 text-primary" /> {t.prerequisites}</CardTitle>
            </CardHeader>
            <CardContent>
              {prerequisites && prerequisites.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-2">
                  {prerequisites.map((pre, index) => <li key={index}>{pre}</li>)}
                </ul>
              ) : (
                <p className="text-muted-foreground">{t.noPrerequisites}</p>
              )}
            </CardContent>
          </Card>

           {estimatedTimeToComplete && (
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center"><Timer className="mr-2 h-6 w-6 text-primary" /> {t.estimatedTime}</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-foreground/90">{estimatedTimeToComplete}</p>
                </CardContent>
            </Card>
          )}

          {quizzes && quizzes.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center">
                  <FileQuestion className="mr-2 h-6 w-6 text-primary" /> {t.assessmentsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {quizzes.map((quiz: Quiz) => {
                    const QuizIcon = quiz.quizType === 'GRADED' ? GradedQuizIcon : PracticeQuizIcon;
                    const quizLabel = quiz.quizType === 'GRADED' ? t.gradedQuiz : t.practiceQuiz;
                    return (
                      <li key={quiz.id} className="p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-grow">
                            <h4 className="font-semibold text-md flex items-center">
                              <QuizIcon className="mr-2 h-5 w-5 text-accent shrink-0" />
                              {quiz.title}
                            </h4>
                            <p className="text-xs text-muted-foreground sm:ml-7">
                              {quizLabel}
                            </p>
                          </div>
                          <div className="w-full sm:w-auto shrink-0">
                            {canAccessContent ? (
                              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                                <Link href={`/courses/${courseId}/quiz/${quiz.id}`}>
                                  {t.startQuiz} <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                                <Lock className="mr-1.5 h-4 w-4" /> {t.startQuiz}
                              </Button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1 space-y-6 md:sticky md:top-24">
          <Card className="shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-headline">{t.courseAccess}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCTAButton()}
            </CardContent>
            {isAuthenticated && completionInfo && completionInfo.progress > 0 && completionInfo.progress < 100 && canAccessContent && (
                 <CardFooter className="text-sm text-muted-foreground pt-0 pb-4 text-center justify-center">
                    {t.progressCompleted.replace('{progress}', (completionInfo.progress || 0).toString())}
                </CardFooter>
            )}
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <BookOpenText className="mr-2 h-6 w-6 text-primary" /> {t.courseContent}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modules && modules.length > 0 ? (
                <Accordion type="single" collapsible className="w-full" defaultValue={modules?.[0]?.id}>
                  {modules.map((module: Module, moduleIndex: number) => (
                    <AccordionItem value={module.id} key={module.id}>
                      <AccordionTrigger className="text-md font-semibold hover:no-underline">
                        {t.moduleLabel.replace('{index}', (moduleIndex + 1).toString()).replace('{title}', module.title)}
                      </AccordionTrigger>
                      <AccordionContent>
                        {module.lessons && module.lessons.length > 0 ? (
                          <ul className="space-y-2 pl-2 border-l-2 border-primary/20 ml-2">
                            {module.lessons.map((lesson: Lesson, lessonIndex: number) => {
                              const lessonPath = `/courses/${courseId}/learn/${module.id}/${lesson.id}`;
                              return (
                                <li key={lesson.id}>
                                  {canAccessContent ? (
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
                          <p className="text-sm text-muted-foreground pl-4 py-2">{t.noLessonsInModule}</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t.noModulesAvailable}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

