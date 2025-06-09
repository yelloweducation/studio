
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ImageIcon, Save } from 'lucide-react'; // Removed Edit3 as it's not directly used here
import { useToast } from '@/hooks/use-toast';
import { courses as initialCourses, type Course } from '@/data/mockData';
import { videos as initialVideos, type Video } from '@/data/mockData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

// Removed HERO_IMAGE_STORAGE_KEY, DEFAULT_HERO_IMAGE_URL, DEFAULT_HERO_AI_HINT
// Removed HeroImageData type

export default function ImageManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  // Removed heroImage, editableHeroImageUrl, editableHeroAiHint states
  
  const [isCoursesLoaded, setIsCoursesLoaded] = useState(false);
  const [isVideosLoaded, setIsVideosLoaded] = useState(false);
  // Removed isHeroImageLoaded state

  const { toast } = useToast();

  // Removed useEffect for loading Hero Image
  // Removed handleSaveHeroImage function

  // Load Courses
  useEffect(() => {
    const storedCourses = localStorage.getItem('adminCourses');
    if (storedCourses) {
      try {
        setCourses(JSON.parse(storedCourses) as Course[]);
      } catch (e) {
        console.error("Failed to parse courses from localStorage for image management", e);
        setCourses(initialCourses);
      }
    } else {
      setCourses(initialCourses);
    }
    setIsCoursesLoaded(true);
  }, []);

  // Load Videos
  useEffect(() => {
    const storedVideos = localStorage.getItem('adminVideos');
    if (storedVideos) {
      try {
        setVideos(JSON.parse(storedVideos) as Video[]);
      } catch (e) {
        console.error("Failed to parse videos from localStorage for image management", e);
        setVideos(initialVideos);
      }
    } else {
      setVideos(initialVideos);
    }
    setIsVideosLoaded(true);
  }, []);

  const handleCourseImageChange = (courseId: string, field: 'imageUrl' | 'dataAiHint', value: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, [field]: value } : c));
  };

  const handleSaveCourseImage = (courseId: string) => {
    const courseToSave = courses.find(c => c.id === courseId);
    if (courseToSave) {
      const currentStoredCourses = localStorage.getItem('adminCourses');
      let allCourses: Course[] = [];
      if (currentStoredCourses) {
        try {
          allCourses = JSON.parse(currentStoredCourses);
        } catch (e) { allCourses = initialCourses; }
      } else {
        allCourses = initialCourses;
      }
      const updatedCourses = allCourses.map(c => c.id === courseId ? courseToSave : c);
      localStorage.setItem('adminCourses', JSON.stringify(updatedCourses));
      toast({ title: "Course Image Updated", description: `Image details for "${courseToSave.title}" saved.` });
    }
  };
  
  const handleVideoThumbnailChange = (videoId: string, field: 'thumbnailUrl' | 'dataAiHint', value: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, [field]: value } : v));
  };

  const handleSaveVideoThumbnail = (videoId: string) => {
    const videoToSave = videos.find(v => v.id === videoId);
    if (videoToSave) {
      const currentStoredVideos = localStorage.getItem('adminVideos');
      let allVideos: Video[] = [];
       if (currentStoredVideos) {
        try {
          allVideos = JSON.parse(currentStoredVideos);
        } catch (e) { allVideos = initialVideos; }
      } else {
        allVideos = initialVideos;
      }
      const updatedVideos = allVideos.map(v => v.id === videoId ? videoToSave : v);
      localStorage.setItem('adminVideos', JSON.stringify(updatedVideos));
      toast({ title: "Video Thumbnail Updated", description: `Thumbnail for "${videoToSave.title}" saved.` });
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <ImageIcon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Image Management
        </CardTitle>
        <CardDescription>Manage image URLs and AI hints for various parts of the application.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] pr-3">
          <div className="space-y-8">
            {/* Homepage Hero Image section removed */}

            {/* Course Images */}
            <section>
              <h3 className="text-xl font-semibold mb-4 font-headline">Course Images</h3>
              {isCoursesLoaded && courses.length > 0 ? (
                <div className="space-y-6">
                  {courses.map(course => (
                    <Card key={course.id}>
                      <form onSubmit={(e) => { e.preventDefault(); handleSaveCourseImage(course.id); }}>
                        <CardHeader>
                          <CardTitle className="text-md font-semibold">{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                             <div className="w-full sm:w-1/3 flex-shrink-0">
                                <Label htmlFor={`courseImageUrl-${course.id}`}>Current Image</Label>
                                <div className="mt-1 aspect-video w-full relative border rounded-md overflow-hidden bg-muted">
                                {(course.imageUrl || 'https://placehold.co/600x400.png') && (
                                    <Image src={course.imageUrl || 'https://placehold.co/600x400.png'} alt={course.title} layout="fill" objectFit="cover" key={course.imageUrl}/>
                                )}
                                </div>
                            </div>
                            <div className="w-full sm:w-2/3 space-y-4">
                                <div>
                                    <Label htmlFor={`courseImageUrl-${course.id}`}>Image URL</Label>
                                    <Input 
                                        id={`courseImageUrl-${course.id}`} 
                                        value={course.imageUrl || ''} 
                                        onChange={e => handleCourseImageChange(course.id, 'imageUrl', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`courseAiHint-${course.id}`}>AI Hint</Label>
                                    <Input 
                                        id={`courseAiHint-${course.id}`} 
                                        value={course.dataAiHint || ''} 
                                        onChange={e => handleCourseImageChange(course.id, 'dataAiHint', e.target.value)} 
                                        placeholder="e.g. education programming"
                                    />
                                </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button type="submit" size="sm">
                            <Save className="mr-2 h-4 w-4"/> Save Course Image
                          </Button>
                        </CardFooter>
                      </form>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{isCoursesLoaded ? 'No courses found. Add courses in "Manage Courses" tab.' : 'Loading courses...'}</p>
              )}
            </section>

            {/* Video Thumbnails */}
            <section>
              <h3 className="text-xl font-semibold mb-4 font-headline">Video Thumbnails</h3>
              {isVideosLoaded && videos.length > 0 ? (
                <div className="space-y-6">
                  {videos.map(video => (
                    <Card key={video.id}>
                      <form onSubmit={(e) => {e.preventDefault(); handleSaveVideoThumbnail(video.id);}}>
                        <CardHeader>
                          <CardTitle className="text-md font-semibold">{video.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-full sm:w-1/3 flex-shrink-0">
                                <Label htmlFor={`videoThumbnailUrl-${video.id}`}>Current Thumbnail</Label>
                                <div className="mt-1 aspect-[9/16] w-full max-w-[150px] sm:max-w-full relative border rounded-md overflow-hidden bg-muted">
                                {(video.thumbnailUrl || 'https://placehold.co/360x640.png') && (
                                    <Image src={video.thumbnailUrl || 'https://placehold.co/360x640.png'} alt={video.title} layout="fill" objectFit="cover" key={video.thumbnailUrl}/>
                                )}
                                </div>
                            </div>
                             <div className="w-full sm:w-2/3 space-y-4">
                                <div>
                                    <Label htmlFor={`videoThumbnailUrl-${video.id}`}>Thumbnail URL</Label>
                                    <Input 
                                        id={`videoThumbnailUrl-${video.id}`} 
                                        value={video.thumbnailUrl || ''} 
                                        onChange={e => handleVideoThumbnailChange(video.id, 'thumbnailUrl', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`videoAiHint-${video.id}`}>AI Hint</Label>
                                    <Input 
                                        id={`videoAiHint-${video.id}`} 
                                        value={video.dataAiHint || ''} 
                                        onChange={e => handleVideoThumbnailChange(video.id, 'dataAiHint', e.target.value)} 
                                        placeholder="e.g. tech tutorial"
                                    />
                                </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button type="submit" size="sm">
                            <Save className="mr-2 h-4 w-4"/> Save Video Thumbnail
                          </Button>
                        </CardFooter>
                      </form>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{isVideosLoaded ? 'No videos found. Add videos in "Manage Videos" tab.' : 'Loading videos...'}</p>
              )}
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
