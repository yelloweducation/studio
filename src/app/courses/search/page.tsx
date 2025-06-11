
"use client"; 

import React, { useState, useEffect, Suspense, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/courses/CourseCard';
import CategoryCard from '@/components/categories/CategoryCard';
import { type Course, type Category, type LearningPath } from '@/lib/dbUtils'; // Use Prisma types from dbUtils
// REMOVE: import { getCoursesFromDb, getCategoriesFromDb, getLearningPathsFromDb } from '@/lib/dbUtils';
import { getSearchPageData } from '@/actions/searchPageActions'; // ADDED: Import server action
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Search, X, LayoutGrid, GraduationCap, Star, Milestone, AlertTriangle, ListFilter, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const isValidLucideIcon = (iconName: string | undefined | null): iconName is keyof typeof LucideIcons => {
  return typeof iconName === 'string' && iconName in LucideIcons;
};

const searchPageTranslations = {
  en: {
    searchKeywordLabel: "Search by keyword",
    searchKeywordPlaceholder: "e.g., JavaScript, Data Science...",
    filterCategoryLabel: "Filter by category",
    allCategories: "All Categories",
    clearFilters: "Clear Filters",
    featuredCourses: "Featured Courses",
    noFeaturedCourses: "No featured courses available at the moment.",
    popularTopics: "Popular Topics",
    noPopularTopics: "No popular topics to display currently.",
    browseCategories: "Browse Categories",
    noCategoriesAvailable: "No Categories Found",
    noCategoriesDesc: "It looks like there are no categories in the system yet. Please check back later or contact an admin.",
    availableCourses: "Available Courses",
    noCoursesFound: "No Courses Found",
    noCoursesDesc: "Try adjusting your search terms or category filters. If you're looking for all courses, there might be none in the system yet.",
    exploreLearningPaths: "Explore Learning Paths",
    noLearningPaths: "No Learning Paths Available",
    noLearningPathsDesc: "Learning paths will appear here once they are created.",
    viewPath: "View Path"
  },
  my: {
    searchKeywordLabel: "သော့ချက်စာလုံးဖြင့် ရှာပါ",
    searchKeywordPlaceholder: "ဥပမာ - JavaScript, Data Science...",
    filterCategoryLabel: "အမျိုးအစားအလိုက် စစ်ထုတ်ပါ",
    allCategories: "အမျိုးအစားအားလုံး",
    clearFilters: "စစ်ထုတ်မှုများ ဖယ်ရှားရန်",
    featuredCourses: "အထူးပြု အတန်းများ",
    noFeaturedCourses: "လက်ရှိတွင် အထူးပြု အတန်းများ မရှိသေးပါ။",
    popularTopics: "ရှာဖွေမှုများသောအတန်းများ",
    noPopularTopics: "လက်ရှိတွင် ပြသရန် လူကြိုက်များသော ခေါင်းစဉ်များ မရှိပါ။",
    browseCategories: "အမျိုးအစားများ ကြည့်ရှုရန်",
    noCategoriesAvailable: "အမျိုးအစားများ မတွေ့ပါ",
    noCategoriesDesc: "စနစ်တွင် အမျိုးအစားများ မရှိသေးပုံရသည်။ ကျေးဇူးပြု၍ နောက်မှပြန်စစ်ဆေးပါ သို့မဟုတ် စီမံခန့်ခွဲသူကို ဆက်သွယ်ပါ။",
    availableCourses: "တက်ရောက်နိုင်သောအတန်းများ",
    noCoursesFound: "အတန်းများ မတွေ့ပါ",
    noCoursesDesc: "သင်၏ ရှာဖွေရေး စကားလုံးများ သို့မဟုတ် အမျိုးအစား စစ်ထုတ်မှုများကို ချိန်ညှိကြည့်ပါ။ အကယ်၍ သင်သည် အတန်းအားလုံးကို ရှာဖွေနေပါက၊ စနစ်တွင် အတန်းများ မရှိသေးခြင်း ဖြစ်နိုင်သည်။",
    exploreLearningPaths: "ပညာရေးလမ်းကြောင်းများ",
    noLearningPaths: "ပညာရေးလမ်းကြောင်းများ မရှိသေးပါ",
    noLearningPathsDesc: "ပညာရေးလမ်းကြောင်းများကို ဖန်တီးပြီးသည်နှင့် ဤနေရာတွင် ပေါ်လာပါမည်။",
    viewPath: "လမ်းကြောင်းကြည့်ရန်"
  }
};

function SearchCoursesClientLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = searchPageTranslations[language];
  
  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); 

  const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [popularTopics, setPopularTopics] = useState<string[]>([]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        // UPDATED: Call server action
        const { 
            courses: coursesFromDb, 
            categories: categoriesFromDb, 
            learningPaths: learningPathsFromDb 
        } = await getSearchPageData();
        
        setAllFetchedCourses(coursesFromDb);
        setFeaturedCourses(coursesFromDb.filter(c => c.isFeatured));
        
        const uniqueCourseCategories = Array.from(new Set(coursesFromDb.map(c => c.categoryNameCache ?? ''))).filter(Boolean) as string[];
        setPopularTopics(uniqueCourseCategories);
        
        setAvailableCategories(categoriesFromDb);
        setLearningPaths(learningPathsFromDb.slice(0, 3)); 

      } catch (error) {
        console.error("Error loading data via server action:", error);
        // Set states to empty arrays or handle error appropriately
        setAllFetchedCourses([]);
        setFeaturedCourses([]);
        setPopularTopics([]);
        setAvailableCategories([]);
        setLearningPaths([]);
      }
      setIsLoadingData(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    setSearchTerm(initialQuery);
    setSelectedCategory(initialCategory);
  }, [initialQuery, initialCategory]);

  useEffect(() => {
    if (isLoadingData) return; 

    let filtered = [...allFetchedCourses];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.categoryNameCache === selectedCategory);
    }

    setDisplayedCourses(filtered);

    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) params.set('query', searchTerm); else params.delete('query');
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory); else params.delete('category');
    
    const newQueryString = params.toString();
    if (newQueryString !== searchParams.toString().replace(/\+/g, '%20')) { 
        router.replace(`/courses/search${newQueryString ? `?${newQueryString}` : ''}`, { scroll: false });
    }
  }, [searchTerm, selectedCategory, allFetchedCourses, router, searchParams, isLoadingData]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const handlePopularTopicClick = (topic: string) => {
    setSelectedCategory(topic);
    setSearchTerm(''); 
  };
  
  if (isLoadingData) { 
      return <SearchPageInitialSkeleton />;
  }

  return (
    <div className="space-y-4 md:space-y-6 pt-0">
      <section className="pb-4 md:pb-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search-input" className="block text-sm font-medium text-muted-foreground mb-1">
              {t.searchKeywordLabel}
            </label>
            <div className="relative">
              <Input
                id="search-input"
                type="text"
                placeholder={t.searchKeywordPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 shadow-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-1">
              {t.filterCategoryLabel}
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-select" className="shadow-sm">
                <SelectValue placeholder={t.allCategories} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
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
          <div className="mt-1 md:mt-3">
            <Button variant="ghost" onClick={handleClearFilters} className="text-sm text-muted-foreground hover:text-foreground h-auto py-1 px-2">
              <X className="mr-1.5 h-4 w-4" /> {t.clearFilters}
            </Button>
          </div>
        )}
      </section>

      {featuredCourses.length > 0 ? (
        <section className="py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
            <Star className="mr-2 h-6 w-6 text-primary fill-primary" /> {t.featuredCourses}
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
      ) : (
        <section className="py-4 md:py-6">
            <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
                <Star className="mr-2 h-6 w-6 text-primary fill-primary" /> {t.featuredCourses}
            </h2>
            <Card>
                <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">{t.noFeaturedCourses}</p>
                </CardContent>
            </Card>
        </section>
      )}
      
      {popularTopics.length > 0 ? (
        <section className="py-4 md:py-6">
          <h2 className="text-lg md:text-xl font-headline font-semibold mb-4 flex items-center">
            <ListFilter className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" /> {t.popularTopics}
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
      ) : (
        <section className="py-4 md:py-6">
           <h2 className="text-lg md:text-xl font-headline font-semibold mb-4 flex items-center">
            <ListFilter className="mr-2 h-5 w-5 md:h-6 md:w-6 text-primary" /> {t.popularTopics}
          </h2>
            <Card>
                <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">{t.noPopularTopics}</p>
                </CardContent>
            </Card>
        </section>
      )}

      <section className="py-4 md:py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-headline font-semibold flex items-center">
            <LayoutGrid className="mr-2 h-6 w-6 text-primary" /> {t.browseCategories}
          </h2>
        </div>
        {availableCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {availableCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center">
              <LayoutGrid className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold">{t.noCategoriesAvailable}</h3>
              <p className="text-sm text-muted-foreground">{t.noCategoriesDesc}</p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="py-4 md:py-6">
         <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 md:mb-6 mt-4 md:mt-8 flex items-center">
            <GraduationCap className="mr-2 h-6 w-6 text-primary" /> {t.availableCourses}
        </h2>
        {displayedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayedCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <Card className="col-span-full">
            <CardContent className="pt-10 pb-10 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.noCoursesFound}</h3>
              <p className="text-muted-foreground">
                {t.noCoursesDesc}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
      
      {learningPaths.length > 0 ? (
        <section className="py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
            <Milestone className="mr-2 h-6 w-6 text-primary" /> {t.exploreLearningPaths}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {learningPaths.map(path => {
                const IconComponent = path.icon && isValidLucideIcon(path.icon) ? LucideIcons[path.icon as keyof typeof LucideIcons] as React.ElementType : Milestone;
                return (
                    <Link key={path.id} href={`/learning-paths/${path.id}`} passHref>
                        <Card className="group h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-150 cursor-pointer overflow-hidden">
                             {path.imageUrl && (
                                <div className="relative w-full aspect-video bg-muted">
                                    <Image src={path.imageUrl} alt={path.title} layout="fill" objectFit="cover" data-ai-hint={path.dataAiHint || 'learning path journey'} />
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
                                <Button variant="link" className="p-0 h-auto text-primary group-hover:text-accent">{t.viewPath} <X className="rotate-45 ml-1 h-4 w-4 transform transition-transform group-hover:translate-x-0.5"/></Button>
                            </CardFooter>
                        </Card>
                    </Link>
                );
            })}
          </div>
        </section>
      ) : (
         <section className="py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-headline font-semibold mb-4 flex items-center">
            <Milestone className="mr-2 h-6 w-6 text-primary" /> {t.exploreLearningPaths}
          </h2>
          <Card>
            <CardContent className="pt-6 text-center">
                <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-lg font-semibold">{t.noLearningPaths}</h3>
                <p className="text-sm text-muted-foreground">{t.noLearningPathsDesc}</p>
            </CardContent>
          </Card>
        </section>
      )}

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
