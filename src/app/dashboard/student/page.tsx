
"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookUser, BookMarked, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/courses/CourseCard"; // Assuming CourseCard can be used
import { courses as mockCourses, enrollments as mockEnrollments, type Course, type Enrollment } from "@/data/mockData";
import { useState, useEffect } from "react";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      // Simulate fetching enrolled courses (using mock data)
      const userEnrollments = mockEnrollments.filter(e => e.userId === user.id);
      const coursesDetails = userEnrollments.map(enrollment => {
        return mockCourses.find(course => course.id === enrollment.courseId);
      }).filter(course => course !== undefined) as Course[];
      setEnrolledCourses(coursesDetails);
      setIsLoading(false);
    } else {
      setEnrolledCourses([]);
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
                <BookMarked className="mr-2 h-6 w-6 text-primary" /> My Enrolled Courses
            </h2>
            {isLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                        <Card key={i}>
                            <CardHeader><CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle></CardHeader>
                            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                            <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                        </Card>
                    ))}
                </div>
            ) : enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map(course => (
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
                        Your recent learning activity will appear here.
                    </p>
                </CardContent>
            </Card>
        </section>
      </div>
    </ProtectedRoute>
  );
}
