
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

function getEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  try {
    // Attempt to construct a URL object. If it fails, it's not a valid URL.
    const urlObj = new URL(url);

    if (urlObj.hostname === 'www.youtube.com' && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1); // Remove leading '/'
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (urlObj.hostname === 'drive.google.com') {
      if (urlObj.pathname.includes('/preview')) {
        return url; // Already a preview URL
      }
      let fileId: string | null = null;
      // For links like /file/d/FILE_ID/view or /file/d/FILE_ID
      if (urlObj.pathname.startsWith('/file/d/')) {
        fileId = urlObj.pathname.split('/')[3]; // e.g., /file/d/FILE_ID/view -> FILE_ID is at index 3
      } else if (urlObj.searchParams.has('id')) { // For links like /open?id=FILE_ID or /uc?id=FILE_ID&export=view
        fileId = urlObj.searchParams.get('id');
      }

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
  } catch (error) {
    console.error("Error parsing embed URL, or URL is not standard:", error);
    // If URL parsing fails (e.g., not a full valid URL for the URL constructor)
    // or if it's a non-standard URL we don't specifically handle,
    // return null to avoid passing an invalid URL to the iframe.
    return null;
  }
  // If no specific rule matches but URL was valid for constructor, return the original URL.
  return url;
}


export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const storedCourses = localStorage.getItem('adminCourses');
    if (storedCourses) {
      try {
        const parsedCourses = JSON.parse(storedCourses) as Course[];
        setActiveCourses(parsedCourses);
      } catch (e) {
        console.error("Failed to parse courses from localStorage on detail page", e);
        setActiveCourses(allCourses);
      }
    } else {
      setActiveCourses(allCourses);
    }
  }, []);

  useEffect(() => {
    if (!courseId) {
      setCourse(null);
      setIsLoading(false);
      return;
    }
    
    // This effect depends on activeCourses. It will run when activeCourses is populated.
    // Ensure activeCourses has data before trying to find.
    if (activeCourses.length > 0) {
        const foundCourse = activeCourses.find(c => c.id === courseId);
        setCourse(foundCourse || null);
    } else if (!localStorage.getItem('adminCourses')) {
        // If activeCourses is empty AND there was nothing in localStorage
        // (meaning the first effect set it to allCourses, which might be empty or not have the ID)
        // we might still be waiting for the first effect to correctly populate from allCourses if localStorage was empty.
        // However, the dependency on activeCourses should handle this.
        // If activeCourses is empty because localStorage parse failed and allCourses is also empty, then it's truly not found.
    }
    // Always set loading to false after attempting to find, once activeCourses is available.
    // This check ensures we don't set loading to false prematurely if activeCourses isn't populated yet.
    if (activeCourses.length > 0 || !localStorage.getItem('adminCourses')) {
        setIsLoading(false);
    }
    
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
                            {module.lessons.map(lesson => (
                              <li key={lesson.id} className="p-4 border rounded-md bg-card hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium text-md flex items-center">
                                    {lesson.embedUrl ? <Video className="mr-2 h-5 w-5 text-accent"/> : <FileText className="mr-2 h-5 w-5 text-accent"/>}
                                    {lesson.title}
                                  </h4>
                                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{lesson.duration}</span>
                                </div>
                                {lesson.description && (
                                  <p className="text-sm text-muted-foreground mb-3">{lesson.description}</p>
                                )}
                                {lesson.embedUrl && (
                                  <div className="aspect-video rounded-md overflow-hidden border">
                                    <iframe
                                      src={getEmbedUrl(lesson.embedUrl) || ''}
                                      title={lesson.title}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                      className="w-full h-full"
                                    ></iframe>
                                  </div>
                                )}
                              </li>
                            ))}
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
