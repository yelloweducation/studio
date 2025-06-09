
"use client";
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
            className="flex-1" // Changed: Removed custom accent styles, will use default primary style
          >
            <Search className="mr-2 h-5 w-5" /> Search Courses
          </Button>
          <Button 
            onClick={handleShowVideos} 
            variant="default"
            className="flex-1"
          >
            <VideoIcon className="mr-2 h-5 w-5" /> View Videos
          </Button>
        </div>
      </section>
    </div>
  );
}
