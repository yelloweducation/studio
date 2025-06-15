
"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BookUser, BookMarked, History, GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/courses/CourseCard";
import { type Course, type Enrollment } from "@/lib/dbUtils"; // Use Prisma types from dbUtils
import { serverGetEnrollmentsByUserId } from '@/actions/adminDataActions';
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from '@/contexts/LanguageContext';

const studentDashboardTranslations = {
  en: {
    welcome: "Welcome",
    description: "This is your personal learning dashboard.",
    myEnrolledCourses: "My Enrolled Courses",
    learningActivity: "Learning Activity",
    exploreCourses: "Explore Courses",
    noCoursesYet: "You haven't enrolled in any courses yet.",
    activityPlaceholder: "Your recent learning activity will appear here. (Completion progress is tracked per course).",
    student: "Student",
    loadingCourses: "Loading your courses..."
  },
  my: {
    welcome: "ကြိုဆိုပါတယ်",
    description: "ဤသည်မှာ သင်၏ကိုယ်ပိုင်သင်ယူမှု ဒက်ရှ်ဘုတ်ဖြစ်သည်။",
    myEnrolledCourses: "ကျွန်ုပ်၏ စာရင်းသွင်းထားသော အတန်းများ",
    learningActivity: "သင်ယူမှု လှုပ်ရှားမှု",
    exploreCourses: "အတန်းများ ရှာဖွေရန်",
    noCoursesYet: "သင်သည် မည်သည့်အတန်းမှ စာရင်းမသွင်းရသေးပါ။",
    activityPlaceholder: "သင်၏ မကြာသေးမီက သင်ယူမှု လှုပ်ရှားမှုများကို ဤနေရာတွင် ပြသပါမည်။ (ပြီးဆုံးမှု တိုးတက်မှုကို အတန်းအလိုက် ခြေရာခံသည်)။",
    student: "ကျောင်းသား",
    loadingCourses: "သင်၏အတန်းများကို တင်နေသည်..."
  }
};

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const t = studentDashboardTranslations[language];
  const [enrolledCoursesDetails, setEnrolledCoursesDetails] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true); // Start with true

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (authLoading) {
        setIsLoadingCourses(true); // Ensure loading state while auth is resolving
        return;
      }

      if (user && user.id) { // Ensure user and user.id are available
        setIsLoadingCourses(true);
        console.log("[StudentDashboard] Auth loaded. Fetching enrollments for user:", user.id);
        try {
          const userEnrollments = await serverGetEnrollmentsByUserId(user.id);
          console.log("[StudentDashboard] Fetched userEnrollments via server action:", userEnrollments.length);
          
          const coursesData = userEnrollments
            .map(enrollment => enrollment.course) 
            .filter(Boolean) as Course[]; 
          
          console.log("[StudentDashboard] Processed coursesData to display:", coursesData.length);
          setEnrolledCoursesDetails(coursesData);
        } catch (error) {
          console.error("[StudentDashboard] Error fetching enrolled courses from server action:", error);
          setEnrolledCoursesDetails([]);
        } finally {
            setIsLoadingCourses(false);
        }
      } else {
        console.log("[StudentDashboard] Auth loaded. No user authenticated or user.id missing.");
        setEnrolledCoursesDetails([]);
        setIsLoadingCourses(false);
      }
    };
    fetchEnrolledCourses();
  }, [user, authLoading]);


  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="space-y-8">
        <section className="pb-4 border-b">
            <h1 className="text-2xl md:text-3xl font-headline font-semibold flex items-center">
                <BookUser className="mr-2 md:mr-3 h-7 w-7 md:h-8 md:w-8 text-primary" /> {t.welcome}, {user?.name || t.student}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">{t.description}</p>
        </section>

        <section>
            <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
                <GraduationCap className="mr-2 h-6 w-6 text-primary" /> {t.myEnrolledCourses}
            </h2>
            {(authLoading || isLoadingCourses) ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                        <Card key={i} className="flex flex-col overflow-hidden shadow-lg">
                            <CardHeader className="p-0">
                              <Skeleton className="aspect-[16/9] w-full" />
                              <div className="p-6">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                              </div>
                            </CardHeader>
                            <CardContent className="flex-grow px-6 pb-4">
                              <Skeleton className="h-4 w-full mb-1" />
                              <Skeleton className="h-4 w-5/6 mb-3" />
                              <Skeleton className="h-3 w-1/3" />
                            </CardContent>
                            <CardFooter className="px-6 pb-6">
                              <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : enrolledCoursesDetails.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCoursesDetails.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground mb-4">{t.noCoursesYet}</p>
                        <Button asChild>
                            <Link href="/courses/search">{t.exploreCourses}</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </section>
        
        <section>
             <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
                <History className="mr-2 h-6 w-6 text-primary" /> {t.learningActivity}
            </h2>
             <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        {t.activityPlaceholder}
                    </p>
                </CardContent>
            </Card>
        </section>
      </div>
    </ProtectedRoute>
  );
}
