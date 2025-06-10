
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/courses/CourseCard';
import { courses as allCourses, type Course, categories as allCategories, type Category } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchCoursesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use mock data directly for student-facing views
  const availableCourses: Course[] = useMemo(() => allCourses, []);
  const availableCategories: Category[] = useMemo(() => allCategories, []);

  useEffect(() => {
    setIsLoading(true);
    let filtered = availableCourses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    setDisplayedCourses(filtered);
    setIsLoading(false);

    // Update URL
    const params = new URLSearchParams();
    if (searchTerm) params.set('query', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    router.replace(`/courses/search?${params.toString()}`, { scroll: false });

  }, [searchTerm, selectedCategory, availableCourses, router]);


  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-8">
      <section className="pt-2 pb-6 border-b">
        <div className="flex items-center mb-4">
          <Button variant="outline" size="icon" className="mr-3" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-3xl font-headline font-semibold">Explore Courses</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search-input" className="block text-sm font-medium text-muted-foreground mb-1">
              Search by keyword
            </label>
            <div className="relative">
              <Input
                id="search-input"
                type="text"
                placeholder="e.g., JavaScript, Data Science..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 shadow-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-1">
              Filter by category
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-select" className="shadow-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(searchTerm || selectedCategory !== 'all') && (
          <div className="mt-4">
            <Button variant="ghost" onClick={handleClearFilters} className="text-sm text-muted-foreground hover:text-foreground">
              <X className="mr-2 h-4 w-4" /> Clear Filters
            </Button>
          </div>
        )}
      </section>

      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
        ) : displayedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <Card className="col-span-full">
            <CardContent className="pt-10 pb-10 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filters.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
