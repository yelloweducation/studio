
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { type LearningPath, type Course } from '@/lib/dbUtils'; // Use Prisma types from dbUtils
import { getLearningPathsFromDb, getCoursesFromDb } from '@/lib/dbUtils'; // Use Prisma-based functions
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, AlertTriangle, Home, BookOpenCheck, BookMarked, ArrowRight, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const isValidLucideIcon = (iconName: string | undefined | null): iconName is keyof typeof LucideIcons => {
  return typeof iconName === 'string' && iconName in LucideIcons;
};

interface LearningPathDetailClientProps {
  pathId: string;
}

export default function LearningPathDetailClient({ pathId }: LearningPathDetailClientProps) {
  const router = useRouter();

  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [pathCourses, setPathCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPathData = async () => {
      if (!pathId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      
      try {
        const allPaths = await getLearningPathsFromDb(); 
        const currentPath = allPaths.find(p => p.id === pathId);
        setLearningPath(currentPath || null);

        if (currentPath && currentPath.courses && currentPath.courses.length > 0) {
          const courseIds = currentPath.courses.map(lpc => lpc.courseId);
          const allCourses = await getCoursesFromDb(); 
          const coursesForPath = allCourses.filter(course => courseIds.includes(course.id));
          setPathCourses(coursesForPath);
        } else {
          setPathCourses([]);
        }
      } catch (error) {
        console.error("Error fetching learning path data:", error);
        setLearningPath(null);
        setPathCourses([]);
      }
      setIsLoading(false);
    };
    fetchPathData();
  }, [pathId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-1/4 mb-4" /> 
        <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-10 w-3/4 mb-2" /> 
            <Skeleton className="h-20 w-full" /> 
            <Skeleton className="h-6 w-1/2 mt-2" /> 
          </CardHeader>
          <CardContent className="py-10">
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="max-w-lg mx-auto py-6 sm:py-12 text-center">
        <Button variant="outline" onClick={() => router.push('/courses/search')} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Explore
        </Button>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center font-headline">
              <AlertTriangle className="mr-3 h-8 w-8 text-destructive" /> Learning Path Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Sorry, we couldn't find the learning path you were looking for (ID: {pathId}).
            </p>
            <Button asChild>
              <Link href="/courses/search"><Home className="mr-2 h-4 w-4"/> Explore Other Content</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const PathIconComponent = learningPath.icon && isValidLucideIcon(learningPath.icon)
    ? LucideIcons[learningPath.icon as keyof typeof LucideIcons] as React.ElementType
    : BookOpenCheck;

  return (
    <div className="max-w-3xl mx-auto py-4 md:py-8">
      <Button variant="outline" onClick={() => router.push('/courses/search')} className="mb-4 md:mb-6 text-sm">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Explore
      </Button>

      <Card className="shadow-xl overflow-hidden">
         {learningPath.imageUrl && (
            <div className="relative w-full aspect-[16/9] bg-muted">
                <Image
                src={learningPath.imageUrl}
                alt={learningPath.title}
                fill // Changed from layout="fill"
                objectFit="cover"
                data-ai-hint={learningPath.dataAiHint || 'learning journey'}
                priority // Added priority
                />
            </div>
        )}
        <CardHeader className="border-b pb-4">
          <div className="flex items-start gap-4">
            <PathIconComponent className="h-10 w-10 md:h-12 md:w-12 text-primary mt-1 shrink-0" />
            <div>
                <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground">{learningPath.title}</CardTitle>
                <CardDescription className="text-md text-muted-foreground mt-1">{learningPath.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold font-headline mb-4 flex items-center">
            <BookMarked className="mr-2 h-5 w-5 text-accent"/> Courses in this Path
          </h3>
          {pathCourses.length > 0 ? (
            <div className="space-y-4">
              {pathCourses.map(course => (
                <Link key={course.id} href={`/courses/${course.id}`} passHref>
                  <Card className="group hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {course.imageUrl && (
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden shrink-0 bg-muted">
                                <Image src={course.imageUrl} alt={course.title} fill objectFit="cover" data-ai-hint={course.dataAiHint || 'course content'}/>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-md group-hover:text-primary transition-colors">{course.title}</h4>
                            <p className="text-xs text-muted-foreground">{course.categoryNameCache} &bull; {course.instructor}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1"/>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No courses are currently assigned to this learning path.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
