
"use client";
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Video as VideoIcon, XCircle } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary">Welcome to Yellow Institute</h1>
        <p className="text-lg text-foreground/80 mb-8">
          Discover a world of knowledge. Search for courses or explore trending videos.
        </p>
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
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 shadow-3d-accent hover:shadow-3d-accent-hover active:shadow-none active:translate-y-px active:translate-x-px transition-all duration-150"
          >
            <Search className="mr-2 h-5 w-5" /> Search Courses
          </Button>
          <Button 
            onClick={handleShowVideos} 
            variant="outline" 
            className="flex-1 border-primary text-primary hover:bg-primary/10"
          >
            <VideoIcon className="mr-2 h-5 w-5" /> View Videos
          </Button>
        </div>
      </section>
    </div>
  );
}
