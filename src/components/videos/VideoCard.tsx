
import type { Video } from '@/lib/dbUtils';
import Image from 'next/image';
import { PlayCircle, AlertTriangle } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  // Top-level check for critical video data
  if (!video || !video.id || typeof video.embedUrl !== 'string') {
    console.warn('VideoCard: Invalid or incomplete video data received.', video);
    return (
      <div className="bg-black rounded-lg shadow-xl w-[360px] h-[460px] mx-auto flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
        <p className="text-sm text-center">Video data is unavailable or invalid.</p>
      </div>
    );
  }

  const embeddableUrl = getEmbedUrl(video.embedUrl);

  // Sanitize string properties with fallbacks and log warnings if data is not as expected
  const title = typeof video.title === 'string' ? video.title : "Untitled Video";
  if (typeof video.title !== 'string') {
    console.warn(`VideoCard (ID: ${video.id}): video.title is not a string. Received:`, video.title);
  }

  const description = typeof video.description === 'string' ? video.description : "No description available.";
  if (typeof video.description !== 'string') {
    console.warn(`VideoCard (ID: ${video.id}): video.description is not a string. Received:`, video.description);
  }
  
  const thumbnailUrl = typeof video.thumbnailUrl === 'string' ? video.thumbnailUrl : null;
  if (video.thumbnailUrl !== null && typeof video.thumbnailUrl !== 'string' && typeof video.thumbnailUrl !== 'undefined') {
     console.warn(`VideoCard (ID: ${video.id}): video.thumbnailUrl is not a string or null/undefined. Received:`, video.thumbnailUrl);
  }

  const aiHint = typeof video.dataAiHint === 'string' 
    ? video.dataAiHint 
    : (video.dataAiHint === null || typeof video.dataAiHint === 'undefined' 
      ? 'video content' 
      : String(video.dataAiHint)); // Fallback for non-string, non-null/undefined dataAiHint
  if (video.dataAiHint !== null && typeof video.dataAiHint !== 'string' && typeof video.dataAiHint !== 'undefined') {
     console.warn(`VideoCard (ID: ${video.id}): video.dataAiHint is not a string or null/undefined. Received:`, video.dataAiHint);
  }


  const containerClasses = "bg-black rounded-lg shadow-xl overflow-hidden w-[360px] h-[460px] mx-auto flex flex-col items-center justify-center relative";

  if (embeddableUrl) {
    return (
      <div className={containerClasses}>
        <iframe
          src={embeddableUrl}
          title={title} // Uses sanitized title
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
          loading="lazy" // Add lazy loading for iframes
        ></iframe>
      </div>
    );
  }

  // Fallback display if embeddableUrl is null (e.g., invalid original URL or processed as null)
  return (
    <div className={`${containerClasses} text-white`}>
      {thumbnailUrl ? (
        <Image
            src={thumbnailUrl}
            alt={title} // Uses sanitized title
            layout="fill"
            objectFit="cover"
            className="opacity-70"
            data-ai-hint={aiHint} // Uses sanitized aiHint
            priority={false} // No priority for fallback images in a list
            onError={(e) => {
              // Target is available on SyntheticEvent<HTMLImageElement, Event>
              const target = e.target as HTMLImageElement; 
              console.warn(`VideoCard (ID: ${video.id}): Failed to load image from ${target.src}.`);
              target.style.display = 'none'; // Hide broken image icon
            }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <PlayCircle size={48} className="text-primary/50" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>
      <div className="z-10 p-4 md:p-6 text-center absolute bottom-5 sm:bottom-8 left-3 right-3 sm:left-5 sm:right-5">
        <h3 className="text-lg sm:text-xl md:text-2xl font-headline mb-1 sm:mb-2 drop-shadow-md line-clamp-2">{title}</h3>
        <p className="text-xs sm:text-sm md:text-base opacity-80 mb-2 sm:mb-4 drop-shadow-sm line-clamp-2 sm:line-clamp-3">{description}</p>
        <div
          aria-label={`Play video ${title}`}
          className="bg-primary/80 text-primary-foreground rounded-full p-2 sm:p-3 inline-block cursor-pointer hover:bg-primary transition-colors"
        >
          <PlayCircle size={28} className="sm:h-8 sm:w-8" />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

