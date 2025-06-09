
"use client";
import { useState, type FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/courses/CourseCard';
import VideoCard from '@/components/videos/VideoCard';
import { courses as allCourses, videos as allVideos, type Course, type Video } from '@/data/mockData';
import { Search, Video as VideoIcon, XCircle } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [activeSection, setActiveSection] = useState<'search' | 'videos' | 'none'>('none');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setDisplayedCourses([]);
      setShowResults(true); // Show that search was performed, but no results for empty query
      setActiveSection('search');
      return;
    }
    const filteredCourses = allCourses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setDisplayedCourses(filteredCourses);
    setActiveSection('search');
    setShowResults(true);
  };

  const handleShowVideos = () => {
    setActiveSection('videos');
    setShowResults(false); // Ensure search results are hidden if videos are shown
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setDisplayedCourses([]);
    setShowResults(false);
    setActiveSection('none');
  };

  // For subtle transitions
  const [animationClass, setAnimationClass] = useState('animate-fade-in');

  useEffect(() => {
    setAnimationClass(''); // Clear previous animation class
    const timer = setTimeout(() => setAnimationClass('animate-fade-in'), 50); // Apply new animation class
    return () => clearTimeout(timer);
  }, [activeSection, showResults]);


  return (
    <div className="flex flex-col items-center py-8">
      <section className="w-full max-w-2xl text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary">Welcome to LuminaLearn</h1>
        <p className="text-lg text-foreground/80 mb-8">
          Discover a world of knowledge. Search for courses or explore trending videos.
        </p>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search for courses (e.g., Web Development)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base pr-10"
            />
            {searchQuery && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={clearSearch}
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150">
            <Search className="mr-2 h-5 w-5" /> Search
          </Button>
        </form>
        <Button onClick={handleShowVideos} variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <VideoIcon className="mr-2 h-5 w-5" /> View Videos
        </Button>
      </section>

      {activeSection === 'search' && showResults && (
        <section className={`w-full ${animationClass}`}>
          <h2 className="text-3xl font-headline font-semibold mb-6 text-center">Course Results</h2>
          {displayedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "No courses found matching your query." : "Enter a search term to find courses."}
            </p>
          )}
        </section>
      )}

      {activeSection === 'videos' && (
         <section className={`w-full max-w-md mx-auto ${animationClass}`}>
          <h2 className="text-3xl font-headline font-semibold mb-6 text-center">Trending Videos</h2>
          <div className="h-[600px] md:h-[700px] overflow-y-auto snap-y snap-mandatory space-y-4 rounded-lg p-2 bg-card shadow-inner">
            {allVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
