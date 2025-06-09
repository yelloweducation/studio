
"use client";
import { useParams } from 'next/navigation';
import { courses as allCourses, type Course } from '@/data/mockData';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlayCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // Optional: if only logged-in users can view

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (courseId) {
      const foundCourse = allCourses.find(c => c.id === courseId);
      setCourse(foundCourse || null);
    }
  }, [courseId]);

  if (!course) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Course not found</h1>
        <p className="text-muted-foreground">The course you are looking for does not exist or has been moved.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Go back to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <ProtectedRoute> {/* Assuming course details are protected or for logged-in users */}
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Link>
        </Button>

        <Card className="overflow-hidden shadow-xl">
          {course.imageUrl && (
            <div className="relative w-full h-64 md:h-80">
              <Image 
                src={course.imageUrl} 
                alt={course.title} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={course.dataAiHint || 'education banner'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">{course.title}</h1>
                <p className="text-lg text-primary-foreground/80">{course.category}</p>
              </div>
            </div>
          )}
          <CardHeader className={!course.imageUrl ? "pt-6" : "pt-2 pb-4 px-6"}>
            {!course.imageUrl && <CardTitle className="text-3xl font-headline">{course.title}</CardTitle>}
            <CardDescription className="text-md">By {course.instructor}</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-6">
            <p className="text-lg text-foreground/90">{course.description}</p>
            
            <div>
              <h2 className="text-2xl font-headline font-semibold mb-3 flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-primary" /> Course Modules
              </h2>
              {course.modules.length > 0 ? (
                <ul className="space-y-3">
                  {course.modules.map(module => (
                    <li key={module.id} className="p-4 border rounded-md bg-card hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg mb-1">{module.title}</h3>
                      <ul className="list-disc list-inside pl-2 text-sm text-muted-foreground space-y-1">
                        {module.lessons.map(lesson => (
                          <li key={lesson.id} className="flex justify-between items-center">
                            <span>{lesson.title}</span>
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{lesson.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Modules for this course will be available soon.</p>
              )}
            </div>
            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-md active:translate-y-px transition-all duration-150">
              <PlayCircle className="mr-2 h-6 w-6"/> Start Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

