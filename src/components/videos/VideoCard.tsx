
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

  // Apply fixed width and height, centered horizontally.
  // Removed aspect-[9/16], max-h, and max-w-full.
  // Added fixed w-[360px] and h-[460px]. mx-auto remains for centering on wider screens.
  const containerClasses = "bg-black rounded-lg shadow-xl overflow-hidden w-[360px] h-[460px] mx-auto flex flex-col items-center justify-center relative";


  if (embeddableUrl) {
    return (
      <div className={containerClasses}>
        <iframe
          src={embeddableUrl} 
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0" // iframe will fill the 360x460 container
        ></iframe>
      </div>
    );
  }

  // Fallback if no embeddable URL (e.g., direct video link or placeholder)
  return (
    <div className={`${containerClasses} text-white`}>
      {thumbnailUrl && ( 
        <Image
            src={thumbnailUrl}
            alt={title} 
            layout="fill" // Image will fill the 360x460 container
            objectFit="cover" // Maintain aspect ratio and cover, might crop
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

    