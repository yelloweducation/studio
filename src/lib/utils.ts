
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
        // Ensure videoId is purely numeric for standard TikTok video IDs
        if (videoId && /^\d+$/.test(videoId)) {
             return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
        // If videoId format is not as expected (e.g., contains non-numeric characters where numeric is expected)
        return null;
      }
    }

    // Handle shortened TikTok URLs (e.g., vt.tiktok.com, vm.tiktok.com)
    // These URLs redirect to the full video page. Extracting the final video ID
    // for embedding requires following this redirect, which is not reliably feasible
    // purely client-side due to potential CORS issues or the need for network requests.
    // Therefore, these URLs will result in a null embed URL, and the UI should fall back
    // to displaying a thumbnail or placeholder.
    if (urlObj.hostname === 'vt.tiktok.com' || urlObj.hostname === 'vm.tiktok.com') {
      // console.warn(`Shortened TikTok URL (${url}) provided. These cannot be directly embedded client-side. Thumbnail fallback will be used.`);
      return null;
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
  // If it's a URL but not one we transform, and not caught by specific handlers, return null.
  return null;
}
