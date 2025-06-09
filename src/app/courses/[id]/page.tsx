
"use client";
import { useParams } from 'next/navigation';
import { courses as allCourses, type Course, type Lesson, type Module } from '@/data/mockData';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlayCircle, BookOpen, Video, FileText } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; 
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  try {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('drive.google.com/')) {
      if (url.includes('/preview')) return url;
      if (url.includes('/file/d/')) {
        let previewUrl = url.replace('/file/d/', '/preview/');
        previewUrl = previewUrl.split('/view')[0];
        return previewUrl;
      }
      if (url.includes('/open?id=')) {
        let previewUrl = url.replace('/open?id=', '/preview/');
        return previewUrl;
      }
    }
  } catch (error) {
    console.error("Error parsing embed URL:", error);
    return url; // Fallback to original URL on error
  }
  return url;
}


export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]); // Initialize empty


  useEffect(() => {
    const storedCourses = localStorage.getItem('adminCourses');
    if (storedCourses) {
      try {
        const parsedCourses = JSON.parse(storedCourses) as Course[];
        setActiveCourses(parsedCourses); // Use courses from localStorage if they exist
      } catch (e) {
        console.error("Failed to parse courses from localStorage on detail page", e);
        setActiveCourses(allCourses); // Fallback to mockData on error
      }
    } else {
      setActiveCourses(allCourses); // Fallback if not in localStorage
    }
  }, []); // Runs once on mount


  useEffect(() => {
    if (courseId && activeCourses.length > 0) {
      const foundCourse = activeCourses.find(c => c.id === courseId);
      setCourse(foundCourse || null);
    } else if (courseId && activeCourses.length === 0) {
      // This case handles when activeCourses is empty (e.g., localStorage was empty or mockData was empty)
      setCourse(null);
    }
    // If courseId is not present, course remains null.
  }, [courseId, activeCourses]);

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
