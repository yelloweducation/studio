
"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; 
import { BookUser, BookMarked, History, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/courses/CourseCard"; 
import { courses as mockCourses, enrollments as initialEnrollments, type Course, type Enrollment } from "@/data/mockData";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, type Language } from '@/contexts/LanguageContext'; // Added

const USER_ENROLLMENTS_KEY = 'userEnrollmentsData';

const studentDashboardTranslations = {
  en: {
    welcome: "Welcome",
    description: "This is your personal learning dashboard.",
    myEnrolledCourses: "My Enrolled Courses",
    learningActivity: "Learning Activity",
    exploreCourses: "Explore Courses",
    noCoursesYet: "You haven't enrolled in any courses yet.",
    activityPlaceholder: "Your recent learning activity will appear here. (Completion progress is tracked per course).",
    student: "Student"
  },
  my: {
    welcome: "ကြိုဆိုပါတယ်", // Kyo So Ba Deh
    description: "ဤသည်မှာ သင်၏ကိုယ်ပိုင်သင်ယူမှု ဒက်ရှ်ဘုတ်ဖြစ်သည်။", // This is your personal learning dashboard.
    myEnrolledCourses: "ကျွန်ုပ်၏ စာရင်းသွင်းထားသော သင်တန်းများ", // My Enrolled Courses
    learningActivity: "သင်ယူမှု လှုပ်ရှားမှု", // Learning Activity
    exploreCourses: "သင်တန်းများ ရှာဖွေရန်", // Explore Courses
    noCoursesYet: "သင်သည် မည်သည့်သင်တန်းမှ စာရင်းမသွင်းရသေးပါ။", // You haven't enrolled in any courses yet.
    activityPlaceholder: "သင်၏ မကြာသေးမီက သင်ယူမှု လှုပ်ရှားမှုများကို ဤနေရာတွင် ပြသပါမည်။ (ပြီးဆုံးမှု တိုးတက်မှုကို သင်တန်းအလိုက် ခြေရာခံသည်)။",
    student: "ကျောင်းသား" // Student
  }
};

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { language } = useLanguage(); // Added
  const t = studentDashboardTranslations[language]; // Added
  const [enrolledCoursesDetails, setEnrolledCoursesDetails] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      let userEnrollments: Enrollment[] = [];
      let allCourses: Course[] = [];

      try {
        const storedCoursesString = localStorage.getItem('adminCourses');
        if (storedCoursesString) {
          const parsedCourses = JSON.parse(storedCoursesString) as Course[];
          allCourses = Array.isArray(parsedCourses) ? parsedCourses : mockCourses;
        } else {
          allCourses = mockCourses;
        }
      } catch (error) {
        console.error("Error loading courses for student dashboard:", error);
        allCourses = mockCourses;
      }
      
      try {
        const storedEnrollments = localStorage.getItem(USER_ENROLLMENTS_KEY);
        if (storedEnrollments) {
          userEnrollments = JSON.parse(storedEnrollments) as Enrollment[];
           if (!Array.isArray(userEnrollments)) { 
            userEnrollments = JSON.parse(JSON.stringify(initialEnrollments));
          }
        } else {
          userEnrollments = JSON.parse(JSON.stringify(initialEnrollments));
          localStorage.setItem(USER_ENROLLMENTS_KEY, JSON.stringify(userEnrollments));
        }
      } catch (error) {
        console.error("Error handling enrollments in localStorage for student dashboard:", error);
        userEnrollments = JSON.parse(JSON.stringify(initialEnrollments));
      }

      const currentUserEnrollments = userEnrollments.filter(e => e.userId === user.id);
      
      const coursesData = currentUserEnrollments.map(enrollment => {
        return allCourses.find(course => course.id === enrollment.courseId);
      }).filter(course => course !== undefined) as Course[];
      
      setEnrolledCoursesDetails(coursesData);
      setIsLoading(false);
    } else {
      setEnrolledCoursesDetails([]);
      setIsLoading(false);
    }
  }, [user]);


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
            {isLoading ? (
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
