
"use client";
import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Video as VideoIcon, XCircle, Tv, Loader2 } from 'lucide-react';
import VideoCard from '@/components/videos/VideoCard';
import { videos as mockVideos, type Video } from '@/data/mockData';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  useEffect(() => {
    setIsLoadingVideos(true);
    let videosToDisplay: Video[] = [];
    const storedVideosString = localStorage.getItem('adminVideos');

    if (storedVideosString !== null) {
      try {
        const parsedVideos = JSON.parse(storedVideosString) as Video[];
        if (Array.isArray(parsedVideos)) {
          videosToDisplay = parsedVideos;
        } else {
          console.error("Stored 'adminVideos' in localStorage is not an array for homepage. Using mock videos.", parsedVideos);
          videosToDisplay = mockVideos;
        }
      } catch (e) {
        console.error("Failed to parse 'adminVideos' from localStorage for homepage. Using mock videos.", e);
        videosToDisplay = mockVideos;
      }
    } else {
      videosToDisplay = mockVideos;
    }

    setTrendingVideos(videosToDisplay.slice(0, 3)); // Show first 3 videos as trending
    setIsLoadingVideos(false);
  }, []);


  const performSearch = () => {
    if (!searchQuery.trim()) {
      router.push(`/courses/search`); 
      return;
    }
    router.push(`/courses/search?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleShowVideos = () => {
    router.push('/videos');
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col items-center py-8">
      <section className="w-full max-w-2xl text-center mb-12">
        <div className="mb-8 flex justify-center">
          <Image
            src="https://placehold.co/350x350.png"
            alt="Engaged Student Learning - Yellow Institute"
            width={350}
            height={350}
            className="rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
            data-ai-hint="student learning 3d"
            priority
          />
        </div>
        
        <form onSubmit={handleFormSubmit} className="w-full mb-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search for courses (e.g., Web Development)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm md:text-base pr-10"
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
        </form>
        
        <div className="flex gap-2 w-full">
          <Button 
            type="button" 
            onClick={performSearch} 
            className="flex-1"
          >
            <Search className="mr-2 h-5 w-5" /> Search Courses
          </Button>
          <Button 
            onClick={handleShowVideos} 
            variant="default"
            className="flex-1"
          >
            <VideoIcon className="mr-2 h-5 w-5" /> View All Videos
          </Button>
        </div>
      </section>

      <section className="w-full max-w-4xl mt-12 md:mt-16">
        <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-6 flex items-center">
          <Tv className="mr-3 h-7 w-7 text-primary" /> Trending Videos
        </h2>
        {isLoadingVideos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-muted rounded-lg animate-pulse flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin"/>
              </div>
            ))}
          </div>
        ) : trendingVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingVideos.map(video => (
              <div key={video.id} className="aspect-[9/16] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No trending videos available right now.</p>
        )}
      </section>
    </div>
  );
}
