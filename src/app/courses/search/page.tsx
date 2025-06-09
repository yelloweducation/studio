
"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/courses/CourseCard';
import { courses as mockCourses, type Course } from '@/data/mockData';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  // Use mockCourses directly, bypassing localStorage for this view
  const [activeCourses] = useState<Course[]>(mockCourses); 
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Removed useEffect that loaded from localStorage for activeCourses

  useEffect(() => {
    setIsLoading(true);
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      const results = activeCourses.filter(course =>
        course.title.toLowerCase().includes(lowerCaseQuery) ||
        course.description.toLowerCase().includes(lowerCaseQuery) ||
        course.category.toLowerCase().includes(lowerCaseQuery) || 
        course.category.toLowerCase() === lowerCaseQuery 
      );
      setFilteredCourses(results);
    } else {
      setFilteredCourses(activeCourses); 
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeCourses]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-semibold flex items-center">
          <Search className="mr-2 h-5 w-5 sm:h-6 sm:w-6 md:mr-3 md:h-7 md:w-7 text-primary" />
          {query ? `Results for "${query}"` : "All Courses"}
        </h1>
        <Button variant="outline" asChild className="self-start sm:self-center">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full" />
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xl text-muted-foreground">No courses found matching your search criteria.</p>
            <p className="text-sm text-muted-foreground mt-2">Try a different search term or browse all courses by clearing the search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


export default function SearchCoursesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2 mb-4"/>
        <Skeleton className="h-8 w-1/4 self-end mb-6"/>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64 w-full"/>
          <Skeleton className="h-64 w-full"/>
          <Skeleton className="h-64 w-full"/>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
