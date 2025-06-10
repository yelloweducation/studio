
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
    if (urlObj.hostname === 'www.tiktok.com') {
      if (urlObj.pathname.startsWith('/embed/')) { // e.g. /embed/123 or /embed/v2/123
        return url; // Already an embed URL
      }
      
      const pathParts = urlObj.pathname.split('/');
      // Expected format: /@username/video/VIDEO_ID
      // pathParts for /@username/video/VIDEO_ID will be ['', '@username', 'video', 'VIDEO_ID']
      if (pathParts.length >= 4 && pathParts[2] === 'video') {
        const videoId = pathParts[3];
        if (videoId && /^\d+$/.test(videoId)) { // Ensure videoId is purely numeric
          return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
        // If videoId is not numeric, or if the path structure matched but ID was invalid.
        return null; 
      }
      // If it's www.tiktok.com but not /embed/ and not the recognized /@user/video/ID format.
      return null;
    }

    // Handle shortened TikTok URLs (e.g., vt.tiktok.com, vm.tiktok.com)
    if (urlObj.hostname === 'vt.tiktok.com' || urlObj.hostname === 'vm.tiktok.com') {
      // These URLs redirect. Extracting the final video ID for embedding is not reliably
      // feasible client-side due to potential CORS or network request needs.
      return null;
    }
    
    // Handle Google Drive URLs for course lessons
    if (urlObj.hostname === 'drive.google.com') {
      if (urlObj.pathname.includes('/preview')) {
        return url; // Already a preview/embed URL
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
      return null; // Could not extract fileId from Google Drive URL
    }

  } catch (error) {
    // console.error("Error parsing or transforming embed URL:", url, error);
    return null;
  }
  // If it's a valid URL but not handled by any specific logic above.
  return null;
}
