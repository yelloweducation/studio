
// src/app/videos/page.tsx
import type { Metadata } from 'next';
import VideosClient from './videos-client';

export const metadata: Metadata = {
  title: 'Video Reels | Yellow Institute',
  description: 'Watch short educational video reels and tutorials.',
  keywords: ['video reels', 'tutorials', 'short videos', 'education', 'Yellow Institute'],
};

export default function VideosPageContainer() {
  return <VideosClient />;
}
