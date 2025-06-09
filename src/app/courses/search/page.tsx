
"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/courses/CourseCard';
import { courses as allCourses, type Course } from '@/data/mockData';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (query) {
      const results = allCourses.filter(course =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(results);
    } else {
      setFilteredCourses(allCourses); // Show all courses if query is empty
    }
    setIsLoading(false);
  }, [query]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-semibold flex items-center">
          <Search className="mr-3 h-8 w-8 text-primary" />
          {query ? `Results for "${query}"` : "All Courses"}
        </h1>
        <Button variant="outline" asChild>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <Skeleton className="h-10 w-1/4"/>
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
