import type { Video } from '@/lib/dbUtils'; 
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  const embeddableUrl = getEmbedUrl(video.embedUrl);
  const title = video.title; 
  const description = video.description || ""; 
  const thumbnailUrl = video.thumbnailUrl; 

  const containerClasses = "bg-black rounded-lg shadow-xl overflow-hidden w-full max-w-full sm:max-w-md mx-auto aspect-[9/16] max-h-[calc(100vh-theme(spacing.14)-env(safe-area-inset-bottom,0px))] h-auto flex flex-col items-center justify-center relative";


  if (embeddableUrl) {
    return (
      <div className={containerClasses}>
        <iframe
          src={embeddableUrl} 
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        ></iframe>
      </div>
    );
  }

  return (
    <div className={`${containerClasses} text-white`}>
      {thumbnailUrl && ( 
        <Image
            src={thumbnailUrl}
            alt={title} 
            layout="fill"
            objectFit="cover"
            className="opacity-70"
            data-ai-hint={video.dataAiHint || 'video placeholder'}
            onError={(e) => { 
              console.warn(`Failed to load image for video "${title}": ${thumbnailUrl}`, e);
            }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>
      <div className="z-10 p-4 md:p-6 text-center absolute bottom-5 sm:bottom-8 left-3 right-3 sm:left-5 sm:right-5">
        <h3 className="text-lg sm:text-xl md:text-2xl font-headline mb-1 sm:mb-2 drop-shadow-md line-clamp-2">{title}</h3>
        <p className="text-xs sm:text-sm md:text-base opacity-80 mb-2 sm:mb-4 drop-shadow-sm line-clamp-2 sm:line-clamp-3">{description}</p>
        <div
          aria-label={`Play video ${title}`}
          className="bg-primary/80 text-primary-foreground rounded-full p-2 sm:p-3 inline-block" 
        >
          <PlayCircle size={28} className="sm:h-8 sm:w-8" />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;