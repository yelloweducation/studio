
"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { BookUser, BookMarked, History, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/courses/CourseCard"; 
import { courses as mockCourses, enrollments as initialEnrollments, type Course, type Enrollment } from "@/data/mockData";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const USER_ENROLLMENTS_KEY = 'userEnrollmentsData';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [enrolledCoursesDetails, setEnrolledCoursesDetails] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      let userEnrollments: Enrollment[] = [];
      let allCourses: Course[] = [];

      // Load courses (admin-managed first, then mock)
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
      
      // Load enrollments from localStorage or initialize
      try {
        const storedEnrollments = localStorage.getItem(USER_ENROLLMENTS_KEY);
        if (storedEnrollments) {
          userEnrollments = JSON.parse(storedEnrollments) as Enrollment[];
           if (!Array.isArray(userEnrollments)) { // Basic validation
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
                <BookUser className="mr-2 md:mr-3 h-7 w-7 md:h-8 md:w-8 text-primary" /> Welcome, {user?.name || 'Student'}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">This is your personal learning dashboard.</p>
        </section>

        <section>
            <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
                <GraduationCap className="mr-2 h-6 w-6 text-primary" /> My Enrolled Courses
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
                        <p className="text-muted-foreground mb-4">You haven&apos;t enrolled in any courses yet.</p>
                        <Button asChild>
                            <Link href="/courses/search">Explore Courses</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </section>
        
        <section>
             <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
                <History className="mr-2 h-6 w-6 text-primary" /> Learning Activity
            </h2>
             <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        Your recent learning activity will appear here. (Completion progress is tracked per course).
                    </p>
                </CardContent>
            </Card>
        </section>
      </div>
    </ProtectedRoute>
  );
}
