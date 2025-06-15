
import type { Video } from '@/lib/dbUtils';
import Image from 'next/image';
import { PlayCircle, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { getEmbedUrl } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  // Ensure video and embedUrl are valid before processing
  if (!video || typeof video.embedUrl !== 'string') {
    console.warn('VideoCard: Invalid video data or missing embedUrl.', video);
    return (
      <div className="bg-black rounded-lg shadow-xl w-[360px] h-[460px] mx-auto flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
        <p className="text-sm text-center">Video data is unavailable or invalid.</p>
      </div>
    );
  }

  const embeddableUrl = getEmbedUrl(video.embedUrl);

  // Sanitize string properties with fallbacks
  const title = typeof video.title === 'string' ? video.title : "Untitled Video";
  const description = typeof video.description === 'string' ? video.description : "No description available.";
  const aiHint = typeof video.dataAiHint === 'string' ? video.dataAiHint : (typeof video.dataAiHint === 'undefined' || video.dataAiHint === null) ? 'video content' : String(video.dataAiHint);
  const thumbnailUrl = typeof video.thumbnailUrl === 'string' ? video.thumbnailUrl : null;

  if (typeof video.title !== 'string') {
    console.warn(`VideoCard: video.title is not a string for video ID ${video.id}. Received:`, video.title, ". Using fallback.");
  }
  if (typeof video.description !== 'string') {
    console.warn(`VideoCard: video.description is not a string for video ID ${video.id}. Received:`, video.description, ". Using fallback.");
  }
  if (video.dataAiHint !== null && typeof video.dataAiHint !== 'string' && typeof video.dataAiHint !== 'undefined') {
    console.warn(`VideoCard: video.dataAiHint is not a string or null/undefined for video ID ${video.id}. Received:`, video.dataAiHint, ". Using fallback or stringified value.");
  }
   if (video.thumbnailUrl !== null && typeof video.thumbnailUrl !== 'string' && typeof video.thumbnailUrl !== 'undefined') {
    console.warn(`VideoCard: video.thumbnailUrl is not a string or null/undefined for video ID ${video.id}. Received:`, video.thumbnailUrl, ". Clearing it.");
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
        ></iframe>
      </div>
    );
  }

  // Fallback display if embeddableUrl is null (e.g., invalid original URL)
  return (
    <div className={`${containerClasses} text-white`}>
      {thumbnailUrl ? (
        <Image
            src={thumbnailUrl}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="opacity-70"
            data-ai-hint={aiHint}
            onError={(e) => {
              console.warn(`Failed to load image for video "${title}": ${thumbnailUrl}`, e);
              // Optionally, set a state to hide the image or show a placeholder
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
          // onClick could be added here if this fallback itself should be interactive
        >
          <PlayCircle size={28} className="sm:h-8 sm:w-8" />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
