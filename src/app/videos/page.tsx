
// This file is now a Server Component
import type { Metadata } from 'next';
import VideosClient from './videos-client'; // Import the new client component

export const metadata: Metadata = {
  title: 'Video Reels | Yellow Institute',
  description: 'Watch short, engaging video reels on various tech topics and learning tips from Yellow Institute.',
  keywords: ['videos', 'reels', 'short videos', 'tech tips', 'learning', 'Yellow Institute'],
};

// This is the Server Component that Next.js will render for the page.
export default function VideosPageContainer() {
  return <VideosClient />;
}
