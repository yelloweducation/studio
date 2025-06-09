
import type { Video } from '@/data/mockData';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <div className="bg-black rounded-lg shadow-xl overflow-hidden w-full h-full flex flex-col items-center justify-center relative text-white">
      {video.thumbnailUrl && (
        <Image 
            src={video.thumbnailUrl} 
            alt={video.title} 
            layout="fill" 
            objectFit="cover" 
            className="opacity-70"
            data-ai-hint={video.dataAiHint || 'video content'}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>
      <div className="z-10 p-6 text-center absolute bottom-8 left-5 right-5">
        <h3 className="text-xl md:text-2xl font-headline mb-2 drop-shadow-md">{video.title}</h3>
        <p className="text-sm md:text-base opacity-80 mb-4 drop-shadow-sm">{video.description}</p>
        <button 
          aria-label={`Play video ${video.title}`}
          className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-full p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
        >
          <PlayCircle size={32} />
        </button>
      </div>
    </div>
  );
};

export default VideoCard;
