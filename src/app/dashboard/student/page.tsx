
"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { courses as allCourses, enrollments as allEnrollments, type Course, type Enrollment } from "@/data/mockData";
import CourseCard from "@/components/courses/CourseCard";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck, Forward } from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [learningContinuations, setLearningContinuations] = useState<Course[]>([]);

  useEffect(() => {
    if (user) {
      const userEnrollments = allEnrollments.filter(e => e.userId === user.id);
      const courses = userEnrollments.map(enrollment => {
        return allCourses.find(c => c.id === enrollment.courseId);
      }).filter((course): course is Course => course !== undefined);
      
      setEnrolledCourses(courses);

      // Simple "Continue Learning": courses with some progress but not 100%
      const progressCourses = userEnrollments
        .filter(e => e.progress > 0 && e.progress < 100)
        .map(e => allCourses.find(c => c.id === e.courseId))
        .filter((course): course is Course => course !== undefined)
        .slice(0, 3); // Show a few
      setLearningContinuations(progressCourses);
    }
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-headline font-semibold mb-6 flex items-center">
            <BookOpenCheck className="mr-3 h-8 w-8 text-primary" /> My Courses
          </h1>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                You are not enrolled in any courses yet. Explore our catalog!
              </CardContent>
            </Card>
          )}
        </section>

        {learningContinuations.length > 0 && (
          <section>
            <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center">
              <Forward className="mr-3 h-7 w-7 text-accent" /> Continue Learning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningContinuations.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}
      </div>
    </ProtectedRoute>
  );
}
