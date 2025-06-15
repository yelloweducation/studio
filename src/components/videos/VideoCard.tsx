
import type { Video } from '@/lib/dbUtils';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  const embeddableUrl = getEmbedUrl(video.embedUrl);

  // Defensive checks for string properties
  const title = typeof video.title === 'string' ? video.title : "Video Title Unavailable";
  const description = typeof video.description === 'string' ? video.description : "No description available.";
  const aiHint = typeof video.dataAiHint === 'string' ? video.dataAiHint : 'video content';
  const thumbnailUrl = video.thumbnailUrl;

  if (typeof video.title !== 'string') {
    console.warn(`VideoCard: video.title is not a string for video ID ${video.id}. Received:`, video.title);
  }
  if (typeof video.description !== 'string') {
    console.warn(`VideoCard: video.description is not a string for video ID ${video.id}. Received:`, video.description);
  }
  if (video.dataAiHint !== null && typeof video.dataAiHint !== 'string') {
    console.warn(`VideoCard: video.dataAiHint is not a string or null for video ID ${video.id}. Received:`, video.dataAiHint);
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

  return (
    <div className={`${containerClasses} text-white`}>
      {thumbnailUrl && (
        <Image
            src={thumbnailUrl}
            alt={title} // Uses sanitized title
            layout="fill"
            objectFit="cover"
            className="opacity-70"
            data-ai-hint={aiHint} // Uses sanitized aiHint
            onError={(e) => {
              console.warn(`Failed to load image for video "${title}": ${thumbnailUrl}`, e);
            }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>
      <div className="z-10 p-4 md:p-6 text-center absolute bottom-5 sm:bottom-8 left-3 right-3 sm:left-5 sm:right-5">
        <h3 className="text-lg sm:text-xl md:text-2xl font-headline mb-1 sm:mb-2 drop-shadow-md line-clamp-2">{title}</h3> {/* Uses sanitized title */}
        <p className="text-xs sm:text-sm md:text-base opacity-80 mb-2 sm:mb-4 drop-shadow-sm line-clamp-2 sm:line-clamp-3">{description}</p> {/* Uses sanitized description */}
        <div
          aria-label={`Play video ${title}`} // Uses sanitized title
          className="bg-primary/80 text-primary-foreground rounded-full p-2 sm:p-3 inline-block"
        >
          <PlayCircle size={28} className="sm:h-8 sm:w-8" />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
