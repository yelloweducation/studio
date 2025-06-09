import type { Video } from '@/data/mockData';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <div className="bg-black rounded-lg shadow-xl overflow-hidden w-full h-full flex flex-col items-center justify-center relative text-white snap-center shrink-0">
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
      <div className="z-10 p-4 text-center absolute bottom-5 left-5 right-5">
        <h3 className="text-xl font-headline mb-2">{video.title}</h3>
        <p className="text-sm opacity-80 mb-4">{video.description}</p>
        <button className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-full p-3 transition-colors">
          <PlayCircle size={32} />
        </button>
      </div>
    </div>
  );
};

export default VideoCard;
