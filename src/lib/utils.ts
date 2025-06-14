
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as LucideIcons from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEmbedUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return null;
  }

  try {
    const urlObj = new URL(url); 

    // Handle YouTube URLs
    if (urlObj.hostname === 'www.youtube.com' && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Handle TikTok URLs
    if (urlObj.hostname === 'www.tiktok.com') {
      if (urlObj.pathname.startsWith('/embed/')) { 
        return url; 
      }
      
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.length >= 4 && pathParts[2] === 'video') {
        const videoId = pathParts[3];
        if (videoId && /^\d+$/.test(videoId)) { 
          return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
        return null; 
      }
      return null;
    }

    if (urlObj.hostname === 'vt.tiktok.com' || urlObj.hostname === 'vm.tiktok.com') {
      return null;
    }
    
    if (urlObj.hostname === 'drive.google.com') {
      if (urlObj.pathname.includes('/preview')) {
        return url;
      }
      let fileId: string | null = null;
      if (urlObj.pathname.startsWith('/file/d/')) {
        const parts = urlObj.pathname.split('/');
        if (parts.length > 3) fileId = parts[3];
      } else if (urlObj.searchParams.has('id')) {
        fileId = urlObj.searchParams.get('id');
      }

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return null;
    }

  } catch (error) {
    console.warn("Error parsing or transforming embed URL:", url, error); 
    return null;
  }
  return null;
}

export const isValidLucideIcon = (iconName: string | undefined | null): iconName is keyof typeof LucideIcons => {
  return typeof iconName === 'string' && iconName in LucideIcons;
};
