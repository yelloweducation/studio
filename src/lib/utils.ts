import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
    // Standard URL: https://www.tiktok.com/@username/video/1234567890123456789
    // Embed URL: https://www.tiktok.com/embed/v2/1234567890123456789
    if (urlObj.hostname === 'www.tiktok.com') {
      if (urlObj.pathname.startsWith('/embed/')) {
        return url; // Already an embed URL
      }
      const pathParts = urlObj.pathname.split('/');
      // Expected format: /@username/video/VIDEO_ID
      if (pathParts.length >= 4 && pathParts[2] === 'video') {
        const videoId = pathParts[3];
        return videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : null;
      }
    }
    
    // Handle Google Drive URLs for course lessons (existing logic)
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
    // console.error("Error parsing or transforming embed URL:", url, error); // Keep for debugging if needed
    return null;
  }
  // If it's a URL but not one we transform, and not caught by specific handlers,
  // it might be a direct embed link for other platforms.
  // However, for safety, let's only return known good patterns or null.
  // For now, if no specific transformation applies, return null.
  // This can be expanded if other direct embed types are needed.
  return null;
}
