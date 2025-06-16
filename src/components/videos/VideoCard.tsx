
"use client";
import React, { useState, useEffect } from 'react';
import type { Video } from '@/lib/dbUtils';
import Image from 'next/image';
import { getEmbedUrl } from '@/lib/utils';
import { AlertTriangle, PlayCircle } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);

  const title = typeof video.title === 'string' ? video.title : 'Untitled Video';
  const description = typeof video.description === 'string' ? video.description : 'No description available.';
  const thumbnailUrl = typeof video.thumbnailUrl === 'string' ? video.thumbnailUrl : null;
  const dataAiHintVal = typeof video.dataAiHint === 'string' ? video.dataAiHint : 'video content';

  useEffect(() => {
    if (typeof video.embedUrl === 'string') {
      setEmbedSrc(getEmbedUrl(video.embedUrl));
    } else {
      setEmbedSrc(null);
      if (video.embedUrl) {
        console.warn(`[VideoCard] embedUrl for video "${title}" is not a string:`, video.embedUrl);
      }
    }
  }, [video.embedUrl, title]);

  // Container for the card itself, centered by its parent in VideosClient.tsx
  // It has a max-width and a specific aspect ratio to mimic reels.
  // bg-black provides the "black layer" background.
  const cardContainerClasses = "relative w-full max-w-[280px] aspect-[9/16.5] bg-black rounded-xl shadow-2xl overflow-hidden flex flex-col";

  return (
    <div className={cardContainerClasses}>
      {embedSrc ? (
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0" // Iframe will fill the card container
        ></iframe>
      ) : thumbnailUrl ? (
        <div className="relative w-full h-full"> {/* Image container also fills the card */}
          <Image
            src={thumbnailUrl}
            alt={title}
            layout="fill"
            objectFit="cover" // Cover will fill and crop if aspect ratios differ
            data-ai-hint={dataAiHintVal}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group">
            <PlayCircle className="h-16 w-16 text-white/70 group-hover:text-white/90 transition-opacity" />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-800 p-4">
          <AlertTriangle className="h-12 w-12 mb-2" />
          <p className="text-sm text-center">Video content not available.</p>
        </div>
      )}
      
      {/* Overlay for title and description - always shown at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <h3 className="text-white font-semibold text-md truncate" title={title}>{title}</h3>
        <p className="text-white/80 text-xs line-clamp-2" title={description}>{description}</p>
      </div>
    </div>
  );
};

export default React.memo(VideoCard);
