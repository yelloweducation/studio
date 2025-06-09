
"use client";
import { useParams } from 'next/navigation';
import { courses as allCourses, type Course, type Lesson, type Module } from '@/data/mockData';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlayCircle, BookOpen, Video, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function getEmbedUrl(url: string | undefined | null): string | null {
  // Check if the URL is null, undefined, or an empty string.
  if (!url || typeof url !== 'string') return null;

  // Basic check: if it doesn't start with http, it's unlikely to be a valid embeddable URL.
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // console.warn(`Provided embedUrl does not start with http(s): ${url}`); // Optional: for debugging
    return null;
  }

  try {
    const urlObj = new URL(url);

    // Handle YouTube URLs
    if (urlObj.hostname === 'www.youtube.com' && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Handle Google Drive URLs
    if (urlObj.hostname === 'drive.google.com') {
      if (urlObj.pathname.includes('/preview')) {
        return url;
      }
      let fileId: string | null = null;
      if (urlObj.pathname.startsWith('/file/d/')) {
        const parts = urlObj.pathname.split('/');
        if (parts.length > 3) fileId = parts[3];
      } else if (urlObj.searchParams.has('id')) {
        fileId = urlObj.searchParams.get('id');
      }

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return null;
    }
  } catch (error) {
    console.error("Error parsing embed URL (url might be malformed even after basic checks):", url, error);
    return null;
  }
  // Fallback for other valid URLs that might be directly embeddable
  return url;
}


export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    // This effect loads the list of available courses.
    setIsLoading(true);
    const storedCourses = localStorage.getItem('adminCourses');
    let coursesToUse = allCourses;
    if (storedCourses) {
      try {
        const parsedCourses = JSON.parse(storedCourses) as Course[];
        if (parsedCourses.length > 0) {
          coursesToUse = parsedCourses;
        }
      } catch (e) {
        console.error("Failed to parse courses from localStorage on detail page", e);
        // Fallback to allCourses is already default
      }
    }
    setActiveCourses(coursesToUse);
    // setIsLoading(false) will be handled in the next effect after course finding attempt
  }, []);

  useEffect(() => {
    // This effect runs when courseId changes or when activeCourses list is populated/updated.
    if (!courseId) {
      setCourse(null);
      setIsLoading(false);
      return;
    }
    
    if (activeCourses.length > 0) {
        const foundCourse = activeCourses.find(c => c.id === courseId);
        setCourse(foundCourse || null);
    } else {
        // If activeCourses is empty (e.g. initial load or error), set course to null
        setCourse(null);
    }
    setIsLoading(false); // Set loading to false after attempting to find the course
    
  }, [courseId, activeCourses]);

  if (isLoading) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold text-foreground">Loading course details...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

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
    <ProtectedRoute>
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
              {course.modules && course.modules.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {course.modules.map(module => (
                    <AccordionItem value={`module-${module.id}`} key={module.id} className="border-b">
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                        {module.title}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-0">
                        {module.lessons && module.lessons.length > 0 ? (
                          <ul className="space-y-4 pl-2">
                            {module.lessons.map(lesson => {
                              const embeddableUrl = getEmbedUrl(lesson.embedUrl);
                              return (
                                <li key={lesson.id} className="p-4 border rounded-md bg-card hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium text-md flex items-center">
                                      {embeddableUrl ? <Video className="mr-2 h-5 w-5 text-accent"/> : <FileText className="mr-2 h-5 w-5 text-accent"/>}
                                      {lesson.title}
                                    </h4>
                                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{lesson.duration}</span>
                                  </div>
                                  {lesson.description && (
                                    <p className="text-sm text-muted-foreground mb-3">{lesson.description}</p>
                                  )}
                                  {lesson.embedUrl && embeddableUrl && (
                                    <div className="aspect-video rounded-md overflow-hidden border">
                                      <iframe
                                        src={embeddableUrl || ''} 
                                        title={lesson.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="w-full h-full"
                                      ></iframe>
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                           <p className="text-sm text-muted-foreground px-4 py-2">No lessons in this module yet.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
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

