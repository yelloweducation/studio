
// This directive applies to the module, making SearchCoursesClientLogic a client component.
"use client"; 

import React, { useState, useEffect, Suspense, lazy, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/courses/CourseCard';
import CategoryCard from '@/components/categories/CategoryCard';
import { courses as defaultMockCourses, type Course, categories as defaultMockCategories, type Category, type LearningPath, initialLearningPaths } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, X, LayoutGrid, GraduationCap, Lightbulb, Star, Milestone, Send, Loader2, AlertTriangle, ListFilter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"; // Added
import { getQuickRecommendations, type QuickRecommendationInput, type QuickRecommendationOutput } from '@/ai/flows/quick-recommendation-flow'; // Added
import * as LucideIcons from 'lucide-react'; // For dynamic learning path icons

const CareerAdviceChatbox = lazy(() => import('@/components/ai/CareerAdviceChatbox'));

const isValidLucideIcon = (iconName: string): iconName is keyof typeof LucideIcons => {
  return iconName in LucideIcons;
};

const LEARNING_PATHS_KEY = 'adminLearningPaths';


// Client component containing the core logic and UI for the search page
function SearchCoursesClientLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true); 

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]); // Added
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]); // Added
  const [popularTopics, setPopularTopics] = useState<string[]>([]); // Added

  const [quickRecInput, setQuickRecInput] = useState(''); // For AI Quick Recs
  const [quickRecs, setQuickRecs] = useState<QuickRecommendationOutput['recommendations']>([]);
  const [isQuickRecLoading, setIsQuickRecLoading] = useState(false);
  const [quickRecError, setQuickRecError] = useState<string | null>(null);


  useEffect(() => {
    setIsLoading(true);
    let coursesToUse: Course[] = [];
    let categoriesToUse: Category[] = [];
    let learningPathsToUse: LearningPath[] = [];

    try {
      const storedCoursesString = localStorage.getItem('adminCourses');
      if (storedCoursesString) {
        const parsed = JSON.parse(storedCoursesString);
        coursesToUse = Array.isArray(parsed) ? parsed : defaultMockCourses;
      } else {
        coursesToUse = defaultMockCourses;
      }
    } catch (error) {
      console.error("Error loading courses from localStorage:", error);
      coursesToUse = defaultMockCourses;
    }
    setAvailableCourses(coursesToUse);
    setFeaturedCourses(coursesToUse.filter(c => c.isFeatured));
    
    const uniqueCategories = Array.from(new Set(coursesToUse.map(c => c.category))).filter(Boolean);
    setPopularTopics(uniqueCategories);


    try {
      const storedCategoriesString = localStorage.getItem('adminCategories');
      if (storedCategoriesString) {
        const parsed = JSON.parse(storedCategoriesString);
        categoriesToUse = Array.isArray(parsed) ? parsed : defaultMockCategories;
      } else {
        categoriesToUse = defaultMockCategories;
      }
    } catch (error) {
      console.error("Error loading categories from localStorage:", error);
      categoriesToUse = defaultMockCategories;
    }
    setAvailableCategories(categoriesToUse);

    try {
      const storedLearningPaths = localStorage.getItem(LEARNING_PATHS_KEY);
      if (storedLearningPaths) {
        const parsed = JSON.parse(storedLearningPaths);
        learningPathsToUse = Array.isArray(parsed) ? parsed : initialLearningPaths;
      } else {
        learningPathsToUse = initialLearningPaths;
      }
    } catch (error) {
      console.error("Error loading learning paths from localStorage:", error);
      learningPathsToUse = initialLearningPaths;
    }
    setLearningPaths(learningPathsToUse.slice(0, 3)); // Show max 3 paths

  }, []);

  useEffect(() => {
    setSearchTerm(initialQuery);
    setSelectedCategory(initialCategory);
  }, [initialQuery, initialCategory]);

  useEffect(() => {
    setIsLoading(true); 

    let filtered = [...availableCourses];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    setDisplayedCourses(filtered);
    setIsLoading(false);

    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('query', searchTerm);
    } else {
      params.delete('query');
    }
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    const newQueryString = params.toString();
    if (newQueryString !== searchParams.toString().replace(/\+/g, '%20')) { 
        router.replace(`/courses/search${newQueryString ? `?${newQueryString}` : ''}`, { scroll: false });
    }
  }, [searchTerm, selectedCategory, availableCourses, router, searchParams]);


  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const handlePopularTopicClick = (topic: string) => {
    setSelectedCategory(topic);
    setSearchTerm(''); // Optionally clear search term or set it to topic
  };

  const handleQuickRecSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const interest = quickRecInput.trim();
    if (!interest || availableCourses.length === 0) return;

    setIsQuickRecLoading(true);
    setQuickRecError(null);
    setQuickRecs([]);

    try {
      // Map full Course objects to the simplified structure expected by the AI flow
      const coursesForAI = availableCourses.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description || '',
        category: c.category || '',
      }));
      const inputData: QuickRecommendationInput = { userInterest: interest, availableCourses: coursesForAI };
      const response = await getQuickRecommendations(inputData);
      setQuickRecs(response.recommendations);
    } catch (err) {
      console.error("Error getting quick recommendations:", err);
      setQuickRecError(err instanceof Error ? err.message : "Failed to get recommendations.");
    } finally {
      setIsQuickRecLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pt-0">
      <section className="pb-4 md:pb-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-end">
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
          <div className="mt-2 md:mt-3">
            <Button variant="ghost" onClick={handleClearFilters} className="text-sm text-muted-foreground hover:text-foreground h-auto py-1 px-2">
              <X className="mr-1.5 h-4 w-4" /> Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* Featured Courses Carousel */}
      {featuredCourses.length > 0 && (
        <section className="py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
            <Star className="mr-2 h-6 w-6 text-primary fill-primary" /> Featured Courses
          </h2>
          <Carousel opts={{ align: "start", loop: featuredCourses.length > (isMobile ? 1:3) }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredCourses.map((course) => (
                <CarouselItem key={course.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <CourseCard course={course} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-12 hidden sm:flex" />
            <CarouselNext className="mr-12 hidden sm:flex" />
          </Carousel>
        </section>
      )}

      {/* Quick Recommendations AI Snippet */}
      <section className="py-4 md:py-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-headline flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-primary" /> Quick Suggestions
            </CardTitle>
            <CardDescription>Tell us your interest, and we'll suggest a course!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuickRecSubmit} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="e.g., 'learn python for web'"
                value={quickRecInput}
                onChange={(e) => setQuickRecInput(e.target.value)}
                className="flex-grow shadow-sm"
                disabled={isQuickRecLoading}
              />
              <Button type="submit" disabled={isQuickRecLoading || !quickRecInput.trim()} className="shadow-sm">
                {isQuickRecLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="sr-only">Get Suggestion</span>
              </Button>
            </form>
            {quickRecError && <p className="text-destructive text-sm mt-2 flex items-center"><AlertTriangle className="h-4 w-4 mr-1.5"/>{quickRecError}</p>}
            {quickRecs.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Here are some ideas:</h4>
                {quickRecs.map(rec => (
                  <Link key={rec.id} href={`/courses/${rec.id}`} passHref>
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-2.5 shadow-sm hover:border-primary">
                        <GraduationCap className="mr-2 h-4 w-4 text-primary/80"/>
                        <div>
                            <span className="font-semibold">{rec.title}</span>
                            {rec.reason && <p className="text-xs text-muted-foreground">{rec.reason}</p>}
                        </div>
                    </Button>
                  </Link>
                ))}
              </div>
            )}
             {isQuickRecLoading === false && quickRecs.length === 0 && quickRecInput && !quickRecError && (
                <p className="text-sm text-muted-foreground mt-3">No specific recommendations found for "{quickRecInput}". Try a broader term or browse below!</p>
            )}
          </CardContent>
        </Card>
      </section>
      
      {/* Popular Topics Cloud */}
      {popularTopics.length > 0 && (
        <section className="py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
            <ListFilter className="mr-2 h-6 w-6 text-primary" /> Popular Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map(topic => (
              <Badge
                key={topic}
                variant={selectedCategory === topic ? "default" : "secondary"}
                onClick={() => handlePopularTopicClick(topic)}
                className="cursor-pointer text-sm px-3 py-1 shadow-sm hover:shadow-md transition-all"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </section>
      )}


      <section className="py-4 md:py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-headline font-semibold flex items-center">
            <LayoutGrid className="mr-2 h-6 w-6 text-primary" /> Browse Categories
          </h2>
        </div>
        {isLoading && availableCategories.length === 0 ? ( 
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-md">
                <Skeleton className="w-full h-24 sm:h-32 rounded-t-lg" />
                <div className="p-3 pt-4">
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : availableCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {availableCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center">
              <LayoutGrid className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold">No Categories Available</h3>
              <p className="text-sm text-muted-foreground">Categories will appear here once added.</p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="py-4 md:py-6">
         <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 md:mb-6 mt-4 md:mt-8 flex items-center">
            <GraduationCap className="mr-2 h-6 w-6 text-primary" /> Available Courses
        </h2>
        {isLoading && displayedCourses.length === 0 ? ( 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
      
      {/* Learning Paths Teaser */}
      {learningPaths.length > 0 && (
        <section className="py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
            <Milestone className="mr-2 h-6 w-6 text-primary" /> Explore Learning Paths
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {learningPaths.map(path => {
                const IconComponent = path.icon && isValidLucideIcon(path.icon) ? LucideIcons[path.icon] as React.ElementType : Milestone;
                return (
                    <Link key={path.id} href={`/learning-paths/${path.id}`} passHref>
                        <Card className="group h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-150 cursor-pointer overflow-hidden">
                             {path.imageUrl && (
                                <div className="relative w-full aspect-video bg-muted">
                                    <img src={path.imageUrl} alt={path.title} className="w-full h-full object-cover" data-ai-hint={path.dataAiHint || 'learning path journey'} />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="font-headline text-lg flex items-center">
                                    <IconComponent className="mr-2 h-5 w-5 text-primary group-hover:text-accent transition-colors" />
                                    {path.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3">{path.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="link" className="p-0 h-auto text-primary group-hover:text-accent">View Path <X className="rotate-45 ml-1 h-4 w-4 transform transition-transform group-hover:translate-x-0.5"/></Button>
                            </CardFooter>
                        </Card>
                    </Link>
                );
            })}
          </div>
        </section>
      )}


      <section className="w-full mt-8 md:mt-12 mb-8">
        <Suspense fallback={
            <Card className="w-full shadow-xl">
                <CardHeader className="pb-4">
                    <Skeleton className="h-7 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        }>
          <CareerAdviceChatbox />
        </Suspense>
      </section>
    </div>
  );
}

function SearchPageInitialSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 pt-0"> 
      <section className="pb-4 md:pb-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-end">
          <div className="md:col-span-2">
            <Skeleton className="h-4 w-1/4 mb-1 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-4 w-1/4 mb-1 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </section>
       <section className="py-4 md:py-6">
         <Skeleton className="h-7 w-1/3 mb-4 rounded-md" /> 
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={`feat-skel-${i}`} className="h-72 w-full rounded-lg" />)}
         </div>
       </section>
       <section className="py-4 md:py-6">
        <Skeleton className="h-7 w-1/2 mb-4 rounded-md" /> 
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={`cat-skel-${i}`} className="bg-card rounded-lg shadow-md">
                <Skeleton className="w-full h-24 sm:h-32 rounded-t-lg" />
                <div className="p-3 pt-4">
                  <Skeleton className="h-5 w-3/4 mx-auto rounded-md" />
                </div>
              </div>
            ))}
          </div>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map(i => (
          <Card key={`course-skel-${i}`} className="flex flex-col overflow-hidden shadow-lg">
            <CardHeader className="p-0">
              <Skeleton className="aspect-[16/9] w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="flex-grow px-6 pb-4">
              <Skeleton className="h-4 w-full mb-1 rounded-md" />
              <Skeleton className="h-4 w-5/6 mb-3 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded-md" />
            </CardContent>
            <CardFooter className="px-6 pb-6">
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </section>
      <section className="w-full mt-8 md:mt-12 mb-8">
        <Card className="w-full shadow-xl">
          <CardHeader className="pb-4">
            <Skeleton className="h-7 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

export default function SearchCoursesPage() {
  return (
    <Suspense fallback={<SearchPageInitialSkeleton />}>
      <SearchCoursesClientLogic />
    </Suspense>
  );
}
